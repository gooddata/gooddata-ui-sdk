// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import { InvertableList, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { AttributeListItem, isNonEmptyListItem, IAttributeFilterListProps, IListItem } from "./types";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../Context/AttributeFilterContext";

const ITEM_HEIGHT = 28;
const MOBILE_LIST_ITEM_HEIGHT = 40;
export const MAX_SELECTION_SIZE = 500;
const VISIBLE_ITEMS_COUNT = 10;
const INTERNAL_LIST_WIDTH = 214;

export const AttributeFilterList: React.FC<IAttributeFilterListProps> = ({
    items,
    //  totalCount, // TODO handle total count current components gets total count calculated for paging and number of all items and filtered are wrong
    isLoading,
    selectedItems,
    isInverted,
    onNextPageRequest,
    onSelect,
    onSearch,
    searchString,

    loadedCount,
    pageSize,
}) => {
    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");

    const { AttributeFilterListLoading, AttributeFilterListItem } = useAttributeFilterComponentsContext();

    const getItemKey = useCallback((i: AttributeListItem) => {
        return isNonEmptyListItem(i) ? (i.uri ? i.uri : i.title) : "empty";
    }, []);

    const onScrollEnd = useCallback(
        (visibleRowsStartIndex: number, _visibleRowsEndIndex: number) => {
            if (visibleRowsStartIndex > items.length - VISIBLE_ITEMS_COUNT - 1) {
                // list display VISIBLE_ITEMS_COUNT and 1/2 item thats why -1
                onNextPageRequest();
            }
        },
        [onNextPageRequest, items.length],
    );

    const itemHeight = isMobile ? MOBILE_LIST_ITEM_HEIGHT : ITEM_HEIGHT;

    const hasNextPage = items.length < loadedCount;

    //TODO memo this
    //TODO calculate edge case when loading last page it could be smaller than page
    const itemsCount = hasNextPage ? items.length + pageSize : items.length;

    return (
        <InvertableList<AttributeListItem>
            className="gd-attribute-filter-list"
            intl={intl}
            items={items}
            itemsCount={itemsCount}
            filteredItemsCount={itemsCount}
            selectedItems={selectedItems}
            isInverted={isInverted}
            showSearchField={true}
            searchString={searchString}
            isLoading={isLoading}
            noItemsFound={!items.length}
            maxSelectionSize={MAX_SELECTION_SIZE}
            itemHeight={itemHeight}
            height={itemHeight * VISIBLE_ITEMS_COUNT}
            width={INTERNAL_LIST_WIDTH}
            smallSearch={true}
            renderItem={(props) => {
                return <AttributeFilterListItem {...props} />;
            }}
            renderLoading={(props: { height: number }) => {
                return <AttributeFilterListLoading height={props.height} />;
            }}
            onSearch={onSearch}
            onSelect={onSelect}
            getItemKey={getItemKey}
            onScrollEnd={onScrollEnd}
            actionsAsCheckboxes={true}
            searchPlaceholder={intl.formatMessage({ id: "gs.list.search.placeholder" })}
        />
    );
};

export const useAttributeFilterList = (): IAttributeFilterListProps => {
    const { elements, selection, onSearch, changeSelection, onNextPageRequest } = useAttributeFilterContext();

    const onSelect = useCallback(
        (selectedItems: IListItem[], isInverted: boolean) => {
            const keys = selectedItems.map((item) => item.uri);
            changeSelection({ keys, isInverted });
        },
        [changeSelection],
    );

    return {
        pageSize: elements.currentOptions.limit,
        loadedCount: elements.totalCountWithCurrentSettings,
        totalCount: elements.totalCount,
        items: elements.data ?? [],
        selectedItems: selection.working.elements ?? [],
        isInverted: selection.working.isInverted,
        isLoading: elements.initialPageLoad.status !== "success",
        searchString: elements.currentOptions.search ?? "",
        onSearch: onSearch,
        onSelect: onSelect,
        onNextPageRequest: onNextPageRequest,
    };
};
