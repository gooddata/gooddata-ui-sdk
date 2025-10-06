// (C) 2022-2025 GoodData Corporation

import {
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    IAttributeMetadataObject,
    ObjRef,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * AttributeFilter controller state.
 *
 * @public
 */
export type AttributeFilterControllerData = {
    /**
     * Loaded attribute.
     */
    attribute: IAttributeMetadataObject;

    /**
     * Current offset used for the attribute element loading.
     */
    offset: number;

    /**
     * Current limit used for the attribute element loading.
     */
    limit: number;

    /**
     * If true, AttributeFilter is filtering elements.
     */
    isFiltering: boolean;

    /**
     * If true, AttributeFilter is initializing internal data and elements
     */
    isInitializing: boolean;

    /**
     * Error that occurred during the initialization, if any.
     */
    initError?: GoodDataSdkError;

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
    totalElementsCount: number;

    /**
     * Total count of the attribute elements with currently set options.
     */
    totalElementsCountWithCurrentSettings: number;

    /**
     * If true, current selection is considered not valid and should not be applied.
     * The number of selected elements reached the limit of maximum selection size or no elements are selected.
     */
    isSelectionInvalid: boolean;

    /**
     * If true, selection has no changes or the selection si invalid. see {@link AttributeFilterControllerData.isSelectionInvalid}.
     */
    isApplyDisabled: boolean;

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
    currentDisplayAsDisplayFormRef: ObjRef;

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

    enableAttributeFilterVirtualised?: boolean;

    /**
     * Indicates whether the working selection has changed since the last commit.
     */
    isWorkingSelectionChanged?: boolean;
};

/**
 * AttributeFilter controller callbacks.
 *
 * @public
 */
export type AttributeFilterControllerCallbacks = {
    /**
     * Apply changes from working selection to committed selection.
     * @param applyRegardlessWithoutApplySetting - If true, apply changes regardless of the withoutApply setting.
     * @param applyToWorkingOnly - If true, apply changes to working selection only.
     */
    onApply: (applyRegardlessWithoutApplySetting?: boolean, applyToWorkingOnly?: boolean) => void;

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
     * Reset working selection.
     */
    onReset: () => void;

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
 * AttributeFilter controller return type.
 *
 * @public
 */
export type AttributeFilterController = AttributeFilterControllerData & AttributeFilterControllerCallbacks;
