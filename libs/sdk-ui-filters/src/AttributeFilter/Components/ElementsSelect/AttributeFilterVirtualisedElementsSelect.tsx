// (C) 2019-2025 GoodData Corporation

import React, { useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { IAttributeElement } from "@gooddata/sdk-model";
import { GoodDataSdkError, usePrevious } from "@gooddata/sdk-ui";
import { InvertableSelectVirtualised, UiAutofocus, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext.js";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext.js";
import { MAX_SELECTION_SIZE } from "../../hooks/constants.js";
import { getElementKey, getElementPrimaryTitle, getElementTitle } from "../../utils.js";

const ITEM_HEIGHT = 28;
const MOBILE_LIST_ITEM_HEIGHT = 40;
const VISIBLE_ITEMS_COUNT = 10;
const MIN_LOADING_HEIGHT = 20;
const LOADING_PADDING = 32;

interface IAttributeFilterVirtualisedElementsSelect {
    items: IAttributeElement[];
    totalItemsCount: number;
    totalItemsCountWithCurrentSettings: number;
    isInverted: boolean;
    selectedItems: IAttributeElement[];
    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    searchString: string;
    onSearch: (searchString: string) => void;
    isLoading: boolean;
    isLoadingNextPage: boolean;
    onLoadNextPage: () => void;
    nextPageSize: number;
    parentFilterTitles: string[];
    isFilteredByParentFilters: boolean;
    error?: GoodDataSdkError;
    enableShowingFilteredElements?: boolean;
    isFilteredByDependentDateFilters?: boolean;
    isFilteredByLimitingValidationItems: boolean;
    attributeTitle?: string;
    onShowFilteredElements?: () => void;
    irrelevantSelection?: IAttributeElement[];
    onClearIrrelevantSelection?: () => void;
    withoutApply?: boolean;
    onApplyButtonClick?: () => void;
    isApplyDisabled?: boolean;
    enableAttributeFilterVirtualised?: boolean;
}

/**
 * This component allows users to search Attribute Filter elements.
 * It manipulates selection.
 * It displays statues like loading, filtering etc.
 * It allows paging.
 * It displays selection status like number of elements and selected elements labels.
 * It displays messages when elements are filtered out by parent filters or the result of search is empty.
 *
 * @internal
 */
export function AttributeFilterVirtualisedElementsSelect(props: IAttributeFilterVirtualisedElementsSelect) {
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

    const [refocusKey, setRefocusKey] = useState<string | undefined>(undefined);

    const itemHeight = fullscreenOnMobile && isMobile ? MOBILE_LIST_ITEM_HEIGHT : ITEM_HEIGHT;
    const isAdaptiveHeight = isMobile && fullscreenOnMobile;

    const previousItemsCount = usePrevious(totalItemsCountWithCurrentSettings);
    const loadingHeight = useMemo(() => {
        return (
            Math.max(
                (Math.min(previousItemsCount, VISIBLE_ITEMS_COUNT) || 1) * itemHeight,
                MIN_LOADING_HEIGHT,
            ) + LOADING_PADDING
        );
    }, [previousItemsCount, itemHeight]);

    const primaryLabelTitle = useMemo(() => {
        if (!attribute) {
            return null;
        }
        const primaryLabel = attribute.displayForms.find((df) => !!df.isPrimary);
        return primaryLabel?.title;
    }, [attribute]);

    const handleShowFilteredElements = useCallback(() => {
        setRefocusKey("show");
        onShowFilteredElements();
    }, [onShowFilteredElements, setRefocusKey]);

    return (
        <UiAutofocus refocusKey={refocusKey}>
            <InvertableSelectVirtualised<IAttributeElement>
                className="gd-attribute-filter-elements-select__next"
                adaptiveWidth
                adaptiveHeight={isAdaptiveHeight}
                isSingleSelect={selectionMode === "single"}
                items={items}
                totalItemsCount={totalItemsCountWithCurrentSettings}
                itemHeight={itemHeight}
                getItemKey={getElementKey}
                getItemTitle={(item) => getElementTitle(item, intl)}
                isItemQuestionMarkEnabled={(item) => !!getElementPrimaryTitle(item)}
                isInverted={isInverted}
                selectedItems={selectedItems}
                selectedItemsLimit={MAX_SELECTION_SIZE}
                onSelect={onSelect}
                onApplyButtonClick={onApplyButtonClick}
                searchString={searchString}
                onSearch={onSearch}
                canSubmitOnKeyDown={!isApplyDisabled}
                isLoading={isLoading}
                error={error}
                isLoadingNextPage={isLoadingNextPage}
                nextPageItemPlaceholdersCount={nextPageSize}
                onLoadNextPage={onLoadNextPage}
                numberOfHiddenSelectedItems={irrelevantSelection.length}
                renderItem={(props) => (
                    <ElementsSelectItemComponent
                        {...props}
                        primaryLabelTitle={primaryLabelTitle}
                        fullscreenOnMobile={fullscreenOnMobile}
                    />
                )}
                renderError={() => {
                    return <ElementsSelectErrorComponent error={error} />;
                }}
                renderLoading={() => {
                    return <ElementsSelectLoadingComponent height={loadingHeight} />;
                }}
                renderNoData={({ height }) => (
                    <EmptyResultComponent
                        height={height}
                        isFilteredByParentFilters={isFilteredByParentFilters}
                        isFilteredByDependentDateFilters={isFilteredByDependentDateFilters}
                        searchString={searchString}
                        totalItemsCount={totalItemsCount}
                        parentFilterTitles={parentFilterTitles}
                        enableShowingFilteredElements={enableShowingFilteredElements}
                    />
                )}
                renderSearchBar={({ onSearch, searchString }) => (
                    <ElementsSearchBarComponent
                        onSearch={onSearch}
                        searchString={searchString}
                        isSmall={!(isMobile && fullscreenOnMobile)}
                    />
                )}
                renderStatusBar={({ getItemTitle, isInverted, selectedItems, selectedItemsLimit }) => (
                    <StatusBarComponent
                        getItemTitle={getItemTitle}
                        isFilteredByParentFilters={isFilteredByParentFilters}
                        isFilteredByDependentDateFilters={isFilteredByDependentDateFilters}
                        isFilteredByLimitingValidationItems={isFilteredByLimitingValidationItems}
                        isInverted={isInverted}
                        parentFilterTitles={parentFilterTitles}
                        selectedItems={selectedItems}
                        totalElementsCountWithCurrentSettings={totalItemsCountWithCurrentSettings}
                        selectedItemsLimit={selectedItemsLimit}
                        attributeTitle={attributeTitle}
                        enableShowingFilteredElements={enableShowingFilteredElements}
                        onShowFilteredElements={handleShowFilteredElements}
                        irrelevantSelection={irrelevantSelection}
                        onClearIrrelevantSelection={onClearIrrelevantSelection}
                        withoutApply={withoutApply}
                    />
                )}
                renderActions={({
                    checked,
                    onChange,
                    onToggle,
                    isFiltered,
                    totalItemsCount,
                    isPartialSelection,
                    isVisible,
                }) => (
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
                )}
            />
        </UiAutofocus>
    );
}
