// (C) 2025 GoodData Corporation

import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { UiAsyncTable } from "@gooddata/sdk-ui-kit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useAutomationColumns } from "./columns/useAutomationColumns.js";
import { useAutomationFilters } from "./filters/useAutomationFilters.js";
import { getDefaultColumnDefinitions } from "./utils.js";
import { IAutomationsCoreProps, IAutomationsState } from "./types.js";
import { AutomationsDefaultState } from "./constants.js";

export function AutomationsCore(props: IAutomationsCoreProps) {
    const {
        state,
        dashboardFilter,
        recipientsFilter,
        createdByFilter,
        status,
        skeletonItemsCount,
        columns,
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
    } = useAutomationsState(props);

    const { automations, totalItemsCount, hasNextPage, selectedIds, sortBy, sortDirection } = state;

    return (
        <div>
            <UiAsyncTable<IAutomationMetadataObject>
                items={automations}
                totalItemsCount={totalItemsCount}
                isLoading={status === "loading" || status === "pending"}
                maxHeight={props.maxHeight}
                hasNextPage={hasNextPage}
                loadNextPage={loadNextPage}
                onSort={handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                skeletonItemsCount={skeletonItemsCount}
                selectedItemIds={selectedIds}
                setSelectedItemIds={setSelectedIds}
                filters={[dashboardFilter, recipientsFilter, createdByFilter]}
                columns={columns}
                onSearch={setSearch}
            />
        </div>
    );
}

const useAutomationsState = ({ type, selectedColumnDefinitions, pageSize }: IAutomationsCoreProps) => {
    const backend = useBackend();
    const workspace = useWorkspace();

    const [state, setState] = useState<IAutomationsState>(AutomationsDefaultState);

    const {
        dashboardFilter,
        dashboardFilterQuery,
        recipientsFilter,
        recipientsFilterQuery,
        createdByFilter,
        createdByFilterQuery,
    } = useAutomationFilters();

    const columnDefinitions = useMemo(() => {
        return selectedColumnDefinitions ?? getDefaultColumnDefinitions();
    }, [selectedColumnDefinitions]);

    const columns = useAutomationColumns(type, columnDefinitions);

    const { status, error } = useCancelablePromise(
        {
            promise: async () => {
                return backend
                    .workspace(workspace)
                    .automations()
                    .getAutomationsQuery()
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

    const resetState = useCallback(() => {
        setState((state) => ({
            ...state,
            page: 0,
            automations: [],
            hasNextPage: true,
            totalItemsCount: 0,
            selectedIds: [],
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

    const skeletonItemsCount = useMemo(() => {
        if (state.hasNextPage) {
            return Math.min(pageSize, state.totalItemsCount - state.automations.length) || pageSize;
        }
        return 0;
    }, [state.hasNextPage, state.totalItemsCount, state.automations.length, pageSize]);

    return {
        state,
        dashboardFilter,
        recipientsFilter,
        createdByFilter,
        status,
        error,
        skeletonItemsCount,
        columns,
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
    };
};
