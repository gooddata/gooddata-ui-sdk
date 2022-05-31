// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { InvertableList, LoadingMask } from "@gooddata/sdk-ui-kit";
import { IAttributeElement } from "@gooddata/sdk-model";

import { AttributeFilterItem } from "./AttributeFilterItem";

import { AttributeListItem, isNonEmptyListItem } from "./types";

const ITEM_HEIGHT = 28;
const MOBILE_LIST_ITEM_HEIGHT = 40;
export const MAX_SELECTION_SIZE = 500;
const VISIBLE_ITEMS_COUNT = 10;
const INTERNAL_LIST_WIDTH = 214;

const ListLoading = (props: { height: number }) => <LoadingMask height={props.height} />;

const ListError = () => (
    <div className="gd-message error">
        <FormattedMessage id="gs.list.error" />
    </div>
);

interface IAttributeDropdownListProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<IAttributeElement>;
    isInverted: boolean;
    isLoading: boolean;
    error?: any;

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    isMobile?: boolean;
}

export const AttributeDropdownList: React.FC<IAttributeDropdownListProps> = ({
    items,
    totalCount,
    error,
    isLoading,
    selectedItems,
    isInverted,
    onRangeChange,
    onSelect,
    onSearch,
    searchString,
    isMobile,
}) => {
    const intl = useIntl();

    const getItemKey = useCallback((i: AttributeListItem) => {
        return isNonEmptyListItem(i) ? (i.uri ? i.uri : i.title) : "empty";
    }, []);

    const onScrollEnd = useCallback(
        (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => {
            onRangeChange(searchString, visibleRowsStartIndex, visibleRowsEndIndex);
        },
        [onRangeChange, searchString],
    );

    if (error) {
        return <ListError />;
    }

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
            renderItem={(props) => {
                return <AttributeFilterItem {...props} />;
            }}
            renderLoading={(props: { height: number }) => {
                return <ListLoading height={props.height} />;
            }}
            onSearch={onSearch}
            onSelect={onSelect}
            getItemKey={getItemKey}
            onScrollEnd={onScrollEnd}
        />
    );
};
