// (C) 2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { e } from "./asyncTableBem.js";
import { AsyncTableFilter } from "./AsyncTableFilter.js";
import { AsyncTableCheckbox } from "./AsyncTableCheckbox.js";
import { AsyncTableBulkActions } from "./AsyncTableBulkActions.js";
import { useIntl } from "react-intl";
import { messages } from "../locales.js";
import { IAsyncTableToolbarProps } from "./types.js";
import { useAsyncTableSearch } from "../useAsyncTableSearch.js";
import { Input } from "../../Form/Input.js";

export function AsyncTableToolbar<T extends { id: string }>(props: IAsyncTableToolbarProps<T>) {
    const {
        isChecked,
        isCheckboxIndeterminate,
        hasContent,
        checkbox,
        isCheckboxDisabled,
        handleCheckboxChange,
        renderBulkActions,
        renderFilters,
        renderSearch,
    } = useAsyncTableToolbar(props);
    return hasContent ? (
        <div className={e("toolbar", { checkbox })}>
            <AsyncTableCheckbox
                onChange={handleCheckboxChange}
                checked={isChecked}
                indeterminate={isCheckboxIndeterminate}
                disabled={isCheckboxDisabled}
            />
            {renderBulkActions()}
            {renderFilters()}
            {renderSearch()}
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
    onSearch,
}: IAsyncTableToolbarProps<T>) => {
    const intl = useIntl();
    const { searchValue, setSearchValue } = useAsyncTableSearch(onSearch);

    const handleCheckboxChange = useCallback(() => {
        setSelectedItemIds(selectedItemIds.length === 0 ? items.map((item) => item.id) : []);
    }, [selectedItemIds, items, setSelectedItemIds]);

    const isCheckboxDisabled = useMemo(() => {
        return items.length === 0;
    }, [items]);

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

    const renderSearch = useCallback(() => {
        const placeholder = intl.formatMessage(messages.titleSearchPlaceholder);
        return onSearch ? (
            <div className={e("toolbar-search")}>
                <Input
                    isSearch={true}
                    type="search"
                    clearOnEsc
                    placeholder={placeholder}
                    accessibilityConfig={{
                        ariaLabel: placeholder,
                    }}
                    value={searchValue}
                    onChange={setSearchValue}
                />
            </div>
        ) : null;
    }, [onSearch, intl, searchValue, setSearchValue]);

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
        isCheckboxDisabled,
        handleCheckboxChange,
        renderBulkActions,
        renderFilters,
        renderSearch,
    };
};
