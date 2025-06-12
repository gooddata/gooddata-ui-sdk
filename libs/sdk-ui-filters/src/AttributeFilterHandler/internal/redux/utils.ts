// (C) 2024 GoodData Corporation

import { AttributeFilterHandlerStoreContext } from "./store/types.js";

/**
 * We want to display non-unique values when non-primary label is used when feature flag is enabled.
 * Once feature flag is removed, the method can be deleted and all its usage replaced with "false".
 */
export const shouldExcludePrimaryLabel = (
    context: AttributeFilterHandlerStoreContext,
    elementsForm: "uris" | "values",
): boolean => {
    return context.enableDuplicatedLabelValuesInAttributeFilter
        ? false
        : !context.backend.capabilities.supportsElementUris && elementsForm === "values";
};
