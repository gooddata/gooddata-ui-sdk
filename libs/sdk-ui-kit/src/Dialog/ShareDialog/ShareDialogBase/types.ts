// (C) 2021-2023 GoodData Corporation
import { AccessGranularPermission, IUser, ObjRef, ShareStatus } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

import { CurrentUserPermissions, IShareDialogLabels } from "../types.js";

// Grantee types

/**
 * @internal
 */
export type GranteeItem =
    | IGranteeUser
    | IGranteeInactiveOwner
    | IGranteeGroup
    | IGranteeGroupAll
    | IGranularGranteeUser
    | IGranularGranteeGroup;

/**
 * @internal
 */
export type GranteeType = "user" | "inactive_owner" | "group" | "groupAll" | "granularUser" | "granularGroup";

/**
 * @internal
 */
export interface IGranteeBase {
    type: GranteeType;
    id: ObjRef;
}

/**
 * @internal
 */
export type GranteeStatus = "Inactive" | "Active";

/**
 * @internal
 */
export interface IGranteeUser extends IGranteeBase {
    type: "user";
    name: string;
    isOwner: boolean;
    isCurrentUser: boolean;
    status: GranteeStatus;
    email?: string;
}

/**
 * @internal
 */
export const isGranteeUser = (obj: unknown): obj is IGranteeUser => {
    return !isEmpty(obj) && (obj as IGranteeUser).type === "user";
};

/**
 * @internal
 */
export interface IGranularGranteeUser extends IGranteeBase {
    type: "granularUser";
    name: string;
    isOwner: boolean;
    isCurrentUser: boolean;
    status: GranteeStatus;
    email?: string;
    permissions: AccessGranularPermission[];
    inheritedPermissions: AccessGranularPermission[];
}

/**
 * @internal
 */
export const isGranularGranteeUser = (obj: unknown): obj is IGranularGranteeUser => {
    return !isEmpty(obj) && (obj as IGranularGranteeUser).type === "granularUser";
};

/**
 * @internal
 */
export interface IGranteeInactiveOwner extends IGranteeBase {
    type: "inactive_owner";
}

/**
 * @internal
 */
export const isGranteeUserInactive = (obj: unknown): obj is IGranteeInactiveOwner => {
    return !isEmpty(obj) && (obj as IGranteeInactiveOwner).type === "inactive_owner";
};

/**
 * @internal
 */
export interface IGranteeGroup extends IGranteeBase {
    type: "group";
    name: string;
    memberCount?: number;
}
/**
 * @internal
 */
export const isGranteeGroup = (obj: unknown): obj is IGranteeGroup => {
    return !isEmpty(obj) && (obj as IGranteeGroup).type === "group";
};

/**
 * @internal
 */
export interface IGranularGranteeGroup extends IGranteeBase {
    type: "granularGroup";
    name: string;
    permissions: AccessGranularPermission[];
    inheritedPermissions: AccessGranularPermission[];
}

/**
 * @internal
 */
export const isGranularGranteeGroup = (obj: unknown): obj is IGranularGranteeGroup => {
    return !isEmpty(obj) && (obj as IGranularGranteeGroup).type === "granularGroup";
};

/**
 * @internal
 */
export type IGranularGrantee = IGranularGranteeUser | IGranularGranteeGroup;

/**
 * @internal
 */
export const isGranularGrantee = (obj: unknown): obj is IGranularGrantee => {
    return isGranularGranteeUser(obj) || isGranularGranteeGroup(obj);
};

/**
 * @internal
 */
export interface IGranteeGroupAll extends IGranteeBase {
    type: "groupAll";
    memberCount?: number;
}

/**
 * @internal
 */
export const isGranteeGroupAll = (obj: unknown): obj is IGranteeGroupAll => {
    return !isEmpty(obj) && (obj as IGranteeGroupAll).type === "groupAll";
};

/**
 * @internal
 */
export const isGranteeItem = (obj: unknown): obj is GranteeItem => {
    return (
        !isEmpty(obj) &&
        (isGranteeGroupAll(obj) || isGranteeGroup(obj) || isGranteeUserInactive(obj) || isGranteeUser(obj))
    );
};

// Components types

/**
 * @internal
 */
export type IComponentLabelsProviderProps = {
    labels: IShareDialogLabels;
    children?: React.ReactNode;
};

/**
 * @internal
 */
export type DialogModeType = "ShareGrantee" | "AddGrantee";

/**
 * @internal
 */
export interface IAffectedSharedObject {
    ref: ObjRef;
    shareStatus: ShareStatus;
    owner: IGranteeUser | IGranteeInactiveOwner;
    isLocked: boolean;
    isUnderLenientControl: boolean;
    isLockingSupported: boolean;
    isLeniencyControlSupported: boolean;
    isMetadataObjectLockingSupported: boolean;
    areGranularPermissionsSupported?: boolean;
    canWorkspaceManagerSeeEverySharedObject?: boolean;
}

/**
 * @internal
 */
export interface IShareDialogBaseProps {
    sharedObject: IAffectedSharedObject;
    currentUser: IUser;
    currentUserPermissions: CurrentUserPermissions;
    isCurrentUserWorkspaceManager: boolean;
    onCancel: () => void;
    onSubmit: (
        grantees: GranteeItem[],
        granteesToAdd: GranteeItem[],
        granteesToDelete: GranteeItem[],
        isUnderLenientControl: boolean,
        isLocked: boolean,
    ) => void;
    onError: (err: Error) => void;
}

/**
 * @internal
 */
export interface IGranteeItemProps {
    mode: DialogModeType;
    grantee: GranteeItem;
    currentUserPermissions: CurrentUserPermissions;
    isSharedObjectLocked: boolean;
    areGranularPermissionsSupported?: boolean;
    onDelete: (grantee: GranteeItem) => void;
    onChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IShareGranteeBaseProps {
    currentUser: IUser;
    isDirty: boolean;
    isLoading: boolean;
    isLockedNow: boolean;
    isUnderLenientControlNow: boolean;
    sharedObject: IAffectedSharedObject;
    grantees: GranteeItem[];
    isCurrentUserWorkspaceManager: boolean;
    currentUserPermissions: CurrentUserPermissions;
    onAddGranteeButtonClick: () => void;
    onGranteeDelete: (grantee: GranteeItem) => void;
    onCancel: () => void;
    onSubmit: () => void;
    onLockChange: (locked: boolean) => void;
    onUnderLenientControlChange: (isUnderLenientControl: boolean) => void;
    onGranularGranteeChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IShareGranteeContentProps {
    isLoading: boolean;
    grantees: GranteeItem[];
    currentUserPermissions: CurrentUserPermissions;
    isSharedObjectLocked: boolean;
    areGranularPermissionsSupported?: boolean;
    onAddGrantee: () => void;
    onDelete: (grantee: GranteeItem) => void;
    onChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IAddGranteeBaseProps {
    isDirty: boolean;
    currentUser: IUser;
    addedGrantees: GranteeItem[];
    appliedGrantees: GranteeItem[];
    currentUserPermissions: CurrentUserPermissions;
    sharedObject: IAffectedSharedObject;
    onBackClick?: () => void;
    onDelete: (grantee: GranteeItem) => void;
    onAddUserOrGroups?: (grantee: GranteeItem) => void; // rename
    onCancel: () => void;
    onSubmit: () => void;
    onGranularGranteeChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IAddGranteeContentProps {
    currentUser: IUser;
    addedGrantees: GranteeItem[];
    appliedGrantees: GranteeItem[];
    currentUserPermissions: CurrentUserPermissions;
    isSharedObjectLocked: boolean;
    sharedObjectRef: ObjRef;
    areGranularPermissionsSupported?: boolean;
    onDelete: (grantee: GranteeItem) => void;
    onAddUserOrGroups: (grantee: GranteeItem) => void;
    onGranularGranteeChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IGranteesListProps {
    mode: DialogModeType;
    grantees: GranteeItem[];
    currentUserPermissions: CurrentUserPermissions;
    isSharedObjectLocked: boolean;
    areGranularPermissionsSupported?: boolean;
    onDelete: (grantee: GranteeItem) => void;
    onChange?: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IAddUserOrGroupButton {
    isDisabled: boolean;
    onClick: () => void;
}

/**
 * @internal
 */
export interface IGroupedOption {
    label: string;
    options: ISelectOption[];
}

/**
 * @internal
 */
export interface ISelectOption {
    label: string;
    value: GranteeItem;
}

/**
 * @internal
 */
export interface ISelectErrorOption {
    isDisabled: boolean;
    type: "error";
    label: string;
}

/**
 * @internal
 */
export const isSelectErrorOption = (obj: unknown): obj is ISelectErrorOption => {
    return !isEmpty(obj) && (obj as ISelectErrorOption).type === "error";
};

/**
 * @internal
 */
export interface IAddGranteeSelectProps {
    onSelectGrantee: (grantee: GranteeItem) => void;
    currentUser: IUser;
    appliedGrantees: GranteeItem[];
    sharedObjectRef: ObjRef;
}

/**
 * @internal
 */
export interface ISharedObjectLockControlProps {
    isLocked: boolean;
    isLockingSupported: boolean;
    onLockChange: (locked: boolean) => void;
}

/**
 * @internal
 */
export interface ISharedObjectUnderLenientControlProps {
    isUnderLenientControl: boolean;
    isLeniencyControlSupported: boolean;
    onUnderLenientControlChange: (isUnderLenientControl: boolean) => void;
}

/**
 * @internal
 */
export interface IGranteePermissionsPossibility {
    enabled: boolean;
    tooltip?: string;
}

/**
 * @internal
 */
export interface IGranularPermissionTypeItem extends IGranteePermissionsPossibility {
    id: AccessGranularPermission;
    hidden: boolean;
}

/**
 * @internal
 */
export interface IGranteePermissionsPossibilities {
    remove: IGranteePermissionsPossibility;
    assign: {
        items: IGranularPermissionTypeItem[];
        effective: AccessGranularPermission;
    };
    change: IGranteePermissionsPossibility;
}
