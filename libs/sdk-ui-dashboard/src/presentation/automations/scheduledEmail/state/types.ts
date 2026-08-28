// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction } from "react";

import {
    type DashboardAttachmentType,
    type FilterContextItem,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type IDashboardExportParameter,
    type IExportDefinitionVisualizationObjectSettings,
    type IdentifierRef,
    type ParameterValue,
    type WidgetAttachmentType,
} from "@gooddata/sdk-model";

import { type IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";
import { type IAutomationParameter } from "../../shared/automationFilters/automationParameters.js";
import { type IScheduleTimezoneSelection, type IScheduledEmailDialogProps } from "../types.js";

/**
 * The scheduled-export dialog's edit draft: the automation being edited, its baseline, the derived
 * start date, the per-field validity flags, and the "Time zone" section's state.
 *
 * Changes on every keystroke; consumers re-render by design.
 *
 * @alpha
 */
export interface IScheduledExportDraftContextValue {
    /**
     * The schedule being edited; seeded from the saved schedule or the defaults for a new one.
     */
    editedAutomation: IAutomationMetadataObjectDefinition;
    /**
     * The draft as it was when the dialog opened; the dirty check compares against it.
     */
    originalAutomation: IAutomationMetadataObjectDefinition;
    /**
     * The schedule's first run in the user's timezone, normalized for the recurrence form.
     */
    startDate: Date;
    /**
     * Whether the recurrence form's cron expression is valid.
     */
    isCronValid: boolean;
    /**
     * Whether the title passes the length limit.
     */
    isTitleValid: boolean;
    /**
     * Whether the e-mail subject passes its validation.
     */
    isSubjectValid: boolean;
    /**
     * Whether the e-mail message passes its validation.
     */
    isOnMessageValid: boolean;
    /**
     * The enableTimezoneChange setting; timezone-related presentation is gated by it.
     */
    isTimezoneFeatureEnabled: boolean;
    /**
     * Whether the schedule may define its own export timezone (the "Time zone" section renders).
     */
    canSelectScheduleTimezone: boolean;
    /**
     * The "Time zone" section's current selection (the Default option or a concrete timezone).
     */
    scheduleTimezoneSelection: IScheduleTimezoneSelection;
    /**
     * Concrete timezone the dashboard-schedule Default option currently resolves to (display only).
     */
    defaultResolvedTimezone: string | undefined;
    /**
     * True when the edited schedule cannot behave correctly as stored (widget schedule missing a
     * dashboard-scoped timezone); feeds the apply-current-state confirmation.
     */
    scheduleTimezoneIsStale: boolean;
}

/**
 * The scheduled-export dialog's mutators: the draft setter, the form change-handlers, the
 * attachment handlers and the "Time zone" section handlers.
 *
 * Changes rarely.
 *
 * @alpha
 */
export interface IScheduledExportActionsContextValue {
    /**
     * Replaces the draft; the change-handlers below are the preferred, field-scoped writes.
     */
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>;
    /**
     * Sets the schedule title and re-validates its length.
     */
    onTitleChange: (value: string) => void;
    /**
     * Sets the cron expression and first run; `isValid` is the recurrence form's own verdict.
     */
    onRecurrenceChange: (cronExpression: string, startDate: Date | null, isValid: boolean) => void;
    /**
     * Switches between a shared and a per-recipient evaluation of the export.
     */
    onEvaluationModeChange: (isShared: boolean) => void;
    /**
     * Selects the notification channel; recipients incompatible with it are dropped.
     */
    onDestinationChange: (notificationChannelId: string) => void;
    /**
     * Replaces the recipients with the complete updated array.
     */
    onRecipientsChange: (recipients: IAutomationRecipient[]) => void;
    /**
     * Sets the e-mail subject; `isValid` is the subject field's own verdict.
     */
    onSubjectChange: (value: string | number, isValid: boolean) => void;
    /**
     * Sets the e-mail message; `isValid` is the message field's own verdict.
     */
    onMessageChange: (value: string, isValid: boolean) => void;
    /**
     * Replaces the dashboard export formats; new definitions inherit the current filters and timezone.
     */
    onDashboardAttachmentsChange: (formats: DashboardAttachmentType[]) => void;
    /**
     * Replaces the widget export formats; throws when the dialog has no widget.
     */
    onWidgetAttachmentsChange: (formats: WidgetAttachmentType[]) => void;
    /**
     * Sets the XLSX export settings (merge headers, export info).
     */
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Sets the tabular-PDF export settings (page size, orientation, export info).
     */
    onPdfSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Sets the CSV export settings (delimiter).
     */
    onCsvSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Sets the raw-CSV export settings (delimiter).
     */
    onCsvRawSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    /**
     * Sets the slides template of one slides format; undefined restores the default template.
     */
    onSlidesTemplateIdChange: (templateId: string | undefined, format: "PPTX" | "PDF_SLIDES" | "PDF") => void;
    /**
     * Picks the export-content timezone; undefined selects the Default option.
     */
    onScheduleTimezoneChange: (timezoneId: string | undefined) => void;
    /**
     * Repairs a stale schedule timezone with the currently effective one.
     */
    applyCurrentScheduleTimezone: () => void;
}

/**
 * The scheduled-export dialog's recipient defaults: the logged-in user as a recipient, and the
 * recipient a new schedule is seeded with, which an external-recipient override replaces.
 *
 * Changes when the current user or the override changes, so not while the draft is edited.
 *
 * @alpha
 */
export interface IScheduledExportDataContextValue {
    /**
     * The logged-in user as a recipient.
     */
    defaultUser: IAutomationRecipient;
    /**
     * The recipient a new schedule is seeded with; an external-recipient override replaces the user.
     */
    defaultRecipient: IAutomationRecipient;
}

/**
 * The scheduled-export dialog's filter and export-parameter model: the current selection and
 * available filters (flat and per tab), the handlers that mutate them, the staleness gate, and the
 * export-parameter chips with their handlers.
 *
 * Changes when a filter, a parameter or the store-filters toggle is edited; never per keystroke.
 *
 * @alpha
 */
export interface IScheduledExportFiltersContextValue {
    /**
     * The filters the schedule is saved with (flat mode).
     */
    selectedFilters: FilterContextItem[];
    /**
     * The dashboard filters the schedule may use; undefined until resolved.
     */
    availableFilters: FilterContextItem[] | undefined;
    /**
     * Whether the schedule stores its own filters instead of using the latest saved dashboard filters.
     */
    storeFilters: boolean;
    /**
     * Filters structured per dashboard tab; present with more than one tab.
     */
    filtersByTab: IAutomationFiltersTab[] | undefined;
    /**
     * The edited selection per dashboard tab (by-tab mode).
     */
    editedFiltersByTab: Record<string, FilterContextItem[]> | undefined;
    /**
     * Replaces the selection with the complete updated array and mirrors it into the export
     * definitions. `storeFiltersParam` overrides the current toggle value for this write.
     */
    onFiltersChange: (filters: FilterContextItem[], storeFiltersParam?: boolean) => void;
    /**
     * By-tab counterpart of `onFiltersChange`: replaces the per-tab selection wholesale.
     */
    onFiltersByTabChange: (
        newFiltersByTab: Record<string, FilterContextItem[]>,
        storeFiltersParam?: boolean,
    ) => void;
    /**
     * Replaces the selection with the dashboard's current filters (the stale-filters repair).
     */
    onApplyCurrentFilters: () => void;
    /**
     * Toggles filter and parameter persistence. The current filters must be passed back — flat mode
     * as `(value, filters, undefined)`, by-tab mode as `(value, undefined, filtersByTab)`.
     */
    onStoreFiltersChange: (
        value: boolean,
        filters?: FilterContextItem[],
        filtersByTabParam?: Record<string, FilterContextItem[]>,
    ) => void;
    /**
     * False when the saved filters or the saved parameters no longer match the dashboard; gates the
     * stale-filters confirmation.
     */
    automationIsValid: boolean;
    /**
     * Whether the saved filters alone no longer match the dashboard.
     */
    filtersAreStale: boolean;
    /**
     * Whether the export-parameters feature is on; the parameter members below are empty when off.
     */
    parametersEnabled: boolean;
    /**
     * Per-tab visible parameters to render as chips.
     */
    visibleParametersByTab: Record<string, IAutomationParameter[]>;
    /**
     * Per-tab workspace parameters addable via the "+" menu.
     */
    availableParametersByTab: Record<string, IAutomationParameter[]>;
    /**
     * The tab the flat (non-tabbed) UI edits; undefined for multi-tab dashboards or when no
     * parameter context applies.
     */
    flatTabId: string | undefined;
    /**
     * Adds a workspace parameter with its default value on the flat tab.
     */
    onParameterAdd: (ref: IdentifierRef) => void;
    /**
     * Sets a parameter's value on the flat tab.
     */
    onParameterChange: (ref: IdentifierRef, value: ParameterValue) => void;
    /**
     * Removes a parameter override on the flat tab.
     */
    onParameterDelete: (ref: IdentifierRef) => void;
    /**
     * Adds a workspace parameter with its default value on the given tab.
     */
    onParameterAddByTab: (tabId: string, ref: IdentifierRef) => void;
    /**
     * Sets a parameter's value on the given tab.
     */
    onParameterChangeByTab: (tabId: string, ref: IdentifierRef, value: ParameterValue) => void;
    /**
     * Removes a parameter override on the given tab.
     */
    onParameterDeleteByTab: (tabId: string, ref: IdentifierRef) => void;
    /**
     * Resets the parameters to the dashboard's current effective values (the "apply latest" flow).
     */
    applyLatest: () => void;
    /**
     * Re-encodes the parameters onto the automation with the new persistence value.
     */
    onStoreParametersChange: (storeParameters: boolean) => void;
}

/**
 * Return type of `useScheduledEmailFormState`, composed from the context values it feeds.
 *
 * @internal
 */
export type IScheduledEmailFormState = Pick<
    IScheduledExportDraftContextValue,
    | "editedAutomation"
    | "originalAutomation"
    | "startDate"
    | "isCronValid"
    | "isTitleValid"
    | "isSubjectValid"
    | "isOnMessageValid"
> &
    Pick<
        IScheduledExportActionsContextValue,
        | "setEditedAutomation"
        | "onTitleChange"
        | "onRecurrenceChange"
        | "onEvaluationModeChange"
        | "onDestinationChange"
        | "onRecipientsChange"
        | "onSubjectChange"
        | "onMessageChange"
    > &
    IScheduledExportDataContextValue;

/**
 * Return type of `useScheduledEmailExportSettings`: the attachment handlers plus the
 * parameter-wire writer only the filters model consumes.
 *
 * @internal
 */
export type IScheduledEmailExportSettings = Pick<
    IScheduledExportActionsContextValue,
    | "onDashboardAttachmentsChange"
    | "onWidgetAttachmentsChange"
    | "onXlsxSettingsChange"
    | "onPdfSettingsChange"
    | "onCsvSettingsChange"
    | "onCsvRawSettingsChange"
    | "onSlidesTemplateIdChange"
> & {
    setParametersWire: (wire: Record<string, IDashboardExportParameter[]> | undefined) => void;
};

/**
 * Return type of `useScheduleTimezone`: the "Time zone" section's state and handlers plus the live
 * value export-definition rebuilds read.
 *
 * @internal
 */
export type IScheduleTimezoneState = Pick<
    IScheduledExportDraftContextValue,
    | "isTimezoneFeatureEnabled"
    | "canSelectScheduleTimezone"
    | "scheduleTimezoneSelection"
    | "defaultResolvedTimezone"
    | "scheduleTimezoneIsStale"
> &
    Pick<IScheduledExportActionsContextValue, "onScheduleTimezoneChange" | "applyCurrentScheduleTimezone"> & {
        /**
         * Live value for export definitions created after the dialog opened. Active when the section
         * is interactive, and also when an edited schedule carries a stored timezone while the
         * section is hidden.
         */
        scheduleTimezone: { active: boolean; timezoneId: string | undefined };
    };

/**
 * The scheduled-export dialog's validity.
 *
 * @alpha
 */
export interface IScheduledExportDialogValidity {
    /**
     * Whether submit is disabled: the draft is invalid, incomplete, or unchanged in edit mode.
     * Undefined (falsy) in create mode when nothing else disables it.
     */
    isSubmitDisabled: boolean | undefined;
    /**
     * The validation message to show; undefined when there is none.
     */
    validationErrorMessage: string | undefined;
    /**
     * Whether the schedule's source (widget or dashboard) still exists.
     */
    isParentValid: boolean;
    /**
     * Whether the selected channel accepts external (e-mail only) recipients.
     */
    allowExternalRecipients: boolean;
    /**
     * Whether the selected channel accepts only the creator as recipient.
     */
    allowOnlyLoggedUserRecipients: boolean;
}

/**
 * What the scheduled-export dialog's attachment section displays, derived from the draft's export
 * definitions with the defaults applied.
 *
 * @alpha
 */
export interface IScheduledExportAttachments {
    /**
     * The formats of the draft's export definitions, in definition order.
     */
    selectedAttachments: Array<DashboardAttachmentType | WidgetAttachmentType>;
    /**
     * Whether the draft holds a whole-dashboard export definition (true for a draft with none yet).
     */
    isDashboardExportSelected: boolean;
    /**
     * Whether the draft holds a widget CSV export definition.
     */
    isCsvExportSelected: boolean;
    /**
     * Whether the draft holds a widget XLSX export definition.
     */
    isXlsxExportSelected: boolean;
    /**
     * XLSX settings; `mergeHeaders` and `exportInfo` default to true.
     */
    xlsxSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * Tabular-PDF settings; page size defaults from the workspace locale, orientation to portrait,
     * `exportInfo` to true.
     */
    pdfSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * CSV settings; an undefined `delimiter` is the backend default.
     */
    csvSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * Raw-CSV settings; an undefined `delimiter` is the backend default.
     */
    csvRawSettings: IExportDefinitionVisualizationObjectSettings;
    /**
     * The slides template chosen per slides format; undefined where the default template applies.
     */
    slidesTemplateIds: { PPTX: string | undefined; PDF_SLIDES: string | undefined; PDF: string | undefined };
}

/**
 * Lifecycle callbacks of {@link useSaveScheduledEmailToBackend}: `onSubmit`/`onSuccess`/`onError`
 * (create) and `onSave`/`onSaveSuccess`/`onSaveError` (edit).
 *
 * @alpha
 */
export type IUseSaveScheduledEmailCallbacks = Pick<
    IScheduledEmailDialogProps,
    "onSuccess" | "onError" | "onSubmit" | "onSaveSuccess" | "onSaveError" | "onSave"
>;

/**
 * The scheduled-export dialog's save path.
 *
 * @alpha
 */
export interface IScheduledEmailSaveState {
    /**
     * Creates the schedule (draft without an id) or updates it (draft with one), after sanitizing it.
     */
    handleSaveScheduledEmail: () => void;
    /**
     * Whether a create or update is in flight.
     */
    isSavingScheduledEmail: boolean;
    /**
     * A 400 response's detail message, shown in the dialog without closing it; undefined otherwise.
     */
    savingErrorMessage: string | undefined;
}
