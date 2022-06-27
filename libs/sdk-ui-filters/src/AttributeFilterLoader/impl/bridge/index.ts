// (C) 2022 GoodData Corporation
import { v4 as uuid } from "uuid";
import invariant from "ts-invariant";
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
import {
    CallbackRegistration,
    Correlation,
    IElementsLoadResult,
    Loadable,
    LoadableStatus,
} from "../../types/common";
import { IAttributeFilterHandlerConfig, InvertableAttributeElementSelection } from "../../types";
import {
    actions,
    AttributeFilterStore,
    createAttributeFilterStore,
    selectAttribute,
    selectAttributeElements,
    selectAttributeElementsTotalCount,
    selectAttributeElementsTotalCountWithCurrentSettings,
    selectAttributeFilter,
    selectSearch,
    selectWorkingSelectionAttributeElements,
    selectCommitedSelectionAttributeElements,
    selectAttributeElementsMap,
    getElementsByKeys,
    selectAttributeError,
    selectAttributeStatus,
} from "../../internal";
import { newAttributeFilterCallbacks } from "./callbacks";
import { selectInvertableCommitedSelection, selectInvertableWorkingSelection } from "./selectors";

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
export class AttributeFilterReduxBridge {
    private redux: AttributeFilterStore;

    private callbacks: ReturnType<typeof newAttributeFilterCallbacks>;

    constructor(private readonly config: IAttributeFilterHandlerConfig) {
        this.initializeBridge(config);
    }

    private initializeBridge = (config: IAttributeFilterHandlerConfig) => {
        this.callbacks = newAttributeFilterCallbacks();
        this.redux = createAttributeFilterStore({
            backend: config.backend,
            workspace: config.workspace,
            attributeFilter: config.filter,
            eventListener: (action, select) => {
                this.callbacks.eventListener(action, select);
            },
        });
        this.redux.dispatch(
            actions.init({
                attributeFilter: config.filter,
                hiddenElements: config.hiddenElements,
                staticElements: config.staticElements,
            }),
        );
    };

    reset = (): void => {
        this.redux.cancelRootSaga();
        this.callbacks.unsubscribeAll();
        this.initializeBridge(this.config);
    };

    loadAttribute = (correlation: Correlation = uuid()): void => {
        this.redux.dispatch(actions.attributeRequest({ correlationId: correlation }));
    };

    cancelAttributeLoad = (): void => {
        this.redux.dispatch(actions.attributeCancelRequest());
    };

    loadElementsRange = (offset: number, limit: number, correlation: Correlation = uuid()): void => {
        this.redux.dispatch(
            actions.loadElementsRangeRequest({ options: { limit, offset }, correlationId: correlation }),
        );
    };

    cancelElementLoad(): void {
        this.redux.dispatch(actions.loadElementsRangeCancelRequest());
    }

    setSearch = (search: string): void => {
        this.redux.dispatch(actions.setSearch({ search }));
    };

    setLimitingMeasures = (filters: IMeasure[]): void => {
        this.redux.dispatch(actions.setLimitingMeasures({ filters }));
    };

    setLimitingAttributeFilters = (filters: IElementsQueryAttributeFilter[]): void => {
        this.redux.dispatch(actions.setLimitingAttributeFilters({ filters }));
    };

    setLimitingDateFilters = (filters: IRelativeDateFilter[]): void => {
        this.redux.dispatch(actions.setLimitingDateFilters({ filters }));
    };

    getSearch = (): string => {
        return this.redux.select(selectSearch);
    };

    getAllItems = (): IAttributeElement[] => {
        return this.redux.select(selectAttributeElements);
    };

    getItemsByKey = (keys: string[]): IAttributeElement[] => {
        const elementsMap = this.redux.select(selectAttributeElementsMap);
        return getElementsByKeys(keys, elementsMap);
    };

    getTotalCount = (): number => {
        return this.redux.select(selectAttributeElementsTotalCount);
    };

    getCountWithCurrentSettings = (): number => {
        return this.redux.select(selectAttributeElementsTotalCountWithCurrentSettings);
    };

    getAttribute = (): Loadable<IAttributeMetadataObject> => {
        return {
            result: this.redux.select(selectAttribute),
            error: this.redux.select(selectAttributeError),
            status: this.redux.select(selectAttributeStatus),
        } as Loadable<IAttributeMetadataObject>;
    };

    getFilter = (): IAttributeFilter => {
        return this.redux.select(selectAttributeFilter);
    };

    getLoadingStatus = (): LoadableStatus => {
        return this.redux.select(selectAttributeStatus);
    };

    //
    // Multi select
    //
    changeMultiSelection = ({ items, isInverted }: InvertableAttributeElementSelection): void => {
        this.redux.dispatch(
            actions.changeSelection({
                selection: items.map((item) => item.uri),
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
        return this.redux.select(selectInvertableCommitedSelection);
    };

    changeSingleSelection = (selection: IAttributeElement | undefined): void => {
        this.redux.dispatch(
            actions.changeSelection({
                isInverted: false,
                selection: selection ? [selection.uri] : [],
            }),
        );
    };

    revertSingleSelection = (): void => {
        this.redux.dispatch(actions.revertSelection());
    };

    commitSingleSelection = (): void => {
        this.redux.dispatch(actions.commitSelection());
    };

    getWorkingSingleSelection = (): IAttributeElement | undefined => {
        const [element, ...maybeMoreElements] = this.redux.select(selectWorkingSelectionAttributeElements);
        invariant(
            !maybeMoreElements.length,
            "Trying to invoke single select method, but multiple elements are selected.",
        );
        return element;
    };

    getCommittedSingleSelection = (): IAttributeElement | undefined => {
        const [element, ...maybeMoreElements] = this.redux.select(selectCommitedSelectionAttributeElements);
        invariant(
            !maybeMoreElements.length,
            "Trying to invoke single select method, but multiple elements are selected.",
        );
        return element;
    };

    onMultiSelectionChanged: CallbackRegistration<{ selection: InvertableAttributeElementSelection }> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.selectionChanged);
    };

    onMultiSelectionCommitted: CallbackRegistration<{ selection: InvertableAttributeElementSelection }> = (
        cb,
    ) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.selectionCommited);
    };

    onSingleSelectionChanged: CallbackRegistration<{ selection: IAttributeElement | undefined }> = (cb) => {
        return this.callbacks.registerCallback(
            ({ selection }) => cb({ selection: selection[0] }),
            this.callbacks.registrations.selectionChanged,
        );
    };

    onSingleSelectionCommitted: CallbackRegistration<{ selection: IAttributeElement | undefined }> = (cb) => {
        return this.callbacks.registerCallback(
            ({ selection }) => cb({ selection: selection[0] }),
            this.callbacks.registrations.selectionCommited,
        );
    };

    onElementsRangeLoadSuccess: CallbackRegistration<IElementsLoadResult> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.elementsRangeLoadSuccess);
    };

    onElementsRangeLoadStart: CallbackRegistration = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.elementsRangeLoadStart);
    };

    onElementsRangeLoadError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.elementsRangeLoadError);
    };

    onElementsRangeLoadCancel: CallbackRegistration = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.elementsRangeLoadCancel);
    };

    onAttributeLoadSuccess: CallbackRegistration<{ attribute: IAttributeMetadataObject }> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.attributeLoadSuccess);
    };

    onAttributeLoadStart: CallbackRegistration = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.attributeLoadStart);
    };

    onAttributeLoadError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.attributeLoadError);
    };

    onAttributeLoadCancel: CallbackRegistration = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.attributeLoadCancel);
    };

    onInitStart: CallbackRegistration = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initStart);
    };

    onInitSuccess: CallbackRegistration = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initSuccess);
    };

    onInitError: CallbackRegistration<{ error: Error }> = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initError);
    };

    onInitCancel: CallbackRegistration = (cb) => {
        return this.callbacks.registerCallback(cb, this.callbacks.registrations.initCancel);
    };
}
