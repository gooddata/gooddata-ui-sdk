// (C) 2025 GoodData Corporation

import { UiAsyncTable } from "@gooddata/sdk-ui-kit";
import React from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { IAutomationsCoreProps } from "./types.js";
import { useAutomationsState } from "./useAutomationsState.js";

export const AutomationsCore = (props: IAutomationsCoreProps) => {
    const {
        state,
        dashboardFilter,
        recipientsFilter,
        createdByFilter,
        isLoading,
        skeletonItemsCount,
        columns,
        bulkActions,
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
    } = useAutomationsState(props);

    const { automations, totalItemsCount, hasNextPage, selectedIds, sortBy, sortDirection, scrollToIndex } =
        state;

    return (
        <div>
            <UiAsyncTable<IAutomationMetadataObject>
                items={automations}
                totalItemsCount={totalItemsCount}
                isLoading={isLoading}
                scrollToIndex={scrollToIndex}
                maxHeight={props.maxHeight}
                hasNextPage={hasNextPage}
                loadNextPage={loadNextPage}
                onSort={handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                bulkActions={bulkActions}
                skeletonItemsCount={skeletonItemsCount}
                selectedItemIds={selectedIds}
                setSelectedItemIds={setSelectedIds}
                filters={[dashboardFilter, recipientsFilter, createdByFilter]}
                columns={columns}
                onSearch={setSearch}
            />
        </div>
    );
};
