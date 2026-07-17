// (C) 2026 GoodData Corporation

import {
    type GenAIObjectType,
    type IGenAIUserContext,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

export interface IGenAIContextObject {
    id: string;
    ref: ObjRef;
    title: string;
    type: GenAIObjectType;
    where: "view.dashboard";
    nesting: number;
}

export function collectContextReferences(
    context: IGenAIUserContext | undefined,
    type: "ambient" | "user",
): IGenAIContextObject[] {
    if (!context) {
        return [];
    }

    const references: IGenAIContextObject[] = [];

    // dashboard
    const dashboard = context.view?.dashboard;
    if (dashboard) {
        const ref = dashboard.ref;
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
        references.push({
            id,
            ref,
            type: "dashboard",
            where: "view.dashboard",
            title: dashboard.title ?? id,
            nesting: 0,
        });
    }

    //NOTE: For ambient we need to return only one object with
    // most deep nesting level.
    if (type === "ambient") {
        return references.sort((a, b) => b.nesting - a.nesting).slice(0, 1);
    }
    //NOTE: For user we need to return all objects.
    return references;
}
