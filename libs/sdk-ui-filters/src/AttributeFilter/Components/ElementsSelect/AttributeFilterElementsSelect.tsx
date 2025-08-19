// (C) 2019-2025 GoodData Corporation
import React, { useMemo } from "react";

import { useIntl } from "react-intl";

import { IAttributeElement } from "@gooddata/sdk-model";
import { usePrevious } from "@gooddata/sdk-ui";
import { InvertableSelect, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { AttributeFilterVirtualisedElementsSelect } from "./AttributeFilterVirtualisedElementsSelect.js";
import { IAttributeFilterElementsSelectProps } from "./types.js";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext.js";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext.js";
import { MAX_SELECTION_SIZE } from "../../hooks/constants.js";
import { getElementKey, getElementTitle } from "../../utils.js";

const ITEM_HEIGHT = 28;
const MOBILE_LIST_ITEM_HEIGHT = 40;
const VISIBLE_ITEMS_COUNT = 10;

/**
 * This component allows users to search Attribute Filter elements.
 * It manipulates selection.
 * It displays statues like loading, filtering etc.
 * It allows paging.
 * It displays selection status like number of elements and selected elements labels.
 * It displays messages when elements are filtered out by parent filters or the result of search is empty.
 *
 * @beta
 */
export const AttributeFilterElementsSelect: React.FC<IAttributeFilterElementsSelectProps> = (props) => {
    const {
        items,
        totalItemsCount,
        totalItemsCountWithCurrentSettings,

        isInverted,
        selectedItems,
        onSelect,

        searchString,
        onSearch,

        isLoading,
        isLoadingNextPage,
        nextPageSize,
        onLoadNextPage,
        error,

        attributeTitle,
        isFilteredByParentFilters,
        parentFilterTitles,

        enableShowingFilteredElements,
        onShowFilteredElements,

        irrelevantSelection,
        onClearIrrelevantSelection,

        onApplyButtonClick,
        isApplyDisabled,

        isFilteredByDependentDateFilters,
        isFilteredByLimitingValidationItems,
        enableAttributeFilterVirtualised,
        withoutApply,
    } = props;

    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");
    const { fullscreenOnMobile, selectionMode, attribute } = useAttributeFilterContext();
    const {
        ElementsSelectLoadingComponent,
        ElementsSelectItemComponent,
        ElementsSelectErrorComponent,
        EmptyResultComponent,
        ElementsSearchBarComponent,
        ElementsSelectActionsComponent,
        StatusBarComponent,
    } = useAttributeFilterComponentsContext();

    const itemHeight = fullscreenOnMobile && isMobile ? MOBILE_LIST_ITEM_HEIGHT : ITEM_HEIGHT;
    const isAdaptiveHeight = isMobile && fullscreenOnMobile;

    const previousItemsCount = usePrevious(totalItemsCountWithCurrentSettings);
    const loadingHeight = useMemo(() => {
        return Math.max((Math.min(previousItemsCount, VISIBLE_ITEMS_COUNT) || 1) * itemHeight, 20) + 32;
    }, [previousItemsCount, itemHeight]);

    const primaryLabelTitle = useMemo(() => {
        if (!attribute) {
            return null;
        }
        const primaryLabel = attribute.displayForms.find((df) => !!df.isPrimary);
        return primaryLabel?.title;
    }, [attribute]);

    return (
        <>
            {enableAttributeFilterVirtualised ? (
                <AttributeFilterVirtualisedElementsSelect
                    items={items}
                    totalItemsCount={totalItemsCount}
                    totalItemsCountWithCurrentSettings={totalItemsCountWithCurrentSettings}
                    isInverted={isInverted}
                    selectedItems={selectedItems}
                    onSelect={onSelect}
                    searchString={searchString}
                    onSearch={onSearch}
                    isLoading={isLoading}
                    isLoadingNextPage={isLoadingNextPage}
                    nextPageSize={nextPageSize}
                    onLoadNextPage={onLoadNextPage}
                    error={error}
                    attributeTitle={attributeTitle}
                    isFilteredByParentFilters={isFilteredByParentFilters}
                    parentFilterTitles={parentFilterTitles}
                    enableShowingFilteredElements={enableShowingFilteredElements}
                    onShowFilteredElements={onShowFilteredElements}
                    irrelevantSelection={irrelevantSelection}
                    onClearIrrelevantSelection={onClearIrrelevantSelection}
                    onApplyButtonClick={onApplyButtonClick}
                    isApplyDisabled={isApplyDisabled}
                    isFilteredByDependentDateFilters={isFilteredByDependentDateFilters}
                    isFilteredByLimitingValidationItems={isFilteredByLimitingValidationItems}
                    withoutApply={withoutApply}
                />
            ) : (
                <InvertableSelect<IAttributeElement>
                    className="gd-attribute-filter-elements-select__next"
                    adaptiveWidth
                    adaptiveHeight={isAdaptiveHeight}
                    isSingleSelect={selectionMode === "single"}
                    items={items}
                    totalItemsCount={totalItemsCountWithCurrentSettings}
                    itemHeight={itemHeight}
                    getItemKey={getElementKey}
                    getItemTitle={(item) => {
                        return getElementTitle(item, intl);
                    }}
                    isInverted={isInverted}
                    selectedItems={selectedItems}
                    selectedItemsLimit={MAX_SELECTION_SIZE}
                    onSelect={onSelect}
                    searchString={searchString}
                    onSearch={onSearch}
                    isLoading={isLoading}
                    error={error}
                    isLoadingNextPage={isLoadingNextPage}
                    nextPageItemPlaceholdersCount={nextPageSize}
                    onLoadNextPage={onLoadNextPage}
                    numberOfHiddenSelectedItems={irrelevantSelection.length}
                    renderItem={(props) => {
                        return (
                            <ElementsSelectItemComponent
                                {...props}
                                primaryLabelTitle={primaryLabelTitle}
                                fullscreenOnMobile={fullscreenOnMobile}
                            />
                        );
                    }}
                    renderError={() => {
                        return <ElementsSelectErrorComponent error={error} />;
                    }}
                    renderLoading={() => {
                        return <ElementsSelectLoadingComponent height={loadingHeight} />;
                    }}
                    renderNoData={({ height }) => {
                        return (
                            <EmptyResultComponent
                                height={height}
                                isFilteredByParentFilters={isFilteredByParentFilters}
                                isFilteredByDependentDateFilters={isFilteredByDependentDateFilters}
                                searchString={searchString}
                                totalItemsCount={totalItemsCount}
                                parentFilterTitles={parentFilterTitles}
                                enableShowingFilteredElements={enableShowingFilteredElements}
                            />
                        );
                    }}
                    renderSearchBar={({ onSearch, searchString }) => {
                        return (
                            <ElementsSearchBarComponent
                                onSearch={onSearch}
                                searchString={searchString}
                                isSmall={!(isMobile && fullscreenOnMobile)}
                            />
                        );
                    }}
                    renderStatusBar={({ getItemTitle, isInverted, selectedItems, selectedItemsLimit }) => {
                        return (
                            <StatusBarComponent
                                getItemTitle={getItemTitle}
                                isFilteredByParentFilters={isFilteredByParentFilters}
                                isFilteredByLimitingValidationItems={isFilteredByLimitingValidationItems}
                                isFilteredByDependentDateFilters={isFilteredByDependentDateFilters}
                                isInverted={isInverted}
                                parentFilterTitles={parentFilterTitles}
                                selectedItems={selectedItems}
                                totalElementsCountWithCurrentSettings={totalItemsCountWithCurrentSettings}
                                selectedItemsLimit={selectedItemsLimit}
                                attributeTitle={attributeTitle}
                                enableShowingFilteredElements={enableShowingFilteredElements}
                                onShowFilteredElements={onShowFilteredElements}
                                irrelevantSelection={irrelevantSelection}
                                onClearIrrelevantSelection={onClearIrrelevantSelection}
                                withoutApply={withoutApply}
                            />
                        );
                    }}
                    renderActions={({
                        checked,
                        onChange,
                        onToggle,
                        isFiltered,
                        totalItemsCount,
                        isPartialSelection,
                        isVisible,
                    }) => {
                        return (
                            <ElementsSelectActionsComponent
                                isVisible={isVisible}
                                checked={checked}
                                onChange={onChange}
                                onToggle={onToggle}
                                isFiltered={isFiltered}
                                totalItemsCount={totalItemsCount}
                                isPartialSelection={isPartialSelection}
                                isApplyDisabled={isApplyDisabled}
                                onApplyButtonClick={onApplyButtonClick}
                            />
                        );
                    }}
                />
            )}
        </>
    );
};
