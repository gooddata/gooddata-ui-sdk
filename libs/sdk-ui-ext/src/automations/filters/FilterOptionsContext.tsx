// (C) 2025 GoodData Corporation

import { createContext, useContext, useState, ReactNode } from "react";
import { IListedDashboard, IUser, IWorkspaceUser } from "@gooddata/sdk-model";
import { useBackend, useCancelablePromise, useWorkspace, GoodDataSdkError } from "@gooddata/sdk-ui";
import { FilterOptionsContextValue } from "../types.js";

const FilterOptionsContext = createContext<FilterOptionsContextValue | null>(null);

interface FilterOptionsProviderProps {
    children: ReactNode;
}

export function FilterOptionsProvider({ children }: FilterOptionsProviderProps) {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [currentUserError, setCurrentUserError] = useState<GoodDataSdkError | null>(null);

    const [workspaceUsers, setWorkspaceUsers] = useState<IWorkspaceUser[]>([]);
    const [workspaceUsersError, setWorkspaceUsersError] = useState<GoodDataSdkError | null>(null);

    const [dashboards, setDashboards] = useState<IListedDashboard[]>([]);
    const [dashboardsError, setDashboardsError] = useState<GoodDataSdkError | null>(null);

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
                setCurrentUserError(error as GoodDataSdkError);
            },
        },
        [backend],
    );

    useCancelablePromise(
        {
            promise: async () => {
                return backend.workspace(workspace).users().queryAll();
            },
            onSuccess: (result) => {
                setWorkspaceUsers(result);
            },
            onError: (error) => {
                setWorkspaceUsersError(error as GoodDataSdkError);
            },
        },
        [backend],
    );

    useCancelablePromise(
        {
            promise: async () => {
                return backend.workspace(workspace).dashboards().getDashboards();
            },
            onSuccess: (result) => {
                setDashboards(result);
            },
            onError: (error) => {
                setDashboardsError(error as GoodDataSdkError);
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

    const contextValue: FilterOptionsContextValue = {
        currentUser,
        workspaceUsers,
        currentUserError,
        workspaceUsersError,
        dashboards,
        dashboardsError,
        isCurrentUser,
    };

    return <FilterOptionsContext.Provider value={contextValue}>{children}</FilterOptionsContext.Provider>;
}

export const useFilterOptions = (): FilterOptionsContextValue => {
    const context = useContext(FilterOptionsContext);

    if (context === null) {
        throw new Error("FilterOptionsContext not found");
    }

    return context;
};
