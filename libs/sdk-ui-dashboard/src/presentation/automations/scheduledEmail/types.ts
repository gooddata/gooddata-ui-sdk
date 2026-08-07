// (C) 2019-2026 GoodData Corporation

import { type ComponentType } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

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
