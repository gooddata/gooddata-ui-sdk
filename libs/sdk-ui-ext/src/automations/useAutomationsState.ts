// (C) 2025 GoodData Corporation

import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useAutomationColumns } from "./columns/useAutomationColumns.js";
import { useAutomationFilters } from "./filters/useAutomationFilters.js";
import { getDefaultColumnDefinitions } from "./utils.js";
import { IAutomationsCoreProps, IAutomationsState } from "./types.js";
import { AutomationsDefaultState } from "./constants.js";
import { useDeleteAutomation } from "./actions/useDeleteAutomation.js";

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
    const { isDeleting, deleteAutomation } = useDeleteAutomation();
    const { columns, includeAutomationResult } = useAutomationColumns({
        type,
        columnDefinitions,
        deleteAutomation,
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

    const { status, error } = useCancelablePromise(
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
                    automations: [],
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
        return status === "loading" || status === "pending" || isDeleting;
    }, [status, isDeleting]);

    const resetState = useCallback((fetchItems?: boolean) => {
        setState((state) => ({
            ...state,
            automations: [],
            hasNextPage: true,
            totalItemsCount: 0,
            selectedIds: [],
            scrollToIndex: 0,
            page: fetchItems ? 0 : state.page,
            invalidationId: fetchItems ? state.invalidationId + 1 : state.invalidationId,
        }));
    }, []);

    useEffect(() => {
        resetState(true);
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
        if (isDeleting) {
            resetState();
        }
        if (!isDeleting) {
            resetState(true);
        }
    }, [isDeleting, resetState]);

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
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
    };
};
