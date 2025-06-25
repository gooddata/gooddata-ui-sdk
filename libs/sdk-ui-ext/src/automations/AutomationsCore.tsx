// (C) 2025 GoodData Corporation

import { useBackend, useCancelablePromise, useWorkspace } from "@gooddata/sdk-ui";
import { AsyncTable } from "@gooddata/sdk-ui-kit";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IAutomationMetadataObject, SortDirection } from "@gooddata/sdk-model";
import { useAutomationColumns } from "./columns/useAutomationColumns.js";
import { useAutomationFilters } from "./filters/useAutomationFilters.js";
import { AutomationColumnDefinition, AutomationsType } from "./types.js";
import { getDefaultColumnDefinitions } from "./utils.js";

export interface IAutomationsCoreProps {
    type: AutomationsType;
    selectedColumnDefinitions?: Array<AutomationColumnDefinition>;
    maxHeight: number;
    pageSize: number;
}

export const AutomationsCore = (props: IAutomationsCoreProps) => {
    const {
        automations,
        totalItemsCount,
        hasNextPage,
        selectedIds,
        sortBy,
        sortDirection,
        dashboardFilter,
        recipientsFilter,
        createdByFilter,
        status,
        skeletonItemsCount,
        columns,
        handleSort,
        setPage,
        setSearch,
        setSelectedIds,
    } = useAutomationsState(props);

    return (
        <div>
            <AsyncTable<IAutomationMetadataObject>
                items={automations}
                totalItemsCount={totalItemsCount}
                isLoading={status === "loading" || status === "pending"}
                maxHeight={props.maxHeight}
                hasNextPage={hasNextPage}
                loadNextPage={() => {
                    setPage((prev) => prev + 1);
                }}
                onSort={handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                skeletonItemsCount={skeletonItemsCount}
                bulkActions={[
                    {
                        label: "",
                        onClick: () => {},
                    },
                ]}
                selectedItemIds={selectedIds}
                setSelectedItemIds={setSelectedIds}
                filters={[dashboardFilter, recipientsFilter, createdByFilter]}
                columns={columns}
                onSearch={setSearch}
            />
        </div>
    );
};

const useAutomationsState = ({ type, selectedColumnDefinitions, pageSize }: IAutomationsCoreProps) => {
    const backend = useBackend();
    const workspace = useWorkspace();

    const [automations, setAutomations] = useState<IAutomationMetadataObject[]>([]);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Array<string>>([]);
    const [sortBy, setSortBy] = useState<keyof IAutomationMetadataObject>("title");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [invalidationId, setInvalidationId] = useState(0);

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
                    .withPage(page)
                    .withFilter({
                        title: search,
                    })
                    .withDashboard(dashboardFilterQuery)
                    .withRecipient(recipientsFilterQuery)
                    .withAuthor(createdByFilterQuery)
                    .withSorting([`${sortBy},${sortDirection}`])
                    .withType(type)
                    .query();
            },
            onSuccess: (result) => {
                const newAutomations = [...automations, ...result.items];
                setAutomations(newAutomations);
                setHasNextPage(result.totalCount > newAutomations.length);
                setTotalItemsCount(result.totalCount);
            },
            onError: (error) => {
                console.error("error", error);
                setTotalItemsCount(0);
                setHasNextPage(false);
                setAutomations([]);
            },
        },
        [page, invalidationId],
    );

    const resetState = useCallback(() => {
        setPage(0);
        setAutomations([]);
        setHasNextPage(true);
        setTotalItemsCount(0);
        setSelectedIds([]);
        setInvalidationId((prev) => prev + 1);
    }, []);

    useEffect(() => {
        resetState();
    }, [
        search,
        dashboardFilterQuery,
        recipientsFilterQuery,
        createdByFilterQuery,
        sortBy,
        sortDirection,
        type,
        resetState,
    ]);

    const handleSort = (key: keyof IAutomationMetadataObject) => {
        if (sortBy === key) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else {
                setSortDirection("asc");
            }
        } else {
            setSortBy(key);
            setSortDirection("asc");
        }
    };

    const skeletonItemsCount = useMemo(() => {
        if (hasNextPage) {
            return Math.min(pageSize, totalItemsCount - automations.length) || pageSize;
        }
        return 0;
    }, [hasNextPage, totalItemsCount, automations.length, pageSize]);

    return {
        automations,
        totalItemsCount,
        hasNextPage,
        page,
        search,
        selectedIds,
        sortBy,
        sortDirection,
        dashboardFilter,
        recipientsFilter,
        createdByFilter,
        status,
        error,
        skeletonItemsCount,
        columns,
        setPage,
        handleSort,
        setSearch,
        setSelectedIds,
    };
};
