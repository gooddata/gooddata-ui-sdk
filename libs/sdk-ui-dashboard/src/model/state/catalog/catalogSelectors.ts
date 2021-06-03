// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../dashboardStore";
import flatMap from "lodash/flatMap";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.catalog,
);

/**
 * @internal
 */
export const selectCatalogAttributes = createSelector(selectSelf, (state) => {
    return state.attributes ?? [];
});

/**
 * @internal
 */
export const selectCatalogMeasures = createSelector(selectSelf, (state) => {
    return state.measures ?? [];
});

/**
 * @internal
 */
export const selectCatalogFacts = createSelector(selectSelf, (state) => {
    return state.facts ?? [];
});

/**
 * @internal
 */
export const selectCatalogDateDatasets = createSelector(selectSelf, (state) => {
    return state.dateDatasets ?? [];
});

/**
 * @internal
 */
export const selectAttributesWithDrillDown = createSelector(
    [selectCatalogAttributes, selectCatalogDateDatasets],
    (attributes = [], dateDatasets = []) => {
        const dateAttributes = flatMap(dateDatasets ?? [], (dd) => dd.dateAttributes);
        return [...attributes, ...dateAttributes].filter((attr) => attr.attribute.drillDownStep);
    },
);
