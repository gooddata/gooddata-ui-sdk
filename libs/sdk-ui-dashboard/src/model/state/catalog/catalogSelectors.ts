// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import flatMap from "lodash/flatMap";
import keyBy from "lodash/keyBy";
import { serializeObjRef } from "@gooddata/sdk-model";
import {
    IAttributeDisplayFormMetadataObject,
    ICatalogAttribute,
    ICatalogDateAttribute,
} from "@gooddata/sdk-backend-spi";

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
export const selectCatalogDateAttributes = createSelector(selectCatalogDateDatasets, (dateDatasets) => {
    return flatMap(dateDatasets, (dd) => dd.dateAttributes);
});

/**
 * @internal
 */
export const selectAttributesWithDrillDown = createSelector(
    [selectCatalogAttributes, selectCatalogDateAttributes],
    (attributes = [], dateAttributes = []) => {
        return [...attributes, ...dateAttributes].filter((attr) => attr.attribute.drillDownStep);
    },
);

/**
 * Selects all display forms in the catalog as a mapping of (serialized) ref to display form metadata object.
 *
 * @internal
 */
export const selectAllCatalogDisplayFormsMap = createSelector(
    [selectCatalogAttributes, selectCatalogDateDatasets],
    (attributes, dateDatasets) => {
        const nonDateDisplayForms = flatMap(attributes, (a) => a.displayForms);
        const dateDisplayForms = flatMap(dateDatasets, (d) =>
            flatMap(d.dateAttributes, (a) => a.attribute.displayForms),
        );
        const result: Record<string, IAttributeDisplayFormMetadataObject> = keyBy(
            [...nonDateDisplayForms, ...dateDisplayForms],
            (df) => serializeObjRef(df.ref),
        );

        return result;
    },
);

/**
 * Selects all attributes in the catalog as a mapping of (serialized) ref to catalog's attribute object. The mapping
 * will include both 'normal' attributes and attributes from date datasets.
 *
 * @remarks see `isCatalogAttribute` guard; this can be used to determine type of attribute
 * @internal
 */
export const selectAllCatalogAttributesMap = createSelector(
    [selectCatalogAttributes, selectCatalogDateDatasets],
    (attributes, dateDatasets) => {
        const dateAttributes = flatMap(dateDatasets, (d) => d.dateAttributes);
        const result: Record<string, ICatalogAttribute | ICatalogDateAttribute> = keyBy(
            [...attributes, ...dateAttributes],
            (a) => serializeObjRef(a.attribute.ref),
        );

        return result;
    },
);
