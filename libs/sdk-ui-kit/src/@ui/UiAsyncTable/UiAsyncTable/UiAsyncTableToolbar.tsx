// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { ASYNC_TABLE_FILTER_LABEL_ID, ASYNC_TABLE_SELECTED_COUNT_ID } from "./constants.js";
import { UiAsyncTableBulkActions } from "./UiAsyncTableBulkActions.js";
import { UiAsyncTableCheckbox } from "./UiAsyncTableCheckbox.js";
import { UiAsyncTableFilter } from "./UiAsyncTableFilter.js";
import { Input } from "../../../Form/Input.js";
import { UiSearchResultsAnnouncement } from "../../UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { UiAsyncTableToolbarProps } from "../types.js";
import { useAsyncTableSearch } from "../useAsyncTableSearch.js";

export function UiAsyncTableToolbar<T extends { id: string }>(props: UiAsyncTableToolbarProps<T>) {
    const { hasContent, renderBulkActions, renderFilters, renderSearch, renderCustomElement } =
        useAsyncTableToolbar(props);

    const { isMobileView } = props;

    return hasContent ? (
        <div className={e("toolbar", { "mobile-view": isMobileView })}>
            {renderBulkActions()}
            {renderFilters()}
            {renderSearch()}
            {renderCustomElement()}
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
    variant,
    isMobileView,
    width,
    onSearch,
    renderToolbarCustomElement,
    accessibilityConfig,
}: UiAsyncTableToolbarProps<T>) => {
    const intl = useIntl();
    const { searchValue, setSearchValue } = useAsyncTableSearch(onSearch);
    const isSmall = variant === "small";

    const handleCheckboxChange = useCallback(() => {
        setSelectedItemIds(selectedItemIds?.length === 0 ? items.map((item) => item.id) : []);
    }, [selectedItemIds, items, setSelectedItemIds]);

    const isCheckboxDisabled = useMemo(() => {
        return items.length === 0;
    }, [items]);

    const isCheckboxChecked = useMemo(() => {
        return !!selectedItemIds?.length;
    }, [selectedItemIds]);

    const isCheckboxIndeterminate = useMemo(() => {
        return !!bulkActions && selectedItemIds?.length !== items.length;
    }, [bulkActions, selectedItemIds, items]);

    const checkboxAriaLabel = accessibilityConfig?.checkboxAllAriaLabel;

    const renderBulkActions = useCallback(() => {
        const selectedCount = selectedItemIds?.length ?? 0;

        const selectedMessage = intl.formatMessage(messages["selectedCount"], {
            selectedCount,
            totalCount: totalItemsCount,
        });

        const selectedMessageShort = intl.formatMessage(messages["selectedCountShort"], {
            selectedCount,
        });

        const tooltipMessage = intl.formatMessage(messages["selectAll"]);

        if (bulkActions) {
            return (
                <div className={e("toolbar-bulk-actions")}>
                    <div className={e("toolbar-checkbox-section")}>
                        <UiTooltip
                            anchor={
                                <UiAsyncTableCheckbox
                                    onChange={handleCheckboxChange}
                                    checked={isCheckboxChecked}
                                    indeterminate={isCheckboxIndeterminate}
                                    disabled={isCheckboxDisabled}
                                    ariaLabel={checkboxAriaLabel}
                                    header
                                />
                            }
                            triggerBy={["hover", "focus"]}
                            content={tooltipMessage}
                        />
                        <div
                            id={ASYNC_TABLE_SELECTED_COUNT_ID}
                            className={e("toolbar-selected-count", { short: isSmall })}
                        >
                            {isSmall ? selectedMessageShort : selectedMessage}
                        </div>
                    </div>
                    {selectedItemIds?.length > 0 ? (
                        <UiAsyncTableBulkActions bulkActions={bulkActions} />
                    ) : null}
                </div>
            );
        }
        return null;
    }, [
        bulkActions,
        selectedItemIds,
        isSmall,
        totalItemsCount,
        intl,
        isCheckboxDisabled,
        handleCheckboxChange,
        isCheckboxChecked,
        isCheckboxIndeterminate,
        checkboxAriaLabel,
    ]);

    const renderFilters = useCallback(() => {
        return filters?.length ? (
            <div className={e("toolbar-filters-section")}>
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
                            variant={variant}
                            isMobileView={isMobileView}
                            width={width}
                            key={filter.label}
                            {...filter}
                        />
                    ))}
                </div>
            </div>
        ) : null;
    }, [filters, intl, isFiltersTooLarge, variant, isMobileView, width]);

    const renderCustomElement = useCallback(() => {
        return renderToolbarCustomElement ? (
            <div className={e("toolbar-custom-element")}>{renderToolbarCustomElement()}</div>
        ) : null;
    }, [renderToolbarCustomElement]);

    const renderSearch = useCallback(() => {
        const placeholder = intl.formatMessage(messages["titleSearchPlaceholder"]);
        return onSearch ? (
            <div className={e("toolbar-search")}>
                <UiSearchResultsAnnouncement totalResults={searchValue ? totalItemsCount : undefined} />
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
    }, [onSearch, intl, searchValue, setSearchValue, accessibilityConfig?.searchAriaLabel, totalItemsCount]);

    const hasContent = useMemo(() => {
        return filters?.length || bulkActions;
    }, [filters, bulkActions]);

    return {
        hasContent,
        renderBulkActions,
        renderFilters,
        renderSearch,
        renderCustomElement,
    };
};
