// (C) 2019-2022 GoodData Corporation
import React from "react";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext";
import { IAttributeFilterDropdownContentProps } from "./types";

/**
 * @internal
 */
export const AttributeFilterDropdownContent: React.FC<IAttributeFilterDropdownContentProps> = (props) => {
    const { error, parentFilterTitles, showItemsFilteredMessage, hasNoMatchingData, hasNoData } = props;

    const {
        AttributeFilterElementsSelect,
        AttributeFilterElementsSelectNoData,
        AttributeFilterElementsSelectNoMatchingData,
        AttributeFilterElementsSelectParentItemsFiltered,
        AttributeFilterElementsSelectError,
    } = useAttributeFilterComponentsContext();

    const {
        isWorkingSelectionInverted,
        isLoadingInitialElementsPage,
        isLoadingNextElementsPage,
        onLoadNextElementsPage,
        elements,
        onSearch,
        onSelect,
        nextElementsPageSize,
        searchString,
        totalElementsCountWithCurrentSettings,
        workingSelectionElements,
    } = useAttributeFilterContext();

    return (
        <>
            {error ? (
                <AttributeFilterElementsSelectError />
            ) : hasNoMatchingData ? (
                <AttributeFilterElementsSelectNoMatchingData parentFilterTitles={parentFilterTitles} />
            ) : hasNoData ? (
                <AttributeFilterElementsSelectNoData />
            ) : (
                <AttributeFilterElementsSelect
                    isInverted={isWorkingSelectionInverted}
                    isLoading={isLoadingInitialElementsPage}
                    isLoadingNextPage={isLoadingNextElementsPage}
                    items={elements}
                    onLoadNextPage={onLoadNextElementsPage}
                    onSearch={onSearch}
                    onSelect={onSelect}
                    nextPageSize={nextElementsPageSize}
                    searchString={searchString}
                    selectedItems={workingSelectionElements}
                    totalItemsCount={totalElementsCountWithCurrentSettings}
                />
            )}
            <AttributeFilterElementsSelectParentItemsFiltered
                parentFilterTitles={parentFilterTitles}
                showItemsFilteredMessage={showItemsFilteredMessage}
            />
        </>
    );
};
