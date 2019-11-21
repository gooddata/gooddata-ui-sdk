// (C) 2019 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import { FormattedMessage } from "react-intl";
import { IAttributeElement } from "@gooddata/sdk-model";
import InvertableList from "@gooddata/goodstrap/lib/List/InvertableList";

import { AttributeFilterItem } from "./AttributeFilterItem";
import { AttributeListItem } from "./types";

const ITEM_HEIGHT = 28;
const LIST_WIDTH = 208;
const MAX_SELECTION_SIZE = 500;
export const VISIBLE_ITEMS_COUNT = 10;

const ListLoading = () => {
    return (
        <div>
            <span className="s-attribute-filter-list-loading" /> <FormattedMessage id="gs.list.loading" />
        </div>
    );
};

const ListError = () => {
    return (
        <div className="gd-message error">
            <FormattedMessage id="gs.list.error" />
        </div>
    );
};

const ListNoResults = () => {
    return (
        <div>
            <FormattedMessage id="gs.list.noItemsFound" />
        </div>
    );
};

interface IAttributeDropdownListProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: IAttributeElement[];
    isInverted: boolean;
    isLoading: boolean;
    error?: any;

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
}) => {
    if (error) {
        return <ListError />;
    }

    if (isLoading) {
        return <ListLoading />;
    }

    if (!items.length) {
        return <ListNoResults />;
    }

    return (
        <InvertableList
            items={items}
            itemsCount={totalCount}
            filteredItemsCount={totalCount}
            selection={selectedItems}
            isInverted={isInverted}
            showSearchField={false}
            rowItem={<AttributeFilterItem />}
            maxSelectionSize={MAX_SELECTION_SIZE}
            width={LIST_WIDTH}
            itemHeight={ITEM_HEIGHT}
            height={ITEM_HEIGHT * VISIBLE_ITEMS_COUNT}
            onRangeChange={onRangeChange}
            onSelect={onSelect}
            onSearch={noop} // TODO make this prop not required in goodstrap
        />
    );
};
