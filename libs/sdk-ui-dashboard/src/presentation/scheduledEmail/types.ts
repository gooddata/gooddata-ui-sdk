// (C) 2019-2022 GoodData Corporation
import { ComponentType } from "react";
import { IScheduledMail, IScheduledMailDefinition } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

///
/// Component props
///

/**
 * @alpha
 */
export interface IScheduledEmailDialogProps {
    /**
     * Is scheduled e-mail dialog visible?
     */
    isVisible?: boolean;

    /**
     * Callback to be called, when user submits the scheduled email dialog.
     */
    onSubmit?: (scheduledEmailDefinition: IScheduledMailDefinition) => void;

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
    onSuccess?: (scheduledMail: IScheduledMail) => void;
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
     * Callback to be called, when user adds new scheduled email item.
     */
    onAdd?: () => void;

    /**
     * Callback to be called, when user closes the scheduled email management dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when emails fail to load.
     */
    onError?: (error: GoodDataSdkError) => void;
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
