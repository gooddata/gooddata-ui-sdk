// (C) 2022 GoodData Corporation
import React, { useMemo } from "react";
import { useMediaQuery } from "@gooddata/sdk-ui-kit";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext";
import { IAttributeFilterDropdownBodyProps } from "./types";
import { DEFAULT_DROPDOWN_BODY_WIDTH } from "../../constants";

/**
 * @internal
 */
export const AttributeFilterDropdownBody: React.FC<IAttributeFilterDropdownBodyProps> = (props) => {
    const { onApplyButtonClick, onCancelButtonClick, width = DEFAULT_DROPDOWN_BODY_WIDTH } = props;

    const { DropdownActionsComponent, ElementsSelectComponent } = useAttributeFilterComponentsContext();

    const isMobile = useMediaQuery("mobileDevice");

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

    const usedWidth = !isMobile ? width : "100%";
    const style = { width: usedWidth };

    return (
        <div className="gd-attribute-filter-dropdown-body__next" style={style}>
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
                onCancelButtonClick={onCancelButtonClick}
                isApplyDisabled={isApplyDisabled}
            />
        </div>
    );
};
