// (C) 2026 GoodData Corporation

import {
    type IGenAIPublisherDocumentContext,
    type IGenAIPublisherDocumentContextV2,
    type IGenAIUIContext,
    type ObjRef,
    areObjRefsEqual,
    isIdentifierRef,
} from "@gooddata/sdk-model";

const UNSAVED_VIEW_OBJECT_ID = "unsaved";

/**
 * The id of the object the user is viewing. An object that is not saved yet has no reference, and
 * only one object can be viewed at a time, so one fixed id names it.
 */
export function viewObjectId(ref: ObjRef | undefined): string {
    if (!ref) {
        return UNSAVED_VIEW_OBJECT_ID;
    }
    return isIdentifierRef(ref) ? ref.identifier : ref.uri;
}

export function viewedPublisherDocument(
    view: IGenAIUIContext | undefined,
): IGenAIPublisherDocumentContext | IGenAIPublisherDocumentContextV2 | undefined {
    return view?.publisherDocumentV2 ?? view?.publisherDocument;
}

export function publisherDocumentViews(
    view: IGenAIUIContext | undefined,
): Pick<IGenAIUIContext, "publisherDocument" | "publisherDocumentV2"> {
    return {
        ...(view?.publisherDocument ? { publisherDocument: view.publisherDocument } : {}),
        ...(view?.publisherDocumentV2 ? { publisherDocumentV2: view.publisherDocumentV2 } : {}),
    };
}

/**
 * Whether both are the document the user is viewing. Two documents that are not saved yet count as the
 * same one, but an absent document is never the same as one that is not saved yet.
 */
export function isSameViewedPublisherDocument(
    a: { ref?: ObjRef } | undefined,
    b: { ref?: ObjRef } | undefined,
): boolean {
    return a !== undefined && b !== undefined && areObjRefsEqual(a.ref, b.ref);
}
