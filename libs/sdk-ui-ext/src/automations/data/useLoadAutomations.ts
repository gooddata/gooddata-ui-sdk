// (C) 2025 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";

import { IUseLoadAutomationsProps } from "../types.js";
import { useAutomationService } from "../useAutomationService.js";

export const useLoadAutomations = ({
    type,
    pageSize,
    state,
    dashboardFilterQuery,
    recipientsFilterQuery,
    workspacesFilterQuery,
    statusFilterQuery,
    includeAutomationResult,
    scope,
    setState,
}: IUseLoadAutomationsProps) => {
    const { promiseGetAutomationsQuery } = useAutomationService(scope);

    const { status: dataLoadingStatus, error } = useCancelablePromise(
        {
            promise: async () =>
                promiseGetAutomationsQuery({
                    includeAutomationResult,
                    pageSize,
                    page: state.page,
                    search: state.search,
                    dashboardFilterQuery,
                    recipientsFilterQuery,
                    workspacesFilterQuery,
                    statusFilterQuery,
                    sortBy: state.sortBy,
                    sortDirection: state.sortDirection,
                    type,
                }),
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
