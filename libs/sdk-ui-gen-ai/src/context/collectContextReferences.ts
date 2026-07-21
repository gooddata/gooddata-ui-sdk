// (C) 2026 GoodData Corporation

import {
    type IGenAIObjectReference,
    type IGenAIUserContext,
    isIdentifierRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type IGenAIContextObject } from "../types.js";
import { convertReferenceTypeToGenAiType } from "../utils.js";

export function collectContextReferences(context: IGenAIUserContext | undefined): IGenAIContextObject[] {
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

    // references
    context.referencedObjects?.forEach((obj) => {
        obj.objects.forEach((item) => {
            const ref = item.ref;
            const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;

            references.push({
                id,
                ref,
                nesting: 1,
                where: "referencedObjects",
                title: item.title ?? id,
                type: convertReferenceTypeToGenAiType(item.type),
            });
        });
    });

    return references.sort((a, b) => a.nesting - b.nesting);
}

export function collectAvailableReferences(context: IGenAIUserContext | undefined): IGenAIContextObject[] {
    if (!context) {
        return [];
    }

    const references: IGenAIContextObject[] = [];
    const used: string[] = [];

    // dashboard
    const dashboard = context.view?.dashboard;
    if (dashboard) {
        const dashboardRef = dashboard.ref;
        const dashboardId = isIdentifierRef(dashboardRef) ? dashboardRef.identifier : dashboardRef.uri;
        references.push({
            id: dashboardId,
            ref: dashboardRef,
            type: "dashboard",
            where: "view.dashboard",
            title: dashboard.title ?? dashboardId,
            nesting: 0,
        });
        used.push(serializeObjRef(dashboardRef));

        const context: IGenAIObjectReference = {
            ref: dashboardRef,
            type: "DASHBOARD",
            title: dashboard.title ?? dashboardId,
        };
        dashboard.widgets.forEach((widget) => {
            switch (widget.widgetType) {
                case "insight": {
                    const ref = widget.widgetRef;
                    if (!ref) {
                        return;
                    }
                    const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
                    const key = serializeObjRef(ref);
                    if (!used.includes(key)) {
                        used.push(key);
                        references.push({
                            id,
                            ref,
                            nesting: 1,
                            where: "referencedObjects",
                            title: widget.title ?? id,
                            type: "widget",
                            context,
                        });
                    }
                    break;
                }
                case "visualizationSwitcher": {
                    widget.visualizations?.forEach((visualization) => {
                        const ref = visualization.widgetRef;
                        if (!ref) {
                            return;
                        }
                        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
                        const key = serializeObjRef(ref);
                        if (!used.includes(key)) {
                            used.push(key);
                            references.push({
                                id,
                                ref,
                                nesting: 1,
                                where: "referencedObjects",
                                title: visualization.title ?? id,
                                type: "widget",
                                context,
                            });
                        }
                    });
                    break;
                }
                default:
                    break;
            }
        });
    }

    return references.sort((a, b) => a.nesting - b.nesting);
}
