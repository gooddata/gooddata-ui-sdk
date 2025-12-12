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
import { type UiAsyncTableToolbarProps } from "../types.js";
import { useAsyncTableSearch } from "../useAsyncTableSearch.js";

export function UiAsyncTableToolbar<T extends { id: string }>(props: UiAsyncTableToolbarProps<T>) {
    const { hasContent, renderBulkActions, renderFilters, renderSearchSection } = useAsyncTableToolbar(props);

    const { isMobileView, variant } = props;
    const isSmall = variant === "small";

    return hasContent ? (
        <div className={e("toolbar")}>
            <div className={e("toolbar-top", { "mobile-view": isMobileView ?? false })}>
                {isSmall ? null : renderBulkActions()}
                {renderFilters()}
                {renderSearchSection()}
            </div>
            {isSmall ? renderBulkActions() : null}
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
        return !!bulkActions && isCheckboxChecked && selectedItemIds?.length !== items.length;
    }, [bulkActions, isCheckboxChecked, selectedItemIds, items]);

    const checkboxAriaLabel = accessibilityConfig?.checkboxAllAriaLabel;

    const renderBulkActions = useCallback(() => {
        const selectedCount = selectedItemIds?.length ?? 0;

        const selectedMessage = intl.formatMessage(messages["selectedCount"], {
            selectedCount,
            totalCount: totalItemsCount,
        });

        const tooltipMessage = intl.formatMessage(messages["selectAll"]);

        if (bulkActions) {
            return (
                <div className={e("toolbar-bulk-actions", { "mobile-view": isMobileView ?? false })}>
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
                        <div id={ASYNC_TABLE_SELECTED_COUNT_ID} className={e("toolbar-selected-count")}>
                            {selectedMessage}
                        </div>
                    </div>
                    {(selectedItemIds?.length ?? 0) > 0 ? (
                        <UiAsyncTableBulkActions bulkActions={bulkActions} />
                    ) : null}
                </div>
            );
        }
        return null;
    }, [
        bulkActions,
        selectedItemIds,
        isMobileView,
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

    const renderSearchSection = useCallback(() => {
        const placeholder = intl.formatMessage(messages["titleSearchPlaceholder"]);
        return (
            <div className={e("toolbar-search-section")}>
                {onSearch ? (
                    <>
                        <UiSearchResultsAnnouncement
                            totalResults={searchValue ? totalItemsCount : undefined}
                        />
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
                                onChange={(value) => setSearchValue(String(value))}
                            />
                        </div>
                    </>
                ) : null}
                {renderToolbarCustomElement ? renderToolbarCustomElement() : null}
            </div>
        );
    }, [
        onSearch,
        renderToolbarCustomElement,
        intl,
        searchValue,
        setSearchValue,
        accessibilityConfig?.searchAriaLabel,
        totalItemsCount,
    ]);

    const hasContent = useMemo(() => {
        return filters?.length || bulkActions;
    }, [filters, bulkActions]);

    return {
        hasContent,
        renderBulkActions,
        renderFilters,
        renderSearchSection,
    };
};
