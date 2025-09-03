// (C) 2025 GoodData Corporation

import React, { ReactNode, createContext, useCallback, useContext, useState } from "react";

import { invariant } from "ts-invariant";

import { IAutomationMetadataObject, IUser, isAutomationUserGroupRecipient } from "@gooddata/sdk-model";
import { useBackend, useCancelablePromise } from "@gooddata/sdk-ui";

import { AutomationsScope, UserContextValue } from "./types.js";
import { useAutomationService } from "./useAutomationService.js";

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
    children: ReactNode;
    scope: AutomationsScope;
}

export function UserProvider({ children, scope }: UserProviderProps) {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [canManageWorkspace, setCanManageWorkspace] = useState<boolean>(false);

    const backend = useBackend();
    const { promiseGetCurrentUser, promiseCanManageWorkspace } = useAutomationService(scope);

    useCancelablePromise(
        {
            promise: async () => promiseGetCurrentUser(),
            onSuccess: (result) => {
                setCurrentUser(result);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [backend],
    );

    useCancelablePromise(
        {
            promise: async () => promiseCanManageWorkspace(),
            onSuccess: (result) => {
                setCanManageWorkspace(result?.canManageProject ?? false);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [backend],
    );

    // Compare by login since current user doesn't have id property,
    // login is the only property that is guaranteed to be unique for current user
    const isCurrentUserByLogin = useCallback(
        (userLogin: string): boolean => {
            if (!currentUser?.login) {
                return false;
            }
            return currentUser.login === userLogin;
        },
        [currentUser?.login],
    );

    // Compare by email since recipient object doesn't have login property,
    // some recipients are only identified by email,
    // so current user and recipients can only be matched by email
    const isCurrentUserByEmail = useCallback(
        (userEmail?: string): boolean => {
            if (!currentUser?.email) {
                return false;
            }
            return currentUser.email === userEmail;
        },
        [currentUser?.email],
    );

    const canManageAutomation = useCallback(
        (automation: IAutomationMetadataObject): boolean => {
            return (
                scope === "organization" ||
                canManageWorkspace ||
                isCurrentUserByLogin(automation.createdBy?.login)
            );
        },
        [canManageWorkspace, isCurrentUserByLogin, scope],
    );

    const isSubscribedToAutomation = useCallback(
        (automation: IAutomationMetadataObject): boolean => {
            return automation.recipients.some((user) => {
                const email = isAutomationUserGroupRecipient(user) ? null : user.email;
                return isCurrentUserByEmail(email);
            });
        },
        [isCurrentUserByEmail],
    );

    const canPauseAutomation = useCallback(
        (automation: IAutomationMetadataObject): boolean => {
            return canManageAutomation(automation) && automation.state === "ACTIVE";
        },
        [canManageAutomation],
    );

    const canResumeAutomation = useCallback(
        (automation: IAutomationMetadataObject): boolean => {
            return canManageAutomation(automation) && automation.state === "PAUSED";
        },
        [canManageAutomation],
    );

    const contextValue: UserContextValue = {
        canManageAutomation,
        isCurrentUserByLogin,
        isSubscribedToAutomation,
        canPauseAutomation,
        canResumeAutomation,
    };

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export const useUser = (): UserContextValue => {
    const context = useContext(UserContext);

    invariant(context, "UserContext not found");

    return context;
};
