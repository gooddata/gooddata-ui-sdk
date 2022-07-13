// (C) 2022 GoodData Corporation
import { v4 as uuid } from "uuid";
import invariant from "ts-invariant";
import compact from "lodash/compact";
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
import { CallbackRegistration, Correlation, IElementsLoadResult } from "../../types/common";
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
    selectWorkingSelection,
    selectCommitedSelection,
    selectAttributeElementsMap,
    getElementsByKeys,
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
    private config: IAttributeFilterHandlerConfig;

    private callbacks: ReturnType<typeof newAttributeFilterCallbacks>;

    constructor(config: IAttributeFilterHandlerConfig) {
        this.config = config;
        this.initializeBridge();
    }

    private initializeBridge = () => {
        this.callbacks = newAttributeFilterCallbacks();
        this.redux = createAttributeFilterStore({
            backend: this.config.backend,
            workspace: this.config.workspace,
            attributeFilter: this.config.filter,
            eventListener: (action, select) => {
                this.callbacks.eventListener(action, select);
            },
        });
    };

    init = (correlation?: string): void => {
        this.redux.dispatch(
            actions.init({
                correlationId: correlation,
                attributeFilter: this.config.filter,
                hiddenElements: this.config.hiddenElements,
                staticElements: this.config.staticElements,
            }),
        );
    };

    reset = (): void => {
        this.redux.cancelRootSaga();
        this.callbacks.unsubscribeAll();
        this.initializeBridge();
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

    getAttribute = (): IAttributeMetadataObject | undefined => {
        return this.redux.select(selectAttribute);
    };

    getFilter = (): IAttributeFilter => {
        return this.redux.select(selectAttributeFilter);
    };

    //
    // Multi select
    //
    changeMultiSelection = ({ items, isInverted }: InvertableAttributeElementSelection): void => {
        this.redux.dispatch(
            actions.changeSelection({
                selection: items,
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
        const [element, ...maybeMoreElements] = this.redux.select(selectCommitedSelection);
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

    onSingleSelectionChanged: CallbackRegistration<{ selection: string | undefined }> = (cb) => {
        return this.callbacks.registerCallback(
            ({ selection }) => cb({ selection: selection[0] }),
            this.callbacks.registrations.selectionChanged,
        );
    };

    onSingleSelectionCommitted: CallbackRegistration<{ selection: string | undefined }> = (cb) => {
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
