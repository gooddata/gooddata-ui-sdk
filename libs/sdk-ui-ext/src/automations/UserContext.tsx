// (C) 2025 GoodData Corporation

import React, { createContext, useContext, useState, ReactNode } from "react";
import { IAutomationMetadataObject, IUser } from "@gooddata/sdk-model";
import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { invariant } from "ts-invariant";
import { UserContextValue } from "./types.js";

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [canManageWorkspace, setCanManageWorkspace] = useState<boolean>(false);

    const backend = useBackend();
    const workspace = useWorkspace();

    useCancelablePromise(
        {
            promise: async () => {
                return backend.currentUser().getUser();
            },
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
            promise: async () => {
                return backend.workspace(workspace).permissions().getPermissionsForCurrentUser();
            },
            onSuccess: (result) => {
                setCanManageWorkspace(result.canManageProject);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [backend],
    );

    const isCurrentUser = (userLogin: string): boolean => {
        if (!currentUser?.login) {
            return false;
        }

        // Compare by login since both current user and workspace users have this property
        return currentUser.login === userLogin;
    };

    const canManageAutomation = (automation: IAutomationMetadataObject): boolean => {
        return canManageWorkspace || isCurrentUser(automation.createdBy?.login);
    };

    const contextValue: UserContextValue = {
        canManageAutomation,
        isCurrentUser,
    };

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextValue => {
    const context = useContext(UserContext);

    invariant(context, "UserContext not found");

    return context;
};
