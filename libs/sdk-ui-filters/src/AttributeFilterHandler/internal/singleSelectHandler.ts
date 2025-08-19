// (C) 2022-2025 GoodData Corporation
import {
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    isAttributeElementsByRef,
    isPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import { AttributeFilterLoader } from "./loader.js";
import { AttributeFilterHandlerConfig } from "./types.js";
import {
    AttributeElementKey,
    CallbackRegistration,
    ISingleSelectAttributeFilterHandler,
    OnSelectionChangedCallbackPayload,
    OnSelectionCommittedCallbackPayload,
} from "../types/index.js";

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
                ? newPositiveAttributeFilter(
                      filterObjRef(config.attributeFilter),
                      sanitizedItems,
                      filterLocalIdentifier(config.attributeFilter),
                  )
                : newNegativeAttributeFilter(
                      filterObjRef(config.attributeFilter),
                      sanitizedItems,
                      filterLocalIdentifier(config.attributeFilter),
                  ),
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
