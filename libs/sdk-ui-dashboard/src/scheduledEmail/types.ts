// (C) 2019-2021 GoodData Corporation
import { ComponentType } from "react";
import { IScheduledMail, IScheduledMailDefinition } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

///
/// Core props
///

/**
 * The necessary props a component must be able to handle for it to be usable as a ScheduleEmailDialog.
 * @internal
 */
export interface IScheduledEmailDialogCoreProps {
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

///
/// Custom component types
///

/**
 * @internal
 */
export type CustomScheduledEmailDialogComponent = ComponentType<IScheduledEmailDialogCoreProps>;

///
/// Default component props
///

/**
 * The subset of {@link IDefaultScheduledEmailDialogProps} that can be subscribed to by the user (i.e. the callbacks
 * will be called in addition to the default callbacks).
 *
 * @internal
 */
export type IDefaultScheduledEmailDialogCallbackProps = Pick<
    IDefaultScheduledEmailDialogProps,
    "onCancel" | "onError" | "onSubmit" | "onSuccess"
>;

/**
 * Props of the default ScheduledEmailDialog implementation: {@link DefaultScheduledEmailDialog}.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDefaultScheduledEmailDialogProps
    extends IScheduledEmailDialogCoreProps,
        IDefaultScheduledEmailDialogCallbackProps {}
