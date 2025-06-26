// (C) 2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { e } from "./asyncTableBem.js";
import { AsyncTableFilter } from "./AsyncTableFilter.js";
import { AsyncTableCheckbox } from "./AsyncTableCheckbox.js";
import { AsyncTableBulkActions } from "./AsyncTableBulkActions.js";
import { useIntl } from "react-intl";
import { messages } from "./locales.js";
import { IAsyncTableToolbarProps } from "./types.js";

export function AsyncTableToolbar<T extends { id: string }>(props: IAsyncTableToolbarProps<T>) {
    const {
        isChecked,
        isCheckboxIndeterminate,
        hasContent,
        checkbox,
        handleCheckboxChange,
        renderBulkActions,
        renderFilters,
    } = useAsyncTableToolbar(props);
    return hasContent ? (
        <div className={e("toolbar", { checkbox })}>
            <AsyncTableCheckbox
                onChange={handleCheckboxChange}
                checked={isChecked}
                indeterminate={isCheckboxIndeterminate}
            />
            {renderBulkActions()}
            {renderFilters()}
        </div>
    ) : null;
}

const useAsyncTableToolbar = <T extends { id: string }>({
    filters,
    bulkActions,
    scrollToStart,
    selectedItemIds,
    setSelectedItemIds,
    totalItemsCount,
    items,
}: IAsyncTableToolbarProps<T>) => {
    const intl = useIntl();

    const handleCheckboxChange = useCallback(() => {
        setSelectedItemIds(selectedItemIds.length === 0 ? items.map((item) => item.id) : []);
    }, [selectedItemIds, items, setSelectedItemIds]);

    const renderBulkActions = useCallback(() => {
        if (bulkActions) {
            return (
                <>
                    <div className={e("toolbar-selected-count")}>
                        {intl.formatMessage(messages.selectedCount, {
                            selectedCount: selectedItemIds.length,
                            totalCount: totalItemsCount,
                        })}
                    </div>
                    {selectedItemIds.length > 0 ? <AsyncTableBulkActions bulkActions={bulkActions} /> : null}
                </>
            );
        }
        return null;
    }, [bulkActions, selectedItemIds, totalItemsCount, intl]);

    const renderFilters = useCallback(() => {
        return filters.length ? (
            <>
                <div className={e("toolbar-label")}>{intl.formatMessage(messages.filterLabel)}</div>
                {filters.map((filter) => (
                    <AsyncTableFilter key={filter.label} scrollToStart={scrollToStart} {...filter} />
                ))}
            </>
        ) : null;
    }, [filters, scrollToStart, intl]);

    const hasContent = useMemo(() => {
        return filters?.length || bulkActions;
    }, [filters, bulkActions]);

    const isChecked = useMemo(() => {
        return !!selectedItemIds?.length;
    }, [selectedItemIds]);

    const isCheckboxIndeterminate = useMemo(() => {
        return !!bulkActions && selectedItemIds?.length !== items.length;
    }, [bulkActions, selectedItemIds, items]);

    return {
        isChecked,
        isCheckboxIndeterminate,
        hasContent,
        checkbox: !!bulkActions,
        handleCheckboxChange,
        renderBulkActions,
        renderFilters,
    };
};
