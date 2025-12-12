// (C) 2025 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { UiAsyncTable } from "@gooddata/sdk-ui-kit";

import { AutomationConfirmDialog } from "./AutomationConfirmDialog.js";
import { AutomationsEmptyState } from "./AutomationsEmptyState.js";
import { type IAutomationsCoreProps } from "./types.js";
import { useAutomationsAccessibility } from "./useAutomationsAccessibility.js";
import { useAutomationsState } from "./useAutomationsState.js";

export function AutomationsCore(props: IAutomationsCoreProps) {
    const {
        state,
        filters,
        isLoading,
        isFiltersOrSearchActive,
        skeletonItemsCount,
        columns,
        bulkActions,
        selectedIds,
        containerRef,
        handleSort,
        handleItemClick,
        loadNextPage,
        setSearch,
        setSelectedIds,
        setPendingAction,
    } = useAutomationsState(props);

    const { accessibilityConfig } = useAutomationsAccessibility(props.type);

    const {
        automations,
        totalItemsCount,
        hasNextPage,
        sortBy,
        sortDirection,
        scrollToIndex,
        pendingAction,
        isFiltersTooLarge,
    } = state;

    return (
        <div ref={containerRef}>
            <UiAsyncTable<IAutomationMetadataObject>
                items={automations}
                totalItemsCount={totalItemsCount}
                isLoading={isLoading}
                scrollToIndex={scrollToIndex}
                maxHeight={props.maxHeight}
                hasNextPage={hasNextPage}
                loadNextPage={loadNextPage}
                onSort={handleSort}
                onItemClick={handleItemClick}
                sortBy={sortBy}
                sortDirection={sortDirection}
                bulkActions={bulkActions}
                skeletonItemsCount={skeletonItemsCount}
                selectedItemIds={selectedIds}
                setSelectedItemIds={setSelectedIds}
                filters={filters}
                isFiltersTooLarge={isFiltersTooLarge}
                columns={columns}
                variant={props.tableVariant}
                locale={props.locale}
                onSearch={setSearch}
                isMobileView={props.isMobileView}
                accessibilityConfig={accessibilityConfig}
                renderToolbarCustomElement={props.renderToolbarCustomElement}
                renderEmptyState={() => (
                    <AutomationsEmptyState
                        type={props.type}
                        isFiltersOrSearchActive={isFiltersOrSearchActive}
                    />
                )}
            />
            <AutomationConfirmDialog pendingAction={pendingAction} setPendingAction={setPendingAction} />
        </div>
    );
}
