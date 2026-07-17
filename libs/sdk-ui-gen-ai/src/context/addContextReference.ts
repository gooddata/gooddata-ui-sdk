// (C) 2026 GoodData Corporation

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { type StoreContext } from "../types.js";

import type { IGenAIContextObject } from "./collectContextReferences.js";

export function addContextReference(context: StoreContext, reference?: IGenAIContextObject): StoreContext {
    const { ambient } = context;

    if (!reference) {
        return context;
    }

    if (reference.where === "view.dashboard") {
        const ambientRef = ambient?.view?.dashboard?.ref;
        const ref = reference.ref;

        if (areObjRefsEqual(ambientRef, ref)) {
            return {
                ...context,
                ambientMode: "enabled",
            };
        }
    }

    return context;
}
