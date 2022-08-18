// (C) 2022 GoodData Corporation
import React, { useMemo } from "react";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext";
import { IAttributeFilterDropdownBodyProps } from "./types";

/**
 * @internal
 */
export const AttributeFilterDropdownBody: React.FC<IAttributeFilterDropdownBodyProps> = (props) => {
    const { onApplyButtonClick, onCloseButtonClick } = props;

    const { DropdownActionsComponent, ElementsSelectComponent } = useAttributeFilterComponentsContext();

    const {
        initialElementsPageError,
        nextElementsPageError,
        isApplyDisabled,
        isWorkingSelectionInverted,
        isLoadingInitialElementsPage,
        isLoadingNextElementsPage,
        onLoadNextElementsPage,
        elements,
        onSearch,
        onSelect,
        nextElementsPageSize,
        searchString,
        totalElementsCount,
        totalElementsCountWithCurrentSettings,
        workingSelectionElements,
        parentFilterAttributes,
        isFilteredByParentFilters,
    } = useAttributeFilterContext();

    const parentFilterTitles = useMemo(() => {
        return parentFilterAttributes.map((attr) => attr.title);
    }, [parentFilterAttributes]);

    return (
        <div className="gd-attribute-filter-dropdown-body__next">
            <ElementsSelectComponent
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
                totalItemsCount={totalElementsCount}
                totalItemsCountWithCurrentSettings={totalElementsCountWithCurrentSettings}
                parentFilterTitles={parentFilterTitles}
                isFilteredByParentFilters={isFilteredByParentFilters}
                error={initialElementsPageError ?? nextElementsPageError}
            />
            <DropdownActionsComponent
                onApplyButtonClick={onApplyButtonClick}
                onCloseButtonClick={onCloseButtonClick}
                isApplyDisabled={isApplyDisabled}
            />
        </div>
    );
};
