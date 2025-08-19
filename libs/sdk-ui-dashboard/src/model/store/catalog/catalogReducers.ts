// (C) 2021-2025 GoodData Corporation
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import {
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogMeasure,
    IDateHierarchyTemplate,
} from "@gooddata/sdk-model";

import { CatalogState } from "./catalogState.js";

type CatalogReducer<A extends Action> = CaseReducer<CatalogState, A>;

export interface SetCatalogItemsPayload {
    attributes?: ICatalogAttribute[];
    measures?: ICatalogMeasure[];
    facts?: ICatalogFact[];
    dateDatasets?: ICatalogDateDataset[];
    attributeHierarchies?: ICatalogAttributeHierarchy[];
    dateHierarchyTemplates?: IDateHierarchyTemplate[];
}

const setCatalogItems: CatalogReducer<PayloadAction<SetCatalogItemsPayload>> = (state, action) => {
    const { attributes, measures, dateDatasets, facts, attributeHierarchies, dateHierarchyTemplates } =
        action.payload;

    state.attributes = attributes;
    state.measures = measures;
    state.facts = facts;
    state.dateDatasets = dateDatasets;
    state.attributeHierarchies = attributeHierarchies;
    state.dateHierarchyTemplates = dateHierarchyTemplates;
};

export interface SetCatalogMeasuresAndFactsPayload {
    measures: ICatalogMeasure[];
    facts: ICatalogFact[];
}

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

export const catalogReducers = {
    setCatalogItems,
    setCatalogMeasuresAndFacts,
    addAttributeHierarchy,
    updateAttributeHierarchy,
    deleteAttributeHierarchy,
};
