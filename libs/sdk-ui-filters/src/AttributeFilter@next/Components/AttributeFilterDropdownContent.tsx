// (C) 2019-2022 GoodData Corporation
import React from "react";

import { IAttributeFilterDropdownContentProps } from "./types";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";

export const AttributeFilterDropdownContent: React.FC<IAttributeFilterDropdownContentProps> = (props) => {
    const {
        items,
        totalCount,
        error,
        isLoading,
        selectedItems,
        isInverted,
        onRangeChange,
        onSearch,
        searchString,
        onSelect,
        parentFilterTitles,
        showItemsFilteredMessage,

        hasNoMatchingData,
        hasNoData,
    } = props;

    const {
        AttributeFilterList,
        MessageNoData,
        MessageNoMatchingData,
        MessageParentItemsFiltered,
        MessageListError,
    } = useAttributeFilterComponentsContext();

    return (
        <>
            {error ? (
                <MessageListError />
            ) : hasNoMatchingData ? (
                <MessageNoMatchingData parentFilterTitles={parentFilterTitles} />
            ) : hasNoData ? (
                <MessageNoData />
            ) : (
                <AttributeFilterList
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
            )}

            <MessageParentItemsFiltered
                parentFilterTitles={parentFilterTitles}
                showItemsFilteredMessage={showItemsFilteredMessage}
            />
        </>
    );
};
