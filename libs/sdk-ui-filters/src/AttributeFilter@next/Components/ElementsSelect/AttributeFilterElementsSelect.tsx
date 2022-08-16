// (C) 2019-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { InvertableSelect, useMediaQuery } from "@gooddata/sdk-ui-kit";
import { IAttributeElement } from "@gooddata/sdk-model";

import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { getElementTitle, getElementKey } from "../../utils";
import { IAttributeFilterElementsSelectProps } from "./types";

export const MAX_SELECTION_SIZE = 500;
const ITEM_HEIGHT = 28;
const MOBILE_LIST_ITEM_HEIGHT = 40;
const INTERNAL_LIST_WIDTH = 245;
const VISIBLE_ITEMS_COUNT = 10;

/**
 * @internal
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

        isFilteredByParentFilters,

        parentFilterTitles,
    } = props;

    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");

    const {
        ElementsSelectLoadingComponent,
        ElementsSelectItemComponent,
        ElementsSelectErrorComponent,
        EmptyResultComponent,
        ElementsSearchBarComponent,
        StatusBarComponent,
    } = useAttributeFilterComponentsContext();

    const itemHeight = isMobile ? MOBILE_LIST_ITEM_HEIGHT : ITEM_HEIGHT;
    const height = useMemo(() => {
        return isLoading || (!isLoading && items.length === 0)
            ? 100
            : itemHeight * Math.min(VISIBLE_ITEMS_COUNT, totalItemsCountWithCurrentSettings);
    }, [isLoading, items, itemHeight, totalItemsCountWithCurrentSettings]);

    return (
        <>
            <InvertableSelect<IAttributeElement>
                className="gd-attribute-filter-list"
                width={INTERNAL_LIST_WIDTH}
                height={height}
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
                renderItem={(props) => {
                    return <ElementsSelectItemComponent {...props} />;
                }}
                renderError={({ height }) => {
                    return <ElementsSelectErrorComponent height={height} />;
                }}
                renderLoading={(props) => {
                    return <ElementsSelectLoadingComponent height={props.height} />;
                }}
                renderNoData={({ height }) => {
                    return (
                        <EmptyResultComponent
                            height={height}
                            isFilteredByParentFilters={isFilteredByParentFilters}
                            searchString={searchString}
                            totalItemsCount={totalItemsCount}
                            parentFilterTitles={parentFilterTitles}
                        />
                    );
                }}
                renderSearchBar={({ onSearch, searchString }) => {
                    return <ElementsSearchBarComponent onSearch={onSearch} searchString={searchString} />;
                }}
                renderStatusBar={({ getItemTitle, isInverted, selectedItems, selectedItemsLimit }) => {
                    return (
                        <StatusBarComponent
                            getItemTitle={getItemTitle}
                            isFilteredByParentFilters={isFilteredByParentFilters}
                            isInverted={isInverted}
                            parentFilterTitles={parentFilterTitles}
                            selectedItems={selectedItems}
                            totalElementsCountWithCurrentSettings={totalItemsCountWithCurrentSettings}
                            selectedItemsLimit={selectedItemsLimit}
                        />
                    );
                }}
            />
        </>
    );
};
