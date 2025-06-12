// (C) 2019-2025 GoodData Corporation
import { ComponentType } from "react";
import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IFilter,
    IInsight,
    INotificationChannelMetadataObject,
    IWorkspaceUser,
    ObjRef,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { ExtendedDashboardWidget } from "../../model/index.js";

///
/// Component props
///

/**
 * @internal
 */
export interface IScheduledEmailDialogPropsContext {
    widgetRef?: ObjRef | undefined;
}

/**
 * @alpha
 */
export interface IScheduledEmailDialogProps {
    /**
     * In case, we are not creating new schedule, but editing existing one, this is the active schedule to be edited.
     */
    scheduledExportToEdit?: IAutomationMetadataObject;

    /**
     * Users in workspace
     */
    users: IWorkspaceUser[];

    /**
     * Error occurred while loading users
     */
    usersError?: GoodDataSdkError;

    /**
     * Notification channels in organization
     */
    notificationChannels: INotificationChannelMetadataObject[];

    /**
     * Widget to be used for scheduled email.
     *
     * Note: this is available only when scheduling export for widget, not dashboard.
     */
    widget?: ExtendedDashboardWidget;

    /**
     * Insight to be used for scheduled email.
     *
     * Note: this is available only when scheduling export for widget, not dashboard.
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
     */
    widgetFilters?: IFilter[];

    /**
     * Is scheduled email dialog loading initial data, before it can be rendered?
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
     */
    isLoadingScheduleData: boolean;

    /**
     * Error occurred while loading schedule data?
     */
    scheduleDataError?: GoodDataSdkError;

    /**
     * Notification channels in organization
     */
    notificationChannels: INotificationChannelMetadataObject[];

    /**
     * Automations in workspace
     */
    automations: IAutomationMetadataObject[];

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
