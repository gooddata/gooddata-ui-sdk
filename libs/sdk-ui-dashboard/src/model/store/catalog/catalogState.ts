// (C) 2021-2026 GoodData Corporation

import {
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
    type IDateHierarchyTemplate,
    type IParameterMetadataObject,
} from "@gooddata/sdk-model";

/**
 * Status of catalog parameters loading.
 *
 * @alpha
 */
export type CatalogParametersStatus = "uninitialized" | "loading" | "loaded" | "failed" | "gated-off";

/**
 * Catalog parameters slice.
 *
 * @alpha
 */
export interface ICatalogParametersState {
    status: CatalogParametersStatus;
    parameters: IParameterMetadataObject[];
}

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
    /** @alpha */
    parameters: ICatalogParametersState;
};

export const catalogInitialState: CatalogState = {
    attributes: undefined,
    measures: undefined,
    dateDatasets: undefined,
    facts: undefined,
    attributeHierarchies: undefined,
    dateHierarchyTemplates: undefined,
    parameters: { status: "uninitialized", parameters: [] },
};
