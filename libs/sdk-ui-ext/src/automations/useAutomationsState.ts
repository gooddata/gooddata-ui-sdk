// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { UiAsyncTableBulkAction, UiAsyncTableFilter } from "@gooddata/sdk-ui-kit";

import { useAutomationActions } from "./actions/useAutomationActions.js";
import { useAutomationBulkActions } from "./actions/useAutomationBulkActions.js";
import { useAutomationColumns } from "./columns/useAutomationColumns.js";
import { AutomationsDefaultState } from "./constants.js";
import { useLoadAutomations } from "./data/useLoadAutomations.js";
import { useAutomationFilters } from "./filters/useAutomationFilters.js";
import { IAutomationsCoreProps, IAutomationsPendingAction, IAutomationsState } from "./types.js";
import { getDefaultColumnDefinitions } from "./utils.js";

export const useAutomationsState = ({
    type,
    scope,
    timezone,
    selectedColumnDefinitions,
    pageSize,
    preselectedFilters,
    dashboardUrlBuilder,
    widgetUrlBuilder,
    editAutomation,
    invalidateItemsRef,
}: IAutomationsCoreProps) => {
    const [state, setState] = useState<IAutomationsState>(AutomationsDefaultState);
    //prevent useEffect runs on mount
    const actionsRefFirstRun = useRef(true);
    const filtersRefFirstRun = useRef(true);
    const previousSkeletonItemsCountRef = useRef<number>(0);

    const columnDefinitions = useMemo(() => {
        return selectedColumnDefinitions ?? getDefaultColumnDefinitions(scope);
    }, [selectedColumnDefinitions, scope]);

    const setPendingAction = useCallback((pendingAction: IAutomationsPendingAction | undefined) => {
        setState((state) => ({
            ...state,
            pendingAction,
        }));
    }, []);

    const selectedAutomations = useMemo(
        () => state.automations.filter((a) => state.selectedIds.has(a.id)),
        [state.automations, state.selectedIds],
    );
    const {
        isLoading: isActionLoading,
        deleteAutomation,
        bulkDeleteAutomations,
        unsubscribeFromAutomation,
        bulkUnsubscribeFromAutomations,
        pauseAutomation,
        resumeAutomation,
        bulkPauseAutomations,
        bulkResumeAutomations,
    } = useAutomationActions(type, scope);
    const bulkActions: UiAsyncTableBulkAction[] = useAutomationBulkActions({
        selected: selectedAutomations,
        automationsType: type,
        scope,
        bulkDeleteAutomations,
        bulkUnsubscribeFromAutomations,
        bulkPauseAutomations,
        bulkResumeAutomations,
        setPendingAction,
    });
    const { columns, includeAutomationResult } = useAutomationColumns({
        type,
        timezone,
        columnDefinitions,
        automationsType: type,
        scope,
        deleteAutomation,
        unsubscribeFromAutomation,
        pauseAutomation,
        resumeAutomation,
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
        workspacesFilter,
        workspacesFilterQuery,
    } = useAutomationFilters(preselectedFilters);

    const { status: dataLoadingStatus, error } = useLoadAutomations({
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
    });

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
        setState((state) => ({
            ...state,
            automations: [],
            hasNextPage: true,
            totalItemsCount: 0,
            selectedIds: new Set(),
            scrollToIndex: 0,
            isChainedActionInProgress: false,
            page: 0,
            invalidationId: state.invalidationId + 1,
        }));
    }, []);

    // Set the ref for invalidating items from outside
    useEffect(() => {
        if (invalidateItemsRef) {
            invalidateItemsRef.current = resetState;
        }
    }, [invalidateItemsRef, resetState]);

    useEffect(() => {
        if (filtersRefFirstRun.current) {
            filtersRefFirstRun.current = false;
            return;
        }
        resetState();
    }, [
        state.search,
        state.sortBy,
        state.sortDirection,
        dashboardFilterQuery,
        recipientsFilterQuery,
        workspacesFilterQuery,
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
            selectedIds: new Set(selectedIds),
        }));
    }, []);

    const selectedIds = useMemo(() => {
        return Array.from(state.selectedIds);
    }, [state.selectedIds]);

    const filters = useMemo(() => {
        const filtersList: Array<UiAsyncTableFilter> = [];
        if (scope === "workspace") {
            filtersList.push(dashboardFilter);
        }
        if (scope === "organization") {
            filtersList.push(workspacesFilter);
        }
        filtersList.push(recipientsFilter, statusFilter);
        return filtersList;
    }, [dashboardFilter, recipientsFilter, statusFilter, workspacesFilter, scope]);

    return {
        state,
        filters,
        isLoading,
        error,
        skeletonItemsCount,
        columns,
        bulkActions,
        selectedIds,
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
        setPendingAction,
    };
};
