// (C) 2022-2026 GoodData Corporation

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
import { type AttributeFilterHandlerConfig } from "./types.js";
import { type ISingleSelectAttributeFilterHandler } from "../types/attributeFilterHandler.js";
import { type AttributeElementKey, type CallbackRegistration } from "../types/common.js";
import {
    type OnSelectionChangedCallbackPayload,
    type OnSelectionCommittedCallbackPayload,
} from "../types/selectionHandler.js";

/**
 * @internal
 */
export class SingleSelectAttributeFilterHandler
    extends AttributeFilterLoader
    implements ISingleSelectAttributeFilterHandler
{
    private static sanitizeConfig(config: AttributeFilterHandlerConfig): AttributeFilterHandlerConfig {
        const elements = filterAttributeElements(config["attributeFilter"]);
        const keys = isAttributeElementsByRef(elements) ? elements.uris : elements.values;
        const firstItem = keys[0];
        const sanitizedItems = isAttributeElementsByRef(elements)
            ? { uris: [firstItem] }
            : { values: [firstItem] };
        return {
            ...config,
            attributeFilter: isPositiveAttributeFilter(config["attributeFilter"])
                ? newPositiveAttributeFilter(
                      filterObjRef(config["attributeFilter"]),
                      sanitizedItems,
                      filterLocalIdentifier(config["attributeFilter"]),
                  )
                : newNegativeAttributeFilter(
                      filterObjRef(config["attributeFilter"]),
                      sanitizedItems,
                      filterLocalIdentifier(config["attributeFilter"]),
                  ),
        };
    }

    constructor(config: AttributeFilterHandlerConfig) {
        super(SingleSelectAttributeFilterHandler.sanitizeConfig(config));
    }

    // manipulators
    changeSelection = (selection: AttributeElementKey | undefined): void => {
        this.bridge.changeSingleSelection(selection);
    };

    revertSelection = (): void => {
        this.bridge.revertSingleSelection();
    };

    commitSelection = (): void => {
        this.bridge.commitSingleSelection();
    };

    // selectors
    getWorkingSelection = (): AttributeElementKey | undefined => {
        return this.bridge.getWorkingSingleSelection();
    };

    isWorkingSelectionEmpty = (): boolean => {
        return this.bridge.getIsWorkingSelectionEmpty();
    };

    isWorkingSelectionChanged = (): boolean => {
        return this.bridge.getIsWorkingSelectionChanged();
    };

    getCommittedSelection = (): AttributeElementKey | undefined => {
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
