// (C) 2021-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import flatMap from "lodash/flatMap.js";
import isEmpty from "lodash/isEmpty.js";
import negate from "lodash/negate.js";

import {
    IAttributeDisplayFormMetadataObject,
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateAttribute,
    ICatalogDateAttributeHierarchy,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogMeasure,
    IDateHierarchyTemplate,
    ObjRef,
    areObjRefsEqual,
    getHierarchyAttributes,
    getHierarchyRef,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    CatalogDateAttributeWithDataset,
    newCatalogDateAttributeWithDatasetMap,
} from "../../../_staging/catalog/dateAttributeWithDatasetMap.js";
import { createDisplayFormMap } from "../../../_staging/catalog/displayFormMap.js";
import {
    ObjRefMap,
    newCatalogAttributeMap,
    newCatalogDateDatasetMap,
    newCatalogMeasureMap,
} from "../../../_staging/metadata/objRefMap.js";
import {
    selectBackendCapabilities,
    selectSupportsAttributeHierarchies,
} from "../backendCapabilities/backendCapabilitiesSelectors.js";
import { selectIsDrillDownEnabled } from "../config/configSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";

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
export const selectCatalogAttributeDisplayFormsById: DashboardSelector<
    Record<string, IAttributeDisplayFormMetadataObject>
> = createSelector(selectCatalogAttributeDisplayForms, (displayForms) => {
    return displayForms.reduce(
        (acc, displayForm) => {
            acc[displayForm.id] = displayForm;
            return acc;
        },
        {} as Record<string, IAttributeDisplayFormMetadataObject>,
    );
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
 * @alpha
 */
export const selectCatalogIsLoaded: DashboardSelector<boolean> = createSelector(selectSelf, (state) => {
    return [
        state.attributes,
        state.measures,
        state.dateDatasets,
        state.facts,
        state.attributeHierarchies,
        state.dateHierarchyTemplates,
    ].every((item) => item !== undefined);
});

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
export const selectDateHierarchyTemplates: DashboardSelector<IDateHierarchyTemplate[]> = createSelector(
    selectSelf,
    (state) => {
        return state.dateHierarchyTemplates ?? [];
    },
);

/**
 * @alpha
 */
export const selectAdhocDateHierarchies: DashboardSelector<ICatalogDateAttributeHierarchy[]> = createSelector(
    [
        selectDateHierarchyTemplates,
        selectCatalogDateDatasets,
        selectIsDrillDownEnabled,
        selectSupportsAttributeHierarchies,
    ],
    (dateHierarchyTemplates, catalogDateDatasets, isDrillDownEnabled, isSupportAttributeHierarchies) => {
        if (isDrillDownEnabled && isSupportAttributeHierarchies) {
            return buildAdhocDateHierarchies(dateHierarchyTemplates, catalogDateDatasets);
        }
        return [];
    },
);

/**
 * @alpha
 */
export const selectAllCatalogAttributeHierarchies: DashboardSelector<
    (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[]
> = createSelector(
    [selectCatalogAttributeHierarchies, selectAdhocDateHierarchies],
    (catalogAttributeHierarchies, adhocDateHierarchies) => {
        return [...catalogAttributeHierarchies, ...adhocDateHierarchies];
    },
);

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
 * Descendant of the attribute hierarchy.
 * @alpha
 */
export type HierarchyDescendant = {
    /**
     * Reference to the hierarchy.
     */
    hierarchyRef: ObjRef;
    /**
     * Reference to the hierarchy descendant - attribute or date attribute.
     */
    descendantRef: ObjRef;
};

/**
 * Dictionary of the hierarchy descendants grouped by particular attribute.
 * Key is the attribute id.
 * Value is the array of the descendants with their respective hierarchy ref.
 *
 * @alpha
 */
export type HierarchyDescendantsByAttributeId = Record<string, HierarchyDescendant[]>;

/**
 * @alpha
 */
export const selectAttributesWithHierarchyDescendants: DashboardSelector<HierarchyDescendantsByAttributeId> =
    createSelector(
        [selectCatalogAttributes, selectCatalogDateAttributes, selectAllCatalogAttributeHierarchies],
        (attributes = [], dateAttributes = [], attributeHierarchies = []) => {
            return getAttributesWithHierarchyDescendants(attributes, dateAttributes, attributeHierarchies);
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

//
function getAttributesWithHierarchyDescendants(
    attributes: ICatalogAttribute[],
    dateAttributes: ICatalogDateAttribute[],
    attributeHierarchies: (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[],
): HierarchyDescendantsByAttributeId {
    const allCatalogAttributes = [...attributes, ...dateAttributes];
    const attributeDescendants: HierarchyDescendantsByAttributeId = {};

    allCatalogAttributes.forEach((attribute) => {
        const attributeRef = attribute.attribute.ref;
        attributeHierarchies.forEach((hierarchy) => {
            const hierarchyRef = getHierarchyRef(hierarchy);
            const attributes = getHierarchyAttributes(hierarchy);
            const foundAttributeIndex = attributes.findIndex((ref) => areObjRefsEqual(ref, attributeRef));

            if (foundAttributeIndex < 0) {
                return;
            }

            const foundDescendant = attributes[foundAttributeIndex + 1];

            if (!foundDescendant) {
                return;
            }

            const attributeRefAsString = objRefToString(attributeRef);
            const descendantWithHierarchy: HierarchyDescendant = {
                hierarchyRef,
                descendantRef: foundDescendant,
            };
            if (attributeDescendants[attributeRefAsString]) {
                attributeDescendants[attributeRefAsString].push(descendantWithHierarchy);
            } else {
                attributeDescendants[attributeRefAsString] = [descendantWithHierarchy];
            }
        });
    });
    return attributeDescendants;
}

function buildAdhocDateHierarchies(
    dateHierarchyTemplates: IDateHierarchyTemplate[],
    catalogDateDatasets: ICatalogDateDataset[],
): ICatalogDateAttributeHierarchy[] {
    const adhocDateHierarchies: ICatalogDateAttributeHierarchy[] = [];
    catalogDateDatasets.forEach((dateDataset) => {
        dateHierarchyTemplates.forEach((template) => {
            const dateHierarchy = buildDateHierarchy(dateDataset, template);
            if (dateHierarchy) {
                adhocDateHierarchies.push(dateHierarchy);
            }
        });
    });
    return adhocDateHierarchies;
}

function buildDateHierarchy(
    dateDataset: ICatalogDateDataset,
    dateTemplate: IDateHierarchyTemplate,
): ICatalogDateAttributeHierarchy | undefined {
    const dateAttributes = dateDataset.dateAttributes;
    const dateAttributesInHierarchy: ObjRef[] = [];
    dateTemplate.granularities.forEach((templateGranularity) => {
        const dateAttribute = dateAttributes.find((attr) => attr.granularity === templateGranularity);
        if (dateAttribute) {
            dateAttributesInHierarchy.push(dateAttribute.attribute.ref);
        }
    });
    if (!isEmpty(dateAttributesInHierarchy)) {
        return {
            type: "dateAttributeHierarchy",
            // create ref of adhoc date hierarchy by combining date dataset id and date template id
            // this ref should not be stored on MD server as it is not existing MD object
            ref: idRef(
                `${dateTemplate.id}/${objRefToString(dateDataset.dataSet.ref)}`,
                "dateAttributeHierarchy",
            ),
            templateId: dateTemplate.id,
            dateDatasetRef: dateDataset.dataSet.ref,
            title: dateDataset.dataSet.title,
            attributes: dateAttributesInHierarchy,
        };
    }

    return undefined;
}
