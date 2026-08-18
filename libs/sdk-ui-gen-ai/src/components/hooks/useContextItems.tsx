// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IGenAIUserContext, serializeObjRef } from "@gooddata/sdk-model";

import {
    collectAvailableReferences,
    collectContextReferences,
} from "../../context/collectContextReferences.js";
import { contextDashboardsSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { loadContextDashboardsNextPageAction } from "../../store/chatWindow/chatWindowSlice.js";
import { type IGenAIContextObject } from "../../types.js";

export function useContextItems(
    ambient: IGenAIUserContext | undefined,
    active: IGenAIUserContext | undefined,
) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const emptyReferenceLabel = intl.formatMessage({ id: "gd.gen-ai.context.untitled" });
    const dashboards = useSelector(contextDashboardsSelector);

    const items = useMemo(() => {
        const ambientReferences = collectAvailableReferences(ambient, emptyReferenceLabel);
        const selectedReferences = collectContextReferences(active, emptyReferenceLabel);

        const offered = new Set(ambientReferences.map((reference) => serializeObjRef(reference.ref)));
        const dashboardReferences = dashboards.items
            .filter((dashboard) => !offered.has(serializeObjRef(dashboard.ref)))
            .map(
                (dashboard): IGenAIContextObject => ({
                    id: dashboard.id,
                    ref: dashboard.ref,
                    type: "dashboard",
                    where: "referencedObjects",
                    title: dashboard.title || emptyReferenceLabel || dashboard.id,
                    nesting: 1,
                }),
            );

        return [...ambientReferences, ...dashboardReferences].filter(
            (reference) =>
                !selectedReferences.some(
                    (selectedReference) =>
                        selectedReference.id === reference.id && selectedReference.type === reference.type,
                ),
        );
    }, [active, ambient, dashboards.items, emptyReferenceLabel]);

    const loadNextPage = useCallback(() => {
        dispatch(loadContextDashboardsNextPageAction());
    }, [dispatch]);

    return {
        items,
        isLoading: dashboards.isLoading,
        hasNextPage: dashboards.hasNextPage,
        loadNextPage,
    };
}
