import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, Report} from '@src/types/onyx';

type ReportAvatarOnyxProps = {
    report: OnyxEntry<Report>;
    isLoadingApp: OnyxEntry<boolean>;
    policies: OnyxCollection<Policy>;
};

type ReportAvatarProps = ReportAvatarOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT_AVATAR>;

function ReportAvatar({report = {} as Report, route, policies, isLoadingApp = true}: ReportAvatarProps) {
    const {translate} = useLocalize();
    const policyID = route.params.policyID ?? '-1';
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyName = ReportUtils.getPolicyName(report, true, policy);
    const isPolicyRelatedReport = !!policyName;
    const unavailableWorkspace = translate('workspace.common.unavailable');

    const attachment = useMemo(() => {
        if (isPolicyRelatedReport) {
            return {
                source: UserUtils.getFullSizeAvatar(ReportUtils.getWorkspaceAvatar(report), 0),
                headerTitle: policyName,
                originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID ?? '',
                isWorkspaceAvatar: true,
            };
        }

        if (ReportUtils.isGroupChat(report) && !ReportUtils.isThread(report)) {
            return {
                source: report?.avatarUrl ? UserUtils.getFullSizeAvatar(report.avatarUrl, 0) : ReportUtils.getDefaultGroupAvatar(report?.reportID ?? ''),
                headerTitle: ReportUtils.getReportName(report),
                originalFileName: report?.avatarFileName ?? '',
                isWorkspaceAvatar: false,
            };
        }

        return {
            source: UserUtils.getFullSizeAvatar(ReportUtils.getWorkspaceAvatar(report), 0),
            headerTitle: unavailableWorkspace,
            originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID,
            isWorkspaceAvatar: true,
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [report, policy]);

    return (
        <AttachmentModal
            headerTitle={attachment.headerTitle}
            defaultOpen
            source={attachment.source}
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? '-1'));
            }}
            isWorkspaceAvatar={attachment.isWorkspaceAvatar}
            maybeIcon
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName={attachment.originalFileName}
            shouldShowNotFoundPage={!report?.reportID && !isLoadingApp}
            isLoading={(!report?.reportID || !policy?.id) && !!isLoadingApp}
        />
    );
}

ReportAvatar.displayName = 'ReportAvatar';

export default withOnyx<ReportAvatarProps, ReportAvatarOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? '-1'}`,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(ReportAvatar);
