// (C) 2022-2025 GoodData Corporation
import {
    ElementsQueryOptionsElementsSpecification,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    IAbsoluteDateFilter,
    IAttributeElement,
    IAttributeMetadataObject,
    IMeasure,
    IRelativeDateFilter,
    ObjRef,
    SortDirection,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    AsyncOperationStatus,
    AttributeElementKey,
    CallbackPayloadWithCorrelation,
    CallbackRegistration,
    Correlation,
} from "./common.js";

/**
 * Result of the attribute elements load along with the options that were applied for it.
 *
 * @public
 */
export interface ILoadElementsResult {
    elements: IAttributeElement[];
    totalCount: number;
    options: ILoadElementsOptions;
    cacheId?: string;
}

/**
 * Result of checking for irrelevant subset of selection.
 *
 * @public
 */
export interface ILoadIrrelevantElementsResult {
    elementTitles: string[];
}

/**
 * Options that can be applied for the particular load of the attribute elements.
 *
 * @public
 */
export interface ILoadElementsOptions {
    offset?: number;
    limit?: number;
    search?: string;
    order?: SortDirection;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingMeasures?: IMeasure[];
    limitingDateFilters?: IRelativeDateFilter[] | IAbsoluteDateFilter[];
    limitingValidationItems?: ObjRef[];
    elements?: ElementsQueryOptionsElementsSpecification;
    includeTotalCountWithoutFilters?: boolean;
    excludePrimaryLabel?: boolean;
    filterByPrimaryLabel?: boolean;
}

/**
 * Handles the loading of the attribute elements.
 *
 * @public
 */
export interface IAttributeElementLoader {
    /**
     * Resets the paging and loads the attribute elements with the current options.
     *
     * @remarks
     * You should call this every time you change the load options (eg search, limit, limitingAttribute filters, etc).
     *
     * Throws error if you call it before the initialization.
     *
     * Throws error if you combine staticElements with unsupported elements load options (limitingAttributeFilters, limitingMeasures or limitingDateFilters).
     *
     * Cancels the running initial elements page load, if any, and starts it again.
     *
     * Cancels the running next elements page load, if any.
     *
     * You can provide a correlation that will be included in the payload of all callbacks fired as a result of calling this method.
     *
     * @param correlation - correlation that will be included in all callbacks fired by this method
     */
    loadInitialElementsPage(correlation?: Correlation): void;

    /**
     * Cancels the running initial elements page load, if any.
     */
    cancelInitialElementsPageLoad(): void;

    /**
     * Loads next page of the attribute elements with the current options.
     *
     * @remarks
     * Throws error if you call it before the initialization.
     *
     * Throws error if you changed the load options and did not called loadInitialElementsPage before.
     *
     * Cancels the running next elements page load, if any, and starts it again.
     *
     * You can provide a correlation that will be included in the payload of all callbacks fired as a result of calling this method.
     *
     * @param correlation - correlation that will be included in all callbacks fired by this method
     */
    loadNextElementsPage(correlation?: Correlation): void;

    /**
     * Cancels the running next elements page load, if any.
     */
    cancelNextElementsPageLoad(): void;

    /**
     * Loads the attribute elements with the provided options.
     *
     * @remarks
     * This is useful, if you want to load additional attribute elements with different options than the currently set.
     *
     * Multiple custom elements loads will run in parallel.
     *
     * Cancels the running custom elements load, if it matches the specified correlation, and starts it again.
     *
     * You can provide a correlation that will be included in the payload of all callbacks fired as a result of calling this method.
     *
     * @param options - options to apply for the custom elements load
     * @param correlation - correlation that will be included in all callbacks fired by this method
     */
    loadCustomElements(options: ILoadElementsOptions, correlation?: Correlation): void;

    /**
     * Cancels the running custom elements load, if it matches the specified correlation.
     */
    cancelCustomElementsLoad(correlation?: Correlation): void;

    /**
     * Loads the irrelevant subset of currently selected elements.
     *
     * Irrelevant elements are the selected elements that may be filtered out by limiting filters.
     *
     * @remarks
     * This is useful, if you want to load additional irrelevant elements with different options than the currently set.
     *
     * Multiple loads will run in parallel.
     *
     * Cancels the running irrelevant elements load, if it matches the specified correlation, and starts it again.
     *
     * You can provide a correlation that will be included in the payload of all callbacks fired as a result of calling this method.
     *
     * @param correlation - correlation that will be included in all callbacks fired by this method
     */
    loadIrrelevantElements(correlation?: Correlation): void;

    /**
     * Cancels the running irrelevant elements load, if it matches the specified correlation.
     */
    cancelIrrelevantElementsLoad(correlation?: Correlation): void;

    /**
     * Set attribute's display form
     */
    setDisplayForm(displayForm: ObjRef): void;

    /**
     * Set the label used for representing the attribute filter elements visually.
     */
    setDisplayAsLabel(displayAsLabel: ObjRef): void;

    /**
     * Get the label used for representing the attribute filter elements visually if defined.
     */
    getDisplayAsLabel(): ObjRef | undefined;

    /**
     * Set the limit for the upcoming attribute element loads.
     *
     * @remarks
     * When you change the options for the attribute element loads, you should call initial elements page load.
     *
     * @param limit - the limit to use.
     */
    setLimit(limit: number): void;

    /**
     * Set the order for the upcoming attribute element loads.
     *
     * @remarks
     * When you change the options for the attribute element loads, you should call initial elements page load.
     *
     * @param order - the order to use.
     */
    setOrder(order: SortDirection): void;

    /**
     * Set the search to filter the upcoming attribute element loads.
     *
     * @remarks
     * When you change the options for the attribute element loads, you should call initial elements page load.
     *
     * @param search - the search string to use. Use empty string to reset search.
     */
    setSearch(search: string): void;

    /**
     * Set the measures to filter the upcoming attribute element loads.
     *
     * @remarks
     * When you change the options for the attribute element loads, you should call initial elements page load.
     *
     * @param measures - measures to use.
     */
    setLimitingMeasures(measures: IMeasure[]): void;

    /**
     * Set the validation items to filter the upcoming attribute element loads.
     *
     * @remarks
     * When you change the options for the attribute element loads, you should call initial elements page load.
     *
     * Throws error when the backend implementation does not support elements validation filtering.
     *
     * @param validateBy - measures to use.
     */
    setLimitingValidationItems(validateBy: ObjRef[]): void;

    /**
     * Set the attribute filters to filter the upcoming attribute element loads.
     *
     * @remarks
     * When you change the options for the attribute element loads, you should call initial elements page load.
     *
     * Throws error when the backend implementation does not support parent filtering.
     *
     * @param filters - filters to use.
     */
    setLimitingAttributeFilters(filters: IElementsQueryAttributeFilter[]): void;

    /**
     * Set the date filters to filter the upcoming attribute element loads.
     *
     * @remarks
     * When you change the options for the attribute element loads, you should call initial elements page load.
     *
     * @param filters - filters to use.
     */
    setLimitingDateFilters(filters: (IRelativeDateFilter | IAbsoluteDateFilter)[]): void;

    /**
     * Returns the current offset used for the attribute element loads.
     */
    getOffset(): number;

    /**
     * Returns the current limit used for the attribute element loads.
     */
    getLimit(): number;

    /**
     * Returns the current order used for the attribute element loads.
     */
    getOrder(): SortDirection | undefined;

    /**
     * Returns the current search string used to filter the attribute element loads.
     */
    getSearch(): string;

    /**
     * Returns the current measures used to filter the attribute element loads.
     */
    getLimitingMeasures(): IMeasure[];

    /**
     * Returns the current attribute filters used to filter the attribute element loads.
     */
    getLimitingAttributeFilters(): IElementsQueryAttributeFilter[];

    /**
     * Return the current validation items used to filter the attribute element loads.
     */
    getLimitingValidationItems(): ObjRef[];

    /**
     * Returns the current date filters used to filter the attribute element loads.
     */
    getLimitingDateFilters(): (IRelativeDateFilter | IAbsoluteDateFilter)[];

    /**
     * Returns all attribute elements loaded by initialElementsPageLoad and nextElementsPageLoad methods.
     *
     * @remarks
     * It does not return attribute elements loaded by loadCustomElements method.
     * To get them, you should use callbacks or getElementsByKey method.
     *
     */
    getAllElements(): IAttributeElement[];

    /**
     * Returns the attribute elements for the specified keys.
     *
     * @remarks
     * If the attribute elements for the specified keys are not loaded, error is thrown.
     */
    getElementsByKey(keys: AttributeElementKey[]): IAttributeElement[];

    /**
     * Returns the total count of the attribute elements.
     * Total elements count is loaded by default only for child filters.
     */
    getTotalElementsCount(): number;

    /**
     * Starts load of total count
     * @param correlation - correlation that will be included in all callbacks fired by this method
     */
    initTotalCount(correlation?: Correlation): void;

    /**
     * Returns the current status of the total count initialization.
     */
    getInitTotalCountStatus(): AsyncOperationStatus;

    /**
     * Returns error, if it was thrown during the total count initialization, undefined otherwise.
     */
    getInitTotalCountError(): GoodDataSdkError | undefined;

    /**
     * Registers a callback that will be fired when the initialization of total count starts.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * @param callback - callback to run
     */
    onInitTotalCountStart: CallbackRegistration<OnInitTotalCountStartCallbackPayload>;

    /**
     * Registers a callback that will be fired when the initialization of total count
     * is successfully completed.
     * Returns unsubscribe function, that will unregister it.
     *
     * @param callback - callback to run
     */
    onInitTotalCountSuccess: CallbackRegistration<OnInitTotalCountSuccessCallbackPayload>;

    /**
     * Registers a callback that will be fired when error is thrown during the total count initialization.
     * Returns unsubscribe function, that will unregister it.
     *
     * @param callback - callback to run
     */
    onInitTotalCountError: CallbackRegistration<OnInitTotalCountErrorCallbackPayload>;

    /**
     * Registers a callback that will be fired when the initialization of total count was canceled.
     * Returns unsubscribe function, that will unregister it.
     *
     * @param callback - callback to run
     */
    onInitTotalCountCancel: CallbackRegistration<OnInitTotalCountCancelCallbackPayload>;

    /**
     * Returns the total count of the attribute elements with currently set options.
     */
    getTotalElementsCountWithCurrentSettings(): number;

    /**
     * Returns the current status of the initial elements page load.
     */
    getInitialElementsPageStatus(): AsyncOperationStatus;

    /**
     * Returns error, if it was thrown during the initial elements page load, undefined otherwise.
     */
    getInitialElementsPageError(): GoodDataSdkError | undefined;

    /**
     * Returns the current status of the next elements page load.
     */
    getNextElementsPageStatus(): AsyncOperationStatus;

    /**
     * Returns error, if it was thrown during the next elements page load, undefined otherwise.
     */
    getNextElementsPageError(): GoodDataSdkError | undefined;

    /**
     * Returns metadata of the attributes set by {@link IAttributeElementLoader.setLimitingAttributeFilters}.
     *
     * Note that these attributes will be available only after successful initialization,
     * or after successful {@link IAttributeElementLoader.loadInitialElementsPage} load.
     */
    getLimitingAttributeFiltersAttributes(): IAttributeMetadataObject[];

    /**
     * Registers a callback that will be fired when the initial elements page load starts.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadInitialElementsPageStart: CallbackRegistration<OnLoadInitialElementsPageStartCallbackPayload>;

    /**
     * Registers a callback that will be fired when the initial elements page load is successfuly completed.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadInitialElementsPageSuccess: CallbackRegistration<OnLoadInitialElementsPageSuccessCallbackPayload>;

    /**
     * Registers a callback that will be fired when error is thrown during the initial elements page load.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadInitialElementsPageError: CallbackRegistration<OnLoadInitialElementsPageErrorCallbackPayload>;

    /**
     * Registers a callback that will be fired when the initial elements page load was canceled.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadInitialElementsPageCancel: CallbackRegistration<OnLoadInitialElementsPageCancelCallbackPayload>;

    /**
     * Registers a callback that will be fired when the next elements page load starts.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadNextElementsPageStart: CallbackRegistration<OnLoadNextElementsPageStartCallbackPayload>;

    /**
     * Registers a callback that will be fired when the next elements page load is successfuly completed.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadNextElementsPageSuccess: CallbackRegistration<OnLoadNextElementsPageSuccessCallbackPayload>;

    /**
     * Registers a callback that will be fired when error is thrown during the next elements page load.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadNextElementsPageError: CallbackRegistration<OnLoadNextElementsPageErrorCallbackPayload>;

    /**
     * Registers a callback that will be fired when the next elements page load was canceled.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadNextElementsPageCancel: CallbackRegistration<OnLoadNextElementsPageCancelCallbackPayload>;

    /**
     * Registers a callback that will be fired when the custom elements load starts.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadCustomElementsStart: CallbackRegistration<OnLoadCustomElementsStartCallbackPayload>;

    /**
     * Registers a callback that will be fired when the custom elements load is successfuly completed.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadCustomElementsSuccess: CallbackRegistration<OnLoadCustomElementsSuccessCallbackPayload>;

    /**
     * Registers a callback that will be fired when error is thrown during the custom elements load.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadCustomElementsError: CallbackRegistration<OnLoadCustomElementsErrorCallbackPayload>;

    /**
     * Registers a callback that will be fired when the custom elements load was canceled.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadCustomElementsCancel: CallbackRegistration<OnLoadCustomElementsCancelCallbackPayload>;

    /**
     * Registers a callback that will be fired when the irrelevant elements load starts.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadIrrelevantElementsStart: CallbackRegistration<OnLoadIrrelevantElementsStartCallbackPayload>;

    /**
     * Registers a callback that will be fired when the irrelevant elements load is successfuly completed.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadIrrelevantElementsSuccess: CallbackRegistration<OnLoadIrrelevantElementsSuccessCallbackPayload>;

    /**
     * Registers a callback that will be fired when error is thrown during the irrelevant elements load.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadIrrelevantElementsError: CallbackRegistration<OnLoadIrrelevantElementsErrorCallbackPayload>;

    /**
     * Registers a callback that will be fired when the irrelevant elements load was canceled.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadIrrelevantElementsCancel: CallbackRegistration<OnLoadIrrelevantElementsCancelCallbackPayload>;
}

/**
 * Payload of the onLoadInitialElementsPageStart callback.
 *
 * @public
 */
export type OnLoadInitialElementsPageStartCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onLoadInitialElementsPageSuccess callback.
 *
 * @public
 */
export type OnLoadInitialElementsPageSuccessCallbackPayload =
    CallbackPayloadWithCorrelation<ILoadElementsResult>;

/**
 * Payload of the onLoadInitialElementsPageError callback.
 *
 * @public
 */
export type OnLoadInitialElementsPageErrorCallbackPayload = CallbackPayloadWithCorrelation<{
    error: GoodDataSdkError;
}>;

/**
 * Payload of the onLoadInitialElementsPageCancel callback.
 *
 * @public
 */
export type OnLoadInitialElementsPageCancelCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onLoadNextElementsPageStart callback.
 *
 * @public
 */
export type OnLoadNextElementsPageStartCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onLoadNextElementsPageSuccess callback.
 *
 * @public
 */
export type OnLoadNextElementsPageSuccessCallbackPayload =
    CallbackPayloadWithCorrelation<ILoadElementsResult>;

/**
 * Payload of the onLoadNextElementsPageError callback.
 *
 * @public
 */
export type OnLoadNextElementsPageErrorCallbackPayload = CallbackPayloadWithCorrelation<{
    error: GoodDataSdkError;
}>;

/**
 * Payload of the onLoadNextElementsPageCancel callback.
 *
 * @public
 */
export type OnLoadNextElementsPageCancelCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onLoadCustomElementsStart callback.
 *
 * @public
 */
export type OnLoadCustomElementsStartCallbackPayload = Partial<CallbackPayloadWithCorrelation>;

/**
 * Payload of the onLoadCustomElementsSuccess callback.
 *
 * @public
 */
export type OnLoadCustomElementsSuccessCallbackPayload = Partial<CallbackPayloadWithCorrelation> &
    ILoadElementsResult;

/**
 * Payload of the onLoadCustomElementsError callback.
 *
 * @public
 */
export type OnLoadCustomElementsErrorCallbackPayload = Partial<CallbackPayloadWithCorrelation> & {
    error: GoodDataSdkError;
};

/**
 * Payload of the onLoadCustomElementsCancel callback.
 *
 * @public
 */
export type OnLoadCustomElementsCancelCallbackPayload = Partial<CallbackPayloadWithCorrelation>;

/**
 * Payload of the onLoadIrrelevantElementsStart callback.
 *
 * @public
 */
export type OnLoadIrrelevantElementsStartCallbackPayload = Partial<CallbackPayloadWithCorrelation>;

/**
 * Payload of the onLoadIrrelevantElementsSuccess callback.
 *
 * @public
 */
export type OnLoadIrrelevantElementsSuccessCallbackPayload = Partial<CallbackPayloadWithCorrelation> &
    ILoadIrrelevantElementsResult;

/**
 * Payload of the onLoadIrrelevantElementsError callback.
 *
 * @public
 */
export type OnLoadIrrelevantElementsErrorCallbackPayload = Partial<CallbackPayloadWithCorrelation> & {
    error: GoodDataSdkError;
};

/**
 * Payload of the onLoadIrrelevantElementsCancel callback.
 *
 * @public
 */
export type OnLoadIrrelevantElementsCancelCallbackPayload = Partial<CallbackPayloadWithCorrelation>;

/**
 * Payload of the onInitTotalCountStart callback.
 *
 * @public
 */
export type OnInitTotalCountStartCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onInitTotalCountSuccess callback.
 *
 * @public
 */
export type OnInitTotalCountSuccessCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onInitTotalCountError callback.
 *
 * @public
 */
export type OnInitTotalCountErrorCallbackPayload = CallbackPayloadWithCorrelation<{
    error: GoodDataSdkError;
}>;

/**
 * Payload of the onInitTotalCountCancel callback.
 *
 * @public
 */
export type OnInitTotalCountCancelCallbackPayload = CallbackPayloadWithCorrelation;
