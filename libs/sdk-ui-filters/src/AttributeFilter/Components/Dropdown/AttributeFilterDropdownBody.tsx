// (C) 2022-2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IAttributeElement, areObjRefsEqual } from "@gooddata/sdk-model";
import { isEscapeKey, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { AttributeFilterDropdownHeader } from "./AttributeFilterDropdownHeader.js";
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
    const {
        withoutApply,
        attribute,
        displayForms,
        currentDisplayFormRef,
        currentDisplayAsDisplayFormRef,
        filterDetailRequestHandler,
        setDisplayForm,
    } = useAttributeFilterContext();
    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");

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
        currentFilterMode,
        availableInternalFilterModes,
        availableTextFilterModes,
        textFilterOperator,
        textFilterValues,
        textFilterLiteral,
        textFilterLiteralEmptyError,
        textFilterValuesEmptyError,
        textFilterValuesLimitReachedWarning,
        textFilterValuesLimitExceededError,
        textFilterCaseSensitive,
        onFilterModeChange,
        onTextFilterOperatorChange,
        onTextFilterValuesChange,
        onTextFilterValuesBlur,
        onTextFilterLiteralChange,
        onTextFilterLiteralBlur,
        onToggleTextFilterCaseSensitive,
    } = useAttributeFilterContext();

    const parentFilterTitles = useMemo(() => {
        return parentFilterAttributes.map((attr) => attr.title);
    }, [parentFilterAttributes]);

    const currentLabel = useMemo(() => {
        return displayForms.find((df) => areObjRefsEqual(df.ref, currentDisplayFormRef));
    }, [displayForms, currentDisplayFormRef]);

    const applyDisabledTooltip = useMemo(() => {
        if (!isApplyDisabled) {
            return undefined;
        }

        if (!isWorkingSelectionChanged) {
            return intl.formatMessage({
                id: "attributeFilter.text.applyButton.tooltip.noChanges",
            });
        }

        if (currentFilterMode === "text" && textFilterValuesLimitExceededError) {
            return intl.formatMessage(
                {
                    id: "attributeFilter.text.applyButton.tooltip.valuesLimitExceeded",
                },
                { maxValues: MAX_SELECTION_SIZE },
            );
        }

        if (currentFilterMode === "text" && isSelectionInvalid) {
            return intl.formatMessage({
                id: "attributeFilter.text.applyButton.tooltip.emptyValue",
            });
        }

        return undefined;
    }, [
        currentFilterMode,
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
            elements
                .map((el) => el.formattedTitle ?? el.title)
                .filter((t): t is string => t !== null && t !== undefined),
        [elements],
    );

    // Render filter body based on mode
    const renderFilterBody = () => {
        if (currentFilterMode === "text") {
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
                    availableTextModes={availableTextFilterModes}
                    autocompleteOptions={autocompleteOptions}
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

    const totalAvailableModes = availableInternalFilterModes?.length ?? 0;
    const showFilterHeader =
        totalAvailableModes > 1 &&
        ((onFilterModeChange && (availableInternalFilterModes?.length ?? 0) > 1) ||
            (displayForms.length > 1 && setDisplayForm));

    return (
        <div className={ATTRIBUTE_FILTER_DROPDOWN_BODY_CLASS} style={style} onKeyDown={handleKeyDown}>
            {showFilterHeader ? (
                <AttributeFilterDropdownHeader
                    title={title}
                    currentFilterMode={currentFilterMode}
                    availableInternalFilterModes={availableInternalFilterModes}
                    onFilterModeChange={onFilterModeChange}
                    attribute={attribute}
                    label={currentLabel}
                    requestHandler={filterDetailRequestHandler}
                    labels={displayForms}
                    selectedLabelRef={currentDisplayAsDisplayFormRef ?? currentDisplayFormRef}
                    onLabelChange={setDisplayForm}
                />
            ) : null}
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
    );
}
