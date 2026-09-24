// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import {
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogComputedAttribute,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
    type IDateHierarchyTemplate,
    type IdentifierRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import {
    type CatalogState,
    type ICatalogParameterDependenciesState,
    type ICatalogParametersState,
} from "./catalogState.js";

type CatalogReducer<A extends Action> = CaseReducer<CatalogState, A>;

/**
 * @public
 */
export type SetCatalogItemsPayload = {
    attributes?: ICatalogAttribute[];
    measures?: ICatalogMeasure[];
    facts?: ICatalogFact[];
    dateDatasets?: ICatalogDateDataset[];
    attributeHierarchies?: ICatalogAttributeHierarchy[];
    computedAttributes?: ICatalogComputedAttribute[];
    dateHierarchyTemplates?: IDateHierarchyTemplate[];
};

const setCatalogItems: CatalogReducer<PayloadAction<SetCatalogItemsPayload>> = (state, action) => {
    const {
        attributes,
        measures,
        dateDatasets,
        facts,
        attributeHierarchies,
        computedAttributes,
        dateHierarchyTemplates,
    } = action.payload;

    state.attributes = attributes;
    state.measures = measures;
    state.facts = facts;
    state.dateDatasets = dateDatasets;
    state.attributeHierarchies = attributeHierarchies;
    state.computedAttributes = computedAttributes;
    state.dateHierarchyTemplates = dateHierarchyTemplates;
};

/**
 * @public
 */
export type SetCatalogMeasuresAndFactsPayload = {
    measures: ICatalogMeasure[];
    facts: ICatalogFact[];
};

const setCatalogMeasuresAndFacts: CatalogReducer<PayloadAction<SetCatalogMeasuresAndFactsPayload>> = (
    state,
    action,
) => {
    const { measures, facts } = action.payload;
    state.measures = measures;
    state.facts = facts;
};

const addAttributeHierarchy: CatalogReducer<PayloadAction<ICatalogAttributeHierarchy>> = (state, action) => {
    const attributeHierarchy = action.payload;
    state.attributeHierarchies = [...(state.attributeHierarchies ?? []), attributeHierarchy];
};

const updateAttributeHierarchy: CatalogReducer<PayloadAction<ICatalogAttributeHierarchy>> = (
    state,
    action,
) => {
    const attributeHierarchy = action.payload;
    const updatingIndex =
        state.attributeHierarchies?.findIndex(
            (it) => it.attributeHierarchy.id === attributeHierarchy.attributeHierarchy.id,
        ) ?? -1;

    if (updatingIndex >= 0) {
        state.attributeHierarchies = [...(state.attributeHierarchies ?? [])];
        state.attributeHierarchies.splice(updatingIndex, 1, attributeHierarchy);
    }
};

const deleteAttributeHierarchy: CatalogReducer<PayloadAction<ICatalogAttributeHierarchy>> = (
    state,
    action,
) => {
    const attributeHierarchy = action.payload;
    state.attributeHierarchies = state.attributeHierarchies?.filter(
        (it) => it.attributeHierarchy.id !== attributeHierarchy.attributeHierarchy.id,
    );
};

const setCatalogParameters: CatalogReducer<PayloadAction<ICatalogParametersState>> = (state, action) => {
    state.parameters = action.payload;
};

const setCatalogParameterDependencies: CatalogReducer<PayloadAction<ICatalogParameterDependenciesState>> = (
    state,
    action,
) => {
    state.parameterDependencies = action.payload;
};

const mergeCatalogParameterDependencies: CatalogReducer<PayloadAction<Record<string, IdentifierRef[]>>> = (
    state,
    action,
) => {
    Object.assign(state.parameterDependencies.byRoot, action.payload);
    for (const key of Object.keys(action.payload)) {
        delete state.parameterDependencies.requestedRoots[key];
    }
};

const markParameterDependenciesPending: CatalogReducer<PayloadAction<IdentifierRef[]>> = (state, action) => {
    markRequestedRoots(state, action.payload, "pending");
};

/**
 * Marks roots the references service rejected, or that nothing can load. They are never requested
 * again, and a text waiting for them executes with the parameters it has.
 */
const markParameterDependenciesFailed: CatalogReducer<PayloadAction<IdentifierRef[]>> = (state, action) => {
    markRequestedRoots(state, action.payload, "failed");
};

function markRequestedRoots(state: CatalogState, roots: IdentifierRef[], mark: "pending" | "failed"): void {
    for (const root of roots) {
        state.parameterDependencies.requestedRoots[serializeObjRef(root)] = mark;
    }
}

export const catalogReducers = {
    setCatalogItems,
    setCatalogMeasuresAndFacts,
    addAttributeHierarchy,
    updateAttributeHierarchy,
    deleteAttributeHierarchy,
    setCatalogParameters,
    setCatalogParameterDependencies,
    mergeCatalogParameterDependencies,
    markParameterDependenciesPending,
    markParameterDependenciesFailed,
};
