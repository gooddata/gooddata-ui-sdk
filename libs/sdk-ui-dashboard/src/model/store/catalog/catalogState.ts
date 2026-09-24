// (C) 2021-2026 GoodData Corporation

import {
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogComputedAttribute,
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
 * Status of the dashboard-wide root → parameter dependency map.
 *
 * @alpha
 */
export type CatalogParameterDependenciesStatus = "uninitialized" | "loaded";

/**
 * Maps each dependency root (an insight, a text reference, or an object a dashboard filter reads; keyed by
 * `serializeObjRef` of the ref exactly as the caller supplied it) to the parameter refs it depends
 * on through its metrics and computed attributes, as reported by the workspace references service.
 * Drives runtime parameter applicability for execution and for display.
 *
 * @alpha
 */
export interface ICatalogParameterDependenciesState {
    status: CatalogParameterDependenciesStatus;
    byRoot: Record<string, IdentifierRef[]>;
    /**
     * Request status keyed by `serializeObjRef`. Successful loads clear the entry. Failed roots
     * are skipped until initialization or an insight update requests them again.
     */
    requestedRoots: Record<string, "pending" | "failed">;
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
    /**
     * Computed attributes of the workspace; loaded only when the `enableComputedAttributes`
     * setting is on, empty otherwise.
     *
     * @beta
     */
    computedAttributes?: ICatalogComputedAttribute[];
    /** @beta */
    dateHierarchyTemplates?: IDateHierarchyTemplate[];
    /** @alpha */
    parameters: ICatalogParametersState;
    /** @alpha */
    parameterDependencies: ICatalogParameterDependenciesState;
};

export const catalogInitialState: CatalogState = {
    attributes: undefined,
    measures: undefined,
    dateDatasets: undefined,
    facts: undefined,
    attributeHierarchies: undefined,
    computedAttributes: undefined,
    dateHierarchyTemplates: undefined,
    parameters: { status: "uninitialized", parameters: [] },
    parameterDependencies: { status: "uninitialized", byRoot: {}, requestedRoots: {} },
};
