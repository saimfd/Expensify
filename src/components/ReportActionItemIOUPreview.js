import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import MultipleAvatars from './MultipleAvatars';

const propTypes = {
    // Additional logic for displaying the pay button
    shouldHidePayButton: PropTypes.bool,

    // Callback for the Pay/Settle button
    onPayButtonPressed: PropTypes.func,

    // The active IOUReport, used for Onyx subscription
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.number.isRequired,

    // Session info for the currently logged in user.
    session: PropTypes.shape({
        // Currently logged in user email
        email: PropTypes.string,
    }).isRequired,

    /* --- Onyx Props --- */
    // Active IOU Report for current report
    iou: PropTypes.shape({
        // Email address of the manager in this iou report
        managerEmail: PropTypes.string,

        // Email address of the creator of this iou report
        ownerEmail: PropTypes.string,

        // Outstanding amount of this transaction
        cachedTotal: PropTypes.string,

        // Is the IOU report settled?
        hasOutstandingIOU: PropTypes.bool,
    }).isRequired,

    // All of the personal details for everyone
    personalDetails: PropTypes.objectOf(PropTypes.shape({

        // This is either the user's full name, or their login if full name is an empty string
        displayName: PropTypes.string.isRequired,
    })).isRequired,
};

const defaultProps = {
    shouldHidePayButton: false,
    onPayButtonPressed: null,
};

const ReportActionItemIOUPreview = ({
    iou,
    personalDetails,
    session,
    shouldHidePayButton,
    onPayButtonPressed,
}) => {
    const sessionEmail = lodashGet(session, 'email', null);

    // Pay button should be visible to manager person in the report
    // Check if the currently logged in user is the manager.
    const isCurrentUserManager = iou.managerEmail === sessionEmail;

    const managerName = lodashGet(
        personalDetails,
        [iou.managerEmail, 'displayName'],
        iou.managerEmail ? Str.removeSMSDomain(iou.managerEmail) : '',
    );
    const ownerName = lodashGet(
        personalDetails,
        [iou.ownerEmail, 'displayName'],
        iou.ownerEmail ? Str.removeSMSDomain(iou.ownerEmail) : '',
    );
    const managerAvatar = lodashGet(personalDetails, [iou.managerEmail, 'avatar'], '');
    const ownerAvatar = lodashGet(personalDetails, [iou.ownerEmail, 'avatar'], '');
    const cachedTotal = iou.cachedTotal ? iou.cachedTotal.replace(/[()]/g, '') : '';

    return (
        <View style={[styles.chatItemMessage]}>
            <View style={styles.iouPreviewBox}>
                <View style={styles.flexRow}>
                    <View style={styles.flex1}>
                        <Text style={styles.h1}>{cachedTotal}</Text>
                        <Text style={styles.mt2}>
                            {iou.hasOutstandingIOU
                                ? `${managerName} owes ${ownerName}`
                                : `${ownerName} paid ${managerName}`}
                        </Text>
                    </View>
                    <View style={styles.iouPreviewBoxAvatar}>
                        <MultipleAvatars
                            avatarImageURLs={[managerAvatar, ownerAvatar]}
                            secondAvatarStyle={[styles.secondAvatarInline]}
                        />
                    </View>
                </View>
                {isCurrentUserManager && !shouldHidePayButton && (
                    <TouchableOpacity
                        style={[styles.buttonSmall, styles.buttonSuccess, styles.mt4]}
                        onPress={onPayButtonPressed}
                    >
                        <Text
                            style={[
                                styles.buttonSmallText,
                                styles.buttonSuccessText,
                            ]}
                        >
                            Pay
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

ReportActionItemIOUPreview.propTypes = propTypes;
ReportActionItemIOUPreview.defaultProps = defaultProps;
ReportActionItemIOUPreview.displayName = 'ReportActionItemIOUPreview';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    iou: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
    },
})(ReportActionItemIOUPreview);
