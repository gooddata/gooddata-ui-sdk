// (C) 2021-2022 GoodData Corporation
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import {
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
    ICatalogAttributeHierarchy,
} from "@gooddata/sdk-model";

import { CatalogState } from "./catalogState.js";

type CatalogReducer<A extends Action> = CaseReducer<CatalogState, A>;

export interface SetCatalogItemsPayload {
    attributes: ICatalogAttribute[];
    measures: ICatalogMeasure[];
    facts: ICatalogFact[];
    dateDatasets: ICatalogDateDataset[];
    attributeHierarchies: ICatalogAttributeHierarchy[];
}

const setCatalogItems: CatalogReducer<PayloadAction<SetCatalogItemsPayload>> = (state, action) => {
    const { attributes, measures, dateDatasets, facts, attributeHierarchies } = action.payload;

    state.attributes = attributes;
    state.measures = measures;
    state.facts = facts;
    state.dateDatasets = dateDatasets;
    state.attributeHierarchies = attributeHierarchies;
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
    const updatingIndex = state.attributeHierarchies?.findIndex(
        (it) => it.attributeHierarchy.id === attributeHierarchy.attributeHierarchy.id,
    );
    if (updatingIndex && updatingIndex >= 0) {
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
    addAttributeHierarchy,
    updateAttributeHierarchy,
    deleteAttributeHierarchy,
};
