// (C) 2019-2022 GoodData Corporation
import React from "react";
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

        isInverted,
        selectedItems,
        onSelect,

        searchString,
        onSearch,

        isLoading,
        isLoadingNextPage,
        nextPageSize,
        onLoadNextPage,
    } = props;

    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");

    const {
        // TODO
        // AttributeFilterListLoading,
        AttributeFilterElementsSelectItem,
    } = useAttributeFilterComponentsContext();

    const itemHeight = isMobile ? MOBILE_LIST_ITEM_HEIGHT : ITEM_HEIGHT;

    return (
        <InvertableSelect<IAttributeElement>
            className="gd-attribute-filter-list"
            width={INTERNAL_LIST_WIDTH}
            height={isLoading ? 100 : itemHeight * Math.min(VISIBLE_ITEMS_COUNT, totalItemsCount)}
            items={items}
            totalItemsCount={totalItemsCount}
            itemHeight={itemHeight}
            getItemKey={getElementKey}
            getItemTitle={(item) => {
                return getElementTitle(item, intl);
            }}
            renderItem={(props) => {
                return <AttributeFilterElementsSelectItem {...props} />;
            }}
            isInverted={isInverted}
            selectedItems={selectedItems}
            selectedItemsLimit={MAX_SELECTION_SIZE}
            onSelect={onSelect}
            searchString={searchString}
            onSearch={onSearch}
            isLoading={isLoading}
            // TODO:
            // renderLoading={(props: { height: number }) => {
            //     return <AttributeFilterListLoading height={props.height} />;
            // }}
            isLoadingNextPage={isLoadingNextPage}
            nextPageItemPlaceholdersCount={nextPageSize}
            onLoadNextPage={onLoadNextPage}
        />
    );
};
