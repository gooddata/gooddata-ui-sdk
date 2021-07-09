// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import flatMap from "lodash/flatMap";

import {
    CatalogDateAttributeWithDataset,
    newCatalogDateAttributeWithDatasetMap,
} from "../../../_staging/catalog/dateAttributeWithDatasetMap";
import {
    newCatalogAttributeMap,
    newCatalogDateDatasetMap,
    newDisplayFormMap,
} from "../../../_staging/metadata/objRefMap";
import { selectBackendCapabilities } from "../backendCapabilities/backendCapabilitiesSelectors";
import { DashboardState } from "../types";

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
 * Selects all date datasets in the catalog as a mapping of obj ref to date dataset.
 */
export const selectAllCatalogDateDatasetsMap = createSelector(
    [selectCatalogDateDatasets, selectBackendCapabilities],
    (dateDatasets, capabilities) => {
        return newCatalogDateDatasetMap(dateDatasets, capabilities.hasTypeScopedIdentifiers);
    },
);

/**
 * Selects all display forms in the catalog as a mapping of obj ref to display form
 *
 * @internal
 */
export const selectAllCatalogDisplayFormsMap = createSelector(
    [selectCatalogAttributes, selectCatalogDateDatasets, selectBackendCapabilities],
    (attributes, dateDatasets, capabilities) => {
        const nonDateDisplayForms = flatMap(attributes, (a) => a.displayForms);
        const dateDisplayForms = flatMap(dateDatasets, (d) =>
            flatMap(d.dateAttributes, (a) => a.attribute.displayForms),
        );

        return newDisplayFormMap(
            [...nonDateDisplayForms, ...dateDisplayForms],
            capabilities.hasTypeScopedIdentifiers,
        );
    },
);

/**
 * Selects all attributes in the catalog as a mapping of ref to catalog's attribute object. The mapping
 * will include both 'normal' attributes and attributes from date datasets.
 *
 * @remarks see `isCatalogAttribute` guard; this can be used to determine type of attribute
 * @internal
 */
export const selectAllCatalogAttributesMap = createSelector(
    [selectCatalogAttributes, selectCatalogDateDatasets, selectBackendCapabilities],
    (attributes, dateDatasets, capabilities) => {
        const dateAttributes = flatMap(dateDatasets, (d) => d.dateAttributes);

        return newCatalogAttributeMap(
            [...attributes, ...dateAttributes],
            capabilities.hasTypeScopedIdentifiers,
        );
    },
);

/**
 * Selects lookup mapping between date dataset attributes and date datasets. The entry in lookup contains both the date dataset attribute
 * and the date dataset to which it belongs. The lookup is indexed by the date dataset attribute and entries can be obtained using
 * attribute refs.
 *
 * @internal
 */
export const selectCatalogDateAttributeToDataset = createSelector(
    [selectCatalogDateDatasets, selectBackendCapabilities],
    (dateDatasets, capabilities) => {
        const attributesWithDatasets: CatalogDateAttributeWithDataset[] = flatMap(dateDatasets, (dataset) =>
            dataset.dateAttributes.map((attribute) => {
                return {
                    attribute,
                    dataset,
                };
            }),
        );

        return newCatalogDateAttributeWithDatasetMap(
            attributesWithDatasets,
            capabilities.hasTypeScopedIdentifiers,
        );
    },
);
