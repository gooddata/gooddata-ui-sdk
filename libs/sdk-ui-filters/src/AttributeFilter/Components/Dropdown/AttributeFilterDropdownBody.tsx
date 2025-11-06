// (C) 2022-2025 GoodData Corporation

import { KeyboardEvent, useCallback, useMemo } from "react";

import { IAttributeElement } from "@gooddata/sdk-model";
import { isEscapeKey, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { IAttributeFilterDropdownBodyProps } from "./types.js";
import { DEFAULT_DROPDOWN_BODY_WIDTH } from "../../constants.js";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext.js";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext.js";

/**
 * Component showing a list of elements and controls for manipulating the selection.
 *
 * @remarks
 * It uses a component using the {@link IAttributeFilterElementsSelectProps} props for search and manipulation of filter selection
 * and a component using the {@link IAttributeFilterDropdownActionsProps} props to confirm or cancel changes.
 *
 * @beta
 */
export function AttributeFilterDropdownBody({
    onApplyButtonClick,
    onCancelButtonClick,
    width = DEFAULT_DROPDOWN_BODY_WIDTH,
}: IAttributeFilterDropdownBodyProps) {
    const { DropdownActionsComponent, ElementsSelectComponent } = useAttributeFilterComponentsContext();
    const { withoutApply } = useAttributeFilterContext();
    const isMobile = useMediaQuery("mobileDevice");

    const {
        initialElementsPageError,
        nextElementsPageError,
        isApplyDisabled,
        isWorkingSelectionChanged,
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
        isFilteredByDependentDateFilters,
        isFilteredByLimitingValidationItems,
        fullscreenOnMobile,
        selectionMode,
        title,
        enableShowingFilteredElements,
        onShowFilteredElements,
        irrelevantSelection,
        onClearIrrelevantSelection,
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

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (isEscapeKey(e)) {
                e.stopPropagation();
                onCancelButtonClick();
            }
        },
        [onCancelButtonClick],
    );

    return (
        <div className="gd-attribute-filter-dropdown-body__next" style={style} onKeyDown={handleKeyDown}>
            <ElementsSelectComponent
                isInverted={isWorkingSelectionInverted}
                isLoading={isLoadingInitialElementsPage}
                isLoadingNextPage={isLoadingNextElementsPage}
                items={elements}
                onLoadNextPage={onLoadNextElementsPage}
                onSearch={onSearch}
                onSelect={onSelectWithPotentialClose}
                onApplyButtonClick={onApplyButtonClick}
                isApplyDisabled={isApplyDisabled}
                nextPageSize={nextElementsPageSize}
                searchString={searchString}
                selectedItems={workingSelectionElements}
                totalItemsCount={totalElementsCount}
                totalItemsCountWithCurrentSettings={totalElementsCountWithCurrentSettings}
                parentFilterTitles={parentFilterTitles}
                isFilteredByParentFilters={isFilteredByParentFilters}
                error={initialElementsPageError ?? nextElementsPageError}
                attributeTitle={title}
                enableShowingFilteredElements={enableShowingFilteredElements}
                isFilteredByDependentDateFilters={isFilteredByDependentDateFilters}
                isFilteredByLimitingValidationItems={isFilteredByLimitingValidationItems}
                onShowFilteredElements={onShowFilteredElements}
                irrelevantSelection={irrelevantSelection}
                onClearIrrelevantSelection={onClearIrrelevantSelection}
                withoutApply={withoutApply}
            />
            <DropdownActionsComponent
                onApplyButtonClick={onApplyButtonClick}
                onCancelButtonClick={onCancelButtonClick}
                isApplyDisabled={isApplyDisabled}
                isSelectionChanged={isWorkingSelectionChanged}
                withoutApply={withoutApply}
            />
        </div>
    );
}
