// (C) 2021 GoodData Corporation
import { IAccessControlAware, IAccessGrantee, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ShareStatus } from "@gooddata/sdk-backend-spi";
import { IAuditableUsers, ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export interface ISharingApplyPayload {
    shareStatus: ShareStatus;
    isUnderStrictControl: boolean;
    isLocked: boolean;
    granteesToAdd: IAccessGrantee[];
    granteesToDelete: IAccessGrantee[];
}

/**
 * @internal
 */
export interface ISharedObject extends IAccessControlAware, IAuditableUsers {
    ref: ObjRef;
}

/**
 * @internal
 */
export interface IShareDialogLabels {
    accessTypeLabel: string;
    accessRegimeLabel: string;
    removeAccessGranteeTooltip: string;
    removeAccessCreatorTooltip: string;
}

/**
 * @internal
 */
export interface IShareDialogProps {
    backend: IAnalyticalBackend;
    workspace: string;
    sharedObject: ISharedObject;
    currentUserRef: ObjRef;
    locale?: string;
    onApply: (payload: ISharingApplyPayload) => void;
    onCancel: () => void;
    onError?: (error: GoodDataSdkError) => void;
    isLockingSupported: boolean;
    labels: IShareDialogLabels;
}
