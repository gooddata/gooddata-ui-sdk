// (C) 2025 GoodData Corporation

import React, { ReactNode, createContext, useContext, useState } from "react";

import { invariant } from "ts-invariant";

import { IListedDashboard, IWorkspaceUser } from "@gooddata/sdk-model";
import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";

import { FilterOptionsContextValue } from "../types.js";

const FilterOptionsContext = createContext<FilterOptionsContextValue | null>(null);

interface FilterOptionsProviderProps {
    children: ReactNode;
}

export function FilterOptionsProvider({ children }: FilterOptionsProviderProps) {
    const [workspaceUsers, setWorkspaceUsers] = useState<IWorkspaceUser[]>([]);
    const [dashboards, setDashboards] = useState<IListedDashboard[]>([]);

    const backend = useBackend();
    const workspace = useWorkspace();

    const { status: workspaceUsersStatus } = useCancelablePromise(
        {
            promise: async () => {
                return backend.workspace(workspace).users().queryAll();
            },
            onSuccess: (result) => {
                setWorkspaceUsers(result);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [backend],
    );

    const { status: dashboardsStatus } = useCancelablePromise(
        {
            promise: async () => {
                return backend.workspace(workspace).dashboards().getDashboards();
            },
            onSuccess: (result) => {
                setDashboards(result);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [backend],
    );

    const wokspaceUsersLoading = workspaceUsersStatus === "loading";
    const dashboardsLoading = dashboardsStatus === "loading";

    const contextValue: FilterOptionsContextValue = {
        workspaceUsers,
        dashboards,
        wokspaceUsersLoading,
        dashboardsLoading,
    };

    return <FilterOptionsContext.Provider value={contextValue}>{children}</FilterOptionsContext.Provider>;
}

export const useFilterOptions = (): FilterOptionsContextValue => {
    const context = useContext(FilterOptionsContext);

    invariant(context, "FilterOptionsContext not found");

    return context;
};
