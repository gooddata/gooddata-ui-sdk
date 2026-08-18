// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IGenAIUserContext, serializeObjRef } from "@gooddata/sdk-model";

import {
    collectAvailableReferences,
    collectContextReferences,
} from "../../context/collectContextReferences.js";
import { contextObjectsSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { loadContextObjectsNextPageAction } from "../../store/chatWindow/chatWindowSlice.js";
import { type ContextObjectKind, type IGenAIContextListItem, type IGenAIContextObject } from "../../types.js";

export function useContextItems(
    ambient: IGenAIUserContext | undefined,
    active: IGenAIUserContext | undefined,
) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const emptyReferenceLabel = intl.formatMessage({ id: "gd.gen-ai.context.untitled" });
    const contextObjects = useSelector(contextObjectsSelector);
    const dashboards = contextObjects.dashboard;
    const visualizations = contextObjects.visualization;

    const items = useMemo(() => {
        const ambientReferences = collectAvailableReferences(ambient, emptyReferenceLabel);
        const selectedReferences = collectContextReferences(active, emptyReferenceLabel);

        const offered = new Set<string>();
        ambientReferences.forEach((reference) => {
            offered.add(serializeObjRef(reference.ref));
            if (reference.insightRef) {
                offered.add(serializeObjRef(reference.insightRef));
            }
        });

        const workspaceReferences = [
            ...toContextObjects(dashboards.items, "dashboard", emptyReferenceLabel),
            ...toContextObjects(visualizations.items, "visualization", emptyReferenceLabel),
        ].filter((reference) => !offered.has(serializeObjRef(reference.ref)));

        return [...ambientReferences, ...workspaceReferences].filter(
            (reference) =>
                !selectedReferences.some((selectedReference) => isSameObject(selectedReference, reference)),
        );
    }, [active, ambient, dashboards.items, visualizations.items, emptyReferenceLabel]);

    const nextPageKind: ContextObjectKind | undefined = dashboards.hasNextPage
        ? "dashboard"
        : visualizations.hasNextPage
          ? "visualization"
          : undefined;

    const loadNextPage = useCallback(() => {
        if (!nextPageKind) {
            return;
        }

        dispatch(loadContextObjectsNextPageAction({ kind: nextPageKind }));
    }, [dispatch, nextPageKind]);

    return {
        items,
        isLoading: dashboards.isLoading || visualizations.isLoading,
        hasNextPage: nextPageKind !== undefined,
        loadNextPage,
    };
}

function toContextObjects(
    items: IGenAIContextListItem[],
    type: ContextObjectKind,
    emptyReferenceLabel: string,
): IGenAIContextObject[] {
    return items.map(
        (item): IGenAIContextObject => ({
            id: item.id,
            ref: item.ref,
            type,
            where: "referencedObjects",
            title: item.title || emptyReferenceLabel || item.id,
            nesting: 1,
        }),
    );
}

function isSameObject(a: IGenAIContextObject, b: IGenAIContextObject): boolean {
    return a.id === b.id && normalizeType(a.type) === normalizeType(b.type);
}

function normalizeType(type: IGenAIContextObject["type"]): IGenAIContextObject["type"] {
    return type === "widget" ? "visualization" : type;
}
