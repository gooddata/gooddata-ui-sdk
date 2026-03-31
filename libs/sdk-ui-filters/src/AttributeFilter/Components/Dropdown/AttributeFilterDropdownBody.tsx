// (C) 2022-2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IAttributeElement } from "@gooddata/sdk-model";
import { ValidationContextStore, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";
import { isEscapeKey, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { type IAttributeFilterDropdownBodyProps } from "./types.js";
import { ATTRIBUTE_FILTER_DROPDOWN_BODY_CLASS, DEFAULT_DROPDOWN_BODY_WIDTH } from "../../constants.js";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext.js";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext.js";
import { MAX_SELECTION_SIZE } from "../../hooks/constants.js";

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
    const { DropdownActionsComponent, ElementsSelectComponent, TextFilterBodyComponent } =
        useAttributeFilterComponentsContext();
    const { withoutApply } = useAttributeFilterContext();
    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");

    const validationContextValue = useValidationContextValue(
        createInvalidNode({ id: "AttributeFilterDropdownBody" }),
    );
    const {
        initialElementsPageError,
        nextElementsPageError,
        isApplyDisabled,
        isSelectionInvalid,
        isWorkingSelectionChanged = false,
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
        disabled,
        // New mode-related fields
        currentSelectionType,
        availableTextSelectionTypes,
        textFilterOperator,
        textFilterValues,
        textFilterLiteral,
        textFilterLiteralEmptyError,
        textFilterValuesEmptyError,
        textFilterValuesLimitReachedWarning,
        textFilterValuesLimitExceededError,
        textFilterCaseSensitive,
        onTextFilterOperatorChange,
        onTextFilterValuesChange,
        onTextFilterValuesBlur,
        onTextFilterLiteralChange,
        onTextFilterLiteralBlur,
        onToggleTextFilterCaseSensitive,
        hideTooltips,
    } = useAttributeFilterContext();

    const parentFilterTitles = useMemo(() => {
        return parentFilterAttributes.map((attr) => attr.title);
    }, [parentFilterAttributes]);

    const applyDisabledTooltip = useMemo(() => {
        if (!isApplyDisabled) {
            return undefined;
        }

        if (!isWorkingSelectionChanged) {
            return intl.formatMessage({
                id: "attributeFilter.text.applyButton.tooltip.noChanges",
            });
        }

        if (currentSelectionType === "text" && textFilterValuesLimitExceededError) {
            return intl.formatMessage(
                {
                    id: "attributeFilter.text.applyButton.tooltip.valuesLimitExceeded",
                },
                { maxValues: MAX_SELECTION_SIZE },
            );
        }

        if (currentSelectionType === "text" && isSelectionInvalid) {
            return intl.formatMessage({
                id: "attributeFilter.text.applyButton.tooltip.emptyValue",
            });
        }

        return undefined;
    }, [
        currentSelectionType,
        intl,
        isApplyDisabled,
        isSelectionInvalid,
        isWorkingSelectionChanged,
        textFilterValuesLimitExceededError,
    ]);

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

    const autocompleteOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    elements
                        .map((el) => el.formattedTitle ?? el.title)
                        .filter((t): t is string => t !== null && t !== undefined),
                ),
            ),
        [elements],
    );

    // Handler for autocomplete search - reuses the existing onSearch infrastructure
    const handleAutocompleteSearch = useCallback(
        (searchString: string) => {
            if (onSearch) {
                onSearch(searchString);
            }
        },
        [onSearch],
    );

    // Render filter body based on mode
    const renderFilterBody = () => {
        if (currentSelectionType === "text") {
            return (
                <TextFilterBodyComponent
                    operator={textFilterOperator ?? "is"}
                    values={textFilterValues ?? []}
                    literal={textFilterLiteral ?? ""}
                    hasLiteralEmptyError={textFilterLiteralEmptyError}
                    hasValuesEmptyError={textFilterValuesEmptyError}
                    hasValuesLimitReachedWarning={textFilterValuesLimitReachedWarning}
                    hasValuesLimitExceededError={textFilterValuesLimitExceededError}
                    caseSensitive={textFilterCaseSensitive ?? false}
                    onOperatorChange={onTextFilterOperatorChange ?? (() => {})}
                    onValuesChange={onTextFilterValuesChange ?? (() => {})}
                    onValuesBlur={onTextFilterValuesBlur}
                    onLiteralChange={onTextFilterLiteralChange ?? (() => {})}
                    onLiteralBlur={onTextFilterLiteralBlur}
                    onToggleCaseSensitive={onToggleTextFilterCaseSensitive ?? (() => {})}
                    attributeTitle={title ?? ""}
                    disabled={disabled}
                    availableTextModes={availableTextSelectionTypes}
                    autocompleteOptions={autocompleteOptions}
                    onAutocompleteSearch={handleAutocompleteSearch}
                    isAutocompleteLoading={isLoadingInitialElementsPage || isLoadingNextElementsPage}
                    hideTooltips={hideTooltips}
                />
            );
        }

        // Default: elements mode
        return (
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
        );
    };

    return (
        <ValidationContextStore value={validationContextValue}>
            <div className={ATTRIBUTE_FILTER_DROPDOWN_BODY_CLASS} style={style} onKeyDown={handleKeyDown}>
                {renderFilterBody()}
                <DropdownActionsComponent
                    onApplyButtonClick={onApplyButtonClick}
                    onCancelButtonClick={onCancelButtonClick}
                    isApplyDisabled={isApplyDisabled}
                    isSelectionChanged={isWorkingSelectionChanged}
                    applyDisabledTooltip={applyDisabledTooltip}
                    withoutApply={withoutApply}
                />
            </div>
        </ValidationContextStore>
    );
}
