// (C) 2021-2022 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import identity from "lodash/identity";

import { AttributeFilterReducer } from "../state";

const attributeRequest: AttributeFilterReducer<
    PayloadAction<{ attributeRef: ObjRef; correlationId: string }>
> = identity;

const attributeSuccess: AttributeFilterReducer<
    PayloadAction<{ attribute: IAttributeMetadataObject; correlationId: string }>
> = (state, action) => {
    state.attribute = action.payload.attribute;
};

const attributeError: AttributeFilterReducer<PayloadAction<{ error: any; correlationId: string }>> = identity;

const attributeCancel: AttributeFilterReducer<PayloadAction<{ correlationId: string }>> = identity;

const attributeReset: AttributeFilterReducer = (state) => {
    state.attribute = undefined;
};

/**
 * @internal
 */
export const attributeReducers = {
    attributeRequest,
    attributeSuccess,
    attributeError,
    attributeCancel,
    attributeReset,
};
