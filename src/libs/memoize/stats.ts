import Log from '@libs/Log';

type MemoizeStatsEntry = {
    keyLength: number;
    didHit: boolean;
    cacheRetrievalTime: number;
    fnTime?: number;
    cacheSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMemoizeStatsEntry(entry: any): entry is MemoizeStatsEntry {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return entry.keyLength !== undefined && entry.didHit !== undefined && entry.cacheRetrievalTime !== undefined;
}

class MemoizeStats {
    private calls = 0;

    private hits = 0;

    private avgKeyLength = 0;

    private avgCacheRetrievalTime = 0;

    private avgFnTime = 0;

    private cacheSize = 0;

    isEnabled = false;

    constructor(enabled: boolean) {
        this.isEnabled = enabled;
    }

    // See https://en.wikipedia.org/wiki/Moving_average#Cumulative_average
    private calculateCumulativeAvg(avg: number, length: number, value: number) {
        const result = (avg * (length - 1) + value) / length;
        // If the length is 0, we return the average. For example, when calculating average cache retrieval time, hits may be 0, and in that case we want to return the current average cache retrieval time
        return Number.isFinite(result) ? result : avg;
    }

    private cumulateEntry(entry: MemoizeStatsEntry) {
        this.calls++;
        this.hits += entry.didHit ? 1 : 0;

        this.cacheSize = entry.cacheSize;

        this.avgKeyLength = this.calculateCumulativeAvg(this.avgKeyLength, this.calls, entry.keyLength);

        this.avgCacheRetrievalTime = this.calculateCumulativeAvg(this.avgCacheRetrievalTime, this.hits, entry.cacheRetrievalTime);

        if (entry.fnTime !== undefined) {
            this.avgFnTime = this.calculateCumulativeAvg(this.avgFnTime, this.calls - this.hits, entry.fnTime);
        }
    }

    private saveEntry(entry: Partial<MemoizeStatsEntry>) {
        if (!this.isEnabled) {
            return;
        }

        if (!isMemoizeStatsEntry(entry)) {
            Log.warn('MemoizeStats:saveEntry: Invalid entry', entry);
            return;
        }

        return this.cumulateEntry(entry);
    }

    createEntry() {
        // If monitoring is disabled, return a dummy object that does nothing
        if (!this.isEnabled) {
            return {
                track: () => {},
                get: () => {},
                save: () => {},
                trackTime: () => {},
            };
        }

        const entry: Partial<MemoizeStatsEntry> = {};

        return {
            track: <P extends keyof MemoizeStatsEntry>(cacheProp: P, value: MemoizeStatsEntry[P]) => {
                entry[cacheProp] = value;
            },
            trackTime: <P extends keyof Pick<MemoizeStatsEntry, 'cacheRetrievalTime' | 'fnTime'>>(cacheProp: P, startTime: number, endTime = performance.now()) => {
                entry[cacheProp] = endTime - startTime;
            },
            get: <P extends keyof MemoizeStatsEntry>(cacheProp: P) => entry[cacheProp],
            save: () => this.saveEntry(entry),
        };
    }

    startMonitoring() {
        this.isEnabled = true;
        this.calls = 0;
        this.hits = 0;
        this.avgKeyLength = 0;
        this.avgCacheRetrievalTime = 0;
        this.avgFnTime = 0;
        this.cacheSize = 0;
    }

    stopMonitoring() {
        this.isEnabled = false;

        return {
            calls: this.calls,
            hits: this.hits,
            avgKeyLength: this.avgKeyLength,
            avgCacheRetrievalTime: this.avgCacheRetrievalTime,
            avgFnTime: this.avgFnTime,
            cacheSize: this.cacheSize,
        };
    }
}

export type {MemoizeStatsEntry};
export {MemoizeStats};
