// (C) 2022-2023 GoodData Corporation
import { invariant } from "ts-invariant";
import compact from "lodash/compact.js";
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
    ILoadElementsOptions,
    InvertableAttributeElementSelection,
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
    OnSelectionChangedCallbackPayload,
    OnSelectionCommittedCallbackPayload,
} from "../types/index.js";
import {
    actions,
    AttributeFilterHandlerStore,
    createAttributeFilterHandlerStore,
    selectAttribute,
    selectElements,
    selectElementsTotalCount,
    selectElementsTotalCountWithCurrentSettings,
    selectAttributeFilter,
    selectSearch,
    selectWorkingSelection,
    selectCommittedSelection,
    selectElementsCache,
    getElementsByKeys,
    selectAttributeStatus,
    selectAttributeError,
    selectInitStatus,
    selectInitError,
    selectLoadInitialElementsPageStatus,
    selectLoadInitialElementsPageError,
    selectLoadNextElementsPageStatus,
    selectLoadNextElementsPageError,
    selectLimitingMeasures,
    selectLimitingAttributeFilters,
    selectLimitingDateFilters,
    selectLimit,
    selectOrder,
    selectInvertableCommittedSelection,
    selectInvertableWorkingSelection,
    selectIsWorkingSelectionChanged,
    selectIsWorkingSelectionEmpty,
    selectOffset,
    selectIsLoadElementsOptionsChanged,
    selectLimitingAttributeFiltersAttributes,
} from "./redux/index.js";
import { newAttributeFilterCallbacks } from "./callbacks.js";
import { AttributeFilterHandlerConfig } from "./types.js";

/**
 * @internal
 */
export class AttributeFilterReduxBridge {
    private redux: AttributeFilterHandlerStore;
    private config: AttributeFilterHandlerConfig;

    private callbacks: ReturnType<typeof newAttributeFilterCallbacks>;

    constructor(config: AttributeFilterHandlerConfig) {
        this.config = config;
        this.initializeBridge();
    }

    private initializeBridge = () => {
        this.callbacks = newAttributeFilterCallbacks();
        this.redux = createAttributeFilterHandlerStore({
            ...this.config,
            eventListener: (action, select) => {
                this.callbacks.eventListener(action, select);
            },
        });
    };

    //
    // Init
    //

    init = (correlation: Correlation): void => {
        this.redux.dispatch(
            actions.init({
                correlation,
            }),
        );
    };

    getInitStatus = (): AsyncOperationStatus => {
        return this.redux.select(selectInitStatus);
    };

    getInitError = (): GoodDataSdkError | undefined => {
        return this.redux.select(selectInitError);
    };

    onInitStart: CallbackRegistration<OnInitStartCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initStart);
    };

    onInitSuccess: CallbackRegistration<OnInitSuccessCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initSuccess);
    };

    onInitError: CallbackRegistration<OnInitErrorCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initError);
    };

    onInitCancel: CallbackRegistration<OnInitCancelCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initCancel);
    };

    //
    // Attribute
    //

    loadAttribute = (correlation: Correlation): void => {
        this.redux.dispatch(actions.loadAttributeRequest({ correlation: correlation }));
    };

    cancelAttributeLoad = (): void => {
        this.redux.dispatch(actions.loadAttributeCancelRequest());
    };

    getAttribute = (): IAttributeMetadataObject | undefined => {
        return this.redux.select(selectAttribute);
    };

    getAttributeStatus = (): AsyncOperationStatus => {
        return this.redux.select(selectAttributeStatus);
    };

    getAttributeError = (): GoodDataSdkError | undefined => {
        return this.redux.select(selectAttributeError);
    };

    onLoadAttributeStart: CallbackRegistration<OnLoadAttributeStartCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadAttributeStart);
    };

    onLoadAttributeSuccess: CallbackRegistration<OnLoadAttributeSuccessCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadAttributeSuccess);
    };

    onLoadAttributeError: CallbackRegistration<OnLoadAttributeErrorCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadAttributeError);
    };

    onLoadAttributeCancel: CallbackRegistration<OnLoadAttributeCancelCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadAttributeCancel);
    };

    //
    // Initial elements page
    //

    loadInitialElementsPage = (correlation: Correlation): void => {
        this.redux.dispatch(actions.loadInitialElementsPageRequest({ correlation: correlation }));
    };

    cancelInitialElementsPageLoad = (): void => {
        this.redux.dispatch(actions.loadInitialElementsPageCancelRequest());
    };

    getInitialElementsPageStatus = (): AsyncOperationStatus => {
        return this.redux.select(selectLoadInitialElementsPageStatus);
    };

    getInitialElementsPageError = (): GoodDataSdkError | undefined => {
        return this.redux.select(selectLoadInitialElementsPageError);
    };

    onLoadInitialElementsPageStart: CallbackRegistration<OnLoadInitialElementsPageStartCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadInitialElementsPageStart);
    };

    onLoadInitialElementsPageSuccess: CallbackRegistration<OnLoadInitialElementsPageSuccessCallbackPayload> =
        (cb) => {
            return this.callbacks.registerCallback(
                cb,
                this.callbacks.registrations.loadInitialElementsPageSuccess,
            );
        };

    onLoadInitialElementsPageError: CallbackRegistration<OnLoadInitialElementsPageErrorCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadInitialElementsPageError);
    };

    onLoadInitialElementsPageCancel: CallbackRegistration<OnLoadInitialElementsPageCancelCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(
            cb,
            this.callbacks.registrations.loadInitialElementsPageCancel,
        );
    };

    //
    // Next elements page
    //

    loadNextElementsPage = (correlation: Correlation): void => {
        this.redux.dispatch(actions.loadNextElementsPageRequest({ correlation: correlation }));
    };

    cancelNextElementsPageLoad(): void {
        this.redux.dispatch(actions.loadNextElementsPageCancelRequest());
    }

    getNextElementsPageStatus = (): AsyncOperationStatus => {
        return this.redux.select(selectLoadNextElementsPageStatus);
    };

    getNextElementsPageError = (): GoodDataSdkError | undefined => {
        return this.redux.select(selectLoadNextElementsPageError);
    };

    onLoadNextElementsPageStart: CallbackRegistration<OnLoadNextElementsPageStartCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadNextElementsPageStart);
    };

    onLoadNextElementsPageSuccess: CallbackRegistration<OnLoadNextElementsPageSuccessCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadNextElementsPageSuccess);
    };

    onLoadNextElementsPageError: CallbackRegistration<OnLoadNextElementsPageErrorCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadNextElementsPageError);
    };

    onLoadNextElementsPageCancel: CallbackRegistration<OnLoadNextElementsPageCancelCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadNextElementsPageCancel);
    };

    //
    // Custom elements
    //

    loadCustomElements = (options: ILoadElementsOptions, correlation: Correlation): void => {
        this.redux.dispatch(actions.loadCustomElementsRequest({ options, correlation: correlation }));
    };

    cancelCustomElementsLoad(correlation: Correlation): void {
        this.redux.dispatch(actions.loadCustomElementsCancelRequest({ correlation: correlation }));
    }

    onLoadCustomElementsStart: CallbackRegistration<OnLoadCustomElementsStartCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadCustomElementsStart);
    };

    onLoadCustomElementsSuccess: CallbackRegistration<OnLoadCustomElementsSuccessCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadCustomElementsSuccess);
    };

    onLoadCustomElementsError: CallbackRegistration<OnLoadCustomElementsErrorCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadCustomElementsError);
    };

    onLoadCustomElementsCancel: CallbackRegistration<OnLoadCustomElementsCancelCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadCustomElementsCancel);
    };

    //
    // Elements options
    //

    getOffset = (): number => {
        return this.redux.select(selectOffset);
    };

    setSearch = (search: string): void => {
        this.redux.dispatch(actions.setSearch({ search }));
    };

    getSearch = (): string => {
        return this.redux.select(selectSearch);
    };

    setLimit = (limit: number): void => {
        this.redux.dispatch(actions.setLimit({ limit }));
    };

    getLimit = (): number => {
        return this.redux.select(selectLimit);
    };

    setOrder = (order: SortDirection): void => {
        this.redux.dispatch(actions.setOrder({ order }));
    };

    getOrder = (): SortDirection => {
        return this.redux.select(selectOrder);
    };

    setLimitingMeasures = (filters: IMeasure[]): void => {
        this.redux.dispatch(actions.setLimitingMeasures({ filters }));
    };

    getLimitingMeasures = (): IMeasure[] => {
        return this.redux.select(selectLimitingMeasures);
    };

    setLimitingAttributeFilters = (filters: IElementsQueryAttributeFilter[]): void => {
        this.redux.dispatch(actions.setLimitingAttributeFilters({ filters }));
    };

    getLimitingAttributeFilters = (): IElementsQueryAttributeFilter[] => {
        return this.redux.select(selectLimitingAttributeFilters);
    };

    setLimitingDateFilters = (filters: IRelativeDateFilter[]): void => {
        this.redux.dispatch(actions.setLimitingDateFilters({ filters }));
    };

    getLimitingDateFilters = (): IRelativeDateFilter[] => {
        return this.redux.select(selectLimitingDateFilters);
    };

    //
    // Elements
    //

    getAllElements = (): IAttributeElement[] => {
        return this.redux.select(selectElements);
    };

    getElementsByKey = (keys: string[]): IAttributeElement[] => {
        const elementsCache = this.redux.select(selectElementsCache);
        return getElementsByKeys(keys, elementsCache);
    };

    getTotalCount = (): number => {
        return this.redux.select(selectElementsTotalCount);
    };

    getTotalCountWithCurrentSettings = (): number => {
        return this.redux.select(selectElementsTotalCountWithCurrentSettings);
    };

    getLimitingAttributeFiltersAttributes = (): IAttributeMetadataObject[] => {
        return this.redux.select(selectLimitingAttributeFiltersAttributes);
    };

    //
    // Multi select
    //

    changeMultiSelection = ({ keys, isInverted }: InvertableAttributeElementSelection): void => {
        this.redux.dispatch(
            actions.changeSelection({
                selection: keys,
                isInverted,
            }),
        );
    };

    revertMultiSelection = (): void => {
        this.redux.dispatch(actions.revertSelection());
    };

    commitMultiSelection = (): void => {
        this.redux.dispatch(actions.commitSelection());
    };

    invertMultiSelection = (): void => {
        this.redux.dispatch(actions.invertSelection());
    };

    clearMultiSelection = (): void => {
        this.redux.dispatch(actions.clearSelection());
    };

    getWorkingMultiSelection = (): InvertableAttributeElementSelection => {
        return this.redux.select(selectInvertableWorkingSelection);
    };

    getCommittedMultiSelection = (): InvertableAttributeElementSelection => {
        return this.redux.select(selectInvertableCommittedSelection);
    };

    // Single select

    changeSingleSelection = (selection: string | undefined): void => {
        this.redux.dispatch(
            actions.changeSelection({
                isInverted: false,
                selection: compact([selection]),
            }),
        );
    };

    revertSingleSelection = (): void => {
        this.redux.dispatch(actions.revertSelection());
    };

    commitSingleSelection = (): void => {
        this.redux.dispatch(actions.commitSelection());
    };

    getWorkingSingleSelection = (): string | undefined => {
        const [element, ...maybeMoreElements] = this.redux.select(selectWorkingSelection);
        invariant(
            !maybeMoreElements.length,
            "Trying to invoke single select method, but multiple elements are selected.",
        );
        return element;
    };

    getCommittedSingleSelection = (): string | undefined => {
        const [element, ...maybeMoreElements] = this.redux.select(selectCommittedSelection);
        invariant(
            !maybeMoreElements.length,
            "Trying to invoke single select method, but multiple elements are selected.",
        );
        return element;
    };

    onMultiSelectionChanged: CallbackRegistration<
        OnSelectionChangedCallbackPayload<InvertableAttributeElementSelection>
    > = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.selectionChanged);
    };

    onMultiSelectionCommitted: CallbackRegistration<
        OnSelectionCommittedCallbackPayload<InvertableAttributeElementSelection>
    > = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.selectionCommitted);
    };

    onSingleSelectionChanged: CallbackRegistration<OnSelectionChangedCallbackPayload<string | undefined>> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(
            ({ selection }) => cb({ selection: selection.keys[0] }),
            this.callbacks.registrations.selectionChanged,
        );
    };

    onSingleSelectionCommitted: CallbackRegistration<
        OnSelectionCommittedCallbackPayload<string | undefined>
    > = (cb) => {
        return this.callbacks.registerCallback(
            ({ selection }) => cb({ selection: selection.keys[0] }),
            this.callbacks.registrations.selectionCommitted,
        );
    };

    //
    // Selection
    //

    getIsWorkingSelectionEmpty = (): boolean => {
        return this.redux.select(selectIsWorkingSelectionEmpty);
    };

    getIsWorkingSelectionChanged = (): boolean => {
        return this.redux.select(selectIsWorkingSelectionChanged);
    };

    //
    // Filter
    //

    getFilter = (): IAttributeFilter => {
        return this.redux.select(selectAttributeFilter);
    };

    onUpdate: CallbackRegistration<void> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.update);
    };

    isLoadElementsOptionsChanged = (): boolean => {
        return this.redux.select(selectIsLoadElementsOptionsChanged);
    };
}
