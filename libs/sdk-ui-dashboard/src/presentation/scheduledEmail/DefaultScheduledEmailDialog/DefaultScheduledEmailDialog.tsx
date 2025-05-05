// (C) 2019-2025 GoodData Corporation
import React, { useMemo, useRef, useState } from "react";
import cx from "classnames";
import { defineMessage, useIntl } from "react-intl";
import {
    ConfirmDialogBase,
    Overlay,
    ContentDivider,
    Button,
    Hyperlink,
    RecurrenceForm,
    Message,
    OverlayControllerProvider,
    OverlayController,
    useId,
} from "@gooddata/sdk-ui-kit";
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
    selectExecutionTimestamp,
    useFiltersForDashboardScheduledExport,
    selectEnableAutomationFilterContext,
} from "../../../model/index.js";
import { IScheduledEmailDialogProps } from "../types.js";
import { useEditScheduledEmail } from "./hooks/useEditScheduledEmail.js";
import { useSaveScheduledEmailToBackend } from "./hooks/useSaveScheduledEmailToBackend.js";
import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
import { DeleteScheduleConfirmDialog } from "../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js";
import { DashboardAttachments } from "./components/Attachments/DashboardAttachments.js";
import { WidgetAttachments } from "./components/Attachments/WidgetAttachments.js";
import { useFiltersForDashboardScheduledExportInfo } from "./hooks/useFiltersForDashboardScheduledExportInfo.js";
import { DEFAULT_MAX_RECIPIENTS } from "./constants.js";
import { DefaultLoadingScheduledEmailDialog } from "./DefaultLoadingScheduledEmailDialog.js";
import { isMobileView } from "../utils/responsive.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";
import { AutomationFiltersSelect } from "../../automationFilters/components/AutomationFiltersSelect.js";
import { useAutomationFiltersData } from "../../automationFilters/useAutomationFiltersData.js";
import { validateAllFilterLocalIdentifiers } from "../../automationFilters/utils.js";

import { MessageForm } from "./components/MessageForm/MessageForm.js";
import { SubjectForm } from "./components/SubjectForm/SubjectForm.js";
import { ScheduledEmailDialogHeader } from "./components/Header/ScheduleEmailDialogHeader.js";

const DEFAULT_MIN_RECURRENCE_MINUTES = "60";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

interface ScheduledEmailDialogFooterProps {
    isWhiteLabeled: boolean;
    helpTextId: string;
    scheduledExportToEdit?: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null;
    isSavingScheduledEmail: boolean;
    onDeleteClick: () => void;
}

const ScheduledEmailDialogFooter: React.FC<ScheduledEmailDialogFooterProps> = ({
    isWhiteLabeled,
    helpTextId,
    scheduledExportToEdit,
    isSavingScheduledEmail,
    onDeleteClick,
}) => {
    const intl = useIntl();

    return (
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
                    onClick={onDeleteClick}
                    disabled={isSavingScheduledEmail}
                />
            ) : null}
        </div>
    );
};

export function ScheduledMailDialogRenderer({
    scheduledExportToEdit,
    users,
    usersError,
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

    const dialogTitleRef = useRef<HTMLInputElement | null>(null);

    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);

    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const allDashboardFilters = useFiltersForDashboardScheduledExport({});

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
        isExecutionTimestampMode,
        enableAutomationFilterContext,
    } = useDefaultScheduledEmailDialogData({ filters: allDashboardFilters ?? [] });

    const {
        availableFilters,
        automationFilters,
        setAutomationFilters,
        allVisibleFiltersMetadata,
        areVisibleFiltersMissingOnDashboard,
    } = useAutomationFiltersData({
        allFilters: allDashboardFilters,
        storedDashboardFilters: dashboardFilters,
        storedWidgetFilters: widgetFilters,
        metadataVisibleFilters: scheduledExportToEdit?.metadata?.visibleFilters,
        isEditing: !!scheduledExportToEdit,
        widget,
    });

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
        validationErrorMessage,
        storeFilters,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsSettingsChange,
        onDestinationChange,
        onMessageChange,
        onRecipientsChange,
        onRecurrenceChange,
        onSubjectChange,
        onTitleChange,
        onFiltersChange,
        onStoreFiltersChange,
    } = useEditScheduledEmail({
        notificationChannels,
        insight,
        widget,
        scheduledExportToEdit,
        allDashboardFilters,
        automationFilters,
        dashboardFilters,
        widgetFilters,
        maxAutomationsRecipients,
        setAutomationFilters,
        allVisibleFiltersMetadata,
        enableAutomationFilterContext,
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

    const titleElementId = useId();

    return (
        <>
            <Overlay
                className="gd-notifications-channels-dialog-overlay"
                isModal={true}
                positionType="fixed"
                ensureVisibility={true}
            >
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
                        accessibilityConfig={{
                            closeButton: {
                                ariaLabel: intl.formatMessage({ id: "dialogs.schedule.email.closeLabel" }),
                            },
                            titleElementId,
                        }}
                        showProgressIndicator={isSavingScheduledEmail}
                        footerLeftRenderer={() => (
                            <ScheduledEmailDialogFooter
                                isWhiteLabeled={isWhiteLabeled}
                                helpTextId={helpTextId}
                                scheduledExportToEdit={scheduledExportToEdit}
                                isSavingScheduledEmail={isSavingScheduledEmail}
                                onDeleteClick={() => setScheduledEmailToDelete(editedAutomation)}
                            />
                        )}
                        isSubmitDisabled={
                            isSubmitDisabled || isSavingScheduledEmail || isExecutionTimestampMode
                        }
                        submitButtonTooltipText={
                            isExecutionTimestampMode
                                ? intl.formatMessage({
                                      id: "dialogs.schedule.email.save.executionTimestampMode",
                                  })
                                : undefined
                        }
                        initialFocus={dialogTitleRef}
                        submitOnEnterKey={false}
                        onCancel={onCancel}
                        onSubmit={handleSaveScheduledEmail}
                        headline={undefined}
                        headerLeftButtonRenderer={() => (
                            <ScheduledEmailDialogHeader
                                title={editedAutomation.title ?? ""}
                                onChange={onTitleChange}
                                onCancel={onCancel}
                                placeholder={intl.formatMessage({
                                    id: "dialogs.schedule.email.title.placeholder",
                                })}
                                ref={dialogTitleRef}
                            />
                        )}
                    >
                        <h2 className={"sr-only"} id={titleElementId}>
                            {intl.formatMessage({ id: "dialogs.schedule.email.accessibilityTitle" })}
                        </h2>
                        <div
                            className={cx("gd-notifications-channel-dialog-content-wrapper", {
                                "gd-notification-channel-dialog-with-automation-filters":
                                    enableAutomationFilterContext,
                            })}
                        >
                            <div className="gd-divider-with-margin" />
                            {enableAutomationFilterContext ? (
                                <>
                                    <AutomationFiltersSelect
                                        availableFilters={availableFilters}
                                        selectedFilters={automationFilters}
                                        onFiltersChange={onFiltersChange}
                                        storeFilters={storeFilters}
                                        onStoreFiltersChange={onStoreFiltersChange}
                                        isDashboardAutomation={isDashboardExportSelected}
                                        areFiltersMissing={areVisibleFiltersMissingOnDashboard}
                                    />
                                    <ContentDivider className="gd-divider-with-margin" />
                                </>
                            ) : null}
                            <RecurrenceForm
                                startDate={startDate}
                                cronExpression={
                                    editedAutomation.schedule?.cron ?? getDefaultCronExpression(startDate)
                                }
                                cronDescription={editedAutomation.schedule?.cronDescription}
                                timezone={editedAutomation.schedule?.timezone ?? TIMEZONE_DEFAULT.identifier}
                                dateFormat={dateFormat ?? "MM/dd/yyyy"}
                                locale={locale}
                                weekStart={weekStart}
                                onChange={onRecurrenceChange}
                                allowHourlyRecurrence={allowHourlyRecurrence}
                                isWhiteLabeled={isWhiteLabeled}
                            />
                            <ContentDivider className="gd-divider-with-margin" />
                            <DestinationSelect
                                notificationChannels={notificationChannels}
                                selectedItemId={editedAutomation.notificationChannel}
                                onChange={onDestinationChange}
                            />
                            <ContentDivider className="gd-divider-with-margin" />
                            <RecipientsSelect
                                id="schedule.email.recipients"
                                loggedUser={defaultUser}
                                users={users}
                                usersError={usersError}
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
                            <SubjectForm
                                dashboardTitle={dashboardTitle}
                                editedAutomation={editedAutomation}
                                onChange={onSubjectChange}
                            />
                            <MessageForm
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
                                    enableAutomationFilterContext={enableAutomationFilterContext}
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
                                    enableAutomationFilterContext={enableAutomationFilterContext}
                                />
                            )}
                            {errorMessage ? (
                                <Message type="error" className="gd-notifications-channels-dialog-error">
                                    {errorMessage}
                                </Message>
                            ) : null}
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

function useDefaultScheduledEmailDialogData({ filters }: { filters: FilterContextItem[] }) {
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
    const isExecutionTimestampMode = !!useDashboardSelector(selectExecutionTimestamp);
    const enableAutomationFilterContextFlag = useDashboardSelector(selectEnableAutomationFilterContext);
    const enableAutomationFilterContext = useMemo(() => {
        const doAllFiltersHaveLocalIdentifiers = validateAllFilterLocalIdentifiers(filters);
        return enableAutomationFilterContextFlag && doAllFiltersHaveLocalIdentifiers;
    }, [filters, enableAutomationFilterContextFlag]);

    return {
        locale,
        dashboardTitle,
        dateFormat,
        weekStart,
        maxAutomationsRecipients,
        allowHourlyRecurrence,
        isCrossFiltering,
        isExecutionTimestampMode,
        enableAutomationFilterContext,
    };
}
