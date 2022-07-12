// (C) 2022 GoodData Corporation
import { v4 as uuid } from "uuid";
import {
    ElementsQueryOptionsElementsSpecification,
    IAnalyticalBackend,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeElement,
    IAttributeMetadataObject,
    ObjRef,
    IAttributeFilter,
    IMeasure,
    IRelativeDateFilter,
} from "@gooddata/sdk-model";
import { CallbackRegistration, Correlation, IElementsLoadResult } from "../types/common";
import { IAttributeFilterHandlerConfig, IAttributeFilterLoader } from "../types";
import { AttributeFilterReduxBridge } from "./bridge/index";

/**
 * @internal
 */
export interface ElementsLoadConfig {
    backend: IAnalyticalBackend;
    workspace: string;
    displayForm: ObjRef;
    offset: number;
    limit: number;
    search?: string;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingMeasures?: IMeasure[];
    limitingDateFilters?: IRelativeDateFilter[];
    elements?: ElementsQueryOptionsElementsSpecification;
}

/**
 * @internal
 */
export class AttributeFilterLoader implements IAttributeFilterLoader {
    protected bridge: AttributeFilterReduxBridge;

    protected constructor(config: IAttributeFilterHandlerConfig) {
        this.bridge = new AttributeFilterReduxBridge(config);
    }

    // manipulators
    init = (correlation: Correlation = uuid()): void => {
        this.bridge.init(correlation);
    };

    loadAttribute = (correlation: Correlation = uuid()): void => {
        this.bridge.loadAttribute(correlation);
    };

    cancelAttributeLoad = (): void => {
        this.bridge.cancelAttributeLoad();
    };

    loadElementsRange = (offset: number, limit: number, correlation: Correlation = uuid()): void => {
        this.bridge.loadElementsRange(offset, limit, correlation);
    };

    cancelElementLoad(): void {
        this.bridge.cancelElementLoad();
    }

    setSearch = (search: string): void => {
        this.bridge.setSearch(search);
    };

    setLimitingMeasures = (measures: IMeasure[]): void => {
        this.bridge.setLimitingMeasures(measures);
    };

    setLimitingAttributeFilters = (filters: IElementsQueryAttributeFilter[]): void => {
        return this.bridge.setLimitingAttributeFilters(filters);
    };

    setLimitingDateFilters = (filters: IRelativeDateFilter[]): void => {
        return this.bridge.setLimitingDateFilters(filters);
    };

    // selectors
    getSearch = (): string => {
        return this.bridge.getSearch();
    };

    getAllItems = (): IAttributeElement[] => {
        return this.bridge.getAllItems();
    };

    getItemsByKey = (keys: string[]): IAttributeElement[] => {
        return this.bridge.getItemsByKey(keys);
    };

    getTotalCount = (): number => {
        return this.bridge.getTotalCount();
    };

    getCountWithCurrentSettings = (): number => {
        return this.bridge.getCountWithCurrentSettings();
    };

    getAttribute = (): IAttributeMetadataObject | undefined => {
        return this.bridge.getAttribute();
    };

    getFilter = (): IAttributeFilter => {
        return this.bridge.getFilter();
    };

    // callbacks
    onElementsRangeLoadSuccess: CallbackRegistration<IElementsLoadResult> = (cb) => {
        return this.bridge.onElementsRangeLoadSuccess(cb);
    };

    onElementsRangeLoadStart: CallbackRegistration = (cb) => {
        return this.bridge.onElementsRangeLoadStart(cb);
    };

    onElementsRangeLoadError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.bridge.onElementsRangeLoadError(cb);
    };

    onElementsRangeLoadCancel: CallbackRegistration = (cb) => {
        return this.bridge.onElementsRangeLoadCancel(cb);
    };

    onAttributeLoadSuccess: CallbackRegistration<{ attribute: IAttributeMetadataObject }> = (cb) => {
        return this.bridge.onAttributeLoadSuccess(cb);
    };

    onAttributeLoadStart: CallbackRegistration = (cb) => {
        return this.bridge.onAttributeLoadStart(cb);
    };

    onAttributeLoadError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.bridge.onAttributeLoadError(cb);
    };

    onAttributeLoadCancel: CallbackRegistration = (cb) => {
        return this.bridge.onAttributeLoadCancel(cb);
    };

    onInitStart: CallbackRegistration = (cb) => {
        return this.bridge.onInitStart(cb);
    };

    onInitSuccess: CallbackRegistration = (cb) => {
        return this.bridge.onInitSuccess(cb);
    };

    onInitError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.bridge.onInitError(cb);
    };

    onInitCancel: CallbackRegistration = (cb) => {
        return this.bridge.onInitCancel(cb);
    };
}
