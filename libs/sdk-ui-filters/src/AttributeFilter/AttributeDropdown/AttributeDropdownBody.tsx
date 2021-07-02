// (C) 2019 GoodData Corporation
import React from "react";
import { IAttributeElement } from "@gooddata/sdk-backend-spi";

import { AttributeDropdownList } from "./AttributeDropdownList";
import { AttributeDropdownButtons } from "./AttributeDropdownButtons";
import { AttributeListItem } from "./types";
import { AttributeDropdownItemsFilteredBody } from "./AttributeDropdownItemsFilteredBody";

interface IAttributeDropdownBodyProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<IAttributeElement>;
    isInverted: boolean;
    isLoading: boolean;
    isFullWidth?: boolean;
    error?: any;
    applyDisabled?: boolean;

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
}

export const AttributeDropdownBody: React.FC<IAttributeDropdownBodyProps> = ({
    items,
    totalCount,
    error,
    isLoading,
    selectedItems,
    isInverted,
    applyDisabled,
    onRangeChange,
    onSearch,
    searchString,
    onSelect,
    onApplyButtonClicked,
    onCloseButtonClicked,
    parentFilterTitles,
    showItemsFilteredMessage,
}) => {
    return (
        <div className="gd-attribute-filter-overlay">
            <AttributeDropdownList
                error={error}
                isLoading={isLoading}
                items={items}
                isInverted={isInverted}
                onRangeChange={onRangeChange}
                selectedItems={selectedItems}
                totalCount={totalCount}
                onSearch={onSearch}
                searchString={searchString}
                onSelect={onSelect}
            />
            <AttributeDropdownItemsFilteredBody
                parentFilterTitles={parentFilterTitles}
                showItemsFilteredMessage={showItemsFilteredMessage}
            />
            <AttributeDropdownButtons
                applyDisabled={applyDisabled}
                onApplyButtonClicked={onApplyButtonClicked}
                onCloseButtonClicked={onCloseButtonClicked}
            />
        </div>
    );
};
