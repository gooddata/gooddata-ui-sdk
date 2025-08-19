// (C) 2021-2025 GoodData Corporation
import {
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogMeasure,
    IDateHierarchyTemplate,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export interface CatalogState {
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
}

export const catalogInitialState: CatalogState = {
    attributes: undefined,
    measures: undefined,
    dateDatasets: undefined,
    facts: undefined,
    attributeHierarchies: undefined,
    dateHierarchyTemplates: undefined,
};
