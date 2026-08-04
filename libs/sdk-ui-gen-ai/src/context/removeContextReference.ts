// (C) 2026 GoodData Corporation

import {
    type IGenAIObjectReferenceGroup,
    type IGenAIUserContext,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { type IGenAIContextObject } from "../types.js";

import { undefinedIfEmpty } from "./build.js";

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

    return normalizeContext(newContext);
}

/**
 * Removes from `context` everything that was contributed by `ambient` - the dashboard the user was
 * viewing, plus the objects they pinned from it.
 * @internal
 */
export function removeAmbientContribution(
    context: IGenAIUserContext | undefined,
    ambient: IGenAIUserContext | undefined,
): IGenAIUserContext | undefined {
    const ambientDashboardRef = ambient?.view?.dashboard?.ref;

    if (!context || !ambientDashboardRef) {
        return context;
    }

    const newContext: IGenAIUserContext = { ...context };

    if (areObjRefsEqual(newContext.view?.dashboard?.ref, ambientDashboardRef)) {
        newContext.view = { ...newContext.view };
        delete newContext.view.dashboard;
    }

    newContext.referencedObjects = newContext.referencedObjects?.filter(
        (group) => !areObjRefsEqual(group.context?.ref, ambientDashboardRef),
    );

    return normalizeContext(newContext);
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

export function removeUserContextReferences(
    context: IGenAIUserContext | undefined,
): IGenAIUserContext | undefined {
    if (!context) {
        return undefined;
    }
    const newContext: IGenAIUserContext = { ...context };
    delete newContext.referencedObjects;
    delete newContext.activeObject;

    return undefinedIfEmpty(newContext);
}
