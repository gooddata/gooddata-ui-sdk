// (C) 2026 GoodData Corporation

import { type IGenAIUserContext } from "@gooddata/sdk-model";

import type { IGenAIContextObject } from "./collectContextReferences.js";

export function removeContextReference(
    context: IGenAIUserContext | undefined,
    reference?: IGenAIContextObject,
): IGenAIUserContext | undefined {
    if (!context) {
        return undefined;
    }

    if (!reference) {
        return context;
    }

    const newContext: IGenAIUserContext = { ...context };

    // remove dashboard reference
    if (reference.where === "view.dashboard" && newContext.view) {
        newContext.view = { ...newContext.view };
        delete newContext.view.dashboard;
    }

    // make clean context
    if (newContext.view && Object.keys(newContext.view).length === 0) {
        delete newContext.view;
    }
    if (newContext.referencedObjects?.length === 0) {
        delete newContext.referencedObjects;
    }

    if (Object.keys(newContext).length === 0) {
        return undefined;
    }
    return newContext;
}
