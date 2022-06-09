// (C) 2022 GoodData Corporation
import {
    IAttributeElement,
    filterObjRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
    isPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { CallbackRegistration, ISingleSelectAttributeFilterHandler } from "../types";
import { AttributeFilterLoader, IAttributeFilterHandlerConfig } from "./loader";

/**
 * @internal
 */
export class SingleSelectAttributeFilterHandler
    extends AttributeFilterLoader
    implements ISingleSelectAttributeFilterHandler
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
        super(SingleSelectAttributeFilterHandler.sanitizeConfig(config));
    }

    // manipulators
    changeSelection = (selection: IAttributeElement | undefined): void => {
        this.bridge.changeSingleSelection(selection);
    };

    revertSelection = (): void => {
        this.bridge.revertSingleSelection();
    };

    commitSelection = (): void => {
        this.bridge.commitSingleSelection();
    };

    // selectors
    getWorkingSelection = (): IAttributeElement | undefined => {
        return this.bridge.getWorkingSingleSelection();
    };

    getCommittedSelection = (): IAttributeElement | undefined => {
        return this.bridge.getCommittedSingleSelection();
    };

    // callbacks
    onSelectionChanged: CallbackRegistration<{ selection: IAttributeElement | undefined }> = (cb) => {
        return this.bridge.onSingleSelectionChanged(cb);
    };

    onSelectionCommitted: CallbackRegistration<{ selection: IAttributeElement | undefined }> = (cb) => {
        return this.bridge.onSingleSelectionCommitted(cb);
    };
}
