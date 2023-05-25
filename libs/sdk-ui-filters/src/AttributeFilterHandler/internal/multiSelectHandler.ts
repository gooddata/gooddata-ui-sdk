// (C) 2022 GoodData Corporation
import {
    CallbackRegistration,
    IMultiSelectAttributeFilterHandler,
    InvertableAttributeElementSelection,
    OnSelectionChangedCallbackPayload,
    OnSelectionCommittedCallbackPayload,
} from "../types/index.js";
import { AttributeFilterLoader } from "./loader.js";
import { AttributeFilterHandlerConfig } from "./types.js";

/**
 * @internal
 */
export class MultiSelectAttributeFilterHandler
    extends AttributeFilterLoader
    implements IMultiSelectAttributeFilterHandler
{
    constructor(config: AttributeFilterHandlerConfig) {
        super(config);
    }

    // manipulators
    changeSelection = (selection: InvertableAttributeElementSelection): void => {
        this.bridge.changeMultiSelection(selection);
    };

    revertSelection = (): void => {
        this.bridge.revertMultiSelection();
    };

    commitSelection = (): void => {
        this.bridge.commitMultiSelection();
    };

    invertSelection = (): void => {
        this.bridge.invertMultiSelection();
    };

    clearSelection = (): void => {
        this.bridge.clearMultiSelection();
    };

    // selectors
    getWorkingSelection = (): InvertableAttributeElementSelection => {
        return this.bridge.getWorkingMultiSelection();
    };

    isWorkingSelectionEmpty = (): boolean => {
        return this.bridge.getIsWorkingSelectionEmpty();
    };

    isWorkingSelectionChanged = (): boolean => {
        return this.bridge.getIsWorkingSelectionChanged();
    };

    getCommittedSelection = (): InvertableAttributeElementSelection => {
        return this.bridge.getCommittedMultiSelection();
    };

    // callbacks
    onSelectionChanged: CallbackRegistration<
        OnSelectionChangedCallbackPayload<InvertableAttributeElementSelection>
    > = (cb) => {
        return this.bridge.onMultiSelectionChanged(cb);
    };

    onSelectionCommitted: CallbackRegistration<
        OnSelectionCommittedCallbackPayload<InvertableAttributeElementSelection>
    > = (cb) => {
        return this.bridge.onMultiSelectionCommitted(cb);
    };
}
