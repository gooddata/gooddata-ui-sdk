// (C) 2019-2021 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { ISharedObject, ISharingApplyPayload as Payload } from "@gooddata/sdk-ui-kit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISharingApplyPayload extends Payload {
    // this payload will have more items,
}

/**
 * @alpha
 */
export interface IShareDialogProps {
    /**
     * Analytical backend from which the dashboard obtains data to render.
     */
    backend: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the dashboard obtains data to render.
     */
    workspace: string;

    /**
     * Is share dialog visible?
     */
    isVisible?: boolean;

    /**
     * Object to share
     */
    sharedObject: ISharedObject;

    /**
     * Current user reference
     */
    currentUserRef: ObjRef;

    /**
     * Callback to be called when user apply share dialog
     */
    onApply: (payload: ISharingApplyPayload) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called when user closes the share dialog.
     */
    onCancel: () => void;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomShareDialogComponent = ComponentType<IShareDialogProps>;
