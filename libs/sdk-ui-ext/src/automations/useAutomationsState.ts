// (C) 2025 GoodData Corporation

import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useAutomationColumns } from "./columns/useAutomationColumns.js";
import { useAutomationFilters } from "./filters/useAutomationFilters.js";
import { getDefaultColumnDefinitions } from "./utils.js";
import { IAutomationsCoreProps, IAutomationsState } from "./types.js";
import { AutomationsDefaultState } from "./constants.js";
import { useAutomationActions } from "./actions/useAutomationActions.js";
import { UiAsyncTableBulkAction } from "@gooddata/sdk-ui-kit";
import { useAutomationBulkActions } from "./actions/useAutomationBulkActions.js";

export const useAutomationsState = ({
    type,
    selectedColumnDefinitions,
    pageSize,
    dashboardUrlBuilder,
    automationUrlBuilder,
    widgetUrlBuilder,
}: IAutomationsCoreProps) => {
    const [state, setState] = useState<IAutomationsState>(AutomationsDefaultState);

    const columnDefinitions = useMemo(() => {
        return selectedColumnDefinitions ?? getDefaultColumnDefinitions();
    }, [selectedColumnDefinitions]);

    const backend = useBackend();
    const workspace = useWorkspace();
    const {
        isLoading: isActionLoading,
        deleteAutomation,
        bulkDeleteAutomations,
        unsubscribeFromAutomation,
        bulkUnsubscribeFromAutomations,
    } = useAutomationActions();
    const bulkActions: UiAsyncTableBulkAction[] = useAutomationBulkActions({
        selected: state.automations.filter((a) => state.selectedIds.includes(a.id)),
        bulkDeleteAutomations,
        bulkUnsubscribeFromAutomations,
    });
    const { columns, includeAutomationResult } = useAutomationColumns({
        type,
        columnDefinitions,
        deleteAutomation,
        unsubscribeFromAutomation,
        dashboardUrlBuilder,
        automationUrlBuilder,
        widgetUrlBuilder,
    });
    const {
        dashboardFilter,
        dashboardFilterQuery,
        recipientsFilter,
        recipientsFilterQuery,
        createdByFilter,
        createdByFilterQuery,
    } = useAutomationFilters();

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
                    .withDashboard(dashboardFilterQuery)
                    .withRecipient(recipientsFilterQuery)
                    .withAuthor(createdByFilterQuery)
                    .withSorting([`${state.sortBy},${state.sortDirection}`])
                    .withType(type)
                    .query();
            },
            onSuccess: (result) => {
                const newAutomations = [...state.automations, ...result.items];
                setState({
                    ...state,
                    automations: newAutomations,
                    hasNextPage: result.totalCount > newAutomations.length,
                    totalItemsCount: result.totalCount,
                });
            },
            onError: (error) => {
                console.error("error", error);
                setState({
                    ...state,
                    totalItemsCount: 0,
                    hasNextPage: false,
                });
            },
        },
        [state.page, state.invalidationId],
    );

    const skeletonItemsCount = useMemo(() => {
        if (state.hasNextPage) {
            return Math.min(pageSize, state.totalItemsCount - state.automations.length) || pageSize;
        }
        return 0;
    }, [state.hasNextPage, state.totalItemsCount, state.automations.length, pageSize]);

    const isLoading = useMemo(() => {
        return dataLoadingStatus === "loading" || isActionLoading || state.isChainedActionInProgress;
    }, [dataLoadingStatus, isActionLoading, state.isChainedActionInProgress]);

    const resetState = useCallback(() => {
        setState((state) => ({
            ...state,
            automations: [],
            hasNextPage: true,
            totalItemsCount: 0,
            selectedIds: [],
            scrollToIndex: 0,
            isChainedActionInProgress: false,
            page: 0,
            invalidationId: state.invalidationId + 1,
        }));
    }, []);

    useEffect(() => {
        resetState();
    }, [
        state.search,
        state.sortBy,
        state.sortDirection,
        dashboardFilterQuery,
        recipientsFilterQuery,
        createdByFilterQuery,
        type,
        resetState,
    ]);

    useEffect(() => {
        if (isActionLoading) {
            setState((state) => ({
                ...state,
                automations: [],
                hasNextPage: true,
                scrollToIndex: 0,
                isChainedActionInProgress: true,
            }));
        }
        if (!isActionLoading) {
            resetState();
        }
    }, [isActionLoading, resetState]);

    useEffect(() => {
        if (!isLoading) {
            setState((state) => ({
                ...state,
                scrollToIndex: undefined,
            }));
        }
    }, [isLoading]);

    const handleSort = (key: keyof IAutomationMetadataObject) => {
        if (state.sortBy === key) {
            if (state.sortDirection === "asc") {
                setState({
                    ...state,
                    sortDirection: "desc",
                });
            } else {
                setState({
                    ...state,
                    sortDirection: "asc",
                });
            }
        } else {
            setState({
                ...state,
                sortBy: key,
                sortDirection: "asc",
            });
        }
    };

    const loadNextPage = useCallback(() => {
        setState((state) => ({
            ...state,
            page: state.page + 1,
        }));
    }, []);

    const setSearch = useCallback((search: string) => {
        setState((state) => ({
            ...state,
            search,
        }));
    }, []);

    const setSelectedIds = useCallback((selectedIds: string[]) => {
        setState((state) => ({
            ...state,
            selectedIds,
        }));
    }, []);

    return {
        state,
        dashboardFilter,
        recipientsFilter,
        createdByFilter,
        isLoading,
        error,
        skeletonItemsCount,
        columns,
        bulkActions,
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
    };
};
