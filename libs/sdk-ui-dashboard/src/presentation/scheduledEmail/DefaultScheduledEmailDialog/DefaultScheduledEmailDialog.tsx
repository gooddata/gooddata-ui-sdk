// (C) 2019-2025 GoodData Corporation
import React, { useState } from "react";
import noop from "lodash/noop.js";
import { defineMessage, useIntl } from "react-intl";
import {
    ConfirmDialogBase,
    Overlay,
    ContentDivider,
    Button,
    EditableLabel,
    Hyperlink,
    RecurrenceForm,
    Message,
    OverlayControllerProvider,
    OverlayController,
} from "@gooddata/sdk-ui-kit";
import { Textarea } from "./components/Textarea.js";
import { Input } from "./components/Input.js";
import { RecipientsSelect } from "./components/RecipientsSelect/RecipientsSelect.js";
import { IntlWrapper } from "../../localization/index.js";
import { DestinationSelect } from "./components/DestinationSelect/DestinationSelect.js";
import {
    selectLocale,
    useDashboardSelector,
    selectDateFormat,
    selectWeekStart,
    selectDashboardTitle,
    selectEntitlementMaxAutomationRecipients,
    selectEntitlementMinimumRecurrenceMinutes,
    selectIsCrossFiltering,
    selectIsWhiteLabeled,
} from "../../../model/index.js";
import { IScheduledEmailDialogProps } from "../types.js";
import { useEditScheduledEmail } from "./hooks/useEditScheduledEmail.js";
import { useSaveScheduledEmailToBackend } from "./hooks/useSaveScheduledEmailToBackend.js";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX, DASHBOARD_TITLE_MAX_LENGTH } from "../../constants/index.js";
import { DeleteScheduleConfirmDialog } from "../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js";
import { DashboardAttachments } from "./components/Attachments/DashboardAttachments.js";
import { WidgetAttachments } from "./components/Attachments/WidgetAttachments.js";
import { useFiltersForDashboardScheduledExportInfo } from "./hooks/useFiltersForDashboardScheduledExportInfo.js";
import { DEFAULT_MAX_RECIPIENTS } from "./constants.js";
import { DefaultLoadingScheduledEmailDialog } from "./DefaultLoadingScheduledEmailDialog.js";
import { isMobileView } from "../utils/responsive.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";

const MAX_MESSAGE_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 200;
const DEFAULT_MIN_RECURRENCE_MINUTES = "60";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export function ScheduledMailDialogRenderer({
    scheduledExportToEdit,
    users,
    notificationChannels,
    insight,
    widget,
    dashboardFilters,
    widgetFilters,
    onCancel,
    onDeleteSuccess,
    onDeleteError,
    onError,
    onSave,
    onSaveError,
    onSaveSuccess,
    onSubmit,
    onSuccess,
}: IScheduledEmailDialogProps) {
    const intl = useIntl();

    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);

    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const handleScheduleDeleteSuccess = () => {
        onDeleteSuccess?.();
        setScheduledEmailToDelete(null);
    };

    const {
        locale,
        dashboardTitle,
        dateFormat,
        weekStart,
        maxAutomationsRecipients,
        allowHourlyRecurrence,
        isCrossFiltering,
    } = useDefaultScheduledEmailDialogData();

    const {
        defaultUser,
        editedAutomation,
        originalAutomation,
        isSubmitDisabled,
        settings,
        startDate,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        areDashboardFiltersChanged,
        warningMessage,
        validationErrorMessage,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsSettingsChange,
        onDestinationChange,
        onMessageChange,
        onRecipientsChange,
        onRecurrenceChange,
        onSubjectChange,
        onTitleChange,
    } = useEditScheduledEmail({
        notificationChannels,
        insight,
        widget,
        scheduledExportToEdit,
        dashboardFilters,
        widgetFilters,
        maxAutomationsRecipients,
    });

    const { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage } =
        useSaveScheduledEmailToBackend(editedAutomation, {
            onSuccess,
            onError,
            onSubmit,
            onSaveSuccess,
            onSaveError,
            onSave,
        });

    const errorMessage = savingErrorMessage ?? validationErrorMessage;

    const dashboardScheduledExportFiltersInfo = useFiltersForDashboardScheduledExportInfo({
        effectiveFilters: dashboardFilters,
    });

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.schedule.email.footer.title.short" }).id
        : defineMessage({ id: "dialogs.schedule.email.footer.title" }).id;

    return (
        <>
            <Overlay className="gd-notifications-channels-dialog-overlay" isModal={true} positionType="fixed">
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialogBase
                        className="gd-notifications-channels-dialog s-gd-notifications-channels-dialog"
                        isPositive={true}
                        cancelButtonText={intl.formatMessage({ id: "cancel" })}
                        submitButtonText={
                            scheduledExportToEdit
                                ? intl.formatMessage({ id: `dialogs.schedule.email.save` })
                                : intl.formatMessage({ id: `dialogs.schedule.email.create` })
                        }
                        showProgressIndicator={isSavingScheduledEmail}
                        footerLeftRenderer={() => (
                            <div className="gd-notifications-channels-dialog-footer-link">
                                {!isWhiteLabeled ? (
                                    <Hyperlink
                                        text={intl.formatMessage({ id: helpTextId })}
                                        href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-ScheduleExport"
                                        iconClass="gd-icon-circle-question"
                                    />
                                ) : null}
                                {scheduledExportToEdit ? (
                                    <Button
                                        className="gd-button-link-dimmed"
                                        value={intl.formatMessage({ id: "delete" })}
                                        onClick={() => setScheduledEmailToDelete(editedAutomation)}
                                        disabled={isSavingScheduledEmail}
                                    />
                                ) : null}
                            </div>
                        )}
                        isSubmitDisabled={isSubmitDisabled || isSavingScheduledEmail}
                        submitOnEnterKey={false}
                        onCancel={onCancel}
                        onSubmit={handleSaveScheduledEmail}
                        headline={undefined}
                        headerLeftButtonRenderer={() => (
                            <div className="gd-notifications-channels-dialog-header">
                                <Button
                                    className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-schedule-email-dialog-button"
                                    onClick={onCancel}
                                />
                                <EditableLabel
                                    value={editedAutomation.title ?? ""}
                                    onSubmit={noop}
                                    onChange={onTitleChange}
                                    maxRows={1}
                                    maxLength={40}
                                    className="gd-notifications-channels-dialog-title s-gd-notifications-channels-dialog-title"
                                    autofocus={!editedAutomation.title}
                                    placeholder={intl.formatMessage({
                                        id: "dialogs.schedule.email.title.placeholder",
                                    })}
                                    ariaLabel={intl.formatMessage({
                                        id: "dialogs.schedule.accessibility.label.email.title",
                                    })}
                                />
                            </div>
                        )}
                    >
                        <div className="gd-notifications-channel-dialog-content-wrapper">
                            <ContentDivider className="gd-divider-with-margin gd-divider-full-row" />
                            <RecurrenceForm
                                startDate={startDate}
                                cronExpression={
                                    editedAutomation.schedule?.cron ?? getDefaultCronExpression(startDate)
                                }
                                timezone={editedAutomation.schedule?.timezone ?? TIMEZONE_DEFAULT.identifier}
                                dateFormat={dateFormat ?? "MM/dd/yyyy"}
                                locale={locale}
                                weekStart={weekStart}
                                onChange={onRecurrenceChange}
                                allowHourlyRecurrence={allowHourlyRecurrence}
                            />
                            <ContentDivider className="gd-divider-with-margin" />
                            <DestinationSelect
                                notificationChannels={notificationChannels}
                                selectedItemId={editedAutomation.notificationChannel}
                                onChange={onDestinationChange}
                            />
                            <ContentDivider className="gd-divider-with-margin" />
                            <RecipientsSelect
                                loggedUser={defaultUser}
                                users={users}
                                value={editedAutomation.recipients ?? []}
                                originalValue={originalAutomation.recipients || []}
                                onChange={onRecipientsChange}
                                allowEmptySelection
                                allowOnlyLoggedUserRecipients={allowOnlyLoggedUserRecipients}
                                allowExternalRecipients={allowExternalRecipients}
                                maxRecipients={maxAutomationsRecipients}
                                notificationChannels={notificationChannels}
                                notificationChannelId={editedAutomation.notificationChannel}
                            />
                            <Input
                                id="schedule.subject"
                                className="gd-notifications-channels-dialog-subject s-gd-notifications-channels-dialog-subject"
                                label={intl.formatMessage({ id: "dialogs.schedule.email.subject.label" })}
                                maxlength={MAX_SUBJECT_LENGTH}
                                placeholder={
                                    dashboardTitle.length > DASHBOARD_TITLE_MAX_LENGTH
                                        ? dashboardTitle.substring(0, DASHBOARD_TITLE_MAX_LENGTH)
                                        : dashboardTitle
                                }
                                value={editedAutomation.details?.subject ?? ""}
                                onChange={onSubjectChange}
                            />
                            <Textarea
                                id="schedule.message"
                                className="gd-notifications-channels-dialog-message s-gd-notifications-channels-dialog-message"
                                label={intl.formatMessage({ id: "dialogs.schedule.email.message.label" })}
                                maxlength={MAX_MESSAGE_LENGTH}
                                placeholder={intl.formatMessage({
                                    id: "dialogs.schedule.email.message.placeholder",
                                })}
                                rows={3}
                                onChange={onMessageChange}
                                value={editedAutomation.details?.message ?? ""}
                            />
                            {widget ? (
                                <WidgetAttachments
                                    widgetFilters={widgetFilters}
                                    areDashboardFiltersChanged={areDashboardFiltersChanged}
                                    isCrossFiltering={isCrossFiltering}
                                    scheduledExportToEdit={scheduledExportToEdit}
                                    csvSelected={isCsvExportSelected}
                                    xlsxSelected={isXlsxExportSelected}
                                    settings={settings}
                                    onWidgetAttachmentsSelectionChange={onWidgetAttachmentsChange}
                                    onWidgetAttachmentsSettingsChange={onWidgetAttachmentsSettingsChange}
                                />
                            ) : (
                                <DashboardAttachments
                                    dashboardSelected={isDashboardExportSelected}
                                    scheduledExportToEdit={scheduledExportToEdit}
                                    areDashboardFiltersChanged={areDashboardFiltersChanged}
                                    dashboardFilters={dashboardFilters}
                                    isCrossFiltering={isCrossFiltering}
                                    filtersToDisplayInfo={dashboardScheduledExportFiltersInfo}
                                    onDashboardAttachmentsSelectionChange={onDashboardAttachmentsChange}
                                />
                            )}
                            {errorMessage ? (
                                <Message type="error" className="gd-notifications-channels-dialog-error">
                                    {errorMessage}
                                </Message>
                            ) : null}
                            {warningMessage ? (
                                <Message type="warning" className="gd-notifications-channels-dialog-warning">
                                    {warningMessage}
                                </Message>
                            ) : null}
                            <ContentDivider className="gd-divider-with-margin gd-divider-full-row" />
                        </div>
                    </ConfirmDialogBase>
                </OverlayControllerProvider>
            </Overlay>
            {scheduledEmailToDelete ? (
                <DeleteScheduleConfirmDialog
                    scheduledEmail={scheduledEmailToDelete}
                    onCancel={() => setScheduledEmailToDelete(null)}
                    onSuccess={handleScheduleDeleteSuccess}
                    onError={onDeleteError}
                />
            ) : null}
        </>
    );
}

/**
 * @alpha
 */
export const DefaultScheduledEmailDialog: React.FC<IScheduledEmailDialogProps> = (props) => {
    const { isLoading, onCancel, scheduledExportToEdit } = props;
    const locale = useDashboardSelector(selectLocale);

    if (isLoading) {
        return (
            <DefaultLoadingScheduledEmailDialog
                onCancel={onCancel}
                scheduledExportToEdit={scheduledExportToEdit}
            />
        );
    }

    return (
        <IntlWrapper locale={locale}>
            <ScheduledMailDialogRenderer {...props} />
        </IntlWrapper>
    );
};

function useDefaultScheduledEmailDialogData() {
    const locale = useDashboardSelector(selectLocale);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const dateFormat = useDashboardSelector(selectDateFormat);
    const weekStart = useDashboardSelector(selectWeekStart);
    const maxAutomationsRecipientsEntitlement = useDashboardSelector(
        selectEntitlementMaxAutomationRecipients,
    );
    const maxAutomationsRecipients = parseInt(
        maxAutomationsRecipientsEntitlement?.value ?? DEFAULT_MAX_RECIPIENTS,
        10,
    );
    const minimumRecurrenceMinutesEntitlement = useDashboardSelector(
        selectEntitlementMinimumRecurrenceMinutes,
    );
    const allowHourlyRecurrence =
        parseInt(minimumRecurrenceMinutesEntitlement?.value ?? DEFAULT_MIN_RECURRENCE_MINUTES, 10) === 60;

    const isCrossFiltering = useDashboardSelector(selectIsCrossFiltering);

    return {
        locale,
        dashboardTitle,
        dateFormat,
        weekStart,
        maxAutomationsRecipients,
        allowHourlyRecurrence,
        isCrossFiltering,
    };
}
