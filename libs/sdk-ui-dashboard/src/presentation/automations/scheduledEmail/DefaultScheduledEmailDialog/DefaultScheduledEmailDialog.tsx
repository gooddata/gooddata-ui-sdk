// (C) 2019-2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type DashboardAttachmentType,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type WidgetAttachmentType,
} from "@gooddata/sdk-model";
import { ValidationContextStore, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";
import {
    ConfirmDialogBase,
    ContentDivider,
    type IUiTab,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    RecurrenceForm,
    ScrollablePanel,
    UiTabs,
    getTimezoneDisplayLabel,
    isEnterKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../shared/automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import {
    AutomationDialogFooterLeft,
    DefaultAutomationDialogActionBar,
} from "../../shared/slots/DefaultAutomationDialogActionBar.js";
import { DeleteScheduleConfirmDialog } from "../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import { useScheduledExportActions } from "../state/ScheduledExportActionsContext.js";
import { useScheduledExportDraft } from "../state/ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "../state/ScheduledExportFiltersContext.js";
import { useSaveScheduledEmailToBackend } from "../state/useSaveScheduledEmailToBackend.js";
import {
    useScheduledEmailDialogActionBarProps,
    useScheduledEmailDialogDestinationProps,
    useScheduledEmailDialogFiltersProps,
    useScheduledEmailDialogHeaderProps,
    useScheduledEmailDialogRecipientsProps,
    useScheduledEmailDialogTimezoneProps,
} from "../state/useScheduledEmailDialogRegionProps.js";
import { useScheduledExportAttachments } from "../state/useScheduledExportAttachments.js";
import { useScheduledExportDialogValidity } from "../state/useScheduledExportDialogValidity.js";
import { type IDefaultScheduledEmailDialogProps } from "../types.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";

import { DashboardAttachments } from "./components/Attachments/DashboardAttachments.js";
import { WidgetAttachments } from "./components/Attachments/WidgetAttachments.js";
import { DefaultScheduledEmailDialogDestination } from "./components/DefaultScheduledEmailDialogDestination.js";
import { DefaultScheduledEmailDialogFilters } from "./components/DefaultScheduledEmailDialogFilters.js";
import { DefaultScheduledEmailDialogHeader } from "./components/DefaultScheduledEmailDialogHeader.js";
import { DefaultScheduledEmailDialogRecipients } from "./components/DefaultScheduledEmailDialogRecipients.js";
import { DefaultScheduledEmailDialogTimezone } from "./components/DefaultScheduledEmailDialogTimezone.js";
import { EvaluationModeCheckbox } from "./components/EvaluationModeCheckbox/EvaluationModeCheckbox.js";
import { MessageForm } from "./components/MessageForm/MessageForm.js";
import { SubjectForm } from "./components/SubjectForm/SubjectForm.js";
import { SCHEDULED_EMAIL_DIALOG_ID } from "./constants.js";
import { DefaultLoadingScheduledEmailDialog } from "./DefaultLoadingScheduledEmailDialog.js";
import { useElementHeightSnapshot } from "./hooks/useElementHeightSnapshot.js";

const CLOSE_ON_PARENT_SCROLL = true;

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export function ScheduledMailDialogRenderer({
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
    slots,
    topContent,
    bottomContent,
}: IDefaultScheduledEmailDialogProps) {
    const HeaderSlot = slots?.Header;
    const FiltersSlot = slots?.Filters;
    const TimezoneSlot = slots?.Timezone;
    const DestinationSlot = slots?.Destination;
    const RecipientsSlot = slots?.Recipients;
    const ActionBarSlot = slots?.ActionBar;

    const intl = useIntl();

    const dialogTitleRef = useRef<HTMLInputElement | null>(null);
    const generalTabContentRef = useRef<HTMLDivElement | null>(null);
    const filtersTabContentRef = useRef<HTMLDivElement | null>(null);

    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);

    const [selectedTabId, setSelectedTabId] = useState<"general" | "filters">("general");

    const { isWhiteLabeled, tabIds } = useAutomationsContext();
    const { exportTemplates, widget, dashboardFilters, notificationChannels } =
        useScheduledEmailDialogContext();

    const handleScheduleDeleteSuccess = () => {
        onDeleteSuccess?.();
        setScheduledEmailToDelete(null);
    };

    const {
        locale,
        dashboardTitle,
        dateFormat,
        weekStart,
        allowHourlyRecurrence,
        isCrossFiltering,
        isSlidesExportEnabled,
        isAccessibilityModeEnabled,
        enableAutomationEvaluationMode,
    } = useDefaultScheduledEmailDialogData();

    const {
        editedAutomation,
        startDate,
        isTimezoneFeatureEnabled,
        canSelectScheduleTimezone,
        scheduleTimezoneIsStale,
    } = useScheduledExportDraft();
    const {
        onRecurrenceChange,
        onEvaluationModeChange,
        onSubjectChange,
        onMessageChange,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        onSlidesTemplateIdChange,
        applyCurrentScheduleTimezone,
    } = useScheduledExportActions();
    const {
        onApplyCurrentFilters,
        automationIsValid,
        applyLatest: applyLatestParameters,
    } = useScheduledExportFilters();
    const { selectedAttachments, xlsxSettings, pdfSettings, csvSettings, csvRawSettings, slidesTemplateIds } =
        useScheduledExportAttachments();
    const { isSubmitDisabled, validationErrorMessage } = useScheduledExportDialogValidity();

    // a stale schedule timezone repairs through the same consent dialog as stale filters
    const [isApplyCurrentFiltersDialogOpen, setIsApplyCurrentFiltersDialogOpen] = useState(
        !automationIsValid || scheduleTimezoneIsStale,
    );

    const { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage } =
        useSaveScheduledEmailToBackend({ onSuccess, onError, onSubmit, onSaveSuccess, onSaveError, onSave });

    const { returnFocusTo } = useScheduleEmailDialogAccessibility();

    const missingAttachmentsErrorMessage =
        selectedAttachments.length === 0 &&
        intl.formatMessage({ id: "scheduledEmail.attachments.error.noAttachmentsSelected" });

    const validationContextValue = useValidationContextValue(
        createInvalidNode({ id: "ScheduledEmailDialog" }),
    );
    const { getInvalidDatapoints } = validationContextValue;

    const errorMessage = savingErrorMessage ?? validationErrorMessage ?? missingAttachmentsErrorMessage;

    const titleElementId = useIdPrefixed("title");

    const actionBarDefaultProps = useScheduledEmailDialogActionBarProps({
        onCancel,
        onSubmit: handleSaveScheduledEmail,
        isSaving: isSavingScheduledEmail,
        onDelete: () => setScheduledEmailToDelete(editedAutomation),
    });
    const submitDisabled = actionBarDefaultProps.isSubmitDisabled;

    const handleSubmitForm = useCallback(
        (e: KeyboardEvent) => {
            if (isEnterKey(e) && !submitDisabled) {
                handleSaveScheduledEmail();
            }
        },
        [submitDisabled, handleSaveScheduledEmail],
    );

    const headerDefaultProps = useScheduledEmailDialogHeaderProps({
        onBack,
        onTitleKeyDown: handleSubmitForm,
        ref: dialogTitleRef,
    });
    const filtersDefaultProps = useScheduledEmailDialogFiltersProps();
    const destinationDefaultProps = useScheduledEmailDialogDestinationProps();
    const recipientsDefaultProps = useScheduledEmailDialogRecipientsProps({
        onKeyDownSubmit: handleSubmitForm,
    });
    const timezoneDefaultProps = useScheduledEmailDialogTimezoneProps();

    const tabs: IUiTab[] = useMemo(
        () => [
            {
                id: "general",
                label: intl.formatMessage({ id: "dialogs.schedule.email.tabs.general" }),
            },
            {
                id: "filters",
                label: intl.formatMessage({ id: "dialogs.schedule.email.tabs.filters" }),
            },
        ],
        [intl],
    );

    const handleTabSelect = useCallback((tab: IUiTab) => {
        setSelectedTabId(tab.id as "filters" | "general");
    }, []);

    // Measure General tab content height to maintain consistent dialog size. Re-measures on
    // content-size changes within the General tab itself (e.g. validation messages
    // appearing/disappearing), not just on tab switch - otherwise the Filters tab could
    // inherit a stale minHeight from before the change. The last measured value is kept
    // internally so it survives the General tab unmounting when the user switches to Filters.
    const tabContentHeight = useElementHeightSnapshot(generalTabContentRef, selectedTabId);

    if (isApplyCurrentFiltersDialogOpen) {
        return (
            <ApplyCurrentFiltersConfirmDialog
                automationType="schedule"
                filtersChanged={!automationIsValid}
                timezoneChanged={scheduleTimezoneIsStale}
                onCancel={() => onCancel?.()}
                onEdit={() => {
                    // each repair only fixes its own staleness: a timezone-only repair must not
                    // replace intentionally snapshotted, still-valid filters (and vice versa)
                    if (!automationIsValid) {
                        onApplyCurrentFilters();
                        applyLatestParameters();
                    }
                    applyCurrentScheduleTimezone();
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
                            className="gd-notifications-channels-dialog s-gd-notifications-channels-dialog gd-dialog--wide gd-notifications-channels-dialog--wide"
                            isPositive
                            cancelButtonText={actionBarDefaultProps.cancelButtonText}
                            submitButtonText={actionBarDefaultProps.submitButtonText}
                            accessibilityConfig={{
                                closeButton: {
                                    ariaLabel: intl.formatMessage({
                                        id: "dialogs.schedule.email.closeLabel",
                                    }),
                                },
                                titleElementId,
                                dialogId: SCHEDULED_EMAIL_DIALOG_ID,
                            }}
                            showProgressIndicator={actionBarDefaultProps.isSaving}
                            returnFocusTo={returnFocusTo}
                            returnFocusAfterClose={false}
                            footerLeftRenderer={
                                ActionBarSlot
                                    ? undefined
                                    : () => (
                                          <AutomationDialogFooterLeft
                                              helpLinkText={actionBarDefaultProps.helpLinkText}
                                              helpLinkHref={actionBarDefaultProps.helpLinkHref}
                                              deleteButtonText={actionBarDefaultProps.deleteButtonText}
                                              onDelete={actionBarDefaultProps.onDelete}
                                              isDeleteDisabled={actionBarDefaultProps.isSaving}
                                          />
                                      )
                            }
                            footerRenderer={
                                ActionBarSlot
                                    ? () => (
                                          <ActionBarSlot
                                              Default={DefaultAutomationDialogActionBar}
                                              defaultProps={actionBarDefaultProps}
                                          />
                                      )
                                    : undefined
                            }
                            isSubmitDisabled={actionBarDefaultProps.isSubmitDisabled}
                            submitButtonTooltipText={actionBarDefaultProps.submitButtonTooltipText}
                            initialFocus={dialogTitleRef}
                            submitOnEnterKey={false}
                            onCancel={onCancel}
                            onSubmit={actionBarDefaultProps.onSubmit}
                            headline={undefined}
                            headerLeftButtonRenderer={() => {
                                return HeaderSlot ? (
                                    <HeaderSlot
                                        Default={DefaultScheduledEmailDialogHeader}
                                        defaultProps={headerDefaultProps}
                                    />
                                ) : (
                                    <DefaultScheduledEmailDialogHeader {...headerDefaultProps} />
                                );
                            }}
                        >
                            <h2 className={"sr-only"} id={titleElementId}>
                                {intl.formatMessage({ id: "dialogs.schedule.email.accessibilityTitle" })}
                            </h2>
                            {tabs.length > 1 ? (
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
                                    "gd-notification-channel-dialog-with-automation-filters": true,
                                    "gd-notification-channel-dialog-with-tabs": tabs.length > 1,
                                })}
                            >
                                {topContent}
                                <div className="gd-divider-with-margin" />
                                {selectedTabId === "filters" ? (
                                    <div
                                        ref={filtersTabContentRef}
                                        className="gd-schedule-dialog-tab-content"
                                        style={
                                            tabContentHeight
                                                ? { minHeight: `${tabContentHeight}px` }
                                                : undefined
                                        }
                                    >
                                        {FiltersSlot ? (
                                            <FiltersSlot
                                                Default={DefaultScheduledEmailDialogFilters}
                                                defaultProps={filtersDefaultProps}
                                            />
                                        ) : (
                                            <DefaultScheduledEmailDialogFilters {...filtersDefaultProps} />
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        ref={generalTabContentRef}
                                        className="gd-schedule-dialog-tab-content"
                                    >
                                        {!widget && tabIds.length > 1 ? (
                                            <Message
                                                type="progress"
                                                className="gd-schedule-dialog-tab-content-info"
                                            >
                                                {intl.formatMessage({
                                                    id: "dialogs.schedule.email.tabs.info",
                                                })}
                                            </Message>
                                        ) : null}
                                        <RecurrenceForm
                                            startDate={startDate}
                                            cronExpression={
                                                editedAutomation.schedule?.cron ??
                                                getDefaultCronExpression(startDate)
                                            }
                                            cronDescription={editedAutomation.schedule?.cronDescription}
                                            timezone={
                                                // display-only prop; with the timezone feature on,
                                                // show the friendly label used by the time zone
                                                // picker instead of the raw IANA ID
                                                isTimezoneFeatureEnabled
                                                    ? getTimezoneDisplayLabel(
                                                          editedAutomation.schedule?.timezone ??
                                                              TIMEZONE_DEFAULT.identifier,
                                                      )
                                                    : (editedAutomation.schedule?.timezone ??
                                                      TIMEZONE_DEFAULT.identifier)
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
                                        {DestinationSlot ? (
                                            <DestinationSlot
                                                Default={DefaultScheduledEmailDialogDestination}
                                                defaultProps={destinationDefaultProps}
                                            />
                                        ) : (
                                            <DefaultScheduledEmailDialogDestination
                                                {...destinationDefaultProps}
                                            />
                                        )}
                                        <ContentDivider className="gd-divider-with-margin" />
                                        {RecipientsSlot ? (
                                            <RecipientsSlot
                                                Default={DefaultScheduledEmailDialogRecipients}
                                                defaultProps={recipientsDefaultProps}
                                            />
                                        ) : (
                                            <DefaultScheduledEmailDialogRecipients
                                                {...recipientsDefaultProps}
                                            />
                                        )}
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
                                            <WidgetAttachments
                                                selectedAttachments={
                                                    selectedAttachments as WidgetAttachmentType[]
                                                }
                                                onWidgetAttachmentsChange={onWidgetAttachmentsChange}
                                                xlsxSettings={xlsxSettings}
                                                pdfSettings={pdfSettings}
                                                onXlsxSettingsChange={onXlsxSettingsChange}
                                                onPdfSettingsChange={onPdfSettingsChange}
                                                csvSettings={csvSettings}
                                                onCsvSettingsChange={onCsvSettingsChange}
                                                csvRawSettings={csvRawSettings}
                                                onCsvRawSettingsChange={onCsvRawSettingsChange}
                                                isSlidesExportEnabled={isSlidesExportEnabled}
                                                isAccessibilityModeEnabled={isAccessibilityModeEnabled}
                                                exportTemplates={exportTemplates}
                                                slidesTemplateIds={slidesTemplateIds}
                                                onSlidesTemplateIdChange={onSlidesTemplateIdChange}
                                            />
                                        ) : (
                                            <DashboardAttachments
                                                selectedAttachments={
                                                    selectedAttachments as DashboardAttachmentType[]
                                                }
                                                dashboardFilters={dashboardFilters}
                                                isCrossFiltering={isCrossFiltering}
                                                onDashboardAttachmentsChange={onDashboardAttachmentsChange}
                                                xlsxSettings={xlsxSettings}
                                                onXlsxSettingsChange={onXlsxSettingsChange}
                                                isSlidesExportEnabled={isSlidesExportEnabled}
                                                exportTemplates={exportTemplates}
                                                slidesTemplateIds={slidesTemplateIds}
                                                onSlidesTemplateIdChange={onSlidesTemplateIdChange}
                                            />
                                        )}
                                        {canSelectScheduleTimezone ? (
                                            TimezoneSlot ? (
                                                <TimezoneSlot
                                                    Default={DefaultScheduledEmailDialogTimezone}
                                                    defaultProps={timezoneDefaultProps}
                                                />
                                            ) : (
                                                <DefaultScheduledEmailDialogTimezone
                                                    {...timezoneDefaultProps}
                                                />
                                            )
                                        ) : null}
                                        {enableAutomationEvaluationMode ? (
                                            <EvaluationModeCheckbox
                                                isShared={editedAutomation.evaluationMode === "SHARED"}
                                                onChange={onEvaluationModeChange}
                                            />
                                        ) : null}
                                        {errorMessage ? (
                                            <Message
                                                type="error"
                                                className={cx("gd-notifications-channels-dialog-error", {
                                                    "gd-notifications-channels-dialog-error-scrollable": true,
                                                })}
                                            >
                                                {errorMessage}
                                            </Message>
                                        ) : null}
                                        {getInvalidDatapoints()
                                            .filter(
                                                (invalidDatapoint) => invalidDatapoint.severity === "error",
                                            )
                                            .map((invalidDatapoint) => (
                                                <Message
                                                    key={invalidDatapoint.id}
                                                    id={invalidDatapoint.id}
                                                    type="error"
                                                    className={cx("gd-notifications-channels-dialog-error", {
                                                        "gd-notifications-channels-dialog-error-scrollable": true,
                                                    })}
                                                >
                                                    {invalidDatapoint.message}
                                                </Message>
                                            ))}
                                    </div>
                                )}
                                {bottomContent}
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
 * Default implementation of the scheduled export create/edit dialog.
 *
 * This component is a pure consumer of `AutomationsContext`, `ScheduledEmailDialogContext`, and the
 * scheduled export dialog state contexts: it reads org/workspace data, per-dialog state, and the
 * export draft's state from those contexts rather than from the dashboard store. It must therefore
 * be rendered within an `AutomationsContextProvider`, a `ScheduledEmailDialogContextProvider` (for
 * the create/edit flow), and a `ScheduledEmailDialogStateProvider`, whose state model establishes
 * itself once `useScheduledEmailDialogContext().isLoading` is false. Inside a `Dashboard`, the
 * scheduled export connector supplies the first two providers above the
 * `ScheduledEmailDialogComponent` slot and mounts `ScheduledEmailDialogStateProvider` around the
 * resolved slot component — so the default component, and any wholesale slot replacement, inherit
 * all three contexts automatically and require no extra wiring.
 *
 * The providers are intentionally hoisted above the slot rather than built inside this component:
 * that is what lets a wholesale replacement receive the same contexts. Rendering this component
 * outside those providers throws at runtime.
 *
 * The dialog is composed from the exported region renders — {@link DefaultScheduledEmailDialogHeader},
 * {@link DefaultScheduledEmailDialogFilters}, {@link DefaultScheduledEmailDialogDestination},
 * {@link DefaultScheduledEmailDialogRecipients}, {@link DefaultScheduledEmailDialogTimezone},
 * {@link DefaultAutomationDialogActionBar} — fed by the matching `use*Props` hooks
 * ({@link useScheduledEmailDialogFiltersProps} and siblings). A custom `ScheduledEmailDialogComponent`
 * that keeps our regions but owns the markup places the connected blocks
 * ({@link ScheduledEmailDialogFilters} and siblings) instead of this component, and reads or writes
 * the same draft through {@link useScheduledExportDraft} and {@link useScheduledExportActions}.
 *
 * Slots render only in the fully rendered dialog: not while the dialog context reports loading,
 * and not while the stale-filters confirmation step is shown. The Filters slot additionally
 * renders only while the Filters tab is selected — see {@link IScheduledEmailDialogSlots.Filters}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialog(props: IDefaultScheduledEmailDialogProps) {
    const { onCancel } = props;
    const { isLoading, scheduledExportToEdit } = useScheduledEmailDialogContext();
    if (isLoading) {
        return (
            <DefaultLoadingScheduledEmailDialog
                onCancel={onCancel}
                scheduledExportToEdit={scheduledExportToEdit}
            />
        );
    }
    return <DefaultScheduledEmailDialogBody {...props} />;
}

function DefaultScheduledEmailDialogBody(props: IDefaultScheduledEmailDialogProps) {
    const { locale } = useAutomationsContext();

    return (
        <IntlWrapper locale={locale}>
            <ScheduledMailDialogRenderer {...props} />
        </IntlWrapper>
    );
}

function useDefaultScheduledEmailDialogData() {
    const {
        locale,
        settings,
        weekStart,
        allowHourlyRecurrence,
        features: { enableSlideshowExports, enableAutomationEvaluationMode },
    } = useAutomationsContext();
    const { dashboardTitle, dateFormat, isCrossFiltering } = useScheduledEmailDialogContext();

    return {
        locale,
        dashboardTitle,
        dateFormat,
        weekStart,
        allowHourlyRecurrence,
        isCrossFiltering,
        isSlidesExportEnabled: enableSlideshowExports,
        isAccessibilityModeEnabled: settings?.enableAccessibilityMode === true,
        enableAutomationEvaluationMode,
    };
}
