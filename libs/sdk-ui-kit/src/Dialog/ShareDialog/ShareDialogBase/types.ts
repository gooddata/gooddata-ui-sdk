// (C) 2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

// Grantee types

/**
 * @internal
 */
export type GranteeItem = IGranteeUser | IGranteeUserInactive | IGranteeGroup | IGranteeGroupAll;

/**
 * @internal
 */
export type GranteeType = "user" | "inactive_user" | "group" | "groupAll";

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
export interface IGranteeUser extends IGranteeBase {
    type: "user";
    name: string;
    email: string;
    isOwner: boolean;
    isCurrentUser: boolean;
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
export interface IGranteeUserInactive extends IGranteeBase {
    type: "inactive_user";
}

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

// Components types

/**
 * @internal
 */
export type DialogModeType = "ShareGrantee" | "AddGrantee";

/**
 * @internal
 */
export interface IShareDialogBaseProps {
    owner: IGranteeUser | IGranteeUserInactive;
    grantees: GranteeItem[];
    onCancel: () => void;
    onSubmit: (granteesToAdd: GranteeItem[], granteesToDelete: GranteeItem[]) => void;
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
    isDirty: boolean;
    owner: IGranteeUser | IGranteeUserInactive;
    grantees: GranteeItem[];
    onAddGranteeButtonClick: () => void;
    onGranteeDelete: (grantee: GranteeItem) => void;
    onCancel: () => void;
    onSubmit: () => void;
}

/**
 * @internal
 */
export interface IShareGranteeContentProps {
    grantees: GranteeItem[];
    onAddGrantee: () => void;
    onDelete: (grantee: GranteeItem) => void;
}

/**
 * @internal
 */
export interface IAddGranteeBaseProps {
    isDirty: boolean;
    availableGrantees: GranteeItem[];
    addedGrantees: GranteeItem[];
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
    availableGrantees: GranteeItem[];
    addedGrantees: GranteeItem[];
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
export interface ISelectOption {
    label: string;
    value: GranteeItem;
}

/**
 * @internal
 */
export interface IAddGranteeSelectProps {
    onSelectGrantee: (grantee: GranteeItem) => void;
    granteesOption: ISelectOption[];
}
