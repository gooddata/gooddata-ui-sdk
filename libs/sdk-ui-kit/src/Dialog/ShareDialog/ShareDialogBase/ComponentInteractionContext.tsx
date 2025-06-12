// (C) 2023 GoodData Corporation

import React, { useCallback, useContext, useMemo } from "react";
import noop from "lodash/noop.js";
import { v4 as uuidv4 } from "uuid";
import {
    CurrentUserPermissions,
    IShareDialogInteractionData,
    ShareDialogInteractionGranteeData,
    ShareDialogInteractionType,
} from "../types.js";
import { getGranularPermissionFromUserPermissions, getIsGranteeCurrentUser } from "./utils.js";
import { AccessGranularPermission, IUser, ShareStatus } from "@gooddata/sdk-model";
import { GranteeItem, isGranularGrantee, isGranularGranteeUser } from "./types.js";

interface IComponentInteractionData extends ShareDialogInteractionGranteeData {
    type: ShareDialogInteractionType;
}

type ComponentInteractionContextType = {
    onInteraction: (data: IComponentInteractionData) => void;
    currentUser: IUser;
};

const defaultContext: ComponentInteractionContextType = {
    onInteraction: noop,
    currentUser: undefined,
};

const ComponentInteractionContext = React.createContext<ComponentInteractionContextType>(defaultContext);

/**
 * @internal
 */
export const useComponentInteractionContext = (): ComponentInteractionContextType =>
    useContext(ComponentInteractionContext);

interface IComponentInteractionProps {
    onInteraction: (data: IShareDialogInteractionData) => void;
    currentUser: IUser;
    currentUserPermissions: CurrentUserPermissions;
    isCurrentUserWorkspaceManager: boolean;
    sharedObjectStatus: ShareStatus;
    isSharedObjectLocked: boolean;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export const ComponentInteractionProvider: React.FC<IComponentInteractionProps> = (props) => {
    const {
        children,
        onInteraction,
        currentUser,
        currentUserPermissions,
        isCurrentUserWorkspaceManager,
        isSharedObjectLocked,
        sharedObjectStatus,
    } = props;

    const flowId = useMemo(() => uuidv4(), []);
    const currentUserPermission = useMemo(
        () => getGranularPermissionFromUserPermissions(currentUserPermissions),
        [currentUserPermissions],
    );
    const handleInteraction = useCallback(
        (data: IComponentInteractionData) => {
            onInteraction({
                ...data,
                flowId,
                currentUserPermission,
                isSharedObjectLocked,
                sharedObjectStatus,
                isCurrentUserWorkspaceManager,
            });
        },
        [
            onInteraction,
            flowId,
            currentUserPermission,
            isSharedObjectLocked,
            sharedObjectStatus,
            isCurrentUserWorkspaceManager,
        ],
    );

    return (
        <ComponentInteractionContext.Provider
            value={{
                onInteraction: handleInteraction,
                currentUser,
            }}
        >
            {children}
        </ComponentInteractionContext.Provider>
    );
};

export const useShareDialogInteraction = () => {
    const { onInteraction, currentUser } = useComponentInteractionContext();

    const openInteraction = useCallback(
        () =>
            onInteraction({
                type: "SHARE_DIALOG_OPENED",
            }),
        [onInteraction],
    );

    const closeInteraction = useCallback(
        () =>
            onInteraction({
                type: "SHARE_DIALOG_CLOSED",
            }),
        [onInteraction],
    );

    const saveInteraction = useCallback(
        () =>
            onInteraction({
                type: "SHARE_DIALOG_SAVED",
            }),
        [onInteraction],
    );

    const permissionsDropdownOpenInteraction = useCallback(
        (
            grantee: GranteeItem,
            isExistingGrantee: boolean,
            granteeEffectivePermission: AccessGranularPermission,
        ) => {
            if (!isGranularGrantee(grantee)) {
                return;
            }

            onInteraction({
                type: "SHARE_DIALOG_PERMISSIONS_DROPDOWN_OPENED",
                isCurrentUserSelfUpdating: getIsGranteeCurrentUser(grantee.id, currentUser),
                isExistingGrantee,
                granteeType: isGranularGranteeUser(grantee) ? "user" : "group",
                granteeEffectivePermission,
            });
        },
        [onInteraction, currentUser],
    );

    const permissionsChangeInteraction = useCallback(
        (
            grantee: GranteeItem,
            isExistingGrantee: boolean,
            granteeEffectivePermission: AccessGranularPermission,
            granteeUpdatedPermission: AccessGranularPermission,
        ) => {
            if (!isGranularGrantee(grantee)) {
                return;
            }

            onInteraction({
                type: "SHARE_DIALOG_PERMISSIONS_CHANGED",
                isCurrentUserSelfUpdating: getIsGranteeCurrentUser(grantee.id, currentUser),
                isExistingGrantee,
                granteeType: isGranularGranteeUser(grantee) ? "user" : "group",
                granteeEffectivePermission,
                granteeUpdatedPermission,
            });
        },
        [onInteraction, currentUser],
    );

    const permissionsRemoveInteraction = useCallback(
        (
            grantee: GranteeItem,
            isExistingGrantee: boolean,
            granteeEffectivePermission: AccessGranularPermission,
        ) => {
            if (!isGranularGrantee(grantee)) {
                return;
            }

            onInteraction({
                type: "SHARE_DIALOG_GRANTEE_REMOVED",
                isCurrentUserSelfUpdating: getIsGranteeCurrentUser(grantee.id, currentUser),
                isExistingGrantee,
                granteeType: isGranularGranteeUser(grantee) ? "user" : "group",
                granteeEffectivePermission,
            });
        },
        [onInteraction, currentUser],
    );

    const granteeAddInteraction = useCallback(
        (grantee: GranteeItem) => {
            if (!isGranularGrantee(grantee)) {
                return;
            }

            onInteraction({
                type: "SHARE_DIALOG_GRANTEE_ADDED",
                granteeType: isGranularGranteeUser(grantee) ? "user" : "group",
            });
        },
        [onInteraction],
    );

    const availableGranteeListOpenInteraction = useCallback(
        (numberOfAvailableGrantees: number) =>
            onInteraction({ type: "SHARE_DIALOG_AVAILABLE_GRANTEE_LIST_OPENED", numberOfAvailableGrantees }),
        [onInteraction],
    );

    return {
        openInteraction,
        closeInteraction,
        saveInteraction,
        permissionsDropdownOpenInteraction,
        permissionsChangeInteraction,
        permissionsRemoveInteraction,
        granteeAddInteraction,
        availableGranteeListOpenInteraction,
    };
};
