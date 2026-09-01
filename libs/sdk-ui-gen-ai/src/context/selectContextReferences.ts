// (C) 2026 GoodData Corporation

import { type IGenAIUserContext, isIdentifierRef } from "@gooddata/sdk-model";

import type { IGenAIContextObject, SelectedContext, StoreContext } from "../types.js";

import { addContextReference } from "./addContextReference.js";
import { isReferenceChanged } from "./isReferenceChanged.js";
import { removeContextReference } from "./removeContextReference.js";

export function selectContextReferences(
    context: StoreContext,
    selected: Partial<SelectedContext> | undefined,
): StoreContext {
    let newContext: StoreContext = {
        ...context,
        ambientSelected: {
            ...context.ambientSelected,
            ...selected,
        },
    };

    if (newContext.ambientSelected?.activated) {
        newContext = addContextReference(newContext, newContext.ambientSelected?.dashboard);
        newContext = addContextReference(newContext, newContext.ambientSelected?.visualization);
    } else {
        newContext = removeContextReference(newContext, context.ambientSelected?.dashboard);
        newContext = removeContextReference(newContext, context.ambientSelected?.visualization);
    }

    return newContext;
}

export function updateAmbientContext(context: StoreContext, ambient?: IGenAIUserContext): StoreContext {
    const referenceChanged = isReferenceChanged(context.ambient, ambient);
    const activated = !context.loaded;

    let newContext = { ...context };
    newContext.ambient = ambient;
    newContext = removeContextReference(newContext, context.ambientSelected?.dashboard);
    newContext = removeContextReference(newContext, context.ambientSelected?.visualization);
    newContext = updateContextReference(newContext, ambient, referenceChanged, activated);
    return newContext;
}

function updateContextReference(
    newContext: StoreContext,
    ambient?: IGenAIUserContext,
    referenceChanged?: boolean,
    activated?: boolean,
) {
    let reference: IGenAIContextObject | undefined = undefined;
    if (ambient?.view?.dashboard) {
        const dash = ambient.view.dashboard;
        const ref = dash.ref;
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;

        reference = {
            id,
            ref,
            nesting: 0,
            type: "dashboard",
            where: "view.dashboard",
            title: dash.title ?? "",
        };

        newContext.loaded = true;
        newContext.ambientSelected = {
            ...newContext.ambientSelected,
            dashboard: reference,
            ...(referenceChanged ? { visualization: undefined } : {}),
            ...(activated ? { activated: true } : {}),
        };
    } else {
        newContext.ambientSelected = {
            ...newContext.ambientSelected,
            dashboard: undefined,
            visualization: undefined,
        };
    }

    if (newContext.ambientSelected?.activated) {
        newContext = addContextReference(newContext, newContext.ambientSelected?.dashboard);
        newContext = addContextReference(newContext, newContext.ambientSelected?.visualization);
    }

    return newContext;
}
