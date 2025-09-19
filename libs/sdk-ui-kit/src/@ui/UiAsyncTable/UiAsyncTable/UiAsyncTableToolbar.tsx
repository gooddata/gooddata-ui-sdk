// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { UiAsyncTableBulkActions } from "./UiAsyncTableBulkActions.js";
import { UiAsyncTableCheckbox } from "./UiAsyncTableCheckbox.js";
import { UiAsyncTableFilter } from "./UiAsyncTableFilter.js";
import { Input } from "../../../Form/Input.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { UiAsyncTableToolbarProps } from "../types.js";
import { useAsyncTableSearch } from "../useAsyncTableSearch.js";

export function UiAsyncTableToolbar<T extends { id: string }>(props: UiAsyncTableToolbarProps<T>) {
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
            <UiAsyncTableCheckbox
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
    isFiltersTooLarge,
    bulkActions,
    selectedItemIds,
    setSelectedItemIds,
    totalItemsCount,
    items,
    isSmall,
    onSearch,
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
                <div className={e("toolbar-label")}>{intl.formatMessage(messages["filterLabel"])}</div>
                {filters.map((filter) => (
                    <UiAsyncTableFilter
                        isSmall={isSmall ? !!selectedItemIds?.length : null}
                        isFiltersTooLarge={isFiltersTooLarge}
                        key={filter.label}
                        {...filter}
                    />
                ))}
            </>
        ) : null;
    }, [filters, intl, isSmall, selectedItemIds?.length, isFiltersTooLarge]);

    const renderSearch = useCallback(() => {
        const placeholder = intl.formatMessage(messages["titleSearchPlaceholder"]);
        return onSearch ? (
            <div className={e("toolbar-search")}>
                <Input
                    isSearch={true}
                    type="search"
                    isSmall={true}
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
