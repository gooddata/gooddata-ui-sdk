// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import flatMap from "lodash/flatMap.js";
import {
    IAttributeDisplayFormMetadataObject,
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogMeasure,
    ObjRef,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    CatalogDateAttributeWithDataset,
    newCatalogDateAttributeWithDatasetMap,
} from "../../../_staging/catalog/dateAttributeWithDatasetMap.js";
import {
    ObjRefMap,
    newCatalogAttributeMap,
    newCatalogDateDatasetMap,
    newCatalogMeasureMap,
} from "../../../_staging/metadata/objRefMap.js";
import { selectBackendCapabilities } from "../backendCapabilities/backendCapabilitiesSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";
import { createDisplayFormMap } from "../../../_staging/catalog/displayFormMap.js";
import isEmpty from "lodash/isEmpty.js";
import negate from "lodash/negate.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.catalog,
);

/**
 * @public
 */
export const selectCatalogAttributes: DashboardSelector<ICatalogAttribute[]> = createSelector(
    selectSelf,
    (state) => {
        return state.attributes ?? [];
    },
);

/**
 * @alpha
 */
export const selectHasCatalogAttributes: DashboardSelector<boolean> = createSelector(
    selectCatalogAttributes,
    negate(isEmpty),
);

/**
 * @public
 */
export const selectCatalogAttributeDisplayForms: DashboardSelector<IAttributeDisplayFormMetadataObject[]> =
    createSelector(selectCatalogAttributes, (attributes) => {
        return flatMap(attributes, (attribute) => [
            ...attribute.displayForms,
            ...attribute.geoPinDisplayForms,
        ]);
    });

/**
 * @public
 */
export const selectCatalogMeasures: DashboardSelector<ICatalogMeasure[]> = createSelector(
    selectSelf,
    (state) => {
        return state.measures ?? [];
    },
);

/**
 * @alpha
 */
export const selectHasCatalogMeasures: DashboardSelector<boolean> = createSelector(
    selectCatalogMeasures,
    negate(isEmpty),
);

/**
 * @public
 */
export const selectCatalogFacts: DashboardSelector<ICatalogFact[]> = createSelector(selectSelf, (state) => {
    return state.facts ?? [];
});

/**
 * @alpha
 */
export const selectHasCatalogFacts: DashboardSelector<boolean> = createSelector(
    selectCatalogFacts,
    negate(isEmpty),
);

/**
 * @public
 */
export const selectCatalogDateDatasets: DashboardSelector<ICatalogDateDataset[]> = createSelector(
    selectSelf,
    (state) => {
        return state.dateDatasets ?? [];
    },
);

/**
 * @alpha
 */
export const selectHasCatalogDateDatasets: DashboardSelector<boolean> = createSelector(
    selectCatalogDateDatasets,
    negate(isEmpty),
);

/**
 * @public
 */
export const selectCatalogDateAttributes: DashboardSelector<ICatalogDateAttribute[]> = createSelector(
    selectCatalogDateDatasets,
    (dateDatasets) => {
        return flatMap(dateDatasets, (dd) => dd.dateAttributes);
    },
);

/**
 * @beta
 */
export const selectCatalogAttributeHierarchies: DashboardSelector<ICatalogAttributeHierarchy[]> =
    createSelector(selectSelf, (state) => {
        return state.attributeHierarchies ?? [];
    });

/**
 * @alpha
 */
export const selectAttributesWithDrillDown: DashboardSelector<(ICatalogAttribute | ICatalogDateAttribute)[]> =
    createSelector(
        [selectCatalogAttributes, selectCatalogDateAttributes],
        (attributes = [], dateAttributes = []) => {
            return [...attributes, ...dateAttributes].filter((attr) => attr.attribute.drillDownStep);
        },
    );

/**
 * Returns map of catalog attribute keys with all their descendants based on attribute hierarchies.
 *
 * This selector does descendant lookup for each existing catalog attribute. If an attribute is in any attribute hierarchy
 * and has at least one descendant, the attribute key is added to the map together with the descendant reference.
 *
 * @beta
 */
export const selectAttributesWithHierarchyDescendants: DashboardSelector<Record<string, ObjRef[]>> =
    createSelector(
        [selectCatalogAttributes, selectCatalogDateAttributes, selectCatalogAttributeHierarchies],
        (attributes = [], dateAttributes = [], attributeHierarchies = []) => {
            const allCatalogAttributes = [...attributes, ...dateAttributes];
            const attributeDescendants: Record<string, ObjRef[]> = {};

            allCatalogAttributes.forEach((attribute) => {
                const attributeRef = attribute.attribute.ref;
                attributeHierarchies.forEach((hierarchy) => {
                    const hierarchyAttributes = hierarchy.attributeHierarchy.attributes;
                    const foundAttributeIndex = hierarchyAttributes.findIndex((ref) =>
                        areObjRefsEqual(ref, attributeRef),
                    );

                    if (foundAttributeIndex < 0) {
                        return;
                    }

                    const foundDescendant = hierarchyAttributes[foundAttributeIndex + 1];

                    if (!foundDescendant) {
                        return;
                    }

                    const attributeRefAsString = objRefToString(attributeRef);
                    if (attributeDescendants[attributeRefAsString]) {
                        attributeDescendants[attributeRefAsString].push(foundDescendant);
                    } else {
                        attributeDescendants[attributeRefAsString] = [foundDescendant];
                    }
                });
            });

            return attributeDescendants;
        },
    );

/**
 * @internal
 */
export const selectAttributesWithDisplayFormLink: DashboardSelector<ICatalogAttribute[]> = createSelector(
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
export const selectAllCatalogDateDatasetsMap: DashboardSelector<ObjRefMap<ICatalogDateDataset>> =
    createSelector([selectCatalogDateDatasets, selectBackendCapabilities], (dateDatasets, capabilities) => {
        return newCatalogDateDatasetMap(dateDatasets, capabilities.hasTypeScopedIdentifiers);
    });

/**
 * Selects all display forms in the catalog as a mapping of obj ref to display form
 *
 * @alpha
 */
export const selectAllCatalogDisplayFormsMap: DashboardSelector<
    ObjRefMap<IAttributeDisplayFormMetadataObject>
> = createSelector(
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
export const selectAllCatalogAttributesMap: DashboardSelector<
    ObjRefMap<ICatalogAttribute | ICatalogDateAttribute>
> = createSelector(
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
export const selectAllCatalogMeasuresMap: DashboardSelector<ObjRefMap<ICatalogMeasure>> = createSelector(
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
export const selectCatalogDateAttributeToDataset: DashboardSelector<
    ObjRefMap<CatalogDateAttributeWithDataset>
> = createSelector([selectCatalogDateDatasets, selectBackendCapabilities], (dateDatasets, capabilities) => {
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
});
