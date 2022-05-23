// (C) 2021-2022 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import { IAttributeElement } from "@gooddata/sdk-model";

import { AttributeFilterReducer } from "../state";

const setSelection: AttributeFilterReducer<PayloadAction<{ selection: IAttributeElement[] }>> = (
    state,
    action,
) => {
    state.selectedAttributeElements = action.payload.selection;
};

/**
 * @internal
 */
export const selectionReducers = {
    setSelection,
};
