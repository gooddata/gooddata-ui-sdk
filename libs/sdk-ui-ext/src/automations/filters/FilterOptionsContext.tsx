// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext, useState } from "react";

import { invariant } from "ts-invariant";

import { type IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { type IListedDashboard, type IOrganizationUser, type IWorkspaceUser } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";

import { type AutomationsScope, type FilterOptionsContextValue } from "../types.js";
import { useAutomationService } from "../useAutomationService.js";

const FilterOptionsContext = createContext<FilterOptionsContextValue | null>(null);

interface FilterOptionsProviderProps {
    children: ReactNode;
    scope: AutomationsScope;
}

export function FilterOptionsProvider({ children, scope }: FilterOptionsProviderProps) {
    const [workspaceUsers, setWorkspaceUsers] = useState<IWorkspaceUser[] | IOrganizationUser[]>([]);
    const [dashboards, setDashboards] = useState<IListedDashboard[]>([]);
    const [workspaces, setWorkspaces] = useState<IWorkspaceDescriptor[]>([]);

    const { promiseGetUsers, promiseGetDashboards, promiseGetWorkspaces } = useAutomationService(scope);

    const { status: workspaceUsersStatus } = useCancelablePromise(
        {
            promise: async () => {
                return promiseGetUsers();
            },
            onSuccess: (result) => {
                setWorkspaceUsers(result);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [promiseGetUsers],
    );

    const { status: dashboardsStatus } = useCancelablePromise(
        {
            promise: async () => {
                return promiseGetDashboards();
            },
            onSuccess: (result) => {
                setDashboards(result);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [promiseGetDashboards],
    );

    const { status: workspacesStatus } = useCancelablePromise(
        {
            promise: async () => {
                return promiseGetWorkspaces();
            },
            onSuccess: (result) => {
                setWorkspaces(result);
            },
            onError: (error) => {
                console.error(error);
            },
        },
        [promiseGetWorkspaces],
    );

    const wokspaceUsersLoading = workspaceUsersStatus === "loading";
    const dashboardsLoading = dashboardsStatus === "loading";
    const workspacesLoading = workspacesStatus === "loading";

    const contextValue: FilterOptionsContextValue = {
        workspaceUsers,
        dashboards,
        wokspaceUsersLoading,
        dashboardsLoading,
        workspaces,
        workspacesLoading,
    };

    return <FilterOptionsContext.Provider value={contextValue}>{children}</FilterOptionsContext.Provider>;
}

export const useFilterOptions = (): FilterOptionsContextValue => {
    const context = useContext(FilterOptionsContext);

    invariant(context, "FilterOptionsContext not found");

    return context;
};
