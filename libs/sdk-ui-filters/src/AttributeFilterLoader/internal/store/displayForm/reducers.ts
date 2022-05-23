// (C) 2021-2022 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import { IAttributeDisplayFormMetadataObject, ObjRef } from "@gooddata/sdk-model";
import identity from "lodash/identity";

import { AttributeFilterReducer } from "../state";

const displayFormRequest: AttributeFilterReducer<
    PayloadAction<{ displayFormRef: ObjRef; correlationId: string }>
> = identity;

const displayFormSuccess: AttributeFilterReducer<
    PayloadAction<{ displayForm: IAttributeDisplayFormMetadataObject; correlationId: string }>
> = (state, action) => {
    state.displayForm = action.payload.displayForm;
};

const displayFormError: AttributeFilterReducer<PayloadAction<{ error: any; correlationId: string }>> =
    identity;

const displayFormCancel: AttributeFilterReducer<PayloadAction<{ correlationId: string }>> = identity;

const displayFormReset: AttributeFilterReducer = (state) => {
    state.displayForm = undefined;
};

/**
 * @internal
 */
export const displayFormReducers = {
    displayFormRequest,
    displayFormSuccess,
    displayFormError,
    displayFormCancel,
    displayFormReset,
};
