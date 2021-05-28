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
export const attributesSelector = createSelector(selectSelf, (state) => {
    return state.attributes ?? [];
});

/**
 * @internal
 */
export const measuresSelector = createSelector(selectSelf, (state) => {
    return state.measures ?? [];
});

/**
 * @internal
 */
export const factsSelector = createSelector(selectSelf, (state) => {
    return state.facts ?? [];
});

/**
 * @internal
 */
export const dateDatasetsSelector = createSelector(selectSelf, (state) => {
    return state.dateDatasets ?? [];
});

/**
 * @internal
 */
export const attributesWithDrillDownSelector = createSelector(
    [attributesSelector, dateDatasetsSelector],
    (attributes = [], dateDatasets = []) => {
        const dateAttributes = flatMap(dateDatasets ?? [], (dd) => dd.dateAttributes);
        return [...attributes, ...dateAttributes].filter((attr) => attr.attribute.drillDownStep);
    },
);
