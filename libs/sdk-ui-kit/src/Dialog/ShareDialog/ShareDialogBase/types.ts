// (C) 2021 GoodData Corporation
import { ShareStatus } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { IShareDialogLabels } from "../types";

// Grantee types

/**
 * @internal
 */
export type GranteeItem = IGranteeUser | IGranteeInactiveOwner | IGranteeGroup | IGranteeGroupAll;

/**
 * @internal
 */
export type GranteeType = "user" | "inactive_owner" | "group" | "groupAll";

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
    email: string;
    isOwner: boolean;
    isCurrentUser: boolean;
    status: GranteeStatus;
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
export interface IGranteeGroupAll extends IGranteeBase {
    type: "groupAll";
    memberCount?: number;
}

/**
 * @internal
 */
export const isGranteeGroupAll = (obj: unknown): obj is IGranteeGroup => {
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
}

/**
 * @internal
 */
export interface IShareDialogBaseProps {
    sharedObject: IAffectedSharedObject;
    currentUserRef: ObjRef;
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
    onDelete: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IShareGranteeBaseProps {
    currentUserRef: ObjRef;
    isDirty: boolean;
    isLoading: boolean;
    isLockedNow: boolean;
    isUnderLenientControlNow: boolean;
    sharedObject: IAffectedSharedObject;
    grantees: GranteeItem[];
    onAddGranteeButtonClick: () => void;
    onGranteeDelete: (grantee: GranteeItem) => void;
    onCancel: () => void;
    onSubmit: () => void;
    onLockChange: (locked: boolean) => void;
    onUnderLenientControlChange: (isUnderLenientControl: boolean) => void;
}

/**
 * @internal
 */
export interface IShareGranteeContentProps {
    isLoading: boolean;
    grantees: GranteeItem[];
    onAddGrantee: () => void;
    onDelete: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IAddGranteeBaseProps {
    isDirty: boolean;
    currentUserRef: ObjRef;
    addedGrantees: GranteeItem[];
    appliedGrantees: GranteeItem[];
    onBackClick?: () => void;
    onDelete: (grantee: GranteeItem) => void;
    onAddUserOrGroups?: (grantee: GranteeItem) => void; // rename
    onCancel: () => void;
    onSubmit: () => void;
}

/**
 * @internal
 */
export interface IAddGranteeContentProps {
    currentUserRef: ObjRef;
    addedGrantees: GranteeItem[];
    appliedGrantees: GranteeItem[];
    onDelete: (grantee: GranteeItem) => void;
    onAddUserOrGroups: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IGranteesListProps {
    mode: DialogModeType;
    grantees: GranteeItem[];
    onDelete: (grantee: GranteeItem) => void;
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
    currentUserRef: ObjRef;
    appliedGrantees: GranteeItem[];
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
