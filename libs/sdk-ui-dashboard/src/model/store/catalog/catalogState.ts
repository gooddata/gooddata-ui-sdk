// (C) 2021-2026 GoodData Corporation

import {
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
    type IDateHierarchyTemplate,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export type CatalogState = {
    /** @beta */
    attributes?: ICatalogAttribute[];
    /** @beta */
    measures?: ICatalogMeasure[];
    /** @beta */
    dateDatasets?: ICatalogDateDataset[];
    /** @beta */
    facts?: ICatalogFact[];
    /** @beta */
    attributeHierarchies?: ICatalogAttributeHierarchy[];
    /** @beta */
    dateHierarchyTemplates?: IDateHierarchyTemplate[];
};

export const catalogInitialState: CatalogState = {
    attributes: undefined,
    measures: undefined,
    dateDatasets: undefined,
    facts: undefined,
    attributeHierarchies: undefined,
    dateHierarchyTemplates: undefined,
};
