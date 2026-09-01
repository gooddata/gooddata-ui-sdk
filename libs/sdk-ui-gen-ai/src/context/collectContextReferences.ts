// (C) 2026 GoodData Corporation

import {
    type IGenAIObjectReference,
    type IGenAIUserContext,
    areObjRefsEqual,
    isIdentifierRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type IGenAIContextObject, type SelectedContext } from "../types.js";
import { convertReferenceTypeToGenAiType } from "../utils.js";

export function collectContextReferences(
    userContext: IGenAIUserContext | undefined,
    selectedContext: SelectedContext | undefined,
    placeholderTitle?: string,
): IGenAIContextObject[] {
    const userReferences: IGenAIContextObject[] = [];

    // dashboard
    const userDashboard = userContext?.view?.dashboard;
    if (userDashboard) {
        const ref = userDashboard.ref;
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;

        if (!areObjRefsEqual(ref, selectedContext?.dashboard?.ref)) {
            userReferences.push({
                id,
                ref,
                nesting: 0,
                type: "dashboard",
                where: "view.dashboard",
                title: userDashboard.title || placeholderTitle || id,
            });
        }
    }

    // references
    userContext?.referencedObjects?.forEach((obj) => {
        if (areObjRefsEqual(obj.context?.ref, selectedContext?.dashboard?.ref)) {
            return;
        }
        obj.objects.forEach((item) => {
            const ref = item.ref;
            const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;

            userReferences.push({
                id,
                ref,
                nesting: 1,
                where: "referencedObjects",
                title: item.title || placeholderTitle || id,
                type: convertReferenceTypeToGenAiType(item.type),
            });
        });
    });

    return userReferences.sort((a, b) => a.nesting - b.nesting);
}

export function collectAvailableReferences(
    context: IGenAIUserContext | undefined,
    placeholderTitle?: string,
): IGenAIContextObject[] {
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
            title: dashboard.title || placeholderTitle || dashboardId,
            nesting: 0,
        });
        used.push(serializeObjRef(dashboardRef));

        const context: IGenAIObjectReference = {
            ref: dashboardRef,
            type: "DASHBOARD",
            title: dashboard.title || placeholderTitle || dashboardId,
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
                            title: widget.title || placeholderTitle || id,
                            type: "widget",
                            context,
                            insightRef: widget.insightRef,
                            ...(widget.visualizationUrl ? { visualizationUrl: widget.visualizationUrl } : {}),
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
                                title: visualization.title || placeholderTitle || id,
                                type: "widget",
                                context,
                                insightRef: visualization.insightRef,
                                ...(visualization.visualizationUrl
                                    ? { visualizationUrl: visualization.visualizationUrl }
                                    : {}),
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
