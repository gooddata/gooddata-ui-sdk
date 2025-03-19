// (C) 2019-2024 GoodData Corporation
import { ComponentType } from "react";
import { IAutomationMetadataObject, IInsightWidget } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

///
/// Component props
///

/**
 * @alpha
 */
export interface IAlertingDialogProps {
    /**
     * Callback to be called, when user save the existing alert.
     */
    onUpdate?: (alertingDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the alerting dialog.
     */
    onCancel?: () => void;

    /**
     * Alert to be edited in the dialog.
     */
    editAlert?: IAutomationMetadataObject;

    /**
     * Widget to be edited in the dialog.
     */
    editWidget?: IInsightWidget;

    /**
     * Anchor element for the dialog.
     */
    anchorEl?: HTMLElement | null;
}

/**
 * @alpha
 */
export interface IAlertingManagementDialogProps {
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
