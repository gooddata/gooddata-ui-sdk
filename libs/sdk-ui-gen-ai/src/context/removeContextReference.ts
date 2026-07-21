// (C) 2026 GoodData Corporation

import {
    type IGenAIObjectReferenceGroup,
    type IGenAIUserContext,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { type IGenAIContextObject } from "../types.js";

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

    // make clean context
    if (newContext.view && Object.keys(newContext.view).length === 0) {
        delete newContext.view;
    }
    if (!newContext.referencedObjects || newContext.referencedObjects.length === 0) {
        delete newContext.referencedObjects;
    }

    if (Object.keys(newContext).length === 0) {
        return undefined;
    }
    return newContext;
}

export function removeUserContextReferences(
    context: IGenAIUserContext | undefined,
): IGenAIUserContext | undefined {
    if (!context) {
        return undefined;
    }
    const newContext: IGenAIUserContext = { ...context };
    delete newContext.referencedObjects;
    delete newContext.activeObject;

    if (Object.keys(newContext).length === 0) {
        return undefined;
    }
    return newContext;
}
