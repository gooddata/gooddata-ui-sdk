// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import flatMap from "lodash/flatMap";

import {
    CatalogDateAttributeWithDataset,
    newCatalogDateAttributeWithDatasetMap,
} from "../../../_staging/catalog/dateAttributeWithDatasetMap";
import {
    newCatalogAttributeMap,
    newCatalogDateDatasetMap,
    newCatalogMeasureMap,
} from "../../../_staging/metadata/objRefMap";
import { selectBackendCapabilities } from "../backendCapabilities/backendCapabilitiesSelectors";
import { DashboardState } from "../types";
import { createDisplayFormMap } from "../../../_staging/catalog/displayFormMap";
import isEmpty from "lodash/isEmpty";
import negate from "lodash/negate";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.catalog,
);

/**
 * @public
 */
export const selectCatalogAttributes = createSelector(selectSelf, (state) => {
    return state.attributes ?? [];
});

/**
 * @alpha
 */
export const selectHasCatalogAttributes = createSelector(selectCatalogAttributes, negate(isEmpty));

/**
 * @public
 */
export const selectCatalogAttributeDisplayForms = createSelector(selectCatalogAttributes, (attributes) => {
    return flatMap(attributes, (attribute) => [...attribute.displayForms, ...attribute.geoPinDisplayForms]);
});

/**
 * @public
 */
export const selectCatalogMeasures = createSelector(selectSelf, (state) => {
    return state.measures ?? [];
});

/**
 * @public
 */
export const selectCatalogFacts = createSelector(selectSelf, (state) => {
    return state.facts ?? [];
});

/**
 * @public
 */
export const selectCatalogDateDatasets = createSelector(selectSelf, (state) => {
    return state.dateDatasets ?? [];
});

/**
 * @public
 */
export const selectCatalogDateAttributes = createSelector(selectCatalogDateDatasets, (dateDatasets) => {
    return flatMap(dateDatasets, (dd) => dd.dateAttributes);
});

/**
 * @alpha
 */
export const selectAttributesWithDrillDown = createSelector(
    [selectCatalogAttributes, selectCatalogDateAttributes],
    (attributes = [], dateAttributes = []) => {
        return [...attributes, ...dateAttributes].filter((attr) => attr.attribute.drillDownStep);
    },
);

/**
 * @internal
 */
export const selectAttributesWithDisplayFormLink = createSelector(
    [selectCatalogAttributes],
    (attributes = []) => {
        return attributes.filter((attr) => attr.attribute.drillToAttributeLink);
    },
);

/**
 * Selects all date datasets in the catalog as a mapping of obj ref to date dataset.
 *
 * @alpha
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
 * @alpha
 */
export const selectAllCatalogDisplayFormsMap = createSelector(
    [selectCatalogAttributes, selectCatalogDateDatasets, selectBackendCapabilities],
    (attributes, dateDatasets, capabilities) => {
        return createDisplayFormMap(attributes, dateDatasets, capabilities.hasTypeScopedIdentifiers);
    },
);

/**
 * Selects all attributes in the catalog as a mapping of ref to catalog's attribute object. The mapping
 * will include both 'normal' attributes and attributes from date datasets.
 *
 * @remarks see `isCatalogAttribute` guard; this can be used to determine type of attribute
 * @alpha
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
 * Selects all measures in the catalog as a mapping of ref to catalog's measure object.
 *
 * @alpha
 */
export const selectAllCatalogMeasuresMap = createSelector(
    [selectCatalogMeasures, selectBackendCapabilities],
    (measures, capabilities) => {
        return newCatalogMeasureMap(measures, capabilities.hasTypeScopedIdentifiers);
    },
);

/**
 * Selects lookup mapping between date dataset attributes and date datasets. The entry in lookup contains both the date dataset attribute
 * and the date dataset to which it belongs. The lookup is indexed by the date dataset attribute and entries can be obtained using
 * attribute refs.
 *
 * @alpha
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
