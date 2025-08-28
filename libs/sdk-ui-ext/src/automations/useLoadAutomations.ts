// (C) 2025 GoodData Corporation

import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";

import { AutomationsType, IAutomationsState } from "./types.js";

export interface IUseLoadAutomationsProps {
    type: AutomationsType;
    pageSize: number;
    state: IAutomationsState;
    dashboardFilterQuery: string;
    recipientsFilterQuery: string;
    statusFilterQuery: string;
    includeAutomationResult: boolean;
    setState: React.Dispatch<React.SetStateAction<IAutomationsState>>;
}

export const useLoadAutomations = ({
    type,
    pageSize,
    state,
    dashboardFilterQuery,
    recipientsFilterQuery,
    statusFilterQuery,
    includeAutomationResult,
    setState,
}: IUseLoadAutomationsProps) => {
    const backend = useBackend();
    const workspace = useWorkspace();

    const { status: dataLoadingStatus, error } = useCancelablePromise(
        {
            promise: async () => {
                return backend
                    .workspace(workspace)
                    .automations()
                    .getAutomationsQuery({
                        includeAutomationResult,
                    })
                    .withSize(pageSize)
                    .withPage(state.page)
                    .withFilter({
                        title: state.search,
                    })
                    .withDashboard(dashboardFilterQuery, true)
                    .withRecipient(recipientsFilterQuery, true)
                    .withStatus(statusFilterQuery, true)
                    .withSorting([`${state.sortBy},${state.sortDirection}`])
                    .withType(type)
                    .query();
            },
            onSuccess: (result) => {
                const newAutomations = [...state.automations, ...result.items];
                setState((state) => ({
                    ...state,
                    automations: newAutomations,
                    hasNextPage: result.totalCount > newAutomations.length,
                    totalItemsCount: result.totalCount,
                }));
            },
            onError: (error) => {
                console.error("error", error);
                setState((state) => ({
                    ...state,
                    totalItemsCount: 0,
                    hasNextPage: false,
                }));
            },
        },
        [state.page, state.invalidationId],
    );

    return { status: dataLoadingStatus, error };
};
