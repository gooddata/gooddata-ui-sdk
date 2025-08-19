// (C) 2019-2025 GoodData Corporation
import { ComponentType } from "react";

import {
    DateAttributeGranularity,
    IAttribute,
    IAutomationMetadataObject,
    IDataSetMetadataObject,
    IInsight,
    IInsightWidget,
    IMeasure,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { ExtendedDashboardWidget } from "../../model/index.js";

///
/// Component props
///

/**
 * @alpha
 */
export interface IAlertingDialogProps {
    /**
     * In case, we are not creating new alert, but editing existing one, this is the active alert to be edited.
     */
    alertToEdit?: IAutomationMetadataObject;

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
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Widget to be used for alert.
     *
     * Note: this is available only when alerting for widget, not dashboard.
     */
    widget?: ExtendedDashboardWidget;

    /**
     * Insight to be used for alert.
     *
     * Note: this is available only when alerting for widget, not dashboard.
     */
    insight?: IInsight;

    /**
     * Is alert dialog loading initial data, before it can be rendered?
     */
    isLoading?: boolean;

    /**
     * Callback to be called, when user closes the alert dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when alerting finishes successfully.
     */
    onSuccess?: (alertDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onSaveError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when alerting finishes successfully.
     */
    onSaveSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when alert is deleted.
     */
    onDeleteSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when alert fails to delete.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;
}

/**
 * @alpha
 */
export interface IAlertingDialogOldProps {
    /**
     * Alert to be edited in the dialog.
     */
    editAlert?: IAutomationMetadataObject;

    /**
     * Callback to be called, when user save the existing alert.
     */
    onUpdate?: (alertingDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the alerting dialog.
     */
    onCancel?: () => void;

    /**
     * Widget to be edited in the dialog.
     */
    editWidget?: IInsightWidget;

    /**
     * Anchor element for the dialog.
     */
    anchorEl?: HTMLElement | null;
}

//
//
//
/**
 * @alpha
 */
export interface IAlertingManagementDialogProps {
    /**
     * Is loading alert data?
     */
    isLoadingAlertingData: boolean;

    /**
     * Error occurred while loading alert data?
     */
    alertDataError?: GoodDataSdkError;

    /**
     * Notification channels in organization
     */
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Automations in workspace
     */
    automations: IAutomationMetadataObject[];

    /**
     * Callback to be called, when user adds new alert item.
     */
    onAdd?: () => void;

    /**
     * Callback to be called, when user clicks alert item for editing.
     */
    onEdit?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the alert management dialog.
     */
    onClose?: () => void;

    /**
     * Callback to be called, when alert is deleted.
     * @param alert - alert that was deleted
     */
    onDeleteSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when alert fails to delete.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when alert is paused.
     * @param alert - alert that was paused
     * @param pause - true if alert was paused, false if it was resumed
     */
    onPauseSuccess: (alert: IAutomationMetadataObject, pause: boolean) => void;

    /**
     * Callback to be called, when alert fails to pause.
     * @param error - error that occurred
     * @param pause - true if alert was paused, false if it was resumed
     */
    onPauseError: (error: GoodDataSdkError, pause: boolean) => void;
}

/**
 * @alpha
 */
export interface IAlertingManagementDialogOldProps {
    /**
     * Callback to be called, when user clicks alert item for editing.
     */
    onEdit?: (
        alertingDefinition: IAutomationMetadataObject,
        widget: IInsightWidget | undefined,
        anchor: HTMLElement | null,
        onClosed: () => void,
    ) => void;

    /**
     * Callback to be called, when user closes the alert management dialog.
     */
    onClose?: () => void;

    /**
     * Is loading alert data?
     */
    isLoadingAlertingData: boolean;

    /**
     * Error occurred while loading alert data?
     */
    alertingDataError?: GoodDataSdkError;

    /**
     * Automations in workspace
     */
    automations: IAutomationMetadataObject[];

    /**
     * Callback to be called, when alert is deleted.
     * @param alert - alert that was deleted
     */
    onDeleteSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when alert fails to delete.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when alert is paused.
     * @param alert - alert that was paused
     * @param pause - true if alert was paused, false if it was resumed
     */
    onPauseSuccess: (alert: IAutomationMetadataObject, pause: boolean) => void;

    /**
     * Callback to be called, when alert fails to pause.
     * @param error - error that occurred
     * @param pause - true if alert was paused, false if it was resumed
     */
    onPauseError: (error: GoodDataSdkError, pause: boolean) => void;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomAlertingDialogComponent = ComponentType<IAlertingDialogProps>;

/**
 * @alpha
 */
export type CustomAlertingManagementDialogComponent = ComponentType<IAlertingManagementDialogProps>;

/**
 * @alpha
 */
export interface IAlertDropdownProps {
    isReadOnly?: boolean;
    paused: boolean;
    alignTo: HTMLElement;
    onClose: () => void;
    onDelete: () => void;
    onPause: () => void;
    onEdit: () => void;
    onResume: () => void;
}

//
//
//

/**
 * @internal
 */
export enum AlertMetricComparatorType {
    PreviousPeriod,
    SamePeriodPreviousYear,
}

/**
 * @internal
 */
export type AlertMetricComparator = {
    measure: IMeasure;
    isPrimary: boolean;
    comparator: AlertMetricComparatorType;
    //date attribute related
    dataset?: IDataSetMetadataObject;
    granularity?: DateAttributeGranularity;
};

/**
 * @internal
 */
export type AlertMetric = {
    measure: IMeasure;
    isPrimary: boolean;
    comparators: AlertMetricComparator[];
};

/**
 * @internal
 */
export type AlertAttribute = {
    attribute: IAttribute;
    type: "dateAttribute" | "attribute";
};
