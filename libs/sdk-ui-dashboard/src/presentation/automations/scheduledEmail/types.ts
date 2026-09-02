// (C) 2019-2026 GoodData Corporation

import { type ComponentType, type KeyboardEvent, type ReactNode, type Ref } from "react";

import {
    type DashboardAttachmentType,
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IExportDefinitionVisualizationObjectSettings,
    type IExportTemplate,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    type IdentifierRef,
    type ParameterValue,
    type WeekStart,
    type WidgetAttachmentType,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { type IAutomationFiltersTab } from "../../../model/store/filtering/types.js";
import { type IAutomationParameter } from "../shared/automationFilters/automationParameters.js";
import {
    type IAutomationDialogActionBarProps,
    type IAutomationDialogDestinationProps,
    type IAutomationDialogFiltersProps,
    type IAutomationDialogHeaderProps,
    type IAutomationDialogRecipientsProps,
} from "../shared/slots/types.js";

///
/// Component props
///

/**
 * @alpha
 */
export interface IScheduledEmailDialogProps {
    /**
     * In case, we are not creating new schedule, but editing existing one, this is the active schedule to be edited.
     *
     * @deprecated has no effect since 11.51 — the dialog reads `scheduledExportToEdit` from
     *     `useScheduledEmailDialogContext()`. To adjust what it reads, use the
     *     `ScheduledEmailDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    scheduledExportToEdit?: IAutomationMetadataObject;

    /**
     * Notification channels in organization
     *
     * @deprecated has no effect since 11.51 — the dialog reads `notificationChannels` from
     *     `useScheduledEmailDialogContext()`. To adjust what it reads, use the
     *     `ScheduledEmailDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Widget to be used for scheduled email.
     *
     * Note: this is available only when scheduling export for widget, not dashboard.
     * Typed as IWidget (not ExtendedDashboardWidget) because the dialog only
     * supports insight widgets; custom widgets and nested layouts are not valid
     * export targets and were silently discarded at the connector boundary anyway.
     *
     * @deprecated has no effect since 11.51 — the dialog reads `widget` from
     *     `useScheduledEmailDialogContext()`. To adjust what it reads, use the
     *     `ScheduledEmailDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    widget?: IWidget;

    /**
     * Insight to be used for scheduled email.
     *
     * Note: this is available only when scheduling export for widget, not dashboard.
     *
     * @deprecated has no effect since 11.51 — the dialog reads `insight` from
     *     `useScheduledEmailDialogContext()`. To adjust what it reads, use the
     *     `ScheduledEmailDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    insight?: IInsight;

    /**
     * Dashboard filters to be used for scheduled email.
     *
     * Note:
     * - Provided filters exclude cross-filtering filters, as these are typically not desired in exported reports.
     *
     * - If the current dashboard filters (excluding cross-filtering) match the saved dashboard filters, this will be undefined.
     *   In such cases, the scheduled export will use the most recent saved dashboard filters, guaranteeing that
     *   the export reflects the latest intended filter configuration and we don't want to save them.
     *
     * - If we are editing an existing scheduled export, this will contain its filters, as changing saved filters is currently not allowed.
     *
     * @deprecated has no effect since 11.51 — the dialog reads `dashboardFilters` from
     *     `useScheduledEmailDialogContext()`. To adjust what it reads, use the
     *     `ScheduledEmailDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    dashboardFilters?: FilterContextItem[];

    /**
     * Widget filters to be used for scheduled email.
     *
     * Note:
     * - Provided filters are a combination of insight and dashboard filters, following these rules:
     *     - Cross-filtering filters are excluded as they are typically not desired in the scheduled export.
     *     - The widget's ignored filters configuration is honored (ignored filters are not overridden by dashboard filters and remain as is).
     *     - If the resulting filters include all-time date filter, it is excluded as it has no effect on the scheduled export execution.
     *
     * - If we are editing an existing scheduled export, this will contain its filters, as changing saved filters is currently not allowed.
     *
     * @deprecated not read by the default dialog; the effective widget filters are derived from the
     *     edited filters. Prop will be removed.
     */
    widgetFilters?: IFilter[];

    /**
     * Is scheduled email dialog loading initial data, before it can be rendered?
     *
     * @deprecated has no effect since 11.51 — the dialog reads `isLoading` from
     *     `useScheduledEmailDialogContext()`. Prop will be removed.
     */
    isLoading?: boolean;

    /**
     * Callback to be called, when user submits the scheduled email dialog.
     */
    onSubmit?: (
        scheduledEmailDefinition: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    ) => void;

    /**
     * Callback to be called, when user save the existing scheduled email.
     */
    onSave?: (scheduledEmailDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the scheduled email dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when user goes back to the scheduled email management dialog.
     */
    onBack?: () => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when scheduling finishes successfully.
     */
    onSuccess?: (scheduledEmailDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onSaveError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when scheduling finishes successfully.
     */
    onSaveSuccess?: () => void;

    /**
     * Callback to be called, when scheduled email is deleted.
     */
    onDeleteSuccess?: () => void;

    /**
     * Callback to be called, when schedule fails to delete.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;
}

/**
 * Props of the default scheduled email dialog's header region (the title input row).
 *
 * @alpha
 */
export interface IScheduledEmailDialogHeaderProps extends IAutomationDialogHeaderProps {
    /**
     * Called on key-down inside the title input.
     */
    onTitleKeyDown: (event: KeyboardEvent) => void;

    /**
     * Called when the header's back button is pressed.
     */
    onBack?: () => void;
}

/**
 * The exact props the default dialog renders its header with, including the dialog's
 * initial-focus ref.
 *
 * @alpha
 */
export type ScheduledEmailDialogHeaderDefaultProps = IScheduledEmailDialogHeaderProps & {
    ref?: Ref<HTMLInputElement>;
};

/**
 * Props of the default scheduled email dialog's filters region (the Filters tab content).
 *
 * @remarks
 * The region is bimodal: whenever `filtersByTab` is present with more than one tab, the by-tab
 * members (`filtersByTab` and the `*ByTab` parameter family) drive rendering and the flat
 * handlers are unused; otherwise the flat members drive it and the by-tab members are unused.
 * `defaultProps` always carries both families so a wrap stays faithful in either mode.
 *
 * @alpha
 */
export interface IScheduledEmailDialogFiltersProps extends IAutomationDialogFiltersProps {
    /**
     * Whether the schedule stores its own filters instead of using the latest saved dashboard
     * filters.
     */
    storeFilters: boolean;

    /**
     * Toggles filter (and parameter) persistence. The current filters must be passed back —
     * flat mode as `(value, selectedFilters, undefined)`, by-tab mode as
     * `(value, undefined, editedFiltersByTab)`; calling it with the value alone leaves the
     * draft's export definitions out of sync with the toggle.
     */
    onStoreFiltersChange: (
        value: boolean,
        filters?: FilterContextItem[],
        filtersByTab?: Record<string, FilterContextItem[]>,
    ) => void;

    /**
     * Whether the schedule targets the whole dashboard (shows the store-filters checkbox)
     * rather than a single widget.
     */
    isDashboardAutomation: boolean;

    /**
     * Filters structured per dashboard tab; when present with more than one tab, the region
     * renders in by-tab mode.
     */
    filtersByTab?: IAutomationFiltersTab[];

    /**
     * Edited filter selection per tab.
     */
    editedFiltersByTab?: Record<string, FilterContextItem[]>;

    /**
     * Replaces a tab's filter selection with the complete updated record.
     */
    onFiltersByTabChange?: (filtersByTab: Record<string, FilterContextItem[]>) => void;

    /**
     * Parameter chips per tab (by-tab mode).
     */
    parametersByTab?: Record<string, IAutomationParameter[]>;

    /**
     * Addable workspace parameters per tab (by-tab mode).
     */
    availableParametersByTab?: Record<string, IAutomationParameter[]>;

    /**
     * Called when a parameter is added in a tab section (by-tab mode).
     */
    onParameterAddByTab?: (tabId: string, ref: IdentifierRef) => void;

    /**
     * Called when a parameter chip's value is edited in a tab section (by-tab mode).
     */
    onParameterChangeByTab?: (tabId: string, ref: IdentifierRef, value: ParameterValue) => void;

    /**
     * Called when a parameter chip is removed in a tab section (by-tab mode).
     */
    onParameterDeleteByTab?: (tabId: string, ref: IdentifierRef) => void;

    /**
     * Whether workspace parameters are enabled; adjusts the store-filters tooltip copy.
     */
    parametersEnabled?: boolean;
}

/**
 * A timezone selection of the schedule dialog's "Time zone" section.
 *
 * `shouldSave` decides whether the value is baked into the export definitions. Values the backend
 * derives itself at run time are displayed but not saved: the Default option of a dashboard
 * schedule (id undefined; persisted dashboard configuration → settings hierarchy) and a widget
 * schedule showing the settings-hierarchy resolution (concrete id). Everything the backend cannot
 * derive is saved: the view-mode override and browser resolution always, the dashboard's stored
 * configuration for widget schedules, and any timezone picked manually in the dropdown.
 *
 * @alpha
 */
export interface IScheduleTimezoneSelection {
    /**
     * Selected timezone (IANA ID); undefined represents the Default option.
     */
    id: string | undefined;

    /**
     * Whether the selection is baked into the export definitions or left for the backend to
     * derive at run time.
     */
    shouldSave: boolean;
}

/**
 * Props of the default scheduled email dialog's "Time zone" section (the export-content timezone
 * picker on the General tab; unrelated to the schedule cron timezone).
 *
 * @alpha
 */
export interface IScheduledEmailDialogTimezoneProps {
    /**
     * Whether the dialog schedules a single-widget export. Widget schedules always show a concrete
     * resolved timezone — they have no Default option, because the backend cannot derive anything
     * dashboard-scoped for them.
     */
    isWidget: boolean;

    /**
     * Current selection; an undefined id is the Default option (dashboard schedules only).
     */
    selection: IScheduleTimezoneSelection;

    /**
     * Concrete timezone the Default option currently resolves to (display only).
     */
    defaultResolvedTimezone: string | undefined;

    /**
     * Called with the picked timezone; undefined selects the Default option.
     */
    onTimezoneChange: (timezoneId: string | undefined) => void;
}

/**
 * The exact props the default dialog renders its "Time zone" section with.
 *
 * @alpha
 */
export type ScheduledEmailDialogTimezoneDefaultProps = IScheduledEmailDialogTimezoneProps;

/**
 * Props of the default scheduled email dialog's recipients region.
 *
 * @alpha
 */
export interface IScheduledEmailDialogRecipientsProps extends IAutomationDialogRecipientsProps {
    /**
     * Submits the dialog from the recipients input. The default dialog always supplies it.
     */
    onKeyDownSubmit: (e: KeyboardEvent) => void;
}

/**
 * Props of the scheduled-export dialog's recurrence field.
 *
 * @alpha
 */
export interface IScheduledEmailDialogRecurrenceProps {
    /**
     * First-run date the cron editor is anchored to.
     */
    startDate: Date;
    /**
     * The draft's cron expression.
     */
    cronExpression: string;
    /**
     * Human-readable description of the cron expression, when the draft carries one.
     */
    cronDescription?: string;
    /**
     * Display-only timezone label shown in the occurrence description.
     */
    timezone: string;
    /**
     * Date format used by the first-run date picker.
     */
    dateFormat: string;
    /**
     * Locale of the recurrence editor.
     */
    locale: string;
    /**
     * First day of the week in the date picker.
     */
    weekStart: WeekStart;
    /**
     * Whether the hourly recurrence option is offered.
     */
    allowHourlyRecurrence: boolean;
    /**
     * Hides GoodData-specific copy when white-labeled.
     */
    isWhiteLabeled: boolean;
    /**
     * Closes the recurrence dropdowns when the dialog body scrolls.
     */
    closeDropdownsOnParentScroll: boolean;
    /**
     * Sets the cron expression and first run; `isValid` is the recurrence form's own verdict.
     */
    onChange: (cronExpression: string, startDate: Date | null, isValid: boolean) => void;
    /**
     * Key-down handler; the dialog submits on Enter through it.
     */
    onKeyDownSubmit: (event: KeyboardEvent) => void;
}

/**
 * Props of the scheduled-export dialog's subject field.
 *
 * @alpha
 */
export interface IScheduledEmailDialogSubjectProps {
    /**
     * Dashboard title, used as the subject placeholder (truncated to the title max length).
     */
    dashboardTitle: string;
    /**
     * The export draft; the field renders `details.subject`.
     */
    editedAutomation: IAutomationMetadataObjectDefinition;
    /**
     * Disables submit-on-Enter while the dialog is not submittable.
     */
    isSubmitDisabled?: boolean;
    /**
     * Sets the e-mail subject; `isValid` is the field's own length verdict.
     */
    onChange: (value: string, isValid: boolean) => void;
    /**
     * Called on Enter when submit is not disabled.
     */
    onKeyDownSubmit: () => void;
}

/**
 * Props of the scheduled-export dialog's message field.
 *
 * @alpha
 */
export interface IScheduledEmailDialogMessageProps {
    /**
     * The e-mail message text.
     */
    value: string;
    /**
     * Sets the e-mail message; `isValid` is the field's own length verdict.
     */
    onChange: (value: string, isValid: boolean) => void;
}

/**
 * Props of the scheduled-export dialog's evaluation-mode checkbox.
 *
 * @alpha
 */
export interface IScheduledEmailDialogEvaluationModeProps {
    /**
     * Whether the evaluation mode is SHARED.
     */
    isShared: boolean;
    /**
     * Switches between a shared and a per-recipient evaluation of the export.
     */
    onChange: (isShared: boolean) => void;
}

/**
 * Props of the scheduled-export dialog's dashboard-attachments field.
 *
 * @alpha
 */
export interface IScheduledEmailDialogDashboardAttachmentsProps {
    /**
     * The selected export formats.
     */
    selectedAttachments: DashboardAttachmentType[];
    /**
     * Dashboard filters the export is scoped to; the control passes them back as the second
     * argument of every {@link IScheduledEmailDialogDashboardAttachmentsProps.onDashboardAttachmentsChange}
     * call.
     */
    dashboardFilters?: FilterContextItem[];
    /**
     * When true and at least one attachment is selected, the control shows the notice that
     * exports do not reflect cross-filtering.
     */
    isCrossFiltering: boolean;
    /**
     * Replaces the selected dashboard export formats. Called with the complete new selection and
     * the current {@link IScheduledEmailDialogDashboardAttachmentsProps.dashboardFilters}.
     */
    onDashboardAttachmentsChange: (formats: DashboardAttachmentType[], filters?: FilterContextItem[]) => void;
    /**
     * XLSX export settings shown in the attachment's settings editor.
     */
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * Sets the XLSX export settings.
     */
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Whether the slide-based formats (PPTX, PDF slides) are offered; when false they are
     * excluded from the add-attachment options.
     */
    isSlidesExportEnabled: boolean;
    /**
     * Export templates offered in the template picker of the slide-based formats.
     */
    exportTemplates?: IExportTemplate[];
    /**
     * The template chosen per slide-based format; undefined where the default template applies.
     */
    slidesTemplateIds?: { PPTX?: string; PDF_SLIDES?: string; PDF?: string };
    /**
     * Sets the export template of one slide-based format.
     */
    onSlidesTemplateIdChange?: (
        templateId: string | undefined,
        format: "PPTX" | "PDF_SLIDES" | "PDF",
    ) => void;
}

/**
 * Props of the scheduled-export dialog's widget-attachments field.
 *
 * @alpha
 */
export interface IScheduledEmailDialogWidgetAttachmentsProps {
    /**
     * The selected export formats.
     */
    selectedAttachments: WidgetAttachmentType[];
    /**
     * Replaces the selected widget export formats with the complete new selection.
     */
    onWidgetAttachmentsChange: (formats: WidgetAttachmentType[]) => void;
    /**
     * XLSX export settings shown in the attachment's settings editor.
     */
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * Sets the XLSX export settings.
     */
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Tabular-PDF export settings shown in the attachment's settings editor.
     */
    pdfSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * Sets the tabular-PDF export settings.
     */
    onPdfSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * CSV export settings shown in the attachment's settings editor.
     */
    csvSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * Sets the CSV export settings.
     */
    onCsvSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Raw-CSV export settings shown in the attachment's settings editor.
     */
    csvRawSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * Sets the raw-CSV export settings.
     */
    onCsvRawSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Whether the slide-based formats (PPTX, PDF) are offered; when false they are excluded
     * from the add-attachment options.
     */
    isSlidesExportEnabled: boolean;
    /**
     * When true, formats without an accessible rendering (PDF_TABULAR) are excluded from the
     * add-attachment options.
     */
    isAccessibilityModeEnabled: boolean;
    /**
     * Export templates offered in the template picker of the slide-based formats.
     */
    exportTemplates?: IExportTemplate[];
    /**
     * The template chosen per slide-based format; undefined where the default template applies.
     */
    slidesTemplateIds?: { PPTX?: string; PDF_SLIDES?: string; PDF?: string };
    /**
     * Sets the export template of one slide-based format.
     */
    onSlidesTemplateIdChange?: (
        templateId: string | undefined,
        format: "PPTX" | "PDF_SLIDES" | "PDF",
    ) => void;
}

/**
 * Section-level overrides of the default scheduled email dialog.
 *
 * @alpha
 */
export interface IScheduledEmailDialogSlots {
    /**
     * Wraps or replaces the dialog header (the title input row). Must have a stable reference
     * identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     */
    Header?: ComponentType<ISlotProps<ScheduledEmailDialogHeaderDefaultProps>>;

    /**
     * Wraps or replaces the Filters tab content (the filter and parameter chips). Must have a
     * stable reference identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog **and only while the Filters tab is selected**:
     * not while the dialog context reports loading, not while the stale-filters confirmation
     * step is shown, and not on the General tab. The dialog opens on the General tab, so the
     * slot is not mounted initially, and it unmounts — losing any local state — on every switch
     * away from the Filters tab.
     *
     * A replacement takes over computing the next filters array: `onFiltersChange` /
     * `onFiltersByTabChange` expect the complete selection, and `onStoreFiltersChange` must be
     * passed the current filters — see {@link IScheduledEmailDialogFiltersProps}.
     */
    Filters?: ComponentType<ISlotProps<IScheduledEmailDialogFiltersProps>>;

    /**
     * Wraps or replaces the "Time zone" section on the General tab. Must have a stable reference
     * identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only when the dialog shows the section at all: the dashboard-timezone feature is
     * enabled and the dashboard allows the view-mode timezone override. When the section is
     * hidden, the slot is not rendered either.
     */
    Timezone?: ComponentType<ISlotProps<ScheduledEmailDialogTimezoneDefaultProps>>;

    /**
     * Wraps or replaces the dialog's destination region (the notification-channel select on the
     * General tab). Must have a stable reference identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog **and only while the General tab is selected**:
     * not while the dialog context reports loading, and not while the stale-filters confirmation
     * step is shown. It unmounts — losing any local state — on every switch to the Filters tab.
     */
    Destination?: ComponentType<ISlotProps<IAutomationDialogDestinationProps>>;

    /**
     * Wraps or replaces the dialog's recipients region on the General tab. Must have a stable
     * reference identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog **and only while the General tab is selected**:
     * not while the dialog context reports loading, and not while the stale-filters confirmation
     * step is shown. It unmounts — losing any local state — on every switch to the Filters tab.
     */
    Recipients?: ComponentType<ISlotProps<IScheduledEmailDialogRecipientsProps>>;

    /**
     * Wraps or replaces the dialog's action bar (the footer row: documentation link, Delete in
     * edit mode, Cancel and the submit button). Must have a stable reference identity — see
     * {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog: not while the dialog context reports loading
     * (the loading dialog keeps its own footer), and not while the stale-filters confirmation
     * step is shown. Unlike the Filters and Destination slots it renders on **both** tabs — the
     * footer is tab-independent.
     *
     * A replacement that does not render `Default` loses the submit button's Enter-key detection
     * id (Enter no longer submits), the validation aria wiring, and the default row's ordering.
     * Wraps that render `<Default {...defaultProps} />` keep everything; note the Enter-key path
     * invokes the dialog's own submit handler and disabled state, so `defaultProps` overrides
     * affect the buttons only.
     */
    ActionBar?: ComponentType<ISlotProps<IAutomationDialogActionBarProps>>;
}

/**
 * Props of {@link DefaultScheduledEmailDialog}.
 *
 * @remarks
 * Extends the shared {@link IScheduledEmailDialogProps} with customization only the default implementation
 * supports. Slots render only in the fully rendered dialog: not while the dialog context reports
 * loading, and not while the stale-filters confirmation step is shown. The Filters slot
 * additionally renders only while the Filters tab is selected; the Destination and Recipients
 * slots only while the General tab is — see {@link IScheduledEmailDialogSlots}.
 *
 * @alpha
 */
export interface IDefaultScheduledEmailDialogProps extends IScheduledEmailDialogProps {
    /**
     * Section-level overrides. Each slot receives `{ Default, defaultProps }` — `Default` is the region's
     * exported render component ({@link DefaultScheduledEmailDialogHeader} for `Header`, and so on) and `defaultProps` the
     * return of the region's props hook ({@link useScheduledEmailDialogHeaderProps}) — and may render its own content
     * (replace) or `<Default {...defaultProps} />` inside its own markup (wrap).
     *
     * @example
     * The dialog is reached through the `Dashboard` component override; define slot components at
     * module scope (see {@link @gooddata/sdk-ui-kit#ISlotProps}):
     * ```tsx
     * function RecipientsWithNote({ Default, defaultProps }: ISlotProps<IScheduledEmailDialogRecipientsProps>) {
     *     return (
     *         <>
     *             <Default {...defaultProps} />
     *             <Note>External recipients receive a public link.</Note>
     *         </>
     *     );
     * }
     *
     * <Dashboard
     *     ScheduledEmailDialogComponent={(props) => (
     *         <DefaultScheduledEmailDialog {...props} slots={{ Recipients: RecipientsWithNote }} />
     *     )}
     * />;
     * ```
     */
    slots?: IScheduledEmailDialogSlots;

    /**
     * Content rendered as the first child of the dialog's scrollable content area, above the
     * form. Rendered only in the fully rendered dialog: not while the dialog context reports
     * loading, and not while the stale-filters confirmation step is shown. Rendered on both
     * tabs — it is a content-area child, not a tab child.
     */
    topContent?: ReactNode;

    /**
     * Content rendered as the last child of the dialog's scrollable content area, below the
     * form. Same rendering conditions as {@link IDefaultScheduledEmailDialogProps.topContent}.
     * Rendered on both tabs — it is a content-area child, not a tab child.
     */
    bottomContent?: ReactNode;
}

/**
 * Props of {@link ScheduledEmailDialogShell}.
 *
 * @alpha
 */
export interface IScheduledEmailDialogShellProps extends Pick<
    IScheduledEmailDialogProps,
    "onCancel" | "onBack" | "onDeleteSuccess" | "onDeleteError"
> {
    /**
     * The dialog's single save — `handleSaveScheduledEmail` of the caller's
     * {@link useSaveScheduledEmailToBackend} instance. Drives the footer's submit button, the Enter key on
     * it, and the header's Enter-to-submit. (Not the `onSubmit` observer of {@link IScheduledEmailDialogProps};
     * that one goes to the save hook.) The shell does not own the save hook, so the caller's own Enter
     * handlers — {@link useScheduledEmailSubmitOnEnter} — share the same instance. Create the hook instance
     * only once the dialog context reports `isLoading: false`.
     */
    onSubmit: () => void;

    /**
     * `isSavingScheduledEmail` of the same instance: disables submit and Delete and shows the footer's
     * progress indicator.
     */
    isSaving: boolean;

    /**
     * `savingErrorMessage` of the same instance; shown as the body's error message, ahead of the form's
     * validation message.
     */
    savingErrorMessage?: string;

    /**
     * Header, action-bar and Filters-tab overrides — the Level 1 slot contract
     * ({@link IScheduledEmailDialogSlots.Header}, {@link IScheduledEmailDialogSlots.ActionBar},
     * {@link IScheduledEmailDialogSlots.Filters}): each slot receives `{ Default, defaultProps }` with the
     * shell's live values. Slot components need a stable reference identity — see
     * {@link @gooddata/sdk-ui-kit#ISlotProps}. `Filters` is ignored when `filtersTabContent` is passed. The
     * General-tab regions have no slot here: place their blocks ({@link ScheduledEmailDialogDestination} and
     * siblings) as children instead.
     */
    slots?: Pick<IScheduledEmailDialogSlots, "Header" | "ActionBar" | "Filters">;

    /**
     * Rendered first inside the dialog's scrollable content area, above the selected tab's content.
     */
    topContent?: ReactNode;

    /**
     * Rendered last inside the scrollable content area, below the selected tab's content.
     */
    bottomContent?: ReactNode;

    /**
     * The General tab's content: the regions and fields, in the caller's order. Rendered only while the
     * General tab is selected; not mounted while `useScheduledEmailDialogContext().isLoading` is true (the
     * shell shows its loading skeleton — on scheduled email the ordinary path while a widget export's
     * filters load) or while the stale-filters confirmation step is shown.
     */
    children?: ReactNode;

    /**
     * The Filters tab's content. Defaults to the dialog's filters region ({@link DefaultScheduledEmailDialogFilters}
     * with {@link useScheduledEmailDialogFiltersProps}, or the `Filters` slot). Rendered only while the Filters
     * tab is selected. An explicit `null` counts as provided and renders an empty Filters tab.
     */
    filtersTabContent?: ReactNode;
}

/**
 *
 * @alpha
 */
export interface IScheduledEmailManagementDialogProps {
    /**
     * Is loading schedule data?
     *
     * @deprecated read `isLoading` from `useScheduledEmailManagementDialogContext()` instead. Prop will
     *     be removed.
     */
    isLoadingScheduleData?: boolean;

    /**
     * Error occurred while loading schedule data?
     *
     * @deprecated not read by the default dialog. Prop will be removed.
     */
    scheduleDataError?: GoodDataSdkError;

    /**
     * Notification channels in organization
     *
     * @deprecated not read by the default dialog. Prop will be removed.
     */
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Automations in workspace
     *
     * @deprecated read `automations` from `useScheduledEmailManagementDialogContext()` instead. Prop
     *     will be removed.
     */
    automations?: IAutomationMetadataObject[];

    /**
     * Callback to be called, when user adds new scheduled email item.
     */
    onAdd?: () => void;

    /**
     * Callback to be called, when user clicks scheduled email item for editing.
     */
    onEdit?: (scheduledMail: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the scheduled email management dialog.
     */
    onClose?: () => void;

    /**
     * Callback to be called, when scheduled email is deleted.
     */
    onDeleteSuccess?: () => void;

    /**
     * Callback to be called, when schedule fails to delete.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomScheduledEmailDialogComponent = ComponentType<IScheduledEmailDialogProps>;

/**
 * Decorates the data the scheduled-email create/edit dialog reads.
 *
 * The dashboard mounts this component between the connector-provided dialog context and the
 * dialog's state model, so the value it re-provides is what both the default dialog and the
 * state seeding read — a wholesale `ScheduledEmailDialogComponent` replacement sees it too.
 * Read the current value with `useScheduledEmailDialogContext()`, decorate the members to
 * adjust, and re-provide via `ScheduledEmailDialogContextProvider`:
 *
 * @example
 * ```tsx
 * function ChannelsDecorator({ children }: { children?: ReactNode }) {
 *     const ctx = useScheduledEmailDialogContext();
 *     const notificationChannels = useMyFilteredChannels(ctx.notificationChannels);
 *     const decorated = useMemo(() => ({ ...ctx, notificationChannels }), [ctx, notificationChannels]);
 *     return (
 *         <ScheduledEmailDialogContextProvider value={decorated}>
 *             {children}
 *         </ScheduledEmailDialogContextProvider>
 *     );
 * }
 * // <Dashboard ScheduledEmailDialogContextDecoratorComponent={ChannelsDecorator} />
 * ```
 *
 * Pass `isLoading` through untouched. On scheduled email the loading state is on the ordinary
 * path — a widget export renders while its filters load — so a decorator that overrides it
 * corrupts the draft seed on every such open, not in an edge case. Define the decorator outside
 * render, or the dialog remounts (and reseeds) on every parent render.
 *
 * The contract: change the data, not what it means — every member keeps its documented meaning.
 * The dialog does not check the decorated value; when you override a member, everything that
 * reads it is your responsibility. Spread the value you read (`{ ...ctx, member }`) so the other
 * members pass through. Wrap functions instead of replacing them. Do not touch members marked as
 * internal machinery.
 *
 * @alpha
 */
export type CustomScheduledEmailDialogContextDecoratorComponent = ComponentType<{
    children?: ReactNode;
}>;

/**
 * @alpha
 */
export type CustomScheduledEmailManagementDialogComponent =
    ComponentType<IScheduledEmailManagementDialogProps>;

/**
 * Decorates the data the scheduled email management dialog reads.
 *
 * The dashboard mounts this component between the connector-provided management dialog context and
 * the resolved management dialog component (default or replacement), so the value it re-provides is
 * what the dialog reads. Read the current value with `useScheduledEmailManagementDialogContext()`,
 * decorate the members to adjust, and re-provide via
 * `ScheduledEmailManagementDialogContextProvider`:
 *
 * @example
 * ```tsx
 * function SchedulesListDecorator({ children }: { children?: ReactNode }) {
 *     const ctx = useScheduledEmailManagementDialogContext();
 *     const { schedules, loading } = useMySelfFetchedSchedules(ctx.automations);
 *     const decorated = useMemo(
 *         () => ({ ...ctx, automations: schedules, isLoading: ctx.isLoading || loading }),
 *         [ctx, schedules, loading],
 *     );
 *     return (
 *         <ScheduledEmailManagementDialogContextProvider value={decorated}>
 *             {children}
 *         </ScheduledEmailManagementDialogContextProvider>
 *     );
 * }
 * // <Dashboard ScheduledEmailManagementDialogContextDecoratorComponent={SchedulesListDecorator} />
 * ```
 *
 * The management dialog has no state seeding — it renders from the context on every change, so a
 * decorator may replace `automations` or extend `isLoading` (as above). Extend `isLoading` only
 * as `ctx.isLoading || yourOwnLoading`, never force it: forced false shows the list before its
 * data arrives, forced true hides it forever. `isLoading` here may also cover a widget-filters
 * load while a widget-scoped create/edit dialog is open — deliberately broader than the alerting
 * management context's automations-only flag. Define the decorator outside render, or the dialog
 * remounts on every parent render.
 *
 * The contract: change the data, not what it means — every member keeps its documented meaning.
 * The dialog does not check the decorated value; when you override a member, everything that
 * reads it is your responsibility. Spread the value you read (`{ ...ctx, member }`) so the other
 * members pass through. Wrap functions instead of replacing them. Do not touch members marked as
 * internal machinery.
 *
 * @alpha
 */
export type CustomScheduledEmailManagementDialogContextDecoratorComponent = ComponentType<{
    children?: ReactNode;
}>;
