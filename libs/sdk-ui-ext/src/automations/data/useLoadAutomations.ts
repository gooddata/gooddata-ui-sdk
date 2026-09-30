// (C) 2025-2026 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";

import { type IUseLoadAutomationsProps } from "../types.js";
import { useAutomationService } from "../useAutomationService.js";
import { isRequestHeaderTooLargeError } from "../utils.js";

export const useLoadAutomations = ({
    type,
    pageSize,
    state,
    dashboardFilterQuery,
    recipientsFilterQuery,
    externalRecipientsFilterQuery,
    workspacesFilterQuery,
    createdByFilterQuery,
    statusFilterQuery,
    includeAutomationResult,
    includeUnavailableReferences,
    isReady,
    scope,
    setState,
    onLoad,
}: IUseLoadAutomationsProps) => {
    // loading
    const { promiseGetAutomationsQuery } = useAutomationService(scope);
    const isInitial = state.page === 0 && state.invalidationId === 0;

    const { status: dataLoadingStatus, error } = useCancelablePromise(
        {
            promise: isReady
                ? async () =>
                      promiseGetAutomationsQuery({
                          includeAutomationResult,
                          includeUnavailableReferences,
                          pageSize,
                          page: state.page,
                          search: state.search,
                          dashboardFilterQuery,
                          recipientsFilterQuery,
                          externalRecipientsFilterQuery,
                          workspacesFilterQuery,
                          createdByFilterQuery,
                          statusFilterQuery,
                          sortBy: state.sortBy,
                          sortDirection: state.sortDirection,
                          type,
                      })
                : null,
            onSuccess: (result) => {
                const newAutomations = [...state.automations, ...result.items];
                setState((state) => ({
                    ...state,
                    automations: newAutomations,
                    hasNextPage: result.totalCount > newAutomations.length,
                    totalItemsCount: result.totalCount,
                }));
                onLoad?.(newAutomations, isInitial);
            },
            onError: (error) => {
                console.error("error", error);
                //in case of too long filters, reset the automations to previous state
                if (isRequestHeaderTooLargeError(error)) {
                    setState((state) => {
                        const { previousAutomations, previousTotalItemsCount } = state;
                        return {
                            ...state,
                            automations: previousAutomations,
                            totalItemsCount: previousTotalItemsCount,
                            hasNextPage: previousTotalItemsCount > previousAutomations.length,
                            isFiltersTooLarge: true,
                        };
                    });
                } else {
                    setState((state) => ({
                        ...state,
                        totalItemsCount: 0,
                        hasNextPage: false,
                    }));
                }
                onLoad?.(state.automations, isInitial);
            },
        },
        [state.page, state.invalidationId, isReady],
    );

    // Waiting for settings counts as loading, so the empty state does not flash.
    return { status: isReady ? dataLoadingStatus : "loading", error };
};
