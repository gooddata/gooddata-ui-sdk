// (C) 2021-2022 GoodData Corporation
import { IAttributeFilter } from "@gooddata/sdk-model";
import { PayloadAction } from "@reduxjs/toolkit";

import { AttributeFilterReducer } from "../state";

const setAttributeFilter: AttributeFilterReducer<PayloadAction<{ attributeFilter: IAttributeFilter }>> = (
    state,
    action,
) => {
    state.attributeFilter = action.payload.attributeFilter;
};

/**
 * @internal
 */
export const attributeFilterReducers = {
    setAttributeFilter,
};
