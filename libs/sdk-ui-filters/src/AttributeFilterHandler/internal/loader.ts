// (C) 2022 GoodData Corporation
import { v4 as uuid } from "uuid";
import { invariant } from "ts-invariant";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    IAttributeElement,
    IAttributeMetadataObject,
    IAttributeFilter,
    IMeasure,
    IRelativeDateFilter,
    SortDirection,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    AsyncOperationStatus,
    CallbackRegistration,
    Correlation,
    IAttributeFilterLoader,
    ILoadElementsOptions,
    OnInitStartCallbackPayload,
    OnInitSuccessCallbackPayload,
    OnInitErrorCallbackPayload,
    OnInitCancelCallbackPayload,
    OnLoadAttributeStartCallbackPayload,
    OnLoadAttributeSuccessCallbackPayload,
    OnLoadAttributeErrorCallbackPayload,
    OnLoadAttributeCancelCallbackPayload,
    OnLoadInitialElementsPageStartCallbackPayload,
    OnLoadInitialElementsPageSuccessCallbackPayload,
    OnLoadInitialElementsPageErrorCallbackPayload,
    OnLoadInitialElementsPageCancelCallbackPayload,
    OnLoadNextElementsPageStartCallbackPayload,
    OnLoadNextElementsPageSuccessCallbackPayload,
    OnLoadNextElementsPageErrorCallbackPayload,
    OnLoadNextElementsPageCancelCallbackPayload,
    OnLoadCustomElementsStartCallbackPayload,
    OnLoadCustomElementsSuccessCallbackPayload,
    OnLoadCustomElementsErrorCallbackPayload,
    OnLoadCustomElementsCancelCallbackPayload,
} from "../types/index.js";
import { AttributeFilterReduxBridge } from "./bridge.js";
import { AttributeFilterHandlerConfig } from "./types.js";

/**
 * @internal
 */
export class AttributeFilterLoader implements IAttributeFilterLoader {
    protected bridge: AttributeFilterReduxBridge;
    protected config: AttributeFilterHandlerConfig;

    protected constructor(config: AttributeFilterHandlerConfig) {
        this.config = config;
        this.bridge = new AttributeFilterReduxBridge(config);
    }

    private validateStaticElementsLoad = () => {
        invariant(
            !(this.config.staticElements?.length && this.getLimitingAttributeFilters()?.length),
            "Using limitingAttributeFilters is not supported when using static attribute elements",
        );
        invariant(
            !(this.config.staticElements?.length && this.getLimitingDateFilters()?.length),
            "Using limitingDateFilters is not supported when using static attribute elements",
        );
        invariant(
            !(this.config.staticElements?.length && this.getLimitingMeasures()?.length),
            "Using limitingMeasures is not supported when using static attribute elements",
        );
    };

    //
    // Init
    //
    init = (correlation: Correlation = uuid()): void => {
        this.validateStaticElementsLoad();
        this.bridge.init(correlation);
    };

    onInitStart: CallbackRegistration<OnInitStartCallbackPayload> = (cb) => {
        return this.bridge.onInitStart(cb);
    };

    onInitSuccess: CallbackRegistration<OnInitSuccessCallbackPayload> = (cb) => {
        return this.bridge.onInitSuccess(cb);
    };

    onInitError: CallbackRegistration<OnInitErrorCallbackPayload> = (cb) => {
        return this.bridge.onInitError(cb);
    };

    onInitCancel: CallbackRegistration<OnInitCancelCallbackPayload> = (cb) => {
        return this.bridge.onInitCancel(cb);
    };

    getInitStatus = (): AsyncOperationStatus => {
        return this.bridge.getInitStatus();
    };

    getInitError = (): GoodDataSdkError | undefined => {
        return this.bridge.getInitError();
    };

    //
    // Attribute
    //

    loadAttribute = (correlation: Correlation = uuid()): void => {
        this.bridge.loadAttribute(correlation);
    };

    cancelAttributeLoad = (): void => {
        this.bridge.cancelAttributeLoad();
    };

    getAttribute = (): IAttributeMetadataObject | undefined => {
        return this.bridge.getAttribute();
    };

    getAttributeError = (): GoodDataSdkError | undefined => {
        return this.bridge.getAttributeError();
    };

    getAttributeStatus = (): AsyncOperationStatus => {
        return this.bridge.getAttributeStatus();
    };

    onLoadAttributeStart: CallbackRegistration<OnLoadAttributeStartCallbackPayload> = (cb) => {
        return this.bridge.onLoadAttributeStart(cb);
    };

    onLoadAttributeSuccess: CallbackRegistration<OnLoadAttributeSuccessCallbackPayload> = (cb) => {
        return this.bridge.onLoadAttributeSuccess(cb);
    };

    onLoadAttributeError: CallbackRegistration<OnLoadAttributeErrorCallbackPayload> = (cb) => {
        return this.bridge.onLoadAttributeError(cb);
    };

    onLoadAttributeCancel: CallbackRegistration<OnLoadAttributeCancelCallbackPayload> = (cb) => {
        return this.bridge.onLoadAttributeCancel(cb);
    };

    // Initial elements page

    loadInitialElementsPage = (correlation: Correlation = uuid()): void => {
        invariant(
            this.bridge.getInitStatus() === "success",
            "Cannot call loadInitialElementsPage() before successful initialization.",
        );
        this.validateStaticElementsLoad();

        this.bridge.loadInitialElementsPage(correlation);
    };

    cancelInitialElementsPageLoad(): void {
        this.bridge.cancelInitialElementsPageLoad();
    }

    getInitialElementsPageStatus = (): AsyncOperationStatus => {
        return this.bridge.getInitialElementsPageStatus();
    };

    getInitialElementsPageError = (): GoodDataSdkError | undefined => {
        return this.bridge.getInitialElementsPageError();
    };

    onLoadInitialElementsPageStart: CallbackRegistration<OnLoadInitialElementsPageStartCallbackPayload> = (
        cb,
    ) => {
        return this.bridge.onLoadInitialElementsPageStart(cb);
    };

    onLoadInitialElementsPageSuccess: CallbackRegistration<OnLoadInitialElementsPageSuccessCallbackPayload> =
        (cb) => {
            return this.bridge.onLoadInitialElementsPageSuccess(cb);
        };

    onLoadInitialElementsPageError: CallbackRegistration<OnLoadInitialElementsPageErrorCallbackPayload> = (
        cb,
    ) => {
        return this.bridge.onLoadInitialElementsPageError(cb);
    };

    onLoadInitialElementsPageCancel: CallbackRegistration<OnLoadInitialElementsPageCancelCallbackPayload> = (
        cb,
    ) => {
        return this.bridge.onLoadInitialElementsPageCancel(cb);
    };

    //
    // Next elements page
    //

    loadNextElementsPage = (correlation: Correlation = uuid()): void => {
        invariant(
            this.bridge.getInitStatus() === "success",
            "Cannot call loadNextElementsPage() before successful initialization.",
        );
        invariant(
            this.bridge.getInitialElementsPageStatus() === "success",
            "Cannot call loadNextElementsPage() before loadInitialElementsPage() completes.",
        );
        invariant(
            !this.bridge.isLoadElementsOptionsChanged(),
            "Cannot call loadNextElementsPage() when load element options were changed. When options are changed, you should call loadInitialElementsPage() first.",
        );

        this.bridge.loadNextElementsPage(correlation);
    };

    cancelNextElementsPageLoad(): void {
        this.bridge.cancelNextElementsPageLoad();
    }

    getNextElementsPageStatus = (): AsyncOperationStatus => {
        return this.bridge.getNextElementsPageStatus();
    };

    getNextElementsPageError = (): GoodDataSdkError | undefined => {
        return this.bridge.getNextElementsPageError();
    };

    onLoadNextElementsPageStart: CallbackRegistration<OnLoadNextElementsPageStartCallbackPayload> = (cb) => {
        return this.bridge.onLoadNextElementsPageStart(cb);
    };

    onLoadNextElementsPageSuccess: CallbackRegistration<OnLoadNextElementsPageSuccessCallbackPayload> = (
        cb,
    ) => {
        return this.bridge.onLoadNextElementsPageSuccess(cb);
    };

    onLoadNextElementsPageError: CallbackRegistration<OnLoadNextElementsPageErrorCallbackPayload> = (cb) => {
        return this.bridge.onLoadNextElementsPageError(cb);
    };

    onLoadNextElementsPageCancel: CallbackRegistration<OnLoadNextElementsPageCancelCallbackPayload> = (
        cb,
    ) => {
        return this.bridge.onLoadNextElementsPageCancel(cb);
    };

    //
    // Custom elements
    //

    loadCustomElements = (options: ILoadElementsOptions, correlation?: Correlation): void => {
        this.bridge.loadCustomElements(options, correlation);
    };

    cancelCustomElementsLoad(correlation?: Correlation): void {
        this.bridge.cancelCustomElementsLoad(correlation);
    }

    onLoadCustomElementsStart: CallbackRegistration<OnLoadCustomElementsStartCallbackPayload> = (cb) => {
        return this.bridge.onLoadCustomElementsStart(cb);
    };

    onLoadCustomElementsSuccess: CallbackRegistration<OnLoadCustomElementsSuccessCallbackPayload> = (cb) => {
        return this.bridge.onLoadCustomElementsSuccess(cb);
    };

    onLoadCustomElementsError: CallbackRegistration<OnLoadCustomElementsErrorCallbackPayload> = (cb) => {
        return this.bridge.onLoadCustomElementsError(cb);
    };

    onLoadCustomElementsCancel: CallbackRegistration<OnLoadCustomElementsCancelCallbackPayload> = (cb) => {
        return this.bridge.onLoadCustomElementsCancel(cb);
    };

    // Elements options

    getOffset = (): number => {
        return this.bridge.getOffset();
    };

    setSearch = (search: string): void => {
        this.bridge.setSearch(search);
    };

    getSearch = (): string => {
        return this.bridge.getSearch();
    };

    setLimit = (limit: number): void => {
        this.bridge.setLimit(limit);
    };

    getLimit = (): number => {
        return this.bridge.getLimit();
    };

    setOrder = (order: SortDirection): void => {
        this.bridge.setOrder(order);
    };

    getOrder = (): SortDirection => {
        return this.bridge.getOrder();
    };

    setLimitingMeasures = (measures: IMeasure[]): void => {
        this.bridge.setLimitingMeasures(measures);
    };

    getLimitingMeasures = (): IMeasure[] => {
        return this.bridge.getLimitingMeasures();
    };

    setLimitingAttributeFilters = (filters: IElementsQueryAttributeFilter[]): void => {
        this.bridge.setLimitingAttributeFilters(filters);
    };

    getLimitingAttributeFilters = (): IElementsQueryAttributeFilter[] => {
        return this.bridge.getLimitingAttributeFilters();
    };

    setLimitingDateFilters = (filters: IRelativeDateFilter[]): void => {
        this.bridge.setLimitingDateFilters(filters);
    };

    getLimitingDateFilters = (): IRelativeDateFilter[] => {
        return this.bridge.getLimitingDateFilters();
    };

    getAllElements = (): IAttributeElement[] => {
        return this.bridge.getAllElements();
    };

    getElementsByKey = (keys: string[]): IAttributeElement[] => {
        return this.bridge.getElementsByKey(keys);
    };

    getTotalElementsCount = (): number => {
        return this.bridge.getTotalCount();
    };

    getTotalElementsCountWithCurrentSettings = (): number => {
        return this.bridge.getTotalCountWithCurrentSettings();
    };

    getLimitingAttributeFiltersAttributes = (): IAttributeMetadataObject[] => {
        return this.bridge.getLimitingAttributeFiltersAttributes();
    };

    getFilter = (): IAttributeFilter => {
        return this.bridge.getFilter();
    };

    onUpdate: CallbackRegistration<void> = (cb) => {
        return this.bridge.onUpdate(cb);
    };
}
