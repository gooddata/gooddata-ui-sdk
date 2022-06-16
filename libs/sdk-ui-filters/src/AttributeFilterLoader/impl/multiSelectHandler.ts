// (C) 2022 GoodData Corporation
import { CallbackRegistration } from "../types/common";
import {
    IAttributeFilterHandlerConfig,
    IMultiSelectAttributeFilterHandler,
    InvertableAttributeElementSelection,
} from "../types";
import { AttributeFilterLoader } from "./loader";

/**
 * @internal
 */
export class MultiSelectAttributeFilterHandler
    extends AttributeFilterLoader
    implements IMultiSelectAttributeFilterHandler
{
    constructor(config: IAttributeFilterHandlerConfig) {
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
        this.bridge.invertMultiSelection();
    };

    // selectors
    getWorkingSelection = (): InvertableAttributeElementSelection => {
        return this.bridge.getWorkingMultiSelection();
    };

    getCommittedSelection = (): InvertableAttributeElementSelection => {
        return this.bridge.getCommittedMultiSelection();
    };

    // callbacks
    onSelectionChanged: CallbackRegistration<{ selection: InvertableAttributeElementSelection }> = (cb) => {
        return this.bridge.onMultiSelectionChanged(cb);
    };

    onSelectionCommitted: CallbackRegistration<{ selection: InvertableAttributeElementSelection }> = (cb) => {
        return this.bridge.onMultiSelectionCommitted(cb);
    };
}
