// (C) 2021-2022 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { CatalogState } from "./catalogState.js";
import { ICatalogAttribute, ICatalogFact, ICatalogMeasure, ICatalogDateDataset } from "@gooddata/sdk-model";

type CatalogReducer<A extends Action> = CaseReducer<CatalogState, A>;

export interface SetCatalogItemsPayload {
    attributes: ICatalogAttribute[];
    measures: ICatalogMeasure[];
    facts: ICatalogFact[];
    dateDatasets: ICatalogDateDataset[];
}

const setCatalogItems: CatalogReducer<PayloadAction<SetCatalogItemsPayload>> = (state, action) => {
    const { attributes, measures, dateDatasets, facts } = action.payload;

    state.attributes = attributes;
    state.measures = measures;
    state.facts = facts;
    state.dateDatasets = dateDatasets;
};

export const catalogReducers = {
    setCatalogItems,
};
