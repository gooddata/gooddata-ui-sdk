// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { UiAsyncTableBulkAction } from "@gooddata/sdk-ui-kit";

import { useAutomationActions } from "./actions/useAutomationActions.js";
import { useAutomationBulkActions } from "./actions/useAutomationBulkActions.js";
import { useAutomationColumns } from "./columns/useAutomationColumns.js";
import { AutomationsDefaultState } from "./constants.js";
import { useAutomationFilters } from "./filters/useAutomationFilters.js";
import { IAutomationsCoreProps, IAutomationsPendingAction, IAutomationsState } from "./types.js";
import { getDefaultColumnDefinitions } from "./utils.js";

export const useAutomationsState = ({
    type,
    timezone,
    selectedColumnDefinitions,
    pageSize,
    preselectedFilters,
    dashboardUrlBuilder,
    widgetUrlBuilder,
    editAutomation,
}: IAutomationsCoreProps) => {
    const [state, setState] = useState<IAutomationsState>(AutomationsDefaultState);
    //prevent useEffect runs on mount
    const actionsRefFirstRun = useRef(true);
    const filtersRefFirstRun = useRef(true);
    const previousSkeletonItemsCountRef = useRef<number>(0);

    const columnDefinitions = useMemo(() => {
        return selectedColumnDefinitions ?? getDefaultColumnDefinitions();
    }, [selectedColumnDefinitions]);
    const setPendingAction = useCallback((pendingAction: IAutomationsPendingAction | undefined) => {
        setState((state) => ({
            ...state,
            pendingAction,
        }));
    }, []);

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
        automationsType: type,
        bulkDeleteAutomations,
        bulkUnsubscribeFromAutomations,
        setPendingAction,
    });
    const { columns, includeAutomationResult } = useAutomationColumns({
        type,
        timezone,
        columnDefinitions,
        automationsType: type,
        deleteAutomation,
        unsubscribeFromAutomation,
        editAutomation,
        dashboardUrlBuilder,
        widgetUrlBuilder,
        setPendingAction,
    });
    const {
        dashboardFilter,
        dashboardFilterQuery,
        recipientsFilter,
        recipientsFilterQuery,
        statusFilter,
        statusFilterQuery,
    } = useAutomationFilters(preselectedFilters);

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

    const isLoading = useMemo(() => {
        return dataLoadingStatus === "loading" || isActionLoading || state.isChainedActionInProgress;
    }, [dataLoadingStatus, isActionLoading, state.isChainedActionInProgress]);

    const skeletonItemsCount = useMemo(() => {
        let newCount = 0;
        if (state.hasNextPage) {
            newCount = Math.min(pageSize, state.totalItemsCount - state.automations.length) || pageSize;
        }
        // Prevent flickering of skeleton items count when processing sequential requests
        // since we already have a skeleton items count from the previous request and just need to refetch the data
        if (isLoading && previousSkeletonItemsCountRef.current > 0) {
            return previousSkeletonItemsCountRef.current;
        } else {
            previousSkeletonItemsCountRef.current = newCount;
            return newCount;
        }
    }, [state.hasNextPage, state.totalItemsCount, state.automations.length, pageSize, isLoading]);

    const resetState = useCallback(() => {
        if (filtersRefFirstRun.current) {
            filtersRefFirstRun.current = false;
            return;
        }
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
        statusFilterQuery,
        type,
        resetState,
    ]);

    useEffect(() => {
        if (actionsRefFirstRun.current) {
            actionsRefFirstRun.current = false;
            return;
        }
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
        statusFilter,
        isLoading,
        error,
        skeletonItemsCount,
        columns,
        bulkActions,
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
        setPendingAction,
    };
};
