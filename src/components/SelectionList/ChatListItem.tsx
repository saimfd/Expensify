import React from 'react';
import {View} from 'react-native';
import {AttachmentContext} from '@components/AttachmentContext';
import MultipleAvatars from '@components/MultipleAvatars';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ReportActionItemDate from '@pages/home/report/ReportActionItemDate';
import ReportActionItemFragment from '@pages/home/report/ReportActionItemFragment';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ChatListItemProps, ListItem, ReportActionListItemType} from './types';

function ChatListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
}: ChatListItemProps<TItem>) {
    const reportActionItem = item as unknown as ReportActionListItemType;
    const from = reportActionItem.from;
    const icons = [
        {
            type: CONST.ICON_TYPE_AVATAR,
            source: from.avatar,
            name: reportActionItem.formattedFrom,
            id: from.accountID,
        },
    ];
    const fragment = {
        ...reportActionItem.message,
        type: 'COMMENT',
    };
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const attachmentContextValue = {type: CONST.ATTACHMENT_TYPE.SEARCH};

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const hoveredBackgroundColor = styles.sidebarLinkHover?.backgroundColor ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    return (
        <BaseListItem
            item={item}
            pressableStyle={[
                [styles.selectionListPressableItemWrapper, styles.textAlignLeft, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive, item.cursorStyle],
            ]}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone]}
            containerStyle={styles.mb3}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onLongPressRow={onLongPressRow}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            {(hovered) => (
                <AttachmentContext.Provider value={attachmentContextValue}>
                    <MultipleAvatars
                        icons={icons}
                        shouldShowTooltip={showTooltip}
                        secondAvatarStyle={[
                            StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                            isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                            hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                        ]}
                    />
                    <View style={[styles.chatItemRight]}>
                        <View style={[styles.chatItemMessageHeader]}>
                            <View style={[styles.flexShrink1, styles.mr1]}>
                                <TextWithTooltip
                                    shouldShowTooltip={showTooltip}
                                    text={reportActionItem.formattedFrom}
                                    style={[styles.chatItemMessageHeaderSender, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold, styles.pre]}
                                />
                            </View>
                            <ReportActionItemDate created={reportActionItem.created ?? ''} />
                        </View>
                        <View style={styles.chatItemMessage}>
                            <ReportActionItemFragment
                                fragment={fragment}
                                actionName={CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}
                                source=""
                                accountID={from.accountID}
                                isFragmentContainingDisplayName
                            />
                        </View>
                    </View>
                </AttachmentContext.Provider>
            )}
        </BaseListItem>
    );
}

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;
