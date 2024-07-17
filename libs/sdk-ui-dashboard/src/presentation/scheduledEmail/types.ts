// (C) 2019-2024 GoodData Corporation
import { ComponentType } from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IWebhookMetadataObject,
    IWorkspaceUser,
    ObjRef,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

///
/// Component props
///

/**
 * @internal
 */
export interface IScheduledEmailDialogPropsContext {
    insightRef?: ObjRef | undefined;
}

/**
 * @alpha
 */
export interface IScheduledEmailDialogProps {
    /**
     * Is scheduled e-mail dialog visible?
     */
    isVisible?: boolean;

    /**
     * Context for the scheduled e-mail dialog.
     */
    context?: IScheduledEmailDialogPropsContext;

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
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when scheduling finishes successfully.
     */
    onSuccess?: () => void;

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
    editSchedule?: IAutomationMetadataObject;

    /**
     * Users in workspace
     */
    users: IWorkspaceUser[];

    /**
     * Webhooks in organization
     */
    webhooks: IWebhookMetadataObject[];

    /**
     * Automations in workspace
     */
    automations: IAutomationMetadataObject[];
}

/**
 * @alpha
 */
export interface IScheduledEmailManagementDialogProps {
    /**
     * Is scheduled email management dialog visible?
     */
    isVisible?: boolean;

    /**
     * Context for the scheduled e-mail dialog.
     */
    context?: IScheduledEmailDialogPropsContext;

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
     * Is loading schedule data?
     */
    isLoadingScheduleData: boolean;

    /**
     * Error occurred while loading schedule data?
     */
    scheduleDataError?: GoodDataSdkError;

    /**
     * Webhooks in organization
     */
    webhooks: IWebhookMetadataObject[];

    /**
     * Automations in workspace
     */
    automations: IAutomationMetadataObject[];

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
