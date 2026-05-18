// (C) 2021-2026 GoodData Corporation

import {
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
    type IDateHierarchyTemplate,
    type IParameterMetadataObject,
    type IdentifierRef,
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
 * Status of the dashboard-wide metric → parameter dependency map.
 *
 * @alpha
 */
export type CatalogMeasureParametersStatus = "uninitialized" | "loading" | "loaded" | "failed";

/**
 * Maps each referenced metric (keyed by `objRefToString(metricRef)`) to the parameter refs the
 * metric depends on, as reported by the workspace references service. Drives runtime parameter
 * applicability for widget execution.
 *
 * @alpha
 */
export interface ICatalogMeasureParametersState {
    status: CatalogMeasureParametersStatus;
    byMetric: Record<string, IdentifierRef[]>;
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
    /** @alpha */
    measureParameters: ICatalogMeasureParametersState;
};

export const catalogInitialState: CatalogState = {
    attributes: undefined,
    measures: undefined,
    dateDatasets: undefined,
    facts: undefined,
    attributeHierarchies: undefined,
    dateHierarchyTemplates: undefined,
    parameters: { status: "uninitialized", parameters: [] },
    measureParameters: { status: "uninitialized", byMetric: {} },
};
