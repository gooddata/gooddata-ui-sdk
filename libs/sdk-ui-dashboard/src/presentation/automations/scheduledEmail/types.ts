// (C) 2019-2026 GoodData Corporation

import { type ComponentType, type KeyboardEvent, type Ref } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    type IdentifierRef,
    type ParameterValue,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type IAutomationFiltersTab } from "../../../model/store/filtering/types.js";
import { type IAutomationParameter } from "../shared/automationFilters/automationParameters.js";
import {
    type IAutomationDialogFiltersProps,
    type IAutomationDialogHeaderProps,
    type ISlotProps,
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
     * @deprecated read `scheduledExportToEdit` from `useScheduledEmailDialogContext()` instead. Prop will be removed.
     */
    scheduledExportToEdit?: IAutomationMetadataObject;

    /**
     * Notification channels in organization
     *
     * @deprecated read `notificationChannels` from `useScheduledEmailDialogContext()` instead.
     *     Prop will be removed.
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
     * @deprecated read `widget` from `useScheduledEmailDialogContext()` instead. Prop will be removed.
     */
    widget?: IWidget;

    /**
     * Insight to be used for scheduled email.
     *
     * Note: this is available only when scheduling export for widget, not dashboard.
     *
     * @deprecated read `insight` from `useScheduledEmailDialogContext()` instead. Prop will be removed.
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
     * @deprecated read `dashboardFilters` from `useScheduledEmailDialogContext()` instead. Prop will be removed.
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
     * @deprecated read `isLoading` from `useScheduledEmailDialogContext()` instead. Prop will be removed.
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
 * Section-level overrides of the default scheduled email dialog.
 *
 * @alpha
 */
export interface IScheduledEmailDialogSlots {
    /**
     * Wraps or replaces the dialog header (the title input row). Must have a stable reference
     * identity — see {@link ISlotProps}.
     */
    Header?: ComponentType<ISlotProps<ScheduledEmailDialogHeaderDefaultProps>>;

    /**
     * Wraps or replaces the Filters tab content (the filter and parameter chips). Must have a
     * stable reference identity — see {@link ISlotProps}.
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
}

/**
 * Props of {@link DefaultScheduledEmailDialog}.
 *
 * @remarks
 * Extends the shared {@link IScheduledEmailDialogProps} with customization only the default implementation
 * supports. Slots render only in the fully rendered dialog: not while the dialog context reports
 * loading, and not while the stale-filters confirmation step is shown. The Filters slot
 * additionally renders only while the Filters tab is selected — see
 * {@link IScheduledEmailDialogSlots.Filters}.
 *
 * @alpha
 */
export interface IDefaultScheduledEmailDialogProps extends IScheduledEmailDialogProps {
    /**
     * Section-level overrides. Each slot receives `{ Default, defaultProps }` and may render its own
     * content (replace) or `<Default {...defaultProps} />` inside its own markup (wrap).
     */
    slots?: IScheduledEmailDialogSlots;
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
 * @alpha
 */
export type CustomScheduledEmailManagementDialogComponent =
    ComponentType<IScheduledEmailManagementDialogProps>;
