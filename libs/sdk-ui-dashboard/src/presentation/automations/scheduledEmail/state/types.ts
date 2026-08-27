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
import { type IScheduleTimezoneSelection } from "../types.js";

/**
 * The scheduled-export dialog's edit draft: the automation being edited, its baseline, the derived
 * start date, the per-field validity flags, and the "Time zone" section's state.
 *
 * Changes on every keystroke; consumers re-render by design.
 *
 * @internal
 */
export interface IScheduledExportDraftContextValue {
    editedAutomation: IAutomationMetadataObjectDefinition;
    /**
     * The draft as it was when the dialog opened; the dirty check compares against it.
     */
    originalAutomation: IAutomationMetadataObjectDefinition;
    /**
     * The schedule's first run in the user's timezone, normalized for the recurrence form.
     */
    startDate: Date;
    isCronValid: boolean;
    isTitleValid: boolean;
    isSubjectValid: boolean;
    isOnMessageValid: boolean;
    /**
     * The enableTimezoneChange setting; timezone-related presentation is gated by it.
     */
    isTimezoneFeatureEnabled: boolean;
    /**
     * Whether the schedule may define its own export timezone (the "Time zone" section renders).
     */
    canSelectScheduleTimezone: boolean;
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
 * @internal
 */
export interface IScheduledExportActionsContextValue {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>;
    onTitleChange: (value: string) => void;
    onRecurrenceChange: (cronExpression: string, startDate: Date | null, isValid: boolean) => void;
    onEvaluationModeChange: (isShared: boolean) => void;
    onDestinationChange: (notificationChannelId: string) => void;
    onRecipientsChange: (recipients: IAutomationRecipient[]) => void;
    onSubjectChange: (value: string | number, isValid: boolean) => void;
    onMessageChange: (value: string, isValid: boolean) => void;
    /**
     * Replaces the dashboard export formats; new definitions inherit the current filters and timezone.
     */
    onDashboardAttachmentsChange: (formats: DashboardAttachmentType[]) => void;
    /**
     * Replaces the widget export formats; throws when the dialog has no widget.
     */
    onWidgetAttachmentsChange: (formats: WidgetAttachmentType[]) => void;
    onXlsxSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    onPdfSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    onCsvSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    onCsvRawSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
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
 * @internal
 */
export interface IScheduledExportDataContextValue {
    defaultUser: IAutomationRecipient;
    defaultRecipient: IAutomationRecipient;
}

/**
 * The scheduled-export dialog's filter and export-parameter model: the current selection and
 * available filters (flat and per tab), the handlers that mutate them, the staleness gate, and the
 * export-parameter chips with their handlers.
 *
 * Changes when a filter, a parameter or the store-filters toggle is edited; never per keystroke.
 *
 * @internal
 */
export interface IScheduledExportFiltersContextValue {
    selectedFilters: FilterContextItem[];
    availableFilters: FilterContextItem[] | undefined;
    /**
     * Whether the schedule stores its own filters instead of using the latest saved dashboard filters.
     */
    storeFilters: boolean;
    /**
     * Filters structured per dashboard tab; present with more than one tab.
     */
    filtersByTab: IAutomationFiltersTab[] | undefined;
    editedFiltersByTab: Record<string, FilterContextItem[]> | undefined;
    /**
     * Replaces the selection with the complete updated array and mirrors it into the export
     * definitions. `storeFiltersParam` overrides the current toggle value for this write.
     */
    onFiltersChange: (filters: FilterContextItem[], storeFiltersParam?: boolean) => void;
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
    onParameterAdd: (ref: IdentifierRef) => void;
    onParameterChange: (ref: IdentifierRef, value: ParameterValue) => void;
    onParameterDelete: (ref: IdentifierRef) => void;
    onParameterAddByTab: (tabId: string, ref: IdentifierRef) => void;
    onParameterChangeByTab: (tabId: string, ref: IdentifierRef, value: ParameterValue) => void;
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
