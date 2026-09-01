// (C) 2026 GoodData Corporation

import { type ReactElement, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { ValidationContextStore, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";
import {
    ConfirmDialogBase,
    type IUiTab,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    ScrollablePanel,
    UiTabs,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../shared/automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import { DefaultAutomationDialogActionBar } from "../../shared/slots/DefaultAutomationDialogActionBar.js";
import { DefaultScheduledEmailDialogFilters } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogFilters.js";
import { DefaultScheduledEmailDialogHeader } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogHeader.js";
import { SCHEDULED_EMAIL_DIALOG_ID } from "../DefaultScheduledEmailDialog/constants.js";
import { useElementHeightSnapshot } from "../DefaultScheduledEmailDialog/hooks/useElementHeightSnapshot.js";
import { DeleteScheduleConfirmDialog } from "../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import { useScheduledExportActions } from "../state/ScheduledExportActionsContext.js";
import { useScheduledExportDraft } from "../state/ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "../state/ScheduledExportFiltersContext.js";
import {
    useScheduledEmailDialogActionBarProps,
    useScheduledEmailDialogFiltersProps,
    useScheduledEmailDialogHeaderProps,
} from "../state/useScheduledEmailDialogRegionProps.js";
import { useScheduledEmailSubmitOnEnter } from "../state/useScheduledEmailSubmitOnEnter.js";
import { useScheduledExportAttachments } from "../state/useScheduledExportAttachments.js";
import { useScheduledExportDialogValidity } from "../state/useScheduledExportDialogValidity.js";
import { type IScheduledEmailDialogShellProps } from "../types.js";

import { DefaultLoadingScheduledEmailDialog } from "./DefaultLoadingScheduledEmailDialog.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

/**
 * The scheduled-export dialog's chrome, connected to the dialog's state: the modal overlay, the dialog
 * frame with the header row (the back button and the title input) and the action bar, the General and
 * Filters tabs, the scrollable content area around the selected tab's content, the body's error and
 * validation messages, the stale-filters confirmation step shown before the dialog when the saved filters
 * or schedule timezone no longer match the dashboard, and the delete confirmation reached from the
 * action bar in edit mode. While `useScheduledEmailDialogContext().isLoading` is true — on scheduled
 * email the ordinary path while a widget export's filters load — it renders the loading skeleton and
 * none of its children.
 *
 * The default dialog is `<ScheduledEmailDialogShell>` around the region blocks and form; a custom
 * `ScheduledEmailDialogComponent` that keeps this chrome and arranges the blocks differently renders the
 * shell itself. The shell does not own the save: call {@link useSaveScheduledEmailToBackend} and pass its
 * `handleSaveScheduledEmail`, `isSavingScheduledEmail` and `savingErrorMessage`; build Enter handlers for
 * the blocks you place with {@link useScheduledEmailSubmitOnEnter} over the same `handleSaveScheduledEmail`.
 * Call that hook only once `useScheduledEmailDialogContext().isLoading` is false — the state hooks throw
 * while the dialog loads — and render the shell alone (any `onSubmit`, `isSaving: false`) until then, as
 * the example does.
 *
 * Needs an ambient `IntlProvider`; inside a `Dashboard` the dashboard's provider covers it.
 *
 * @example
 * ```tsx
 * function MyScheduledEmailDialog(props: IScheduledEmailDialogProps) {
 *     const { isLoading } = useScheduledEmailDialogContext();
 *     // the state hooks throw while the dialog loads; the shell renders the loading skeleton
 *     if (isLoading) {
 *         return <ScheduledEmailDialogShell {...props} onSubmit={() => {}} isSaving={false} />;
 *     }
 *     return <MyScheduledEmailDialogBody {...props} />;
 * }
 *
 * function MyScheduledEmailDialogBody(props: IScheduledEmailDialogProps) {
 *     const { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage } =
 *         useSaveScheduledEmailToBackend(props);
 *     const submitOnEnter = useScheduledEmailSubmitOnEnter({
 *         onSubmit: handleSaveScheduledEmail,
 *         isSaving: isSavingScheduledEmail,
 *     });
 *     return (
 *         <ScheduledEmailDialogShell
 *             {...props}
 *             onSubmit={handleSaveScheduledEmail}
 *             isSaving={isSavingScheduledEmail}
 *             savingErrorMessage={savingErrorMessage}
 *         >
 *             <ScheduledEmailDialogDestination />
 *             <ScheduledEmailDialogRecipients onKeyDownSubmit={submitOnEnter} />
 *         </ScheduledEmailDialogShell>
 *     );
 * }
 * ```
 *
 * @alpha
 */
export function ScheduledEmailDialogShell(props: IScheduledEmailDialogShellProps): ReactElement {
    const { isLoading, scheduledExportToEdit } = useScheduledEmailDialogContext();
    if (isLoading) {
        return (
            <DefaultLoadingScheduledEmailDialog
                onCancel={props.onCancel}
                scheduledExportToEdit={scheduledExportToEdit}
            />
        );
    }
    return <LoadedScheduledEmailDialogShell {...props} />;
}

function LoadedScheduledEmailDialogShell({
    onBack,
    onCancel,
    onDeleteSuccess,
    onDeleteError,
    onSubmit,
    isSaving,
    savingErrorMessage,
    slots,
    topContent,
    bottomContent,
    children,
    filtersTabContent,
}: IScheduledEmailDialogShellProps): ReactElement {
    const HeaderSlot = slots?.Header;
    const FiltersSlot = slots?.Filters;
    const ActionBarSlot = slots?.ActionBar;

    const intl = useIntl();

    const dialogTitleRef = useRef<HTMLInputElement | null>(null);
    const generalTabContentRef = useRef<HTMLDivElement | null>(null);

    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);

    const [selectedTabId, setSelectedTabId] = useState<"general" | "filters">("general");

    const { tabIds } = useAutomationsContext();
    const { widget } = useScheduledEmailDialogContext();

    const handleScheduleDeleteSuccess = () => {
        onDeleteSuccess?.();
        setScheduledEmailToDelete(null);
    };

    const { editedAutomation, scheduleTimezoneIsStale } = useScheduledExportDraft();
    const { applyCurrentScheduleTimezone } = useScheduledExportActions();
    const {
        onApplyCurrentFilters,
        automationIsValid,
        applyLatest: applyLatestParameters,
    } = useScheduledExportFilters();
    const { selectedAttachments } = useScheduledExportAttachments();
    const { validationErrorMessage } = useScheduledExportDialogValidity();

    // a stale schedule timezone repairs through the same consent dialog as stale filters
    const [isApplyCurrentFiltersDialogOpen, setIsApplyCurrentFiltersDialogOpen] = useState(
        !automationIsValid || scheduleTimezoneIsStale,
    );

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

    const submitOnEnter = useScheduledEmailSubmitOnEnter({ onSubmit, isSaving });

    const actionBarDefaultProps = useScheduledEmailDialogActionBarProps({
        onCancel,
        onSubmit,
        isSaving,
        onDelete: () => setScheduledEmailToDelete(editedAutomation),
    });
    const headerDefaultProps = useScheduledEmailDialogHeaderProps({
        onBack,
        onTitleKeyDown: submitOnEnter,
        ref: dialogTitleRef,
    });
    const filtersDefaultProps = useScheduledEmailDialogFiltersProps();

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

    const filtersTab =
        filtersTabContent === undefined ? (
            FiltersSlot ? (
                <FiltersSlot
                    Default={DefaultScheduledEmailDialogFilters}
                    defaultProps={filtersDefaultProps}
                />
            ) : (
                <DefaultScheduledEmailDialogFilters {...filtersDefaultProps} />
            )
        ) : (
            filtersTabContent
        );

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
                            accessibilityConfig={{
                                closeButton: {
                                    ariaLabel: intl.formatMessage({
                                        id: "dialogs.schedule.email.closeLabel",
                                    }),
                                },
                                titleElementId,
                                dialogId: SCHEDULED_EMAIL_DIALOG_ID,
                            }}
                            returnFocusTo={returnFocusTo}
                            returnFocusAfterClose={false}
                            footerRenderer={() =>
                                ActionBarSlot ? (
                                    <ActionBarSlot
                                        Default={DefaultAutomationDialogActionBar}
                                        defaultProps={actionBarDefaultProps}
                                    />
                                ) : (
                                    <DefaultAutomationDialogActionBar {...actionBarDefaultProps} />
                                )
                            }
                            isSubmitDisabled={actionBarDefaultProps.isSubmitDisabled}
                            initialFocus={dialogTitleRef}
                            submitOnEnterKey={false}
                            onCancel={onCancel}
                            onSubmit={actionBarDefaultProps.onSubmit}
                            headline={undefined}
                            headerLeftButtonRenderer={() =>
                                HeaderSlot ? (
                                    <HeaderSlot
                                        Default={DefaultScheduledEmailDialogHeader}
                                        defaultProps={headerDefaultProps}
                                    />
                                ) : (
                                    <DefaultScheduledEmailDialogHeader {...headerDefaultProps} />
                                )
                            }
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
                                        className="gd-schedule-dialog-tab-content"
                                        style={
                                            tabContentHeight
                                                ? { minHeight: `${tabContentHeight}px` }
                                                : undefined
                                        }
                                    >
                                        {filtersTab}
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
                                        {children}
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
