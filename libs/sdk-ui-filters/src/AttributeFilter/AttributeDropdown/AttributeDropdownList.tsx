// (C) 2019 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IAttributeElement } from "@gooddata/sdk-backend-spi";
import InvertableList from "@gooddata/goodstrap/lib/List/InvertableList";
import LoadingMask from "@gooddata/goodstrap/lib/core/LoadingMask";

import { AttributeFilterItem } from "./AttributeFilterItem";
import { AttributeListItem } from "./types";

const ITEM_HEIGHT = 28;
export const MAX_SELECTION_SIZE = 500;
const VISIBLE_ITEMS_COUNT = 10;

const ListLoading = () => <LoadingMask style={{ height: 306 }} />;

const ListError = () => (
    <div className="gd-message error">
        <FormattedMessage id="gs.list.error" />
    </div>
);

interface IAttributeDropdownListProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<Partial<IAttributeElement>>;
    isInverted: boolean;
    isLoading: boolean;
    error?: any;

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
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
}) => {
    if (error) {
        return <ListError />;
    }

    return (
        <InvertableList
            items={items}
            itemsCount={totalCount}
            filteredItemsCount={items.length}
            selection={selectedItems}
            isLoading={isLoading}
            isLoadingClass={ListLoading}
            noItemsFound={!items.length}
            isInverted={isInverted}
            showSearchField={true}
            onSearch={onSearch}
            searchString={searchString}
            rowItem={<AttributeFilterItem />}
            maxSelectionSize={MAX_SELECTION_SIZE}
            itemHeight={ITEM_HEIGHT}
            height={ITEM_HEIGHT * VISIBLE_ITEMS_COUNT}
            onRangeChange={onRangeChange}
            onSelect={onSelect}
        />
    );
};
