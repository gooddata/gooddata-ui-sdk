// (C) 2019-2021 GoodData Corporation
import { ComponentType } from "react";
import { IAccessControlAware } from "@gooddata/sdk-backend-spi";
import { IAuditableUsers, ObjRef } from "@gooddata/sdk-model";
import { IShareProps } from "../../types";

/**
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISharingApplyPayload extends IShareProps {
    // this payload will have more items,
}

/**
 * @alpha
 */
export interface IShareDialogProps {
    /**
     * Is share dialog visible?
     */
    isVisible?: boolean;

    /**
     * Object to share
     */
    sharedObject: IAccessControlAware & IAuditableUsers;

    /**
     * Current user reference
     */
    currentUserRef: ObjRef;

    /**
     * Callback to be called when user apply share dialog
     */
    onApply: (payload: ISharingApplyPayload) => void;

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
export type CustomShareDialogComponent = ComponentType;
