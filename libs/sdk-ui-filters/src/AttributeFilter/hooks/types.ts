// (C) 2022 GoodData Corporation

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
    initError: GoodDataSdkError;

    /**
     * If true, the first elements page is loading.
     */
    isLoadingInitialElementsPage: boolean;

    /**
     * Error that occurred during the initial elements page load, if any.
     */
    initialElementsPageError: GoodDataSdkError;

    /**
     * If true, the next elements page is loading.
     */
    isLoadingNextElementsPage: boolean;

    /**
     * Error that occurred during the next elements page load, if any.
     */
    nextElementsPageError: GoodDataSdkError;

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
     * If true, selection has changes or the number of selected elements reached the limit of maximum selection size.
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
};

/**
 * AttributeFilter controller callbacks.
 *
 * @public
 */
export type AttributeFilterControllerCallbacks = {
    /**
     * Apply changes from working selection to committed selection.
     */
    onApply: () => void;

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
};

/**
 * AttributeFilter controller return type.
 *
 * @public
 */
export type AttributeFilterController = AttributeFilterControllerData & AttributeFilterControllerCallbacks;
