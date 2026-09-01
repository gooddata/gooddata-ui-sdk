// (C) 2026 GoodData Corporation

import {
    type IGenAIObjectReferenceGroup,
    type IGenAIUserContext,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { type IGenAIContextObject, type StoreContext } from "../types.js";

import { undefinedIfEmpty } from "./build.js";

export function removeContextReference(context: StoreContext, reference?: IGenAIContextObject): StoreContext {
    if (!context) {
        return context;
    }

    if (!reference) {
        return context;
    }

    const active = context.active;
    const newContext: IGenAIUserContext = { ...active };

    // remove dashboard reference
    if (
        reference.where === "view.dashboard" &&
        areObjRefsEqual(newContext.view?.dashboard?.ref, reference.ref)
    ) {
        newContext.view = { ...newContext.view };
        delete newContext.view.dashboard;
    }

    // remove reference
    if (reference.where === "referencedObjects") {
        newContext.referencedObjects = newContext.referencedObjects
            ?.map((obj) => {
                const clone = {
                    ...obj,
                    objects: obj.objects.filter((item) => !areObjRefsEqual(item.ref, reference.ref)),
                };
                if (clone.objects.length === 0) {
                    return null;
                }
                return clone;
            })
            .filter(Boolean) as IGenAIObjectReferenceGroup[];
    }

    return {
        ...context,
        active: normalizeContext(newContext),
    };
}

function normalizeContext(context: IGenAIUserContext): IGenAIUserContext | undefined {
    const newContext = { ...context };

    if (newContext.view && Object.keys(newContext.view).length === 0) {
        delete newContext.view;
    }
    if (!newContext.referencedObjects || newContext.referencedObjects.length === 0) {
        delete newContext.referencedObjects;
    }

    return undefinedIfEmpty(newContext);
}
