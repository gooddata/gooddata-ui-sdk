// (C) 2019-2026 GoodData Corporation

import { type ComponentType, type ReactNode } from "react";

import {
    type DateAttributeGranularity,
    type IAttribute,
    type IAutomationMetadataObject,
    type IDataSetMetadataObject,
    type IInsight,
    type IMeasure,
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
export interface IAlertingDialogProps {
    /**
     * In case, we are not creating new alert, but editing existing one, this is the active alert to be edited.
     *
     * @deprecated read `alertToEdit` from `useAlertingDialogContext()` instead. Prop will be removed.
     */
    alertToEdit?: IAutomationMetadataObject;

    /**
     * Notification channels in organization
     *
     * @deprecated read `notificationChannels` from `useAlertingDialogContext()` instead.
     *     Prop will be removed.
     */
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Widget to be used for alert.
     *
     * Note: this is available only when alerting for widget, not dashboard.
     * Typed as IWidget (not ExtendedDashboardWidget) because the dialog only
     * supports insight widgets; custom widgets and nested layouts are not valid
     * alert targets and were silently discarded at the connector boundary anyway.
     *
     * @deprecated read `widget` from `useAlertingDialogContext()` instead. Prop will be removed.
     */
    widget?: IWidget;

    /**
     * Insight to be used for alert.
     *
     * Note: this is available only when alerting for widget, not dashboard.
     *
     * @deprecated read `insight` from `useAlertingDialogContext()` instead. Prop will be removed.
     */
    insight?: IInsight;

    /**
     * Is alert dialog loading initial data, before it can be rendered?
     *
     * @deprecated read `isLoading` from `useAlertingDialogContext()` instead. Prop will be removed.
     */
    isLoading?: boolean;

    /**
     * Custom content rendered as the first child of the dialog content area, above the default form.
     *
     * @remarks
     * Use this to surface an application-specific banner or warning without replacing the whole dialog.
     */
    topContent?: ReactNode;

    /**
     * Custom content rendered as the last child of the dialog content area, below the default form.
     *
     * @remarks
     * Use this to surface an application-specific note or disclaimer without replacing the whole dialog.
     */
    bottomContent?: ReactNode;

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
export interface IAlertingManagementDialogProps {
    /**
     * Is loading alert data?
     *
     * @deprecated not read by the default dialog. Prop will be removed.
     */
    isLoadingAlertingData?: boolean;

    /**
     * Error occurred while loading alert data?
     *
     * @deprecated not read by the default dialog. Prop will be removed.
     */
    alertDataError?: GoodDataSdkError;

    /**
     * Notification channels in organization
     *
     * @deprecated not read by the default dialog. A replacement can read the dashboard's
     *     notification channels directly. Prop will be removed.
     */
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Automations in workspace
     *
     * @deprecated not read by the default dialog. A replacement can read the dashboard's
     *     automations directly. Prop will be removed.
     */
    automations?: IAutomationMetadataObject[];

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
