// (C) 2019-2025 GoodData Corporation

import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { defineMessage, useIntl } from "react-intl";

import {
    DashboardAttachmentType,
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    WidgetAttachmentType,
} from "@gooddata/sdk-model";
import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import {
    Button,
    ConfirmDialogBase,
    ContentDivider,
    Hyperlink,
    IUiTab,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    RecurrenceForm,
    ScrollablePanel,
    UiIcon,
    UiTabs,
    isEnterKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { DashboardAttachments } from "./components/Attachments/DashboardAttachments.js";
import { WidgetAttachments } from "./components/Attachments/WidgetAttachments.js";
import { DashboardAttachments as DashboardAttachmentsOld } from "./components/AttachmentsOld/DashboardAttachments.js";
import { WidgetAttachments as WidgetAttachmentsOld } from "./components/AttachmentsOld/WidgetAttachments.js";
import { DestinationSelect } from "./components/DestinationSelect/DestinationSelect.js";
import { EvaluationModeCheckbox } from "./components/EvaluationModeCheckbox/EvaluationModeCheckbox.js";
import { ScheduledEmailDialogHeader } from "./components/Header/ScheduleEmailDialogHeader.js";
import { MessageForm } from "./components/MessageForm/MessageForm.js";
import { RecipientsSelect } from "./components/RecipientsSelect/RecipientsSelect.js";
import { SubjectForm } from "./components/SubjectForm/SubjectForm.js";
import { DEFAULT_MAX_RECIPIENTS, SCHEDULED_EMAIL_DIALOG_ID } from "./constants.js";
import { DefaultLoadingScheduledEmailDialog } from "./DefaultLoadingScheduledEmailDialog.js";
import { useEditScheduledEmail } from "./hooks/useEditScheduledEmail.js";
import { useFiltersForDashboardScheduledExportInfo } from "./hooks/useFiltersForDashboardScheduledExportInfo.js";
import { useSaveScheduledEmailToBackend } from "./hooks/useSaveScheduledEmailToBackend.js";
import {
    getWidgetTitle,
    selectDashboardTitle,
    selectDateFormat,
    selectEnableAutomationFilterContext,
    selectEnableAutomationManagement,
    selectEnableDashboardTabs,
    selectEnableNewScheduledExport,
    selectEntitlementMaxAutomationRecipients,
    selectEntitlementMinimumRecurrenceMinutes,
    selectExecutionTimestamp,
    selectExternalRecipient,
    selectIsAutomationDialogSecondaryTitleVisible,
    selectIsCrossFiltering,
    selectIsWhiteLabeled,
    selectLocale,
    selectWeekStart,
    useDashboardSelector,
} from "../../../model/index.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import { AutomationFiltersSelect } from "../../automationFilters/components/AutomationFiltersSelect.js";
import { useValidateExistingAutomationFilters } from "../../automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { useAutomationFiltersSelect } from "../../automationFilters/useAutomationFiltersSelect.js";
import { validateAllFilterLocalIdentifiers } from "../../automationFilters/utils.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
import { IntlWrapper } from "../../localization/index.js";
import { DeleteScheduleConfirmDialog } from "../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import { IScheduledEmailDialogProps } from "../types.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { isMobileView } from "../utils/responsive.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";

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

function ScheduledEmailDialogFooter({
    isWhiteLabeled,
    helpTextId,
    scheduledExportToEdit,
    isSavingScheduledEmail,
    onDeleteClick,
}: ScheduledEmailDialogFooterProps) {
    const intl = useIntl();

    return (
        <div className="gd-notifications-channels-dialog-footer-link">
            {isWhiteLabeled ? null : (
                <Hyperlink
                    text={intl.formatMessage({ id: helpTextId })}
                    href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-ScheduleExport"
                    iconClass="gd-icon-circle-question"
                />
            )}
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
}

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
    const generalTabContentRef = useRef<HTMLDivElement | null>(null);
    const filtersTabContentRef = useRef<HTMLDivElement | null>(null);

    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);

    const [selectedTabId, setSelectedTabId] = useState<"general" | "filters">("general");
    const [tabContentHeight, setTabContentHeight] = useState<number | undefined>(undefined);

    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);
    const isSecondaryTitleVisible = useDashboardSelector(selectIsAutomationDialogSecondaryTitleVisible);
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);

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
        isParentValid,
        onDashboardAttachmentsChange,
        onDashboardAttachmentsChangeOld,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsChangeOld,
        onAttachmentsSettingsChange,
        onDestinationChange,
        onMessageChange,
        onRecipientsChange,
        onRecurrenceChange,
        onEvaluationModeChange,
        onSubjectChange,
        onTitleChange,
        onFiltersChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
        enableAutomationEvaluationMode,
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

    useEffect(() => {
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
        (e: KeyboardEvent) => {
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

    const tabs: IUiTab[] = useMemo(() => {
        const tabsList: IUiTab[] = [
            {
                id: "general",
                label: intl.formatMessage({ id: "dialogs.schedule.email.tabs.general" }),
            },
        ];

        // Only show Filters tab when both automation filter context and dashboard tabs are enabled
        if (enableAutomationFilterContext && enableDashboardTabs) {
            tabsList.push({
                id: "filters",
                label: intl.formatMessage({ id: "dialogs.schedule.email.tabs.filters" }),
            });
        }

        return tabsList;
    }, [intl, enableAutomationFilterContext, enableDashboardTabs]);

    const handleTabSelect = useCallback((tab: IUiTab) => {
        setSelectedTabId(tab.id as "filters" | "general");
    }, []);

    // Reset to General tab if Filters tab is not available
    useEffect(() => {
        if (!(enableAutomationFilterContext && enableDashboardTabs) && selectedTabId === "filters") {
            setSelectedTabId("general");
        }
    }, [enableAutomationFilterContext, enableDashboardTabs, selectedTabId]);

    // Measure General tab content height to maintain consistent dialog size
    useEffect(() => {
        if (
            enableDashboardTabs &&
            enableAutomationFilterContext &&
            generalTabContentRef.current &&
            selectedTabId === "general"
        ) {
            // Use requestAnimationFrame to ensure DOM is fully rendered
            requestAnimationFrame(() => {
                if (generalTabContentRef.current) {
                    const height = generalTabContentRef.current.scrollHeight;
                    setTabContentHeight(height);
                }
            });
        }
    }, [enableDashboardTabs, enableAutomationFilterContext, selectedTabId]);

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
                isModal
                positionType="fixed"
                ensureVisibility
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
                            isPositive
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
                                dialogId: SCHEDULED_EMAIL_DIALOG_ID,
                            }}
                            showProgressIndicator={isSavingScheduledEmail}
                            returnFocusTo={returnFocusTo}
                            returnFocusAfterClose={!enableAutomationManagement}
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
                                    isSecondaryTitleVisible={
                                        isSecondaryTitleVisible ? isParentValid : undefined
                                    }
                                />
                            )}
                        >
                            <h2 className={"sr-only"} id={titleElementId}>
                                {intl.formatMessage({ id: "dialogs.schedule.email.accessibilityTitle" })}
                            </h2>
                            {tabs.length > 1 && enableDashboardTabs ? (
                                <UiTabs
                                    tabs={tabs}
                                    selectedTabId={selectedTabId}
                                    onTabSelect={handleTabSelect}
                                    size="medium"
                                    accessibilityConfig={{
                                        role: "tablist",
                                        tabRole: "tab",
                                        ariaLabel: intl.formatMessage({
                                            id: "dialogs.schedule.email.accessibilityTitle",
                                        }),
                                    }}
                                    disableBottomBorder
                                />
                            ) : null}
                            <ScrollablePanel
                                className={cx("gd-notifications-channel-dialog-content-wrapper", {
                                    "gd-notification-channel-dialog-with-automation-filters":
                                        enableAutomationFilterContext,
                                    "gd-notification-channel-dialog-with-tabs":
                                        tabs.length > 1 && enableDashboardTabs,
                                })}
                            >
                                <div className="gd-divider-with-margin" />
                                {enableDashboardTabs &&
                                enableAutomationFilterContext &&
                                selectedTabId === "filters" ? (
                                    <div
                                        ref={filtersTabContentRef}
                                        className="gd-schedule-dialog-tab-content"
                                        style={
                                            tabContentHeight
                                                ? { minHeight: `${tabContentHeight}px` }
                                                : undefined
                                        }
                                    >
                                        <AutomationFiltersSelect
                                            availableFilters={availableFilters}
                                            selectedFilters={editedAutomationFilters}
                                            onFiltersChange={onFiltersChange}
                                            storeFilters={storeFilters}
                                            onStoreFiltersChange={onStoreFiltersChange}
                                            isDashboardAutomation={isDashboardExportSelected}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                            hideTitle
                                            showAllFilters
                                        />
                                    </div>
                                ) : (
                                    <div
                                        ref={generalTabContentRef}
                                        className="gd-schedule-dialog-tab-content"
                                    >
                                        {enableAutomationFilterContext && !enableDashboardTabs ? (
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
                                                editedAutomation.schedule?.cron ??
                                                getDefaultCronExpression(startDate)
                                            }
                                            cronDescription={editedAutomation.schedule?.cronDescription}
                                            timezone={
                                                editedAutomation.schedule?.timezone ??
                                                TIMEZONE_DEFAULT.identifier
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
                                        {isInPlatformChannel ? null : (
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
                                        )}
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
                                                    onWidgetAttachmentsSelectionChange={
                                                        onWidgetAttachmentsChangeOld
                                                    }
                                                    onAttachmentsSettingsChange={onAttachmentsSettingsChange}
                                                    enableAutomationFilterContext={
                                                        enableAutomationFilterContext
                                                    }
                                                    closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                                    overlayPositionType={OVERLAY_POSITION_TYPE}
                                                />
                                            )
                                        ) : enableNewScheduledExport ? (
                                            <DashboardAttachments
                                                selectedAttachments={
                                                    selectedAttachments as DashboardAttachmentType[]
                                                }
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
                                        {enableAutomationEvaluationMode ? (
                                            <EvaluationModeCheckbox
                                                isShared={editedAutomation.evaluationMode === "SHARED"}
                                                onChange={onEvaluationModeChange}
                                            />
                                        ) : null}
                                        {getInvalidDatapoints({ recursive: true })
                                            .filter(
                                                (invalidDatapoint) => invalidDatapoint.severity === "error",
                                            )
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
                                    </div>
                                )}
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
export function DefaultScheduledEmailDialog(props: IScheduledEmailDialogProps) {
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
}

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
