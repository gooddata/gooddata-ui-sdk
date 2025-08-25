// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useBackend, useWorkspace } from "@gooddata/sdk-ui";
import { Automations } from "@gooddata/sdk-ui-ext";
import {
    AddButton,
    Button,
    ContentDivider,
    Dialog,
    Hyperlink,
    Typography,
    UiTooltip,
    useId,
} from "@gooddata/sdk-ui-kit";

import { DeleteScheduleConfirmDialog } from "./components/DeleteScheduleConfirmDialog.js";
import { ScheduledEmails } from "./components/ScheduledEmailsList.js";
import { messages } from "../../../locales.js";
import {
    DEFAULT_MAX_AUTOMATIONS,
    selectCanCreateAutomation,
    selectCurrentUser,
    selectDashboardId,
    selectEnableAutomationManagement,
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
    selectExecutionTimestamp,
    selectIsWhiteLabeled,
    selectTimezone,
    useDashboardSelector,
} from "../../../model/index.js";
import { AUTOMATIONS_COLUMN_CONFIG, AUTOMATIONS_MAX_HEIGHT } from "../../../presentation/constants/index.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import { IScheduledEmailManagementDialogProps } from "../types.js";
import { isMobileView } from "../utils/responsive.js";

/**
 * @alpha
 */
export function ScheduledEmailManagementDialog(props: IScheduledEmailManagementDialogProps) {
    const {
        onAdd,
        onEdit,
        onDeleteSuccess: onDelete,
        onClose,
        onDeleteError,
        isLoadingScheduleData,
        automations,
        notificationChannels,
    } = props;
    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<IAutomationMetadataObject | null>(
        null,
    );
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const workspace = useWorkspace();
    const backend = useBackend();
    const timezone = useDashboardSelector(selectTimezone);

    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);
    const intl = useIntl();
    const isExecutionTimestampMode = !!useDashboardSelector(selectExecutionTimestamp);

    const { returnFocusTo } = useScheduleEmailDialogAccessibility();

    const handleScheduleDelete = useCallback((scheduledEmail: IAutomationMetadataObject) => {
        setScheduledEmailToDelete(scheduledEmail);
    }, []);

    const handleScheduleEdit = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            onEdit?.(scheduledEmail);
        },
        [onEdit],
    );

    const handleScheduleDeleteSuccess = useCallback(() => {
        onDelete?.();
        setScheduledEmailToDelete(null);
    }, [onDelete]);

    const maxAutomationsReached = automations.length >= maxAutomations && !unlimitedAutomationsEntitlement;

    const isAddButtonDisabled = useMemo(
        () => isLoadingScheduleData || maxAutomationsReached || isExecutionTimestampMode,
        [isLoadingScheduleData, maxAutomationsReached, isExecutionTimestampMode],
    );

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.schedule.email.footer.title.short" }).id
        : defineMessage({ id: "dialogs.schedule.email.footer.title" }).id;

    const titleElementId = useId();

    return (
        <>
            <Dialog
                displayCloseButton={true}
                autofocusOnOpen={automations.length === 0}
                onCancel={onClose}
                className={cx(
                    "gd-notifications-channels-management-dialog s-scheduled-email-management-dialog",
                    {
                        "gd-dialog--wide gd-notifications-channels-management-dialog--wide":
                            enableAutomationManagement,
                    },
                )}
                accessibilityConfig={{ titleElementId, isModal: true }}
                returnFocusAfterClose={true}
                returnFocusTo={returnFocusTo}
            >
                <div className="gd-notifications-channels-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header" id={titleElementId}>
                        <FormattedMessage id="dialogs.schedule.management.title" />
                    </Typography>
                </div>
                <div className="gd-notifications-channels-content">
                    {enableAutomationManagement ? (
                        <>
                            <ContentDivider />
                            <Automations
                                workspace={workspace}
                                timezone={timezone}
                                type="schedule"
                                backend={backend}
                                maxHeight={AUTOMATIONS_MAX_HEIGHT}
                                isSmall={true}
                                editAutomation={handleScheduleEdit}
                                preselectedFilters={{
                                    dashboard: dashboardId ? [dashboardId] : undefined,
                                }}
                                selectedColumnDefinitions={AUTOMATIONS_COLUMN_CONFIG}
                            />
                        </>
                    ) : (
                        <>
                            <div className="gd-notifications-channels-content-header">
                                <Typography tagName="h3">
                                    <FormattedMessage id={messages.scheduleManagementListTitle.id!} />
                                </Typography>
                                {canCreateAutomation ? (
                                    <AddButton
                                        onClick={onAdd}
                                        isDisabled={isAddButtonDisabled}
                                        title={
                                            <FormattedMessage id={messages.scheduleManagementCreate.id!} />
                                        }
                                        tooltip={
                                            maxAutomationsReached ? (
                                                <FormattedMessage
                                                    id={messages.scheduleManagementCreateTooMany.id!}
                                                />
                                            ) : isExecutionTimestampMode ? (
                                                <FormattedMessage
                                                    id={messages.scheduleManagementExecutionTimestampMode.id!}
                                                />
                                            ) : undefined
                                        }
                                    />
                                ) : null}
                            </div>
                            <ScheduledEmails
                                onDelete={handleScheduleDelete}
                                onEdit={handleScheduleEdit}
                                isLoading={isLoadingScheduleData}
                                scheduledEmails={automations}
                                currentUserEmail={currentUser?.email}
                                noSchedulesMessageId={messages.scheduleManagementNoSchedules.id!}
                                notificationChannels={notificationChannels}
                            />
                        </>
                    )}
                </div>
                <div className="gd-content-divider"></div>
                <div className="gd-buttons">
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
                        {enableAutomationManagement && canCreateAutomation ? (
                            <UiTooltip
                                optimalPlacement={true}
                                anchor={
                                    <Button
                                        onClick={onAdd}
                                        disabled={isAddButtonDisabled}
                                        value={intl.formatMessage({
                                            id: messages.scheduleManagementCreate.id!,
                                        })}
                                        className="gd-button-action"
                                    />
                                }
                                disabled={!maxAutomationsReached}
                                triggerBy={["hover"]}
                                content={
                                    maxAutomationsReached
                                        ? intl.formatMessage({
                                              id: messages.scheduleManagementCreateTooMany.id!,
                                          })
                                        : isExecutionTimestampMode
                                          ? intl.formatMessage({
                                                id: messages.scheduleManagementExecutionTimestampMode.id!,
                                            })
                                          : undefined
                                }
                            />
                        ) : null}
                    </div>
                </div>
                {scheduledEmailToDelete ? (
                    <DeleteScheduleConfirmDialog
                        scheduledEmail={scheduledEmailToDelete}
                        onCancel={() => setScheduledEmailToDelete(null)}
                        onSuccess={handleScheduleDeleteSuccess}
                        onError={onDeleteError}
                    />
                ) : null}
            </Dialog>
        </>
    );
}
