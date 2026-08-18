// (C) 2026 GoodData Corporation

import {
    type IGenAIObjectReference,
    type IGenAIObjectReferenceGroup,
    type IGenAIUserContext,
    areObjRefsEqual,
    serializeObjRef,
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
 * Removes what `ambient` put in `context` on its own - the viewed dashboard and its own references.
 * The user's own picks stay, the objects pinned from that dashboard included.
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

    newContext.referencedObjects = withoutObjects(
        newContext.referencedObjects,
        collectRefKeys(ambient.referencedObjects?.flatMap((group) => group.objects)),
    );

    return normalizeContext(newContext);
}

/**
 * Removes the references the newly opened dashboard covers itself - its own ref and the
 * visualizations it renders - so nothing added earlier sits in the context twice.
 * @internal
 */
export function removeReferencesCoveredByAmbient(
    context: IGenAIUserContext | undefined,
    ambient: IGenAIUserContext | undefined,
): IGenAIUserContext | undefined {
    const dashboard = ambient?.view?.dashboard;

    if (!context?.referencedObjects || !dashboard) {
        return context;
    }

    const covered = new Set<string>([serializeObjRef(dashboard.ref)]);
    dashboard.widgets?.forEach((widget) => {
        [widget, ...(widget.visualizations ?? [])].forEach(({ widgetRef, insightRef }) => {
            if (widgetRef) {
                covered.add(serializeObjRef(widgetRef));
            }
            if (insightRef) {
                covered.add(serializeObjRef(insightRef));
            }
        });
    });

    return normalizeContext({
        ...context,
        referencedObjects: withoutObjects(context.referencedObjects, covered),
    });
}

function collectRefKeys(objects: IGenAIObjectReference[] | undefined): Set<string> {
    return new Set(objects?.map((object) => serializeObjRef(object.ref)));
}

function withoutObjects(
    groups: IGenAIObjectReferenceGroup[] | undefined,
    removedRefKeys: Set<string>,
): IGenAIObjectReferenceGroup[] | undefined {
    if (!groups || removedRefKeys.size === 0) {
        return groups;
    }

    return groups
        .map((group) => ({
            ...group,
            objects: group.objects.filter((object) => !removedRefKeys.has(serializeObjRef(object.ref))),
        }))
        .filter((group) => group.objects.length > 0);
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
