// (C) 2022 GoodData Corporation
/* eslint-disable @typescript-eslint/ban-types */
import { v4 as uuid } from "uuid";
import {
    ElementsQueryOptionsElementsSpecification,
    IAnalyticalBackend,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeElement,
    IAttributeDisplayFormMetadataObject,
    ObjRef,
    IAttributeFilter,
    filterObjRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    isNegativeAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
    IAttributeElements,
    IMeasure,
    IRelativeDateFilter,
    isPositiveAttributeFilter,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IElementsLoadResult {
    readonly items: IAttributeElement[];
    readonly limit: number;
    readonly offset: number;
    readonly totalCount: number;
}

/**
 * @internal
 */
export interface ILoadRangeOptions {
    readonly limit: number;
    readonly offset: number;
}

/**
 * @internal
 */
export type Correlation = string;
/**
 * @internal
 */
export type Unsubscribe = () => void;
/**
 * @internal
 */
export type CallbackPayload<T extends object = {}> = T & { correlation?: Correlation };
/**
 * @internal
 */
export type Callback<T extends object = {}> = (payload: CallbackPayload<T>) => void;
/**
 * @internal
 */
export type CallbackRegistration<T extends object = {}> = (cb: Callback<T>) => Unsubscribe;

/**
 * @internal
 */
export interface AttributeElementSelection {
    items: string[];
    isInverted: boolean;
}

/**
 * @internal
 */
export interface AttributeElementSelectionFull {
    elements: IAttributeElement[];
    isInverted: boolean;
}

/**
 * @internal
 */
export type DisplayFormLoad = (
    backend: IAnalyticalBackend,
    workspace: string,
    displayForm: ObjRef,
) => Promise<IAttributeDisplayFormMetadataObject>;

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
export type ElementsLoad = (config: ElementsLoadConfig) => Promise<IElementsLoadResult>;

/**
 * Indicates pending state of a loadable item.
 * @internal
 */
export type LoadablePending = {
    result: undefined;
    error: undefined;
    status: "pending";
};

/**
 * Indicates loading state of a loadable item.
 * @internal
 */
export type LoadableLoading = {
    result: undefined;
    error: undefined;
    status: "loading";
};

/**
 * Indicates error state of a loadable item.
 * @internal
 */
export type LoadableError<TError> = {
    result: undefined;
    error: TError;
    status: "error";
};

/**
 * Indicates success state of a loadable item.
 * @internal
 */
export type LoadableSuccess<TResult> = {
    result: TResult;
    error: undefined;
    status: "success";
};

/**
 * Indicates the current state of a loadable item.
 * @internal
 */
export type Loadable<TResult, TError = Error> =
    | LoadablePending
    | LoadableLoading
    | LoadableError<TError>
    | LoadableSuccess<TResult>;

/**
 * Indicates the current state of the promise inside of a loadable item.
 * @internal
 */
export type LoadableStatus = Loadable<any, any>["status"];

//
//
//

/**
 * Handles the loading of the display form info (e.g. its title).
 * @internal
 */
export interface IAttributeDisplayFormLoader {
    // manipulators
    /**
     * Trigger the load of the display form handled by this handler.
     *
     * @remarks
     * You can provide a correlation value that will be included in all the events fired by this.
     * This is useful if you want to "pair" loading and loaded events from the same initiated by the same
     * loadDisplayFormInfo call.
     *
     * @param correlation - the correlation value
     */
    loadDisplayFormInfo(correlation?: Correlation): void;
    /**
     * Cancel the loading of the display form if any is in progress.
     */
    cancelDisplayFormInfoLoad(): void;
    // selectors
    /**
     * Get the currently loaded value of the display form.
     * @privateRemarks
     */
    getDisplayFormInfo(): Loadable<IAttributeDisplayFormMetadataObject>;
    // callbacks
    onDisplayFormLoadStart: CallbackRegistration;
    onDisplayFormLoadSuccess: CallbackRegistration<{ displayForm: IAttributeDisplayFormMetadataObject }>;
    onDisplayFormLoadError: CallbackRegistration<{ error: Error }>;
    onDisplayFormLoadCancel: CallbackRegistration;
}

/**
 * Handles the loading of the elements
 * @internal
 */
export interface IAttributeElementLoader {
    // manipulators
    /**
     * Trigger the load of a attribute elements range.
     *
     * @remarks
     * Will cancel any running loads if there are any.
     *
     * You can provide a correlation value that will be included in all the events fired by this.
     * This is useful if you want to "pair" loading and loaded events from the same initiated by the same
     * loadElementsRange call.
     *
     * @param offset - the number of elements to skip
     * @param limit - the number of elements to load
     * @param correlation - the correlation value
     */
    loadElementsRange(offset: number, limit: number, correlation?: Correlation): void;
    /**
     * Trigger a load of elements specified.
     *
     * @remarks
     * Will cancel any running loads if there are any.
     *
     * You can provide a correlation value that will be included in all the events fired by this.
     * This is useful if you want to "pair" loading and loaded events from the same initiated by the same
     * loadElementsRange call.
     *
     * @param elements - the elements to load
     * @param correlation - the correlation value
     */
    loadParticularElements(
        elements: ElementsQueryOptionsElementsSpecification,
        correlation?: Correlation,
    ): void;
    /**
     * Set the search value used to filter the elements.
     *
     * @remarks
     * MUST NOT trigger a page load. MUST reset any loaded elements as they are no longer relevant.
     *
     * You can provide a correlation value that will be included in all the events fired by this.
     * This is useful if you want to "pair" loading and loaded events from the same initiated by the same
     * loadElementsRange call.
     *
     * @param search - the search string to use. Use empty string to reset search.
     * @param correlation - the correlation value // TODO is this useful here?
     */
    setSearch(search: string, correlation?: Correlation): void;
    /**
     * Set the measure that will limit the available elements.
     *
     * @param measures - the measures to use
     * @param correlation - the correlation value // TODO is this useful here?
     */
    setLimitingMeasures(measures: IMeasure[], correlation?: Correlation): void;
    /**
     * Set the attribute filters that will limit the available elements.
     *
     * @param filters - the filters to use
     * @param correlation - the correlation value // TODO is this useful here?
     */
    setLimitingAttributeFilters(filters: IElementsQueryAttributeFilter[], correlation?: Correlation): void;
    /**
     * Set the date filters that will limit the available elements.
     *
     * @param filters - the filters to use
     * @param correlation - the correlation value // TODO is this useful here?
     */
    setLimitingDateFilters(filters: IRelativeDateFilter[], correlation?: Correlation): void;
    /**
     * Cancel any loading of the elements if any is in progress.
     */
    cancelElementLoad(): void;
    // selectors
    getAllItems(): IAttributeElement[];
    getItemsByKey(keys: string[]): IAttributeElement[];
    getSearch(): string;
    getTotalCount(): number;
    getCountWithCurrentSettings(): number;
    getLoadingStatus(): LoadableStatus;
    // callbacks
    onElementsRangeLoadStart: CallbackRegistration;
    onElementsRangeLoadSuccess: CallbackRegistration<IElementsLoadResult>;
    onElementsRangeLoadError: CallbackRegistration<{ error: Error }>;
    onElementsRangeLoadCancel: CallbackRegistration;
}

/**
 * Handles simple selection of items
 * @internal
 */
export interface IAttributeElementsSelectionHandler {
    // manipulators
    changeSelection(selection: AttributeElementSelection): void;
    invertSelection(): void;
    clearSelection(): void;
    // selectors
    getSelection(): AttributeElementSelection;
}

/**
 * Handles simple selection of at most one item
 * @internal
 */
export interface ISingleAttributeElementSelectionHandler {
    // manipulators
    changeSelection(selection: string | undefined): void;
    // selectors
    getSelection(): string | undefined;
}

/**
 * Handles selection of items with stages: working and committed.
 * @internal
 */
export interface IStagedAttributeElementsSelectionHandler
    extends Omit<IAttributeElementsSelectionHandler, "getSelection"> {
    // manipulators
    /**
     * Commit the current working selection making it the new committed selection.
     */
    commitSelection(): void;
    /**
     * Revert the current working selection by resetting it to the committed selection.
     */
    revertSelection(): void;
    // selectors
    getWorkingSelection(): AttributeElementSelection;
    getCommittedSelection(): AttributeElementSelection;
    // callbacks
    onSelectionChanged: CallbackRegistration<{ selection: AttributeElementSelection }>;
    onSelectionCommitted: CallbackRegistration<{ selection: AttributeElementSelection }>;
}

/**
 * Handles selection of items with stages: working and committed.
 * @internal
 */
export interface IStagedSingleAttributeElementSelectionHandler
    extends Omit<ISingleAttributeElementSelectionHandler, "getSelection"> {
    // manipulators
    /**
     * Commit the current working selection making it the new committed selection.
     */
    commitSelection(): void;
    /**
     * Revert the current working selection by resetting it to the committed selection.
     */
    revertSelection(): void;
    // selectors
    getWorkingSelection(): string | undefined;
    getCommittedSelection(): string | undefined;
    // callbacks
    onSelectionChanged: CallbackRegistration<{ selection: string | undefined }>;
    onSelectionCommitted: CallbackRegistration<{ selection: string | undefined }>;
}

/**
 * Handles the whole attribute filter experience
 * @internal
 */
export interface IAttributeFilterHandlerBase extends IAttributeDisplayFormLoader, IAttributeElementLoader {
    // selectors
    /**
     * Get the effective filter (using the committed selection).
     */
    getFilter(): IAttributeFilter;
}

/**
 * Handles the whole attribute filter experience
 * @internal
 */
export interface ISingleSelectAttributeFilterHandler extends IAttributeFilterHandlerBase {
    // selectors
    /**
     * Get the currently selected attribute element (using the working selection).
     */
    getSelectedItem(): IAttributeElement | undefined;
}

/**
 * Handles the whole attribute filter experience
 * @internal
 */
export interface IMultiSelectAttributeFilterHandler extends IAttributeFilterHandlerBase {
    // selectors
    /**
     * Get the currently selected attribute elements (using the working selection).
     */
    getSelectedItems(): AttributeElementSelectionFull;
}

//
//
//

const defaultDisplayFormLoad: DisplayFormLoad = (backend, workspace, displayForm) => {
    return backend.workspace(workspace).attributes().getAttributeDisplayForm(displayForm);
};

const defaultElementsLoad: ElementsLoad = (config) => {
    const {
        backend,
        displayForm,
        limit,
        offset,
        workspace,
        limitingAttributeFilters,
        limitingDateFilters,
        limitingMeasures,
        search,
        elements,
    } = config;
    let loader = backend.workspace(workspace).attributes().elements().forDisplayForm(displayForm);
    if (limit) {
        loader = loader.withLimit(limit);
    }
    if (offset) {
        loader = loader.withOffset(limit);
    }
    if (search || elements) {
        loader = loader.withOptions({ filter: search, elements });
    }
    if (limitingDateFilters) {
        loader = loader.withDateFilters(limitingDateFilters);
    }
    if (limitingAttributeFilters) {
        loader = loader.withAttributeFilters(limitingAttributeFilters);
    }
    if (limitingMeasures) {
        loader = loader.withMeasures(limitingMeasures);
    }

    return loader.query().then((res) => ({
        items: res.items,
        limit: res.limit,
        offset: res.offset,
        totalCount: res.totalCount,
    }));
};

const newCallbackHandler = <T extends object = {}>() => {
    let subscribers: Array<Callback<T>> = [];
    const subscribe: CallbackRegistration<T> = (cb) => {
        subscribers.push(cb);
        return () => {
            subscribers = subscribers.filter((i) => i != cb);
        };
    };
    const triggerAll = (payload: CallbackPayload<T>) => {
        subscribers.forEach((cb) => cb(payload));
    };

    return {
        triggerAll,
        subscribe,
    };
};

// TODO: element load: parent filtered, measure filtered, date filtered, custom

/**
 * @internal
 */
export class DefaultAttributeElementsSelectionHandler implements IAttributeElementsSelectionHandler {
    private selection: AttributeElementSelection;

    constructor(selection?: AttributeElementSelection) {
        this.selection = selection ?? { isInverted: true, items: [] };
    }

    // manipulators
    changeSelection = (selection: AttributeElementSelection): void => {
        this.selection = selection;
    };

    invertSelection = (): void => {
        const current = this.getSelection();
        this.changeSelection({ ...current, isInverted: !current.isInverted });
    };

    clearSelection = (): void => {
        this.changeSelection({ isInverted: true, items: [] });
    };

    // selectors
    getSelection = (): AttributeElementSelection => {
        return this.selection;
    };
}

/**
 * @internal
 */
export class DefaultStagedAttributeElementsSelectionHandler
    implements IStagedAttributeElementsSelectionHandler
{
    protected committedSelectionHandler: IAttributeElementsSelectionHandler;
    protected workingSelectionHandler: IAttributeElementsSelectionHandler;

    private onSelectionChangedHandler = newCallbackHandler<{ selection: AttributeElementSelection }>();
    private onSelectionConfirmedHandler = newCallbackHandler<{ selection: AttributeElementSelection }>();

    constructor(initialSelection: AttributeElementSelection = { isInverted: true, items: [] }) {
        this.committedSelectionHandler = new DefaultAttributeElementsSelectionHandler(initialSelection);
        this.workingSelectionHandler = new DefaultAttributeElementsSelectionHandler(initialSelection);
    }

    // manipulators
    commitSelection = (correlation: Correlation = uuid()): void => {
        this.committedSelectionHandler = { ...this.workingSelectionHandler };
        this.onSelectionConfirmedHandler.triggerAll({
            correlation,
            selection: this.committedSelectionHandler.getSelection(),
        });
    };

    revertSelection = (correlation: Correlation = uuid()): void => {
        this.workingSelectionHandler = { ...this.committedSelectionHandler };
        this.onSelectionChangedHandler.triggerAll({
            correlation,
            selection: this.committedSelectionHandler.getSelection(),
        });
    };

    changeSelection = (selection: AttributeElementSelection, correlation: Correlation = uuid()): void => {
        this.workingSelectionHandler.changeSelection(selection);
        this.onSelectionChangedHandler.triggerAll({
            correlation,
            selection: this.workingSelectionHandler.getSelection(),
        });
    };

    invertSelection = (): void => {
        const current = this.getWorkingSelection();
        this.changeSelection({
            ...current,
            isInverted: !current.isInverted,
        });
    };

    clearSelection = (): void => {
        this.changeSelection({ isInverted: true, items: [] });
    };

    // selectors
    getWorkingSelection = (): AttributeElementSelection => {
        return this.workingSelectionHandler.getSelection();
    };

    getCommittedSelection = (): AttributeElementSelection => {
        return this.committedSelectionHandler.getSelection();
    };

    // callbacks
    onSelectionChanged = this.onSelectionChangedHandler.subscribe;
    onSelectionCommitted = this.onSelectionChangedHandler.subscribe;
}

/**
 * @internal
 */
export class DefaultAttributeDisplayFormLoader implements IAttributeDisplayFormLoader {
    private displayForm: Loadable<IAttributeDisplayFormMetadataObject> = {
        status: "pending",
        result: undefined,
        error: undefined,
    };

    private onLoaded = newCallbackHandler<{ displayForm: IAttributeDisplayFormMetadataObject }>();
    private onLoading = newCallbackHandler();
    private onError = newCallbackHandler<{ error: Error }>();
    private onCancelled = newCallbackHandler();

    constructor(
        private readonly displayFormRef: ObjRef,
        private readonly backend: IAnalyticalBackend,
        private readonly workspace: string,
        private readonly displayFormLoad: DisplayFormLoad = defaultDisplayFormLoad,
    ) {}

    // manipulators
    loadDisplayFormInfo = (correlation?: Correlation): void => {
        this.onLoading.triggerAll({ correlation });
        this.displayForm = { status: "loading", result: undefined, error: undefined };
        this.displayFormLoad(this.backend, this.workspace, this.displayFormRef)
            .then((displayForm) => {
                this.displayForm = { status: "success", result: displayForm, error: undefined };
                this.onLoaded.triggerAll({ correlation, displayForm });
            })
            .catch((error: Error) => {
                if (error.name === "AbortError") {
                    this.onCancelled.triggerAll({ correlation });
                } else {
                    this.onError.triggerAll({ correlation, error });
                }
                this.displayForm = { status: "error", error, result: undefined };
            });
    };

    cancelDisplayFormInfoLoad = (): void => {
        // TODO: actually cancel
    };

    // selectors
    getDisplayFormInfo = (): Loadable<IAttributeDisplayFormMetadataObject> => {
        return this.displayForm;
    };

    // callbacks
    onDisplayFormLoadSuccess = this.onLoaded.subscribe;
    onDisplayFormLoadStart = this.onLoading.subscribe;
    onDisplayFormLoadError = this.onError.subscribe;
    onDisplayFormLoadCancel = this.onCancelled.subscribe;
}

/**
 * @internal
 */
export class DefaultAttributeElementsLoader implements IAttributeElementLoader {
    private search: string | undefined;
    private items: IAttributeElement[] = [];
    private dictionary: Map<string, IAttributeElement> = new Map();
    private totalCount: number = -1;
    private currentSettingsCount: number = -1;
    private limitingMeasures: IMeasure[] = [];
    private limitingAttributeFilters: IElementsQueryAttributeFilter[] = [];
    private limitingDateFilters: IRelativeDateFilter[] = [];
    private loadingStatus: LoadableStatus = "pending";

    private onLoaded = newCallbackHandler<IElementsLoadResult>();
    private onLoading = newCallbackHandler();
    private onError = newCallbackHandler<{ error: Error }>();
    private onCancelled = newCallbackHandler();

    constructor(
        private readonly displayFormRef: ObjRef,
        private readonly backend: IAnalyticalBackend,
        private readonly workspace: string,
        private readonly elementsLoad: ElementsLoad = defaultElementsLoad,
    ) {
        this.loadTotalCount();
    }

    // manipulators
    private loadTotalCount = (): void => {
        this.elementsLoad({
            backend: this.backend,
            workspace: this.workspace,
            displayForm: this.displayFormRef,
            offset: 0,
            limit: 1,
            search: "",
        }).then((res) => {
            this.totalCount = res.totalCount;
        });
    };

    loadElementsRange = (offset: number, limit: number, correlation?: string): void => {
        this.onLoading.triggerAll({ correlation });
        this.loadingStatus = "loading";
        this.elementsLoad({
            backend: this.backend,
            workspace: this.workspace,
            displayForm: this.displayFormRef,
            offset,
            limit,
            search: this.search,
            limitingMeasures: this.limitingMeasures,
            limitingAttributeFilters: this.limitingAttributeFilters,
            limitingDateFilters: this.limitingDateFilters,
        })
            .then((res) => {
                this.items.push(...res.items); // TODO actually merge
                res.items.forEach((item) => {
                    this.dictionary.set(item.uri, item);
                });
                this.currentSettingsCount = res.totalCount;
                this.onLoaded.triggerAll({ correlation, ...res });
                this.loadingStatus = "success";
            })
            // eslint-disable-next-line sonarjs/no-identical-functions
            .catch((error: Error) => {
                if (error.name === "AbortError") {
                    this.onCancelled.triggerAll({ correlation });
                } else {
                    this.onError.triggerAll({ correlation, error });
                }
                this.loadingStatus = "error";
            });
    };

    loadParticularElements = (
        elements: ElementsQueryOptionsElementsSpecification,
        correlation?: string,
    ): void => {
        this.onLoading.triggerAll({ correlation });
        this.elementsLoad({
            backend: this.backend,
            workspace: this.workspace,
            displayForm: this.displayFormRef,
            limit: 1000, // TODO actual max limit or length of elements?
            offset: 0,
            elements,
        })
            .then((res) => {
                res.items.forEach((item) => {
                    this.dictionary.set(item.uri, item);
                });
                this.onLoaded.triggerAll({ correlation, ...res });
            })
            // eslint-disable-next-line sonarjs/no-identical-functions
            .catch((error: Error) => {
                if (error.name === "AbortError") {
                    this.onCancelled.triggerAll({ correlation });
                } else {
                    this.onError.triggerAll({ correlation, error });
                }
            });
    };

    setSearch = (search: string, _correlation?: Correlation): void => {
        this.cancelElementLoad();
        this.search = search;
        this.items = [];
        this.currentSettingsCount = -1;
    };

    setLimitingMeasures = (measures: IMeasure[], _correlation?: Correlation): void => {
        this.cancelElementLoad();
        this.limitingMeasures = measures;
        this.items = [];
        this.currentSettingsCount = -1;
    };

    setLimitingAttributeFilters = (
        filters: IElementsQueryAttributeFilter[],
        _correlation?: Correlation,
    ): void => {
        this.cancelElementLoad();
        this.limitingAttributeFilters = filters;
        this.items = [];
        this.currentSettingsCount = -1;
    };

    setLimitingDateFilters = (filters: IRelativeDateFilter[], _correlation?: Correlation): void => {
        this.cancelElementLoad();
        this.limitingDateFilters = filters;
        this.items = [];
        this.currentSettingsCount = -1;
    };

    getSearch = (): string => {
        return this.search ?? "";
    };

    cancelElementLoad = (): void => {
        // TODO actually cancel
    };

    // selectors
    getAllItems = (): IAttributeElement[] => {
        return this.items;
    };

    getItemsByKey = (keys: string[]): IAttributeElement[] => {
        return keys.map((key) => this.dictionary.get(key));
    };

    getTotalCount = (): number => {
        return this.totalCount;
    };

    getCountWithCurrentSettings = (): number => {
        return this.currentSettingsCount;
    };

    getLoadingStatus = (): LoadableStatus => {
        return this.loadingStatus;
    };

    // callbacks
    onElementsRangeLoadSuccess = this.onLoaded.subscribe;
    onElementsRangeLoadStart = this.onLoading.subscribe;
    onElementsRangeLoadError = this.onError.subscribe;
    onElementsRangeLoadCancel = this.onCancelled.subscribe;
}

/**
 * @internal
 */
export interface IAttributeFilterHandlerConfig {
    readonly backend: IAnalyticalBackend;
    readonly workspace: string;
    readonly filter: IAttributeFilter;
    readonly displayFormLoad?: DisplayFormLoad;
    readonly elementsLoad?: ElementsLoad;
}

/**
 * @internal
 */
export class AttributeFilterHandlerBase implements IAttributeFilterHandlerBase {
    protected displayFormLoader: IAttributeDisplayFormLoader;
    protected elementLoader: IAttributeElementLoader;
    protected stagedSelectionHandler: IStagedAttributeElementsSelectionHandler;
    protected displayForm: ObjRef;
    protected isElementsByRef: boolean;

    constructor(config: IAttributeFilterHandlerConfig) {
        this.displayForm = filterObjRef(config.filter);
        this.displayFormLoader = new DefaultAttributeDisplayFormLoader(
            this.displayForm,
            config.backend,
            config.workspace,
            config.displayFormLoad,
        );

        const elements = filterAttributeElements(config.filter);
        const initialSelection: AttributeElementSelection = {
            isInverted: isNegativeAttributeFilter(config.filter),
            items: isAttributeElementsByRef(elements) ? elements.uris : elements.values,
        };
        this.isElementsByRef = isAttributeElementsByRef(elements);
        this.stagedSelectionHandler = new DefaultStagedAttributeElementsSelectionHandler(initialSelection);

        this.elementLoader = new DefaultAttributeElementsLoader(
            this.displayForm,
            config.backend,
            config.workspace,
            config.elementsLoad,
        );

        this.init(initialSelection);
    }

    private init = (selection: AttributeElementSelection) => {
        const correlation = "__INIT__";
        this.loadDisplayFormInfo(correlation);
        this.ensureSelectionLoaded(selection, correlation);
    };

    private ensureSelectionLoaded = (selection: AttributeElementSelection, correlation: Correlation) => {
        this.elementLoader.loadParticularElements(
            {
                uris: selection.items, // TODO detect other types of filters: value, primaryValue,...
            },
            correlation,
        );
    };

    // manipulators
    loadDisplayFormInfo = (correlation: Correlation = uuid()): void => {
        return this.displayFormLoader.loadDisplayFormInfo(correlation);
    };

    cancelDisplayFormInfoLoad = (): void => {
        return this.displayFormLoader.cancelDisplayFormInfoLoad();
    };

    loadElementsRange = (offset: number, limit: number, correlation: Correlation = uuid()): void => {
        return this.elementLoader.loadElementsRange(offset, limit, correlation);
    };

    loadParticularElements = (
        elements: ElementsQueryOptionsElementsSpecification,
        correlation: Correlation = uuid(),
    ): void => {
        return this.elementLoader.loadParticularElements(elements, correlation);
    };

    cancelElementLoad(): void {
        return this.elementLoader.cancelElementLoad();
    }

    setSearch = (search: string, correlation: Correlation = uuid()): void => {
        this.stagedSelectionHandler.changeSelection({ isInverted: true, items: [] }); // maybe not?
        return this.elementLoader.setSearch(search, correlation);
    };

    setLimitingMeasures = (measures: IMeasure[], correlation: Correlation = uuid()): void => {
        return this.elementLoader.setLimitingMeasures(measures, correlation);
    };

    setLimitingAttributeFilters = (
        filters: IElementsQueryAttributeFilter[],
        correlation: Correlation = uuid(),
    ): void => {
        return this.elementLoader.setLimitingAttributeFilters(filters, correlation);
    };

    setLimitingDateFilters = (filters: IRelativeDateFilter[], correlation: Correlation = uuid()): void => {
        return this.elementLoader.setLimitingDateFilters(filters, correlation);
    };

    // selectors
    protected getSelectedItemsBase(): AttributeElementSelectionFull {
        const selection = this.stagedSelectionHandler.getWorkingSelection();
        return {
            isInverted: selection.isInverted,
            elements: this.getItemsByKey(selection.items),
        };
    }

    getSearch = (): string => {
        return this.elementLoader.getSearch();
    };

    getAllItems = (): IAttributeElement[] => {
        return this.elementLoader.getAllItems();
    };

    getItemsByKey = (keys: string[]): IAttributeElement[] => {
        return this.elementLoader.getItemsByKey(keys);
    };

    getTotalCount = (): number => {
        return this.elementLoader.getTotalCount();
    };

    getCountWithCurrentSettings = (): number => {
        return this.elementLoader.getCountWithCurrentSettings();
    };

    getDisplayFormInfo = (): Loadable<IAttributeDisplayFormMetadataObject> => {
        return this.displayFormLoader.getDisplayFormInfo();
    };

    getFilter = (): IAttributeFilter => {
        const committedSelection = this.stagedSelectionHandler.getCommittedSelection();
        const elements: IAttributeElements = this.isElementsByRef
            ? { uris: committedSelection.items }
            : { values: committedSelection.items };
        return committedSelection.isInverted
            ? newNegativeAttributeFilter(this.displayForm, elements)
            : newPositiveAttributeFilter(this.displayForm, elements);
    };

    getLoadingStatus = (): LoadableStatus => {
        return this.elementLoader.getLoadingStatus();
    };

    // callbacks
    onElementsRangeLoadSuccess: CallbackRegistration<IElementsLoadResult> = (cb) => {
        return this.elementLoader.onElementsRangeLoadSuccess(cb);
    };

    onElementsRangeLoadStart: CallbackRegistration = (cb) => {
        return this.elementLoader.onElementsRangeLoadStart(cb);
    };

    onElementsRangeLoadError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.elementLoader.onElementsRangeLoadError(cb);
    };

    onElementsRangeLoadCancel: CallbackRegistration = (cb) => {
        return this.elementLoader.onElementsRangeLoadCancel(cb);
    };

    onDisplayFormLoadSuccess: CallbackRegistration<{ displayForm: IAttributeDisplayFormMetadataObject }> = (
        cb,
    ) => {
        return this.displayFormLoader.onDisplayFormLoadSuccess(cb);
    };

    onDisplayFormLoadStart: CallbackRegistration = (cb) => {
        return this.displayFormLoader.onDisplayFormLoadStart(cb);
    };

    onDisplayFormLoadError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.displayFormLoader.onDisplayFormLoadError(cb);
    };

    onDisplayFormLoadCancel: CallbackRegistration = (cb) => {
        return this.displayFormLoader.onDisplayFormLoadCancel(cb);
    };
}

/**
 * @internal
 */
export class StagedSingleSelectionAttributeFilterHandler
    extends AttributeFilterHandlerBase
    implements ISingleSelectAttributeFilterHandler, IStagedSingleAttributeElementSelectionHandler
{
    private static sanitizeConfig(config: IAttributeFilterHandlerConfig): IAttributeFilterHandlerConfig {
        const elements = filterAttributeElements(config.filter);
        const items = isAttributeElementsByRef(elements) ? elements.uris : elements.values;
        const firstItem = items[0];
        const sanitizedItems = isAttributeElementsByRef(elements)
            ? { uris: [firstItem] }
            : { values: [firstItem] };
        return {
            ...config,
            filter: isPositiveAttributeFilter(config.filter)
                ? newPositiveAttributeFilter(filterObjRef(config.filter), sanitizedItems)
                : newNegativeAttributeFilter(filterObjRef(config.filter), sanitizedItems),
        };
    }

    constructor(config: IAttributeFilterHandlerConfig) {
        super(StagedSingleSelectionAttributeFilterHandler.sanitizeConfig(config));
    }

    changeSelection = (selection: string | undefined): void => {
        return this.stagedSelectionHandler.changeSelection({
            isInverted: false,
            items: selection ? [selection] : [],
        });
    };

    revertSelection = (): void => {
        return this.stagedSelectionHandler.revertSelection();
    };

    commitSelection = (): void => {
        return this.stagedSelectionHandler.commitSelection();
    };

    getWorkingSelection = (): string | undefined => {
        return this.stagedSelectionHandler.getWorkingSelection().items[0];
    };

    getCommittedSelection = (): string | undefined => {
        return this.stagedSelectionHandler.getCommittedSelection().items[0];
    };

    onSelectionChanged: CallbackRegistration<{ selection: string | undefined }> = (cb) => {
        return this.stagedSelectionHandler.onSelectionChanged((selection) => {
            cb({ selection: selection.selection.items[0] });
        });
    };

    getSelectedItem = (): IAttributeElement | undefined => {
        return this.getSelectedItemsBase().elements[0];
    };

    onSelectionCommitted: CallbackRegistration<{ selection: string | undefined }> = (cb) => {
        return this.stagedSelectionHandler.onSelectionCommitted((selection) => {
            cb({ selection: selection.selection.items[0] });
        });
    };
}

/**
 * @internal
 */
export class StagedMultiSelectionAttributeFilterHandler
    extends AttributeFilterHandlerBase
    implements IMultiSelectAttributeFilterHandler, IStagedAttributeElementsSelectionHandler
{
    constructor(config: IAttributeFilterHandlerConfig) {
        super(config);
    }

    changeSelection = (selection: AttributeElementSelection): void => {
        return this.stagedSelectionHandler.changeSelection(selection);
    };

    revertSelection = (): void => {
        return this.stagedSelectionHandler.revertSelection();
    };

    commitSelection = (): void => {
        return this.stagedSelectionHandler.commitSelection();
    };

    invertSelection = (): void => {
        return this.stagedSelectionHandler.invertSelection();
    };

    clearSelection = (): void => {
        return this.stagedSelectionHandler.clearSelection();
    };

    getWorkingSelection = (): AttributeElementSelection => {
        return this.stagedSelectionHandler.getWorkingSelection();
    };

    getSelectedItems = (): AttributeElementSelectionFull => {
        return this.getSelectedItemsBase();
    };

    getCommittedSelection = (): AttributeElementSelection => {
        return this.stagedSelectionHandler.getCommittedSelection();
    };

    onSelectionChanged: CallbackRegistration<{ selection: AttributeElementSelection }> = (cb) => {
        return this.stagedSelectionHandler.onSelectionChanged(cb);
    };

    onSelectionCommitted: CallbackRegistration<{ selection: AttributeElementSelection }> = (cb) => {
        return this.stagedSelectionHandler.onSelectionCommitted(cb);
    };
}
