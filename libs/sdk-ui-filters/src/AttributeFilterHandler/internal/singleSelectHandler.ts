// (C) 2022 GoodData Corporation
import {
    filterObjRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
    isPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import {
    AttributeElementKey,
    CallbackRegistration,
    ISingleSelectAttributeFilterHandler,
    OnSelectionChangedCallbackPayload,
    OnSelectionCommittedCallbackPayload,
} from "../types/index.js";
import { AttributeFilterLoader } from "./loader.js";
import { AttributeFilterHandlerConfig } from "./types.js";

/**
 * @internal
 */
export class SingleSelectAttributeFilterHandler
    extends AttributeFilterLoader
    implements ISingleSelectAttributeFilterHandler
{
    private static sanitizeConfig(config: AttributeFilterHandlerConfig): AttributeFilterHandlerConfig {
        const elements = filterAttributeElements(config.attributeFilter);
        const keys = isAttributeElementsByRef(elements) ? elements.uris : elements.values;
        const firstItem = keys[0];
        const sanitizedItems = isAttributeElementsByRef(elements)
            ? { uris: [firstItem] }
            : { values: [firstItem] };
        return {
            ...config,
            attributeFilter: isPositiveAttributeFilter(config.attributeFilter)
                ? newPositiveAttributeFilter(filterObjRef(config.attributeFilter), sanitizedItems)
                : newNegativeAttributeFilter(filterObjRef(config.attributeFilter), sanitizedItems),
        };
    }

    constructor(config: AttributeFilterHandlerConfig) {
        super(SingleSelectAttributeFilterHandler.sanitizeConfig(config));
    }

    // manipulators
    changeSelection = (selection: string | undefined): void => {
        this.bridge.changeSingleSelection(selection);
    };

    revertSelection = (): void => {
        this.bridge.revertSingleSelection();
    };

    commitSelection = (): void => {
        this.bridge.commitSingleSelection();
    };

    // selectors
    getWorkingSelection = (): string | undefined => {
        return this.bridge.getWorkingSingleSelection();
    };

    isWorkingSelectionEmpty = (): boolean => {
        return this.bridge.getIsWorkingSelectionEmpty();
    };

    isWorkingSelectionChanged = (): boolean => {
        return this.bridge.getIsWorkingSelectionChanged();
    };

    getCommittedSelection = (): string | undefined => {
        return this.bridge.getCommittedSingleSelection();
    };

    // callbacks
    onSelectionChanged: CallbackRegistration<
        OnSelectionChangedCallbackPayload<AttributeElementKey | undefined>
    > = (cb) => {
        return this.bridge.onSingleSelectionChanged(cb);
    };

    onSelectionCommitted: CallbackRegistration<
        OnSelectionCommittedCallbackPayload<AttributeElementKey | undefined>
    > = (cb) => {
        return this.bridge.onSingleSelectionCommitted(cb);
    };
}
