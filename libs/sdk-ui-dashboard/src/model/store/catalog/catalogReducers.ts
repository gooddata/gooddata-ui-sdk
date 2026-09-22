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
} from "@gooddata/sdk-model";

import {
    type CatalogState,
    type ICatalogFilterParametersState,
    type ICatalogInsightParametersState,
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

const setCatalogInsightParameters: CatalogReducer<PayloadAction<ICatalogInsightParametersState>> = (
    state,
    action,
) => {
    state.insightParameters = action.payload;
};

const mergeCatalogInsightParameters: CatalogReducer<PayloadAction<Record<string, IdentifierRef[]>>> = (
    state,
    action,
) => {
    Object.assign(state.insightParameters.byInsight, action.payload);
};

const setCatalogFilterParameters: CatalogReducer<PayloadAction<ICatalogFilterParametersState>> = (
    state,
    action,
) => {
    state.filterParameters = action.payload;
};

const mergeCatalogFilterParameters: CatalogReducer<PayloadAction<Record<string, IdentifierRef[]>>> = (
    state,
    action,
) => {
    Object.assign(state.filterParameters.byRef, action.payload);
};

export const catalogReducers = {
    setCatalogItems,
    setCatalogMeasuresAndFacts,
    addAttributeHierarchy,
    updateAttributeHierarchy,
    deleteAttributeHierarchy,
    setCatalogParameters,
    setCatalogInsightParameters,
    mergeCatalogInsightParameters,
    setCatalogFilterParameters,
    mergeCatalogFilterParameters,
};
