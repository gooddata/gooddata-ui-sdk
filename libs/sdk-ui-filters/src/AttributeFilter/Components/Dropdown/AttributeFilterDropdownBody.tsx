// (C) 2022-2023 GoodData Corporation
import React, { useMemo, useCallback } from "react";
import { useMediaQuery } from "@gooddata/sdk-ui-kit";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext.js";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext.js";
import { IAttributeFilterDropdownBodyProps } from "./types.js";
import { DEFAULT_DROPDOWN_BODY_WIDTH } from "../../constants.js";
import { IAttributeElement } from "@gooddata/sdk-model";

/**
 * Component showing a list of elements and controls for manipulating the selection.
 *
 * @remarks
 * It uses a component using the {@link IAttributeFilterElementsSelectProps} props for search and manipulation of filter selection
 * and a component using the {@link IAttributeFilterDropdownActionsProps} props to confirm or cancel changes.
 *
 * @beta
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
        fullscreenOnMobile,
        selectionMode,
    } = useAttributeFilterContext();

    const parentFilterTitles = useMemo(() => {
        return parentFilterAttributes.map((attr) => attr.title);
    }, [parentFilterAttributes]);

    const usedWidth = isMobile && fullscreenOnMobile ? "100%" : width;
    const style = { width: usedWidth };

    const onSelectWithPotentialClose = useCallback(
        (selectedItems: IAttributeElement[], isInverted: boolean) => {
            onSelect(selectedItems, isInverted);
            if (selectionMode === "single") {
                onApplyButtonClick();
            }
        },
        [onSelect, onApplyButtonClick, selectionMode],
    );

    return (
        <div className="gd-attribute-filter-dropdown-body__next" style={style}>
            <ElementsSelectComponent
                isInverted={isWorkingSelectionInverted}
                isLoading={isLoadingInitialElementsPage}
                isLoadingNextPage={isLoadingNextElementsPage}
                items={elements}
                onLoadNextPage={onLoadNextElementsPage}
                onSearch={onSearch}
                onSelect={onSelectWithPotentialClose}
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
