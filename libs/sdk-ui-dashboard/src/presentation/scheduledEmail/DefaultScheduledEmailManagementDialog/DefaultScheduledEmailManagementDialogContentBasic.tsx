// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
import {
    AddButton,
    Button,
    Dialog,
    Hyperlink,
    OverlayController,
    OverlayControllerProvider,
    Typography,
    useId,
} from "@gooddata/sdk-ui-kit";

import { ScheduledEmails } from "./components/ScheduledEmailsList.js";
import { messages } from "../../../locales.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { DEFAULT_MAX_AUTOMATIONS } from "../../../model/react/useDashboardAutomations/constants.js";
import { selectIsWhiteLabeled } from "../../../model/store/config/configSelectors.js";
import {
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
} from "../../../model/store/entitlements/entitlementsSelectors.js";
import { selectCanCreateAutomation } from "../../../model/store/permissions/permissionsSelectors.js";
import { selectExecutionTimestamp } from "../../../model/store/ui/uiSelectors.js";
import { selectCurrentUser } from "../../../model/store/user/userSelectors.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/zIndex.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import { isMobileView } from "../utils/responsive.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

interface IDefaultScheduledEmailManagementDialogContentBasicProps {
    onAdd?: () => void;
    onClose?: () => void;
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    isLoadingScheduleData: boolean;
    automations: IAutomationMetadataObject[];
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
}

export function DefaultScheduledEmailManagementDialogContentBasic({
    onAdd,
    onClose,
    onDelete,
    onEdit,
    isLoadingScheduleData,
    automations,
    notificationChannels,
}: IDefaultScheduledEmailManagementDialogContentBasicProps) {
    const intl = useIntl();
    const isMobile = isMobileView();

    const currentUser = useDashboardSelector(selectCurrentUser);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const isExecutionTimestampMode = !!useDashboardSelector(selectExecutionTimestamp);
    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);

    const { returnFocusTo } = useScheduleEmailDialogAccessibility();

    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);
    const maxAutomationsReached = automations.length >= maxAutomations && !unlimitedAutomationsEntitlement;

    const isAddButtonDisabled = useMemo(
        () => isLoadingScheduleData || maxAutomationsReached || isExecutionTimestampMode,
        [isLoadingScheduleData, maxAutomationsReached, isExecutionTimestampMode],
    );

    const helpTextId = isMobile
        ? defineMessage({ id: "dialogs.schedule.email.footer.title.short" }).id
        : defineMessage({ id: "dialogs.schedule.email.footer.title" }).id;

    const titleElementId = useId();

    return (
        <Dialog
            displayCloseButton
            autofocusOnOpen
            onCancel={onClose}
            className="gd-notifications-channels-management-dialog s-scheduled-email-management-dialog"
            accessibilityConfig={{ titleElementId, isModal: true }}
            returnFocusAfterClose
            returnFocusTo={returnFocusTo}
        >
            <OverlayControllerProvider overlayController={overlayController}>
                <div className="gd-notifications-channels-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header" id={titleElementId}>
                        {intl.formatMessage({ id: "dialogs.schedule.management.title" })}
                    </Typography>
                </div>
                <div className="gd-notifications-channels-content">
                    <div className="gd-notifications-channels-content-header">
                        <Typography tagName="h3">
                            {intl.formatMessage({ id: messages.scheduleManagementListTitle.id })}
                        </Typography>
                        {canCreateAutomation ? (
                            <AddButton
                                onClick={onAdd}
                                isDisabled={isAddButtonDisabled}
                                title={<FormattedMessage id={messages.scheduleManagementCreate.id} />}
                                tooltip={
                                    maxAutomationsReached ? (
                                        <FormattedMessage id={messages.scheduleManagementCreateTooMany.id} />
                                    ) : isExecutionTimestampMode ? (
                                        <FormattedMessage
                                            id={messages.scheduleManagementExecutionTimestampMode.id}
                                        />
                                    ) : undefined
                                }
                            />
                        ) : null}
                    </div>
                    <ScheduledEmails
                        onDelete={onDelete}
                        onEdit={onEdit}
                        isLoading={isLoadingScheduleData}
                        scheduledEmails={automations}
                        currentUserEmail={currentUser?.email}
                        noSchedulesMessageId={messages.scheduleManagementNoSchedules.id}
                        notificationChannels={notificationChannels}
                    />
                </div>
                <div className="gd-content-divider"></div>
                <div className={`gd-buttons${isWhiteLabeled ? " gd-buttons--end" : ""}`}>
                    {isWhiteLabeled ? null : (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-ScheduleExport"
                            iconClass="gd-icon-circle-question"
                        />
                    )}
                    <div className="gd-buttons">
                        <Button
                            onClick={onClose}
                            className="gd-button-secondary s-close-button"
                            value={intl.formatMessage({ id: "close" })}
                        />
                    </div>
                </div>
            </OverlayControllerProvider>
        </Dialog>
    );
}
