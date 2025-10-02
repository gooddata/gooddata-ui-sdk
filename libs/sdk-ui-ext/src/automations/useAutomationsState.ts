// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useWorkspace } from "@gooddata/sdk-ui";
import { UiAsyncTableBulkAction } from "@gooddata/sdk-ui-kit";

import { useAutomationActions } from "./actions/useAutomationActions.js";
import { useAutomationBulkActions } from "./actions/useAutomationBulkActions.js";
import { useAutomationColumns } from "./columns/useAutomationColumns.js";
import { AutomationsDefaultState } from "./constants.js";
import { useLoadAutomations } from "./data/useLoadAutomations.js";
import { useAutomationFilters } from "./filters/useAutomationFilters.js";
import { IAutomationsCoreProps, IAutomationsPendingAction, IAutomationsState } from "./types.js";
import { useAutomationsSmallLayout } from "./useAutomationsSmallLayout.js";

export const useAutomationsState = ({
    type,
    scope,
    timezone,
    selectedColumnDefinitions,
    pageSize,
    availableFilters,
    preselectedFilters,
    invalidateItemsRef,
    isSmall,
    dashboardUrlBuilder,
    widgetUrlBuilder,
    editAutomation,
    onLoad,
}: IAutomationsCoreProps) => {
    const [state, setState] = useState<IAutomationsState>(AutomationsDefaultState);
    const workspace = useWorkspace();
    //prevent useEffect runs on mount
    const actionsRefFirstRun = useRef(true);
    const filtersRefFirstRun = useRef(true);
    const previousSkeletonItemsCountRef = useRef<number>(0);

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
    const availableBulkActions: UiAsyncTableBulkAction[] = useAutomationBulkActions({
        selected: selectedAutomations,
        automationsType: type,
        bulkDeleteAutomations,
        bulkUnsubscribeFromAutomations,
        bulkPauseAutomations,
        bulkResumeAutomations,
        setPendingAction,
    });
    const { columnDefinitions, includeAutomationResult } = useAutomationColumns({
        type,
        timezone,
        selectedColumnDefinitions,
        automationsType: type,
        isSmall,
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
        filters,
        dashboardFilterQuery,
        recipientsFilterQuery,
        externalRecipientsFilterQuery,
        createdByFilterQuery,
        statusFilterQuery,
        workspacesFilterQuery,
    } = useAutomationFilters(preselectedFilters, availableFilters);

    const { status: dataLoadingStatus, error } = useLoadAutomations({
        type,
        pageSize,
        state,
        dashboardFilterQuery,
        recipientsFilterQuery,
        externalRecipientsFilterQuery,
        workspacesFilterQuery,
        statusFilterQuery,
        createdByFilterQuery,
        includeAutomationResult,
        scope,
        onLoad,
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
            totalItemsCount: 0,
            previousAutomations: state.automations,
            previousTotalItemsCount: state.totalItemsCount,
            hasNextPage: true,
            selectedIds: new Set(),
            scrollToIndex: 0,
            isFiltersTooLarge: false,
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
        dashboardFilterQuery.value,
        dashboardFilterQuery.type,
        recipientsFilterQuery.value,
        recipientsFilterQuery.type,
        createdByFilterQuery.value,
        createdByFilterQuery.type,
        workspacesFilterQuery.value,
        workspacesFilterQuery.type,
        statusFilterQuery.value,
        statusFilterQuery.type,
        externalRecipientsFilterQuery.value,
        externalRecipientsFilterQuery.type,
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

    const handleItemClick = (item: IAutomationMetadataObject) => {
        editAutomation(item, workspace, item.dashboard?.id);
    };

    const loadNextPage = useCallback(() => {
        setState((state) => ({
            ...state,
            page: state.page + 1,
        }));
    }, []);

    const searchHandler = useCallback((search: string) => {
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

    const isFiltersOrSearchActive = useMemo(() => {
        return !!(
            state.search ||
            dashboardFilterQuery?.value ||
            recipientsFilterQuery?.value ||
            createdByFilterQuery?.value ||
            workspacesFilterQuery?.value ||
            statusFilterQuery?.value
        );
    }, [
        state.search,
        dashboardFilterQuery,
        recipientsFilterQuery,
        createdByFilterQuery,
        workspacesFilterQuery,
        statusFilterQuery,
    ]);

    const { setSearch, bulkActions, columns } = useAutomationsSmallLayout({
        searchHandler,
        search: state.search,
        availableBulkActions,
        columnDefinitions,
        isSmall,
        automationsLength: state.automations.length,
    });

    return {
        state,
        filters,
        isLoading,
        error,
        skeletonItemsCount,
        columns,
        bulkActions,
        selectedIds,
        isFiltersOrSearchActive,
        handleSort,
        handleItemClick,
        loadNextPage,
        setSearch,
        setSelectedIds,
        setPendingAction,
    };
};
