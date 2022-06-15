// (C) 2021-2022 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import { IAttributeElement } from "@gooddata/sdk-model";
import identity from "lodash/identity";

import { AttributeFilterReducer } from "../state";
import { ILoadAttributeElementsOptions } from "./effects";

const attributeElementsRequest: AttributeFilterReducer<
    PayloadAction<
        Omit<ILoadAttributeElementsOptions, "displayFormRef"> & {
            correlationId: string;
        }
    >
> = identity;

const attributeElementsSuccess: AttributeFilterReducer<
    PayloadAction<{
        attributeElements: IAttributeElement[];
        totalCount: number;
        correlationId: string;
        limit: number;
        offset: number;
    }>
> = (state, action) => {
    if (!state.attributeElementsMap) {
        state.attributeElementsMap = {};
    }

    action.payload.attributeElements.forEach((el) => {
        if (!state.attributeElementsMap[el.uri]) {
            state.attributeElementsMap[el.uri] = el;
        }
    });
};

const attributeElementsError: AttributeFilterReducer<PayloadAction<{ error: any; correlationId: string }>> =
    identity;

const attributeElementsCancelRequest: AttributeFilterReducer<PayloadAction<{ correlationId: string }>> =
    identity;

const attributeElementsCancel: AttributeFilterReducer<PayloadAction<{ correlationId: string }>> = identity;

const setAttributeElements: AttributeFilterReducer<
    PayloadAction<{
        attributeElements: IAttributeElement[];
    }>
> = (state, action) => {
    state.attributeElements = action.payload.attributeElements.map((el) => el.uri);
};

const setAttributeElementsTotalCount: AttributeFilterReducer<
    PayloadAction<{
        totalCount: number;
    }>
> = (state, action) => {
    state.attributeElementsTotalCount = action.payload.totalCount;
};

const setAttributeElementsTotalCountWithCurrentSettings: AttributeFilterReducer<
    PayloadAction<{
        totalCount: number;
    }>
> = (state, action) => {
    state.attributeElementsTotalCountWithCurrentSettings = action.payload.totalCount;
};

/**
 * @internal
 */
export const attributeElementsReducers = {
    attributeElementsRequest,
    attributeElementsSuccess,
    attributeElementsError,
    attributeElementsCancelRequest,
    attributeElementsCancel,

    setAttributeElements,
    setAttributeElementsTotalCount,
    setAttributeElementsTotalCountWithCurrentSettings,
};
