// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { ASYNC_TABLE_FILTER_LABEL_ID } from "./constants.js";
import { UiAsyncTableBulkActions } from "./UiAsyncTableBulkActions.js";
import { UiAsyncTableCheckbox } from "./UiAsyncTableCheckbox.js";
import { UiAsyncTableFilter } from "./UiAsyncTableFilter.js";
import { Input } from "../../../Form/Input.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { UiAsyncTableToolbarProps } from "../types.js";
import { useAsyncTableSearch } from "../useAsyncTableSearch.js";

export function UiAsyncTableToolbar<T extends { id: string }>(props: UiAsyncTableToolbarProps<T>) {
    const { hasContent, renderBulkActions, renderFilters, renderSearch, renderCheckbox } =
        useAsyncTableToolbar(props);
    return hasContent ? (
        <div className={e("toolbar")}>
            {renderCheckbox()}
            {renderBulkActions()}
            {renderFilters()}
            {renderSearch()}
        </div>
    ) : null;
}

const useAsyncTableToolbar = <T extends { id: string }>({
    filters,
    isFiltersTooLarge,
    bulkActions,
    selectedItemIds,
    setSelectedItemIds,
    totalItemsCount,
    items,
    isSmall,
    onSearch,
    accessibilityConfig,
}: UiAsyncTableToolbarProps<T>) => {
    const intl = useIntl();
    const { searchValue, setSearchValue } = useAsyncTableSearch(onSearch);

    const handleCheckboxChange = useCallback(() => {
        setSelectedItemIds(selectedItemIds?.length === 0 ? items.map((item) => item.id) : []);
    }, [selectedItemIds, items, setSelectedItemIds]);

    const isCheckboxDisabled = useMemo(() => {
        return items.length === 0;
    }, [items]);

    const renderBulkActions = useCallback(() => {
        const message = intl.formatMessage(messages["selectedCount"], {
            selectedCount: selectedItemIds?.length ?? 0,
            totalCount: totalItemsCount,
        });
        const messageShort = intl.formatMessage(messages["selectedCountShort"], {
            selectedCount: selectedItemIds?.length ?? 0,
        });

        if (bulkActions) {
            return (
                <>
                    <div className={e("toolbar-selected-count", { short: isSmall })}>
                        {isSmall ? messageShort : message}
                    </div>
                    {selectedItemIds?.length > 0 ? (
                        <UiAsyncTableBulkActions bulkActions={bulkActions} />
                    ) : null}
                </>
            );
        }
        return null;
    }, [bulkActions, selectedItemIds, isSmall, totalItemsCount, intl]);

    const renderFilters = useCallback(() => {
        return filters?.length ? (
            <>
                <div className={e("toolbar-label")} id={ASYNC_TABLE_FILTER_LABEL_ID}>
                    {intl.formatMessage(messages["filterLabel"])}
                </div>
                <div
                    className={e("toolbar-filters")}
                    role="group"
                    aria-labelledby={ASYNC_TABLE_FILTER_LABEL_ID}
                >
                    {filters.map((filter) => (
                        <UiAsyncTableFilter
                            isFiltersTooLarge={isFiltersTooLarge}
                            isSmall={isSmall}
                            key={filter.label}
                            {...filter}
                        />
                    ))}
                </div>
            </>
        ) : null;
    }, [filters, intl, isFiltersTooLarge, isSmall]);

    const renderSearch = useCallback(() => {
        const placeholder = intl.formatMessage(messages["titleSearchPlaceholder"]);
        return onSearch ? (
            <div className={e("toolbar-search")}>
                <Input
                    isSearch
                    type="search"
                    isSmall
                    clearOnEsc
                    placeholder={placeholder}
                    accessibilityConfig={{
                        ariaLabel: accessibilityConfig?.searchAriaLabel ?? placeholder,
                    }}
                    value={searchValue}
                    onChange={setSearchValue}
                />
            </div>
        ) : null;
    }, [onSearch, intl, searchValue, setSearchValue, accessibilityConfig?.searchAriaLabel]);

    const hasContent = useMemo(() => {
        return filters?.length || bulkActions;
    }, [filters, bulkActions]);

    const isChecked = useMemo(() => {
        return !!selectedItemIds?.length;
    }, [selectedItemIds]);

    const isCheckboxIndeterminate = useMemo(() => {
        return !!bulkActions && selectedItemIds?.length !== items.length;
    }, [bulkActions, selectedItemIds, items]);

    const checkboxAriaLabel = accessibilityConfig?.checkboxAllAriaLabel;

    const renderCheckbox = useCallback(() => {
        return bulkActions ? (
            <UiAsyncTableCheckbox
                onChange={handleCheckboxChange}
                checked={isChecked}
                indeterminate={isCheckboxIndeterminate}
                disabled={isCheckboxDisabled}
                ariaLabel={checkboxAriaLabel}
                header
            />
        ) : null;
    }, [
        handleCheckboxChange,
        bulkActions,
        isChecked,
        isCheckboxIndeterminate,
        isCheckboxDisabled,
        checkboxAriaLabel,
    ]);

    return {
        hasContent,
        renderBulkActions,
        renderFilters,
        renderSearch,
        renderCheckbox,
    };
};
