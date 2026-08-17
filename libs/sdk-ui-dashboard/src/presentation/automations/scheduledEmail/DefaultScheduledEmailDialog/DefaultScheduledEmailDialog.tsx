// (C) 2019-2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { defineMessage, useIntl } from "react-intl";

import {
    type DashboardAttachmentType,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type WidgetAttachmentType,
} from "@gooddata/sdk-model";
import { ValidationContextStore, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";
import {
    Button,
    ConfirmDialogBase,
    ContentDivider,
    Hyperlink,
    type IUiTab,
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

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../shared/automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import { AutomationFiltersSelect } from "../../shared/automationFilters/components/AutomationFiltersSelect.js";
import { DeleteScheduleConfirmDialog } from "../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import { useScheduledExportActions } from "../state/ScheduledExportActionsContext.js";
import { useScheduledExportData } from "../state/ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "../state/ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "../state/ScheduledExportFiltersContext.js";
import { useScheduledExportAttachments } from "../state/useScheduledExportAttachments.js";
import { useScheduledExportDialogValidity } from "../state/useScheduledExportDialogValidity.js";
import {
    type IDefaultScheduledEmailDialogProps,
    type ScheduledEmailDialogHeaderDefaultProps,
} from "../types.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { isMobileView } from "../utils/responsive.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";

import { DashboardAttachments } from "./components/Attachments/DashboardAttachments.js";
import { WidgetAttachments } from "./components/Attachments/WidgetAttachments.js";
import { DestinationSelect } from "./components/DestinationSelect/DestinationSelect.js";
import { EvaluationModeCheckbox } from "./components/EvaluationModeCheckbox/EvaluationModeCheckbox.js";
import { ScheduledEmailDialogHeader } from "./components/Header/ScheduleEmailDialogHeader.js";
import { MessageForm } from "./components/MessageForm/MessageForm.js";
import { RecipientsSelect } from "./components/RecipientsSelect/RecipientsSelect.js";
import { SubjectForm } from "./components/SubjectForm/SubjectForm.js";
import { SCHEDULED_EMAIL_DIALOG_ID } from "./constants.js";
import { DefaultLoadingScheduledEmailDialog } from "./DefaultLoadingScheduledEmailDialog.js";
import { useElementHeightSnapshot } from "./hooks/useElementHeightSnapshot.js";
import { useSaveScheduledEmailToBackend } from "./hooks/useSaveScheduledEmailToBackend.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

interface IScheduledEmailDialogFooterProps {
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
}: IScheduledEmailDialogFooterProps) {
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
}: IDefaultScheduledEmailDialogProps) {
    const HeaderSlot = slots?.Header;

    const intl = useIntl();

    const dialogTitleRef = useRef<HTMLInputElement | null>(null);
    const generalTabContentRef = useRef<HTMLDivElement | null>(null);
    const filtersTabContentRef = useRef<HTMLDivElement | null>(null);

    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);

    const [selectedTabId, setSelectedTabId] = useState<"general" | "filters">("general");

    const {
        isWhiteLabeled,
        externalRecipient: externalRecipientOverride,
        isSecondaryTitleVisible,
        tabIds,
    } = useAutomationsContext();
    const {
        exportTemplates,
        widgetTitle,
        scheduledExportToEdit,
        widget,
        dashboardFilters,
        notificationChannels,
    } = useScheduledEmailDialogContext();

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
        isSlidesExportEnabled,
        isAccessibilityModeEnabled,
        enableAutomationEvaluationMode,
    } = useDefaultScheduledEmailDialogData();

    const { editedAutomation, originalAutomation, startDate } = useScheduledExportDraft();
    const {
        onTitleChange,
        onRecurrenceChange,
        onEvaluationModeChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        onSlidesTemplateIdChange,
    } = useScheduledExportActions();
    const { defaultUser } = useScheduledExportData();
    const {
        selectedFilters,
        availableFilters,
        storeFilters,
        filtersByTab,
        editedFiltersByTab,
        onFiltersChange,
        onFiltersByTabChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
        automationIsValid,
        parametersEnabled,
        visibleParametersByTab,
        availableParametersByTab,
        flatTabId,
        onParameterAdd,
        onParameterChange,
        onParameterDelete,
        onParameterAddByTab,
        onParameterChangeByTab,
        onParameterDeleteByTab,
        applyLatest: applyLatestParameters,
    } = useScheduledExportFilters();
    const { selectedAttachments, xlsxSettings, pdfSettings, csvSettings, csvRawSettings, slidesTemplateIds } =
        useScheduledExportAttachments();
    const {
        isSubmitDisabled,
        validationErrorMessage,
        isParentValid,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
    } = useScheduledExportDialogValidity();

    const [isApplyCurrentFiltersDialogOpen, setIsApplyCurrentFiltersDialogOpen] =
        useState(!automationIsValid);

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
    const { getInvalidDatapoints } = validationContextValue;

    const errorMessage = savingErrorMessage ?? validationErrorMessage ?? missingAttachmentsErrorMessage;

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
                secondaryTitle: widgetTitle,
                secondaryTitleIcon: (
                    <UiIcon
                        type="visualization"
                        size={16}
                        color="complementary-6"
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage({
                                id: "dialogs.automation.icon.ariaLabel.sourceVisualization",
                            }),
                        }}
                    />
                ),
            };
        }
        return {
            secondaryTitle: dashboardTitle,
            secondaryTitleIcon: (
                <UiIcon
                    type="dashboard"
                    size={16}
                    color="complementary-6"
                    accessibilityConfig={{
                        ariaLabel: intl.formatMessage({
                            id: "dialogs.automation.icon.ariaLabel.sourceDashboard",
                        }),
                    }}
                />
            ),
        };
    }, [widget, widgetTitle, dashboardTitle, intl]);

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
                onCancel={() => onCancel?.()}
                onEdit={() => {
                    onApplyCurrentFilters();
                    applyLatestParameters();
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
                            returnFocusAfterClose={false}
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
                            headerLeftButtonRenderer={() => {
                                const headerDefaultProps: ScheduledEmailDialogHeaderDefaultProps = {
                                    title: editedAutomation.title ?? "",
                                    onChange: onTitleChange,
                                    onBack,
                                    placeholder: intl.formatMessage({
                                        id: "dialogs.schedule.email.title.placeholder",
                                    }),
                                    ref: dialogTitleRef,
                                    onTitleKeyDown: handleSubmitForm,
                                    secondaryTitle,
                                    secondaryTitleIcon,
                                    isSecondaryTitleVisible: isSecondaryTitleVisible
                                        ? isParentValid
                                        : undefined,
                                };
                                return HeaderSlot ? (
                                    <HeaderSlot
                                        Default={ScheduledEmailDialogHeader}
                                        defaultProps={headerDefaultProps}
                                    />
                                ) : (
                                    <ScheduledEmailDialogHeader {...headerDefaultProps} />
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
                                        <AutomationFiltersSelect
                                            availableFilters={availableFilters}
                                            selectedFilters={selectedFilters}
                                            onFiltersChange={onFiltersChange}
                                            storeFilters={storeFilters}
                                            onStoreFiltersChange={onStoreFiltersChange}
                                            isDashboardAutomation={!widget}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                            hideTitle
                                            showAllFilters
                                            filtersByTab={filtersByTab}
                                            editedFiltersByTab={editedFiltersByTab}
                                            onFiltersByTabChange={onFiltersByTabChange}
                                            parameters={
                                                flatTabId ? visibleParametersByTab[flatTabId] : undefined
                                            }
                                            availableParameters={
                                                flatTabId ? availableParametersByTab[flatTabId] : undefined
                                            }
                                            onParameterChange={onParameterChange}
                                            onParameterDelete={onParameterDelete}
                                            onParameterAdd={onParameterAdd}
                                            parametersByTab={visibleParametersByTab}
                                            availableParametersByTab={availableParametersByTab}
                                            onParameterChangeByTab={onParameterChangeByTab}
                                            onParameterDeleteByTab={onParameterDeleteByTab}
                                            onParameterAddByTab={onParameterAddByTab}
                                            parametersEnabled={parametersEnabled}
                                        />
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
 * Slots render only in the fully rendered dialog: not while the dialog context reports loading,
 * and not while the stale-filters confirmation step is shown.
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
        maxAutomationsRecipients,
        allowHourlyRecurrence,
        isExecutionTimestampMode,
        features: { enableSlideshowExports, enableAutomationEvaluationMode },
    } = useAutomationsContext();
    const { dashboardTitle, dateFormat, isCrossFiltering } = useScheduledEmailDialogContext();

    return {
        locale,
        dashboardTitle,
        dateFormat,
        weekStart,
        maxAutomationsRecipients,
        allowHourlyRecurrence,
        isCrossFiltering,
        isExecutionTimestampMode,
        isSlidesExportEnabled: enableSlideshowExports,
        isAccessibilityModeEnabled: settings?.enableAccessibilityMode === true,
        enableAutomationEvaluationMode,
    };
}
