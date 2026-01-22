// (C) 2022-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import { type IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    type IAbsoluteDateFilter,
    type IAttributeElement,
    type IAttributeFilter,
    type IAttributeMetadataObject,
    type IMeasure,
    type IRelativeDateFilter,
    type ObjRef,
    type SortDirection,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { newAttributeFilterCallbacks } from "./callbacks.js";
import {
    selectAttributeFilter,
    selectAttributeFilterDisplayAsLabel,
    selectAttributeFilterToDisplay,
    selectOriginalFilter,
} from "./redux/filter/filterSelectors.js";
import { type AttributeFilterHandlerConfig } from "./types.js";
import { type InvertableAttributeElementSelection } from "../types/attributeFilterHandler.js";
import {
    type OnInitCancelCallbackPayload,
    type OnInitErrorCallbackPayload,
    type OnInitStartCallbackPayload,
    type OnInitSuccessCallbackPayload,
} from "../types/attributeFilterLoader.js";
import {
    type OnLoadAttributeCancelCallbackPayload,
    type OnLoadAttributeErrorCallbackPayload,
    type OnLoadAttributeStartCallbackPayload,
    type OnLoadAttributeSuccessCallbackPayload,
} from "../types/attributeLoader.js";
import {
    type AsyncOperationStatus,
    type AttributeElementKey,
    type CallbackRegistration,
    type Correlation,
} from "../types/common.js";
import {
    type ILoadElementsOptions,
    type OnInitTotalCountCancelCallbackPayload,
    type OnInitTotalCountErrorCallbackPayload,
    type OnInitTotalCountStartCallbackPayload,
    type OnInitTotalCountSuccessCallbackPayload,
    type OnLoadCustomElementsCancelCallbackPayload,
    type OnLoadCustomElementsErrorCallbackPayload,
    type OnLoadCustomElementsStartCallbackPayload,
    type OnLoadCustomElementsSuccessCallbackPayload,
    type OnLoadInitialElementsPageCancelCallbackPayload,
    type OnLoadInitialElementsPageErrorCallbackPayload,
    type OnLoadInitialElementsPageStartCallbackPayload,
    type OnLoadInitialElementsPageSuccessCallbackPayload,
    type OnLoadIrrelevantElementsCancelCallbackPayload,
    type OnLoadIrrelevantElementsErrorCallbackPayload,
    type OnLoadIrrelevantElementsStartCallbackPayload,
    type OnLoadIrrelevantElementsSuccessCallbackPayload,
    type OnLoadNextElementsPageCancelCallbackPayload,
    type OnLoadNextElementsPageErrorCallbackPayload,
    type OnLoadNextElementsPageStartCallbackPayload,
    type OnLoadNextElementsPageSuccessCallbackPayload,
} from "../types/elementsLoader.js";
import {
    type OnSelectionChangedCallbackPayload,
    type OnSelectionCommittedCallbackPayload,
} from "../types/selectionHandler.js";
import {
    getElementsByKeys,
    selectElements,
    selectElementsCache,
    selectElementsTotalCount,
    selectElementsTotalCountWithCurrentSettings,
    selectInitTotalCountError,
    selectInitTotalCountStatus,
    selectLimit,
    selectLimitingAttributeFilters,
    selectLimitingAttributeFiltersAttributes,
    selectLimitingDateFilters,
    selectLimitingMeasures,
    selectLimitingValidationItems,
    selectOffset,
    selectOrder,
    selectSearch,
} from "./redux/elements/elementsSelectors.js";
import { selectInitError, selectInitStatus } from "./redux/init/initSelectors.js";
import {
    selectAttribute,
    selectAttributeError,
    selectAttributeStatus,
} from "./redux/loadAttribute/loadAttributeSelectors.js";
import {
    selectLoadInitialElementsPageError,
    selectLoadInitialElementsPageStatus,
} from "./redux/loadInitialElementsPage/loadInitialElementsPageSelectors.js";
import {
    selectIsLoadElementsOptionsChanged,
    selectLoadNextElementsPageError,
    selectLoadNextElementsPageStatus,
} from "./redux/loadNextElementsPage/loadNextElementsPageSelectors.js";
import {
    selectCommittedSelection,
    selectInvertableCommittedSelection,
    selectInvertableWorkingSelection,
    selectIsWorkingSelectionChanged,
    selectIsWorkingSelectionEmpty,
    selectWorkingSelection,
} from "./redux/selection/selectionSelectors.js";
import { createAttributeFilterHandlerStore } from "./redux/store/createStore.js";
import { actions } from "./redux/store/slice.js";
import { type IAttributeFilterHandlerStore } from "./redux/store/types.js";

/**
 * @internal
 */
export class AttributeFilterReduxBridge {
    private redux!: IAttributeFilterHandlerStore;
    private config: AttributeFilterHandlerConfig;

    private callbacks!: ReturnType<typeof newAttributeFilterCallbacks>;

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

    // total count init

    initTotalCount = (correlation: Correlation): void => {
        this.redux.dispatch(
            actions.initTotalCount({
                correlation,
            }),
        );
    };

    getInitTotalCountStatus = (): AsyncOperationStatus => {
        return this.redux.select(selectInitTotalCountStatus);
    };

    getInitTotalCountError = (): GoodDataSdkError | undefined => {
        return this.redux.select(selectInitTotalCountError);
    };

    onInitTotalCountStart: CallbackRegistration<OnInitTotalCountStartCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initTotalCountStart);
    };

    onInitTotalCountSuccess: CallbackRegistration<OnInitTotalCountSuccessCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initTotalCountSuccess);
    };

    onInitTotalCountError: CallbackRegistration<OnInitTotalCountErrorCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initTotalCountError);
    };

    onInitTotalCountCancel: CallbackRegistration<OnInitTotalCountCancelCallbackPayload> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initTotalCountCancel);
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

    loadCustomElements = (options: ILoadElementsOptions, correlation?: Correlation): void => {
        this.redux.dispatch(actions.loadCustomElementsRequest({ options, correlation }));
    };

    cancelCustomElementsLoad(correlation?: Correlation): void {
        this.redux.dispatch(actions.loadCustomElementsCancelRequest({ correlation }));
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
    // Irrelevant elements
    //

    loadIrrelevantElements = (correlation?: Correlation): void => {
        this.redux.dispatch(actions.loadIrrelevantElementsRequest({ correlation: correlation }));
    };

    cancelIrrelevantElementsLoad(correlation?: Correlation): void {
        this.redux.dispatch(actions.loadIrrelevantElementsCancelRequest({ correlation: correlation }));
    }

    onLoadIrrelevantElementsStart: CallbackRegistration<OnLoadIrrelevantElementsStartCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadIrrelevantElementsStart);
    };

    onLoadIrrelevantElementsSuccess: CallbackRegistration<OnLoadIrrelevantElementsSuccessCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(
            cb,
            this.callbacks.registrations.loadIrrelevantElementsSuccess,
        );
    };

    onLoadIrrelevantElementsError: CallbackRegistration<OnLoadIrrelevantElementsErrorCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadIrrelevantElementsError);
    };

    onLoadIrrelevantElementsCancel: CallbackRegistration<OnLoadIrrelevantElementsCancelCallbackPayload> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.loadIrrelevantElementsCancel);
    };

    //
    // Elements options
    //

    setDisplayAsLabel = (displayAsLabel: ObjRef, correlation?: Correlation): void => {
        this.redux.dispatch(actions.setDisplayAsLabel({ displayAsLabel, correlation }));
    };

    getDisplayAsLabel = (): ObjRef | undefined => {
        return this.redux.select(selectAttributeFilterDisplayAsLabel);
    };

    setDisplayForm = (displayForm: ObjRef, correlation?: Correlation): void => {
        this.redux.dispatch(actions.setDisplayFormRef({ displayForm, correlation }));
    };

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

    getOrder = (): SortDirection | undefined => {
        return this.redux.select(selectOrder);
    };

    setLimitingMeasures = (filters: IMeasure[]): void => {
        this.redux.dispatch(actions.setLimitingMeasures({ filters }));
    };

    getLimitingMeasures = (): IMeasure[] => {
        return this.redux.select(selectLimitingMeasures);
    };

    setLimitingValidationItems = (validateBy: ObjRef[]): void => {
        this.redux.dispatch(actions.setLimitingValidationItems({ validateBy }));
    };

    getLimitingValidationItems = (): ObjRef[] => {
        return this.redux.select(selectLimitingValidationItems);
    };

    setLimitingAttributeFilters = (filters: IElementsQueryAttributeFilter[]): void => {
        this.redux.dispatch(actions.setLimitingAttributeFilters({ filters }));
    };

    getLimitingAttributeFilters = (): IElementsQueryAttributeFilter[] => {
        return this.redux.select(selectLimitingAttributeFilters);
    };

    setLimitingDateFilters = (filters: IRelativeDateFilter[] | IAbsoluteDateFilter[]): void => {
        this.redux.dispatch(actions.setLimitingDateFilters({ filters }));
    };

    getLimitingDateFilters = (): IRelativeDateFilter[] | IAbsoluteDateFilter[] => {
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

    getTotalCount = (): number | undefined => {
        return this.redux.select(selectElementsTotalCount);
    };

    getTotalCountWithCurrentSettings = (): number | undefined => {
        return this.redux.select(selectElementsTotalCountWithCurrentSettings);
    };

    getLimitingAttributeFiltersAttributes = (): IAttributeMetadataObject[] => {
        return this.redux.select(selectLimitingAttributeFiltersAttributes);
    };

    //
    // Multi select
    //

    changeMultiSelection = ({
        keys,
        isInverted,
        irrelevantKeys,
    }: InvertableAttributeElementSelection): void => {
        this.redux.dispatch(
            actions.changeSelection({
                selection: keys,
                isInverted,
                irrelevantSelection: irrelevantKeys,
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

    changeSingleSelection = (selection: AttributeElementKey | undefined): void => {
        this.redux.dispatch(
            actions.changeSelection({
                isInverted: false,
                selection: selection === undefined ? [] : [selection],
            }),
        );
    };

    revertSingleSelection = (): void => {
        this.redux.dispatch(actions.revertSelection());
    };

    commitSingleSelection = (): void => {
        this.redux.dispatch(actions.commitSelection());
    };

    getWorkingSingleSelection = (): AttributeElementKey | undefined => {
        const [element, ...maybeMoreElements] = this.redux.select(selectWorkingSelection);
        invariant(
            !maybeMoreElements.length,
            "Trying to invoke single select method, but multiple elements are selected.",
        );
        return element;
    };

    getCommittedSingleSelection = (): AttributeElementKey | undefined => {
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

    onSingleSelectionChanged: CallbackRegistration<
        OnSelectionChangedCallbackPayload<AttributeElementKey | undefined>
    > = (cb) => {
        return this.callbacks.registerCallback(
            ({ selection }) => cb({ selection: selection.keys.length > 0 ? selection.keys[0] : undefined }),
            this.callbacks.registrations.selectionChanged,
        );
    };

    onSingleSelectionCommitted: CallbackRegistration<
        OnSelectionCommittedCallbackPayload<AttributeElementKey | undefined>
    > = (cb) => {
        return this.callbacks.registerCallback(
            ({ selection }) => cb({ selection: selection.keys.length > 0 ? selection.keys[0] : undefined }),
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

    getFilterToDisplay = (): IAttributeFilter => {
        return this.redux.select(selectAttributeFilterToDisplay);
    };

    getOriginalFilter = (): IAttributeFilter | undefined => {
        return this.redux.select(selectOriginalFilter);
    };

    onUpdate: CallbackRegistration<void> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.update);
    };

    isLoadElementsOptionsChanged = (): boolean => {
        return this.redux.select(selectIsLoadElementsOptionsChanged);
    };
}
