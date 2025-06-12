// (C) 2021-2023 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    IAuditableUsers,
    ObjRef,
    IAccessControlAware,
    ShareStatus,
    IAccessGrantee,
    IUser,
    AccessGranularPermission,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export type CurrentUserPermissions = {
    [permission in
        | "canEditLockedAffectedObject"
        | "canEditAffectedObject"
        | "canShareLockedAffectedObject"
        | "canShareAffectedObject"
        | "canViewAffectedObject"]: boolean;
};

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
    currentUser: IUser;
    locale?: string;
    onApply: (payload: ISharingApplyPayload) => void;
    onCancel: () => void;
    onError?: (error: GoodDataSdkError) => void;
    onInteraction?: (data: IShareDialogInteractionData) => void;
    isLockingSupported: boolean;
    isCurrentUserWorkspaceManager: boolean;
    labels: IShareDialogLabels;
    currentUserPermissions: CurrentUserPermissions;
}

/**
 * @internal
 */
export type ShareDialogInteractionType =
    | "SHARE_DIALOG_OPENED"
    | "SHARE_DIALOG_CLOSED"
    | "SHARE_DIALOG_SAVED"
    | "SHARE_DIALOG_PERMISSIONS_DROPDOWN_OPENED"
    | "SHARE_DIALOG_PERMISSIONS_CHANGED"
    | "SHARE_DIALOG_GRANTEE_REMOVED"
    | "SHARE_DIALOG_GRANTEE_ADDED"
    | "SHARE_DIALOG_AVAILABLE_GRANTEE_LIST_OPENED";

/**
 * @internal
 */
export interface IShareDialogInteractionData extends ShareDialogInteractionGranteeData {
    type: ShareDialogInteractionType;
    flowId: string;
    currentUserPermission: AccessGranularPermission;
    isCurrentUserWorkspaceManager: boolean;
    isSharedObjectLocked: boolean;
    sharedObjectStatus: ShareStatus;
}

/**
 * @internal
 */
export type ShareDialogInteractionGranteeData = {
    isCurrentUserSelfUpdating?: boolean;
    isExistingGrantee?: boolean;
    granteeType?: "user" | "group";
    granteeEffectivePermission?: AccessGranularPermission;
    granteeUpdatedPermission?: AccessGranularPermission;
    numberOfAvailableGrantees?: number;
};
