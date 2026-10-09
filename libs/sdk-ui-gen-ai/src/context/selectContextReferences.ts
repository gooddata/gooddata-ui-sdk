// (C) 2026 GoodData Corporation

import {
    type GenAIObjectType,
    type IGenAIUserContext,
    type ObjRef,
    areObjRefsEqual,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import type { IGenAIContextObject, SelectedContext, StoreContext } from "../types.js";

import { addContextReference } from "./addContextReference.js";
import { isReferenceChanged } from "./isReferenceChanged.js";
import { removeContextReference } from "./removeContextReference.js";
import { viewObjectId } from "./viewedPublisherDocument.js";

export function pickSelectedContextFromUserContext(
    context: StoreContext,
    userContext?: IGenAIUserContext,
): StoreContext {
    if (!userContext) {
        return context;
    }

    const dashboardGroup = userContext.referencedObjects?.find((g) =>
        areObjRefsEqual(g.context?.ref, context.ambientSelected?.dashboard?.ref),
    );
    if (dashboardGroup && dashboardGroup.objects.length > 0) {
        const first = dashboardGroup.objects[0];
        const ref = first.ref;
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;

        return {
            ...context,
            ambientSelected: {
                ...context.ambientSelected,
                visualization: {
                    id,
                    ref,
                    title: first.title,
                    nesting: 0,
                    context: dashboardGroup.context,
                    type: first.type === "WIDGET" ? "widget" : (first.type.toLowerCase() as GenAIObjectType),
                    where: "referencedObjects",
                },
            },
        };
    }

    return context;
}

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

    newContext = removeContextReference(newContext, context.ambientSelected?.dashboard);
    newContext = removeContextReference(newContext, context.ambientSelected?.publisherDocument);
    newContext = removeContextReference(newContext, context.ambientSelected?.visualization);

    if (newContext.ambientSelected?.activated) {
        newContext = addContextReference(newContext, newContext.ambientSelected?.dashboard);
        newContext = addContextReference(newContext, newContext.ambientSelected?.publisherDocument);
        newContext = addContextReference(newContext, newContext.ambientSelected?.visualization);
    }

    return newContext;
}

export function updateAmbientContext(
    context: StoreContext,
    ambient?: IGenAIUserContext,
    loading?: boolean,
): StoreContext {
    const referenceChanged = isReferenceChanged(context.ambient, ambient);
    const activated = !context.loaded;

    let newContext = { ...context };
    newContext.ambient = ambient;
    newContext.ambientLoading = loading;
    newContext = removeContextReference(newContext, context.ambientSelected?.dashboard);
    newContext = removeContextReference(newContext, context.ambientSelected?.publisherDocument);
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
    const dashboard = ambient?.view?.dashboard;
    const publisherDocument = ambient?.view?.publisherDocument;

    if (dashboard || publisherDocument) {
        newContext.loaded = true;
    }

    const selected: SelectedContext = {
        ...newContext.ambientSelected,
        dashboard: dashboard ? viewReference("dashboard", dashboard.ref, dashboard.title) : undefined,
        publisherDocument: publisherDocument
            ? viewReference("publisherDocument", publisherDocument.ref, publisherDocument.title)
            : undefined,
        ...(!dashboard || referenceChanged ? { visualization: undefined } : {}),
        ...((dashboard || publisherDocument) && activated ? { activated: true } : {}),
    };
    newContext.ambientSelected = selected;

    if (selected.activated) {
        newContext = addContextReference(newContext, selected.dashboard);
        newContext = addContextReference(newContext, selected.publisherDocument);
        newContext = addContextReference(newContext, selected.visualization);
    }

    return newContext;
}

function viewReference(
    type: "dashboard" | "publisherDocument",
    ref: ObjRef | undefined,
    title?: string,
): IGenAIContextObject {
    return {
        id: viewObjectId(ref),
        ref,
        nesting: 0,
        type,
        where: `view.${type}`,
        title: title ?? "",
    };
}
