// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import { InvertableList, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { AttributeListItem, isNonEmptyListItem, IAttributeFilterListProps } from "./types";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";

const ITEM_HEIGHT = 28;
const MOBILE_LIST_ITEM_HEIGHT = 40;
export const MAX_SELECTION_SIZE = 500;
const VISIBLE_ITEMS_COUNT = 10;
const INTERNAL_LIST_WIDTH = 214;

export const AttributeFilterList: React.FC<IAttributeFilterListProps> = ({
    items,
    totalCount,
    isLoading,
    selectedItems,
    isInverted,
    onRangeChange,
    onSelect,
    onSearch,
    searchString,
}) => {
    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");

    const { AttributeFilterListLoading, AttributeFilterListItem } = useAttributeFilterComponentsContext();

    const getItemKey = useCallback((i: AttributeListItem) => {
        return isNonEmptyListItem(i) ? (i.uri ? i.uri : i.title) : "empty";
    }, []);

    const onScrollEnd = useCallback(
        (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => {
            onRangeChange(searchString, visibleRowsStartIndex, visibleRowsEndIndex);
        },
        [onRangeChange, searchString],
    );

    const itemHeight = isMobile ? MOBILE_LIST_ITEM_HEIGHT : ITEM_HEIGHT;

    return (
        <InvertableList<AttributeListItem>
            intl={intl}
            items={items}
            itemsCount={totalCount}
            filteredItemsCount={totalCount}
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
            searchPlaceholder={intl.formatMessage({ id: "gs.list.search.placeholder" })}
        />
    );
};
