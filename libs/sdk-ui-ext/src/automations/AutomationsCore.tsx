// (C) 2025 GoodData Corporation

import React from "react";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { UiAsyncTable } from "@gooddata/sdk-ui-kit";

import { AutomationConfirmDialog } from "./AutomationConfirmDialog.js";
import { IAutomationsCoreProps } from "./types.js";
import { useAutomationsState } from "./useAutomationsState.js";

export function AutomationsCore(props: IAutomationsCoreProps) {
    const {
        state,
        filters,
        isLoading,
        skeletonItemsCount,
        columns,
        bulkActions,
        selectedIds,
        handleSort,
        loadNextPage,
        setSearch,
        setSelectedIds,
        setPendingAction,
    } = useAutomationsState(props);

    const { automations, totalItemsCount, hasNextPage, sortBy, sortDirection, scrollToIndex, pendingAction } =
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
                filters={filters}
                columns={columns}
                isSmall={props.isSmall}
                onSearch={setSearch}
            />
            <AutomationConfirmDialog pendingAction={pendingAction} setPendingAction={setPendingAction} />
        </div>
    );
}
