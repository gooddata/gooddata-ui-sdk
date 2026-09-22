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
 * Status of the dashboard-wide insight → parameter dependency map.
 *
 * @alpha
 */
export type CatalogInsightParametersStatus = "uninitialized" | "loading" | "loaded" | "failed";

/**
 * Maps each dashboard insight (keyed by `serializeObjRef(insightRef)`) to the parameter refs it
 * depends on through its metrics and computed attributes, as reported by the workspace references
 * service. Drives runtime parameter applicability for widget execution.
 *
 * @alpha
 */
export interface ICatalogInsightParametersState {
    status: CatalogInsightParametersStatus;
    byInsight: Record<string, IdentifierRef[]>;
}

/**
 * Status of the dashboard-wide dashboard-filter → parameter dependency map.
 *
 * @alpha
 */
export type CatalogFilterParametersStatus = "uninitialized" | "loading" | "loaded" | "failed";

/**
 * Maps each object a dashboard filter reads (keyed by `serializeObjRef(ref)`: the computed attribute
 * of an attribute filter, the metric or a computed-attribute dimension of a measure value filter) to
 * the parameter refs it depends on, as reported by the workspace references service. Complements
 * {@link ICatalogInsightParametersState} for the parameters a widget reaches only through dashboard
 * filters, which are not part of its insight.
 *
 * @alpha
 */
export interface ICatalogFilterParametersState {
    status: CatalogFilterParametersStatus;
    byRef: Record<string, IdentifierRef[]>;
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
    insightParameters: ICatalogInsightParametersState;
    /** @alpha */
    filterParameters: ICatalogFilterParametersState;
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
    insightParameters: { status: "uninitialized", byInsight: {} },
    filterParameters: { status: "uninitialized", byRef: {} },
};
