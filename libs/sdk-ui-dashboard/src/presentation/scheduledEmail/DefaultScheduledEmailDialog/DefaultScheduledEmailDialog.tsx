// (C) 2019-2025 GoodData Corporation
import {
    DashboardAttachmentType,
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    WidgetAttachmentType,
} from "@gooddata/sdk-model";
import {
    Button,
    ConfirmDialogBase,
    ContentDivider,
    Hyperlink,
    isEnterKey,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    RecurrenceForm,
    ScrollablePanel,
    UiIcon,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { defineMessage, useIntl } from "react-intl";
import {
    selectDashboardTitle,
    selectDateFormat,
    selectEnableAutomationFilterContext,
    selectEntitlementMaxAutomationRecipients,
    selectEntitlementMinimumRecurrenceMinutes,
    selectExecutionTimestamp,
    selectExternalRecipient,
    selectIsCrossFiltering,
    selectIsWhiteLabeled,
    selectLocale,
    selectWeekStart,
    useDashboardSelector,
    selectEnableNewScheduledExport,
    getWidgetTitle,
    selectEnableDashboardAutomationManagement,
    selectIsScheduledEmailSecondaryTitleVisible,
} from "../../../model/index.js";
import { AutomationFiltersSelect } from "../../automationFilters/components/AutomationFiltersSelect.js";
import { validateAllFilterLocalIdentifiers } from "../../automationFilters/utils.js";
import { useAutomationFiltersSelect } from "../../automationFilters/useAutomationFiltersSelect.js";
import { useValidateExistingAutomationFilters } from "../../automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
import { IntlWrapper } from "../../localization/index.js";
import { DeleteScheduleConfirmDialog } from "../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js";
import { IScheduledEmailDialogProps } from "../types.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { isMobileView } from "../utils/responsive.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";
import { DashboardAttachments as DashboardAttachmentsOld } from "./components/AttachmentsOld/DashboardAttachments.js";
import { WidgetAttachments as WidgetAttachmentsOld } from "./components/AttachmentsOld/WidgetAttachments.js";
import { DashboardAttachments } from "./components/Attachments/DashboardAttachments.js";
import { WidgetAttachments } from "./components/Attachments/WidgetAttachments.js";
import { DestinationSelect } from "./components/DestinationSelect/DestinationSelect.js";
import { RecipientsSelect } from "./components/RecipientsSelect/RecipientsSelect.js";
import { DEFAULT_MAX_RECIPIENTS } from "./constants.js";
import { DefaultLoadingScheduledEmailDialog } from "./DefaultLoadingScheduledEmailDialog.js";
import { useEditScheduledEmail } from "./hooks/useEditScheduledEmail.js";
import { useFiltersForDashboardScheduledExportInfo } from "./hooks/useFiltersForDashboardScheduledExportInfo.js";
import { useSaveScheduledEmailToBackend } from "./hooks/useSaveScheduledEmailToBackend.js";

import { ScheduledEmailDialogHeader } from "./components/Header/ScheduleEmailDialogHeader.js";
import { MessageForm } from "./components/MessageForm/MessageForm.js";
import { SubjectForm } from "./components/SubjectForm/SubjectForm.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import {
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
    ValidationContextStore,
} from "@gooddata/sdk-ui";

const DEFAULT_MIN_RECURRENCE_MINUTES = "60";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

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
    onBack,
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
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);
    const isScheduledEmailSecondaryTitleVisible = useDashboardSelector(
        selectIsScheduledEmailSecondaryTitleVisible,
    );
    const enableAutomationManagement = useDashboardSelector(selectEnableDashboardAutomationManagement);

    const handleScheduleDeleteSuccess = () => {
        onDeleteSuccess?.();
        setScheduledEmailToDelete(null);
    };

    const {
        editedAutomationFilters,
        setEditedAutomationFilters,
        storeFilters,
        setStoreFilters,
        availableFilters,
        availableFiltersAsVisibleFilters,
        filtersForNewAutomation,
    } = useAutomationFiltersSelect({
        automationToEdit: scheduledExportToEdit,
        widget,
    });

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
        enableNewScheduledExport,
    } = useDefaultScheduledEmailDialogData({ filters: availableFilters ?? [] });

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
        selectedAttachments,
        onDashboardAttachmentsChange,
        onDashboardAttachmentsChangeOld,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsChangeOld,
        onAttachmentsSettingsChange,
        onDestinationChange,
        onMessageChange,
        onRecipientsChange,
        onRecurrenceChange,
        onSubjectChange,
        onTitleChange,
        onFiltersChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
    } = useEditScheduledEmail({
        notificationChannels,
        insight,
        widget,
        scheduledExportToEdit,
        storeFilters,
        editedAutomationFilters,
        dashboardFilters,
        widgetFilters,
        maxAutomationsRecipients,
        setEditedAutomationFilters,
        setStoreFilters,
        availableFiltersAsVisibleFilters,
        enableAutomationFilterContext,
        filtersForNewAutomation,
        externalRecipientOverride,
        enableNewScheduledExport,
    });

    const { isValid } = useValidateExistingAutomationFilters({
        automationToEdit: scheduledExportToEdit!,
        widget,
        insight,
        enableAutomationFilterContext,
    });
    const [isApplyCurrentFiltersDialogOpen, setIsApplyCurrentFiltersDialogOpen] = useState(!isValid);

    const { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage } =
        useSaveScheduledEmailToBackend(editedAutomation, {
            onSuccess,
            onError,
            onSubmit,
            onSaveSuccess,
            onSaveError,
            onSave,
        });

    const { returnFocusTo } = useScheduleEmailDialogAccessibility();

    const missingAttachmentsErrorMessage =
        selectedAttachments.length === 0 &&
        intl.formatMessage({ id: "scheduledEmail.attachments.error.noAttachmentsSelected" });

    const validationContextValue = useValidationContextValue(
        createInvalidNode({ id: "ScheduledEmailDialog" }),
    );
    const { getInvalidDatapoints, setInvalidDatapoints } = validationContextValue;

    React.useEffect(() => {
        const errorMessage = savingErrorMessage ?? validationErrorMessage ?? missingAttachmentsErrorMessage;

        if (!errorMessage) {
            return;
        }

        setInvalidDatapoints(() => [createInvalidDatapoint({ message: errorMessage })]);
    }, [missingAttachmentsErrorMessage, savingErrorMessage, setInvalidDatapoints, validationErrorMessage]);

    const dashboardScheduledExportFiltersInfo = useFiltersForDashboardScheduledExportInfo({
        effectiveFilters: dashboardFilters,
    });
    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.schedule.email.footer.title.short" }).id
        : defineMessage({ id: "dialogs.schedule.email.footer.title" }).id;

    const titleElementId = useIdPrefixed("title");

    const submitDisabled = isSubmitDisabled || isSavingScheduledEmail || isExecutionTimestampMode;

    const handleSubmitForm = useCallback(
        (e: React.KeyboardEvent) => {
            if (isEnterKey(e) && !submitDisabled) {
                handleSaveScheduledEmail();
            }
        },
        [submitDisabled, handleSaveScheduledEmail],
    );

    const { secondaryTitle, secondaryTitleIcon } = useMemo(() => {
        if (widget) {
            return {
                secondaryTitle: getWidgetTitle(widget),
                secondaryTitleIcon: <UiIcon type="visualization" size={16} color="complementary-6" />,
            };
        }
        return {
            secondaryTitle: dashboardTitle,
            secondaryTitleIcon: <UiIcon type="dashboard" size={16} color="complementary-6" />,
        };
    }, [widget, dashboardTitle]);

    // This should be visible only when enableAutomationFilterContext is true
    if (isApplyCurrentFiltersDialogOpen && enableAutomationFilterContext) {
        return (
            <ApplyCurrentFiltersConfirmDialog
                automationType="schedule"
                onCancel={() => onCancel?.()}
                onEdit={() => {
                    onApplyCurrentFilters();
                    setIsApplyCurrentFiltersDialogOpen(false);
                }}
            />
        );
    }

    const selectedChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation.notificationChannel,
    );
    const isInPlatformChannel = selectedChannel?.destinationType === "inPlatform";
    return (
        <>
            <Overlay
                className="gd-notifications-channels-dialog-overlay"
                isModal={true}
                positionType="fixed"
                ensureVisibility={true}
            >
                <OverlayControllerProvider overlayController={overlayController}>
                    <ValidationContextStore value={validationContextValue}>
                        <ConfirmDialogBase
                            className={cx(
                                "gd-notifications-channels-dialog s-gd-notifications-channels-dialog",
                                {
                                    "gd-dialog--wide gd-notifications-channels-dialog--wide":
                                        enableAutomationManagement,
                                },
                            )}
                            isPositive={true}
                            cancelButtonText={intl.formatMessage({ id: "cancel" })}
                            submitButtonText={
                                scheduledExportToEdit
                                    ? intl.formatMessage({ id: `dialogs.schedule.email.save` })
                                    : intl.formatMessage({ id: `dialogs.schedule.email.create` })
                            }
                            accessibilityConfig={{
                                closeButton: {
                                    ariaLabel: intl.formatMessage({
                                        id: "dialogs.schedule.email.closeLabel",
                                    }),
                                },
                                titleElementId,
                            }}
                            showProgressIndicator={isSavingScheduledEmail}
                            returnFocusTo={returnFocusTo}
                            footerLeftRenderer={() => (
                                <ScheduledEmailDialogFooter
                                    isWhiteLabeled={isWhiteLabeled}
                                    helpTextId={helpTextId}
                                    scheduledExportToEdit={scheduledExportToEdit}
                                    isSavingScheduledEmail={isSavingScheduledEmail}
                                    onDeleteClick={() => setScheduledEmailToDelete(editedAutomation)}
                                />
                            )}
                            isSubmitDisabled={submitDisabled}
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
                                    onBack={onBack}
                                    placeholder={intl.formatMessage({
                                        id: "dialogs.schedule.email.title.placeholder",
                                    })}
                                    ref={dialogTitleRef}
                                    onKeyDownSubmit={handleSubmitForm}
                                    secondaryTitle={secondaryTitle}
                                    secondaryTitleIcon={secondaryTitleIcon}
                                    isSecondaryTitleVisible={isScheduledEmailSecondaryTitleVisible}
                                />
                            )}
                        >
                            <h2 className={"sr-only"} id={titleElementId}>
                                {intl.formatMessage({ id: "dialogs.schedule.email.accessibilityTitle" })}
                            </h2>
                            <ScrollablePanel
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
                                            selectedFilters={editedAutomationFilters}
                                            onFiltersChange={onFiltersChange}
                                            storeFilters={storeFilters}
                                            onStoreFiltersChange={onStoreFiltersChange}
                                            isDashboardAutomation={isDashboardExportSelected}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
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
                                    timezone={
                                        editedAutomation.schedule?.timezone ?? TIMEZONE_DEFAULT.identifier
                                    }
                                    dateFormat={dateFormat ?? "MM/dd/yyyy"}
                                    locale={locale}
                                    weekStart={weekStart}
                                    onChange={onRecurrenceChange}
                                    allowHourlyRecurrence={allowHourlyRecurrence}
                                    isWhiteLabeled={isWhiteLabeled}
                                    closeDropdownsOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                    onKeyDownSubmit={handleSubmitForm}
                                />
                                <ContentDivider className="gd-divider-with-margin" />
                                <DestinationSelect
                                    notificationChannels={notificationChannels}
                                    selectedItemId={editedAutomation.notificationChannel}
                                    onChange={onDestinationChange}
                                    closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                    overlayPositionType={OVERLAY_POSITION_TYPE}
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
                                    onKeyDownSubmit={handleSubmitForm}
                                    externalRecipientOverride={externalRecipientOverride}
                                />
                                {!isInPlatformChannel ? (
                                    <>
                                        <SubjectForm
                                            dashboardTitle={dashboardTitle}
                                            editedAutomation={editedAutomation}
                                            onChange={onSubjectChange}
                                            onKeyDownSubmit={handleSaveScheduledEmail}
                                            isSubmitDisabled={isSubmitDisabled}
                                        />
                                        <MessageForm
                                            onChange={onMessageChange}
                                            value={editedAutomation.details?.message ?? ""}
                                        />
                                    </>
                                ) : null}
                                {widget ? (
                                    enableNewScheduledExport ? (
                                        <WidgetAttachments
                                            selectedAttachments={
                                                selectedAttachments as WidgetAttachmentType[]
                                            }
                                            onWidgetAttachmentsChange={onWidgetAttachmentsChange}
                                            xlsxSettings={settings}
                                            onXlsxSettingsChange={onAttachmentsSettingsChange}
                                        />
                                    ) : (
                                        <WidgetAttachmentsOld
                                            widgetFilters={widgetFilters}
                                            areDashboardFiltersChanged={areDashboardFiltersChanged}
                                            isCrossFiltering={isCrossFiltering}
                                            scheduledExportToEdit={scheduledExportToEdit}
                                            csvSelected={isCsvExportSelected}
                                            xlsxSelected={isXlsxExportSelected}
                                            settings={settings}
                                            onWidgetAttachmentsSelectionChange={onWidgetAttachmentsChangeOld}
                                            onAttachmentsSettingsChange={onAttachmentsSettingsChange}
                                            enableAutomationFilterContext={enableAutomationFilterContext}
                                            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                        />
                                    )
                                ) : enableNewScheduledExport ? (
                                    <DashboardAttachments
                                        selectedAttachments={selectedAttachments as DashboardAttachmentType[]}
                                        dashboardFilters={dashboardFilters}
                                        isCrossFiltering={isCrossFiltering}
                                        onDashboardAttachmentsChange={onDashboardAttachmentsChange}
                                        xlsxSettings={settings}
                                        onXlsxSettingsChange={onAttachmentsSettingsChange}
                                    />
                                ) : (
                                    <DashboardAttachmentsOld
                                        dashboardSelected={isDashboardExportSelected}
                                        scheduledExportToEdit={scheduledExportToEdit}
                                        areDashboardFiltersChanged={areDashboardFiltersChanged}
                                        dashboardFilters={dashboardFilters}
                                        isCrossFiltering={isCrossFiltering}
                                        filtersToDisplayInfo={dashboardScheduledExportFiltersInfo}
                                        onDashboardAttachmentsSelectionChange={
                                            onDashboardAttachmentsChangeOld
                                        }
                                        enableAutomationFilterContext={enableAutomationFilterContext}
                                    />
                                )}
                                {getInvalidDatapoints({ recursive: true })
                                    .filter((invalidDatapoint) => invalidDatapoint.severity === "error")
                                    .map((invalidDatapoint) => (
                                        <Message
                                            key={invalidDatapoint.id}
                                            id={invalidDatapoint.id}
                                            type="error"
                                            className={cx("gd-notifications-channels-dialog-error", {
                                                "gd-notifications-channels-dialog-error-scrollable":
                                                    enableAutomationFilterContext,
                                            })}
                                        >
                                            {invalidDatapoint.message}
                                        </Message>
                                    ))}
                            </ScrollablePanel>
                        </ConfirmDialogBase>
                    </ValidationContextStore>
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
        const doAllDashboardFiltersHaveLocalIdentifiers = validateAllFilterLocalIdentifiers(filters);
        return enableAutomationFilterContextFlag && doAllDashboardFiltersHaveLocalIdentifiers;
    }, [filters, enableAutomationFilterContextFlag]);
    const enableNewScheduledExport = useDashboardSelector(selectEnableNewScheduledExport);

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
        enableNewScheduledExport,
    };
}
