// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IGenAIUserContext, type ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import {
    collectAvailableReferences,
    collectContextReferences,
} from "../../context/collectContextReferences.js";
import {
    contextObjectsSearchSelector,
    contextObjectsSelector,
    selectedContextSelector,
} from "../../store/chatWindow/chatWindowSelectors.js";
import {
    loadContextObjectsNextPageAction,
    setContextObjectsSearchAction,
} from "../../store/chatWindow/chatWindowSlice.js";
import {
    type ContextObjectKind,
    type ContextObjectListState,
    type IGenAIContextListItem,
    type IGenAIContextObject,
    type SelectedContext,
} from "../../types.js";

export function useUserContextItems(
    ambientContext: IGenAIUserContext | undefined,
    selectedContext: SelectedContext | undefined,
    activeContext: IGenAIUserContext | undefined,
) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const emptyReferenceLabel = intl.formatMessage({ id: "gd.gen-ai.context.untitled" });
    const contextObjects = useSelector(contextObjectsSelector);
    const search = useSelector(contextObjectsSearchSelector);
    const dashboards = contextObjects.dashboard;
    const visualizations = contextObjects.visualization;

    const items = useMemo(() => {
        const matchesSearch = titleMatcher(search);
        const selectedReferences = collectContextReferences(
            activeContext,
            selectedContext,
            emptyReferenceLabel,
        );

        const offered = new Set<string>();
        collectAvailableReferences(ambientContext, emptyReferenceLabel).forEach((reference) => {
            offered.add(serializeObjRef(reference.ref));
            if (reference.insightRef) {
                offered.add(serializeObjRef(reference.insightRef));
            }
        });

        const workspaceReferences = [
            ...searchable(dashboards, "dashboard", emptyReferenceLabel, matchesSearch),
            ...searchable(visualizations, "visualization", emptyReferenceLabel, matchesSearch),
        ].filter((reference) => !offered.has(serializeObjRef(reference.ref)));

        return workspaceReferences.filter(
            (reference) =>
                !selectedReferences.some((selectedReference) => isSameObject(selectedReference, reference)),
        );
    }, [
        search,
        ambientContext,
        emptyReferenceLabel,
        activeContext,
        selectedContext,
        dashboards,
        visualizations,
    ]);

    const setSearch = useCallback(
        (value: string) => {
            if (value === search) {
                return;
            }

            dispatch(setContextObjectsSearchAction({ search: value }));
        },
        [dispatch, search],
    );

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
        search,
        setSearch,
        isLoading: dashboards.isLoading || visualizations.isLoading,
        hasNextPage: nextPageKind !== undefined,
        loadNextPage,
    };
}

export function useAmbientContextItems(ambientContext: IGenAIUserContext | undefined) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const emptyReferenceLabel = intl.formatMessage({ id: "gd.gen-ai.context.untitled" });
    const thisDashboardLabel = intl.formatMessage({ id: "gd.gen-ai.context.this" });
    const search = useSelector(contextObjectsSearchSelector);
    const selected = useSelector(selectedContextSelector);

    const items = useMemo(() => {
        const matchesSearch = titleMatcher(search);
        return collectAvailableReferences(ambientContext, emptyReferenceLabel)
            .map((item) => {
                if (item.type === "dashboard") {
                    return {
                        ...item,
                        title: thisDashboardLabel,
                    };
                }
                return item;
            })
            .filter(matchesSearch);
    }, [search, ambientContext, emptyReferenceLabel, thisDashboardLabel]);

    const setSearch = useCallback(
        (value: string) => {
            if (value === search) {
                return;
            }

            dispatch(setContextObjectsSearchAction({ search: value }));
        },
        [dispatch, search],
    );

    return {
        items,
        search,
        setSearch,
        selectedIds: [
            selected?.visualization?.ref ? selected?.visualization?.ref : selected?.dashboard?.ref,
        ].filter(Boolean) as ObjRef[],
    };
}

function titleMatcher(search: string | undefined): (reference: IGenAIContextObject) => boolean {
    const normalized = (search || "").trim().toLowerCase();

    return normalized ? (reference) => reference.title.toLowerCase().includes(normalized) : () => true;
}

function searchable(
    list: ContextObjectListState,
    type: ContextObjectKind,
    emptyReferenceLabel: string,
    matchesSearch: (reference: IGenAIContextObject) => boolean,
): IGenAIContextObject[] {
    const references = toContextObjects(list.items, type, emptyReferenceLabel);

    return list.isExternal ? references.filter(matchesSearch) : references;
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
            ...(item.visualizationUrl ? { visualizationUrl: item.visualizationUrl } : {}),
        }),
    );
}

function isSameObject(a: IGenAIContextObject, b: IGenAIContextObject): boolean {
    return a.id === b.id && normalizeType(a.type) === normalizeType(b.type);
}

function normalizeType(type: IGenAIContextObject["type"]): IGenAIContextObject["type"] {
    return type === "widget" ? "visualization" : type;
}
