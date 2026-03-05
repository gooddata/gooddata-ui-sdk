// (C) 2022-2026 GoodData Corporation

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeFilter,
    type IAttributeMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type AttributeFilterMode, type AttributeFilterTextMode } from "../filterModeTypes.js";
import { type TextFilterOperator } from "../textFilterOperatorUtils.js";

/**
 * Shared filter controller state (common across all modes).
 *
 * @public
 */
export type CommonFilterControllerData = {
    /**
     * Loaded attribute.
     */
    attribute?: IAttributeMetadataObject;

    /**
     * Display forms of the attribute.
     */
    displayForms: IAttributeDisplayFormMetadataObject[];

    /**
     * Current attribute filter display form {@link @gooddata/sdk-model#ObjRef}.
     */
    currentDisplayFormRef: ObjRef;

    /**
     * Current attribute filter display form used for displaying filter's elements {@link @gooddata/sdk-model#ObjRef}.
     */
    currentDisplayAsDisplayFormRef?: ObjRef;

    /**
     * If true, AttributeFilter is initializing internal data and elements
     */
    isInitializing: boolean;

    /**
     * Error that occurred during the initialization, if any.
     */
    initError?: GoodDataSdkError;

    /**
     * If true, AttributeFilter is filtering elements.
     */
    isFiltering: boolean;

    /**
     * If true, current selection is considered not valid and should not be applied.
     * The number of selected elements reached the limit of maximum selection size or no elements are selected.
     */
    isSelectionInvalid: boolean;

    /**
     * If true, selection has no changes or the selection is invalid. See isSelectionInvalid.
     */
    isApplyDisabled: boolean;

    /**
     * Indicates whether the working selection has changed since the last commit.
     */
    isWorkingSelectionChanged?: boolean;
};

/**
 * Elements mode filter controller state.
 *
 * @public
 */
export type ElementsFilterControllerData = {
    /**
     * Current offset used for the attribute element loading.
     */
    offset: number;

    /**
     * Current limit used for the attribute element loading.
     */
    limit: number;

    /**
     * If true, the first elements page is loading.
     */
    isLoadingInitialElementsPage: boolean;

    /**
     * Error that occurred during the initial elements page load, if any.
     */
    initialElementsPageError?: GoodDataSdkError;

    /**
     * If true, the next elements page is loading.
     */
    isLoadingNextElementsPage: boolean;

    /**
     * Error that occurred during the next elements page load, if any.
     */
    nextElementsPageError?: GoodDataSdkError;

    /**
     * Next element page size
     */
    nextElementsPageSize: number;

    /**
     * All attribute elements loaded by initialElementsPageLoad and all nextElementsPageLoad.
     */
    elements: IAttributeElement[];

    /**
     * Total count of the attribute elements.
     */
    totalElementsCount: number | undefined;

    /**
     * Total count of the attribute elements with currently set options.
     */
    totalElementsCountWithCurrentSettings: number | undefined;

    /**
     * If true, the current working selection is inverted.
     */
    isWorkingSelectionInverted: boolean;

    /**
     * List of all elements in current working selection.
     */
    workingSelectionElements: IAttributeElement[];

    /**
     * If true, the committed selection is inverted.
     */
    isCommittedSelectionInverted: boolean;

    /**
     * List of all elements in committed selection.
     */
    committedSelectionElements: IAttributeElement[];

    /**
     * Current search string.
     */
    searchString: string;

    /**
     * If true, AttributeFilter is filtering elements by parent filters.
     */
    isFilteredByParentFilters: boolean;

    /**
     * List of parent filters Attributes.
     */
    parentFilterAttributes: IAttributeMetadataObject[];

    /**
     * This enables "show filtered elements" option which manages showing filtered elements.
     */
    enableShowingFilteredElements?: boolean;

    /**
     * Irrelevant/filtered out selection elements which are still effective.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    irrelevantSelection?: IAttributeElement[];

    /**
     * Current validation items used to limit attribute filter elements.
     */
    limitingValidationItems?: ObjRef[];

    /**
     * If true, AttributeFilter is filtering elements by validation items.
     */
    isFilteredByLimitingValidationItems?: boolean;

    /**
     * If true, AttributeFilter is filtering elements by dependent date filters.
     *
     * @beta
     */
    isFilteredByDependentDateFilters?: boolean;
};

/**
 * Text mode filter controller state.
 *
 * @public
 */
export type TextFilterControllerData = {
    /**
     * Text filter mode - current operator.
     *
     * @alpha
     */
    textFilterOperator: TextFilterOperator;

    /**
     * Text filter mode - values for "is/is not" operators (chips).
     * Values can be null to represent empty/missing values.
     *
     * @alpha
     */
    textFilterValues?: Array<string | null>;

    /**
     * Text filter mode - literal for like operators.
     *
     * @alpha
     */
    textFilterLiteral?: string;

    /**
     * Text filter mode - true when empty literal validation should be shown.
     *
     * @alpha
     */
    textFilterLiteralEmptyError?: boolean;

    /**
     * Text filter mode - true when empty arbitrary values validation should be shown.
     *
     * @alpha
     */
    textFilterValuesEmptyError?: boolean;

    /**
     * Text filter mode - true when at value limit (warning shown, Apply enabled).
     *
     * @alpha
     */
    textFilterValuesLimitReachedWarning?: boolean;

    /**
     * Text filter mode - true when value limit exceeded (error shown, Apply disabled).
     *
     * @alpha
     */
    textFilterValuesLimitExceededError?: boolean;

    /**
     * Text filter mode - case sensitivity for like operators.
     *
     * @alpha
     */
    textFilterCaseSensitive?: boolean;

    /**
     * Text filter mode - committed/applied filter snapshot.
     *
     * @alpha
     */
    textFilterCommittedFilter?: IAttributeFilter;
};

/**
 * Filter mode state (elements vs text mode switching).
 *
 * @public
 */
export type FilterModeControllerData = {
    /**
     * Current filter mode (derived from filter type).
     *
     * @alpha
     */
    currentFilterMode: AttributeFilterMode;

    /**
     * Available internal filter modes for menu rendering.
     *
     * @alpha
     */
    availableInternalFilterModes?: AttributeFilterMode[];

    /**
     * Available text filter sub-modes.
     *
     * @alpha
     */
    availableTextFilterModes?: AttributeFilterTextMode[];
};

/**
 * AttributeFilter controller state.
 *
 * @public
 */
export type AttributeFilterControllerData = CommonFilterControllerData &
    ElementsFilterControllerData &
    FilterModeControllerData &
    Partial<TextFilterControllerData>;

/**
 * Shared filter controller callbacks (common across all modes).
 *
 * @public
 */
export type CommonFilterControllerCallbacks = {
    /**
     * Apply changes from working selection to committed selection.
     * @param applyRegardlessWithoutApplySetting - If true, apply changes regardless of the withoutApply setting.
     * @param applyToWorkingOnly - If true, apply changes to working selection only.
     */
    onApply: (applyRegardlessWithoutApplySetting?: boolean, applyToWorkingOnly?: boolean) => void;

    /**
     * Reset working selection.
     */
    onReset: () => void;

    /**
     * Load sample elements for the details tooltip bubble.
     * Returns up to 5 elements and total count for the given display form.
     *
     * @alpha
     */
    filterDetailRequestHandler?: (
        labelRef: ObjRef,
    ) => Promise<{ elements: IAttributeElement[]; totalCount: number }>;
};

/**
 * Elements mode filter controller callbacks.
 *
 * @public
 */
export type ElementsFilterControllerCallbacks = {
    /**
     * Request next page of elements that respect current search criteria.
     */
    onLoadNextElementsPage: () => void;

    /**
     * Search elements.
     */
    onSearch: (search: string) => void;

    /**
     * Change working selection.
     */
    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;

    /**
     * Filter open callback.
     */
    onOpen: () => void;

    /**
     * Request to see filtered elements when some are filtered out by limiting filters.
     */
    onShowFilteredElements: () => void;

    /**
     * Clear irrelevant/filtered out selection callback.
     */
    onClearIrrelevantSelection: () => void;
};

/**
 * Text mode filter controller callbacks.
 *
 * @public
 */
export type TextFilterControllerCallbacks = {
    /**
     * Text mode - change operator.
     *
     * @alpha
     */
    onTextFilterOperatorChange?: (operator: TextFilterOperator) => void;

    /**
     * Text mode - change values (for is/is not operators).
     *
     * @alpha
     */
    onTextFilterValuesChange?: (values: Array<string | null>) => void;

    /**
     * Text mode - change literal (for like operators).
     *
     * @alpha
     */
    onTextFilterLiteralChange?: (literal: string) => void;

    /**
     * Text mode - mark literal field as touched (used for blur validation).
     *
     * @alpha
     */
    onTextFilterLiteralBlur?: () => void;

    /**
     * Text mode - mark arbitrary values field as touched (used for blur validation).
     *
     * @alpha
     */
    onTextFilterValuesBlur?: () => void;

    /**
     * Text mode - toggle case sensitivity.
     *
     * @alpha
     */
    onToggleTextFilterCaseSensitive?: () => void;

    /**
     * Text mode - commit current draft as applied state.
     *
     * @alpha
     */
    onCommitTextFilter?: () => void;
};

/**
 * Filter mode callbacks (elements vs text mode switching).
 *
 * @public
 */
export type FilterModeControllerCallbacks = {
    /**
     * Switch filter mode callback.
     * Resets filter to empty state of new mode.
     *
     * @alpha
     */
    onFilterModeChange?: (newMode: AttributeFilterMode) => void;

    /**
     * Change the display form (attribute label) used for filter values.
     *
     * @alpha
     */
    setDisplayForm?: (displayFormRef: ObjRef) => void;

    /**
     * Imperatively reset controller state to new filter (used during mode switch).
     *
     * @internal
     */
    resetForModeSwitch?: (newFilter: IAttributeFilter, newDisplayAsLabel?: ObjRef) => void;
};

/**
 * AttributeFilter controller callbacks.
 *
 * @public
 */
export type AttributeFilterControllerCallbacks = CommonFilterControllerCallbacks &
    ElementsFilterControllerCallbacks &
    TextFilterControllerCallbacks &
    FilterModeControllerCallbacks;

/**
 * AttributeFilter controller return type.
 *
 * @public
 */
export type AttributeFilterController = AttributeFilterControllerData & AttributeFilterControllerCallbacks;

/**
 * Elements mode controller return type.
 *
 * @internal
 */
export type ElementsFilterController = CommonFilterControllerData &
    ElementsFilterControllerData &
    CommonFilterControllerCallbacks &
    ElementsFilterControllerCallbacks &
    Pick<FilterModeControllerCallbacks, "setDisplayForm" | "resetForModeSwitch">;

/**
 * Text mode controller return type.
 * Only text-specific data and callbacks; root controller merges with common data and elements stubs.
 *
 * @internal
 */
export type TextFilterController = TextFilterControllerCallbacks & {
    currentDisplayFormRef: ObjRef;
    isApplyDisabled: boolean;
    isTextFilterInvalid: boolean;
    isWorkingSelectionChanged?: boolean;
    textFilterOperator: TextFilterOperator;
    textFilterValues?: Array<string | null>;
    textFilterLiteral?: string;
    textFilterLiteralEmptyError?: boolean;
    textFilterValuesEmptyError?: boolean;
    textFilterValuesLimitReachedWarning?: boolean;
    textFilterValuesLimitExceededError?: boolean;
    textFilterCaseSensitive?: boolean;
    textFilterCommittedFilter?: IAttributeFilter;
    syncFromFilter?: (nextFilter: IAttributeFilter, updateCommitted?: boolean) => void;
    onResetForDisplayFormChange?: (newDisplayFormRef: ObjRef) => void;
    resetForModeSwitch?: (newFilter: IAttributeFilter) => void;
    onCommitTextFilter?: () => void;
    onReset?: () => void;
    setDisplayForm?: (displayFormRef: ObjRef) => void;
};
