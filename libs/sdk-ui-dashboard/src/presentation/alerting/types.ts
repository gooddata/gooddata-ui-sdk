// (C) 2019-2024 GoodData Corporation
import { ComponentType } from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IWebhookDefinitionObject,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

///
/// Component props
///

/**
 * @alpha
 */
export interface IAlertingDialogProps {
    /**
     * Is scheduled e-mail dialog visible?
     */
    isVisible?: boolean;

    /**
     * Callback to be called, when user submits the scheduled email dialog.
     */
    onSubmit?: (alertingDefinition: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => void;

    /**
     * Callback to be called, when user save the existing scheduled email.
     */
    onSave?: (alertingDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the scheduled email dialog.
     */
    onCancel?: () => void;

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

    /**
     * Schedule to be edited in the dialog.
     */
    editAlert?: IAutomationMetadataObject;

    /**
     * Webhooks in organization
     */
    webhooks: IWebhookDefinitionObject[];

    /**
     * Automations in workspace
     */
    automations: IAutomationMetadataObject[];
}

/**
 * @alpha
 */
export interface IAlertingManagementDialogProps {
    /**
     * Is scheduled email management dialog visible?
     */
    isVisible?: boolean;

    /**
     * Callback to be called, when user clicks scheduled email item for editing.
     */
    onEdit?: (alertingDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the scheduled email management dialog.
     */
    onClose?: () => void;

    /**
     * Is loading schedule data?
     */
    isLoadingAlertingData: boolean;

    /**
     * Error occurred while loading schedule data?
     */
    alertingDataError?: GoodDataSdkError;

    /**
     * Webhooks in organization
     */
    webhooks: IWebhookDefinitionObject[];

    /**
     * Automations in workspace
     */
    automations: IAutomationMetadataObject[];

    /**
     * Callback to be called, when scheduled email is deleted.
     * @param alert - alert that was deleted
     */
    onDeleteSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when schedule fails to delete.
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
    paused: boolean;
    alignTo: HTMLElement;
    onClose: () => void;
    onDelete: () => void;
    onPause: () => void;
    onEdit: () => void;
    onActivate: () => void;
}
