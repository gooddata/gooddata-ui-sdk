// (C) 2021-2022 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import identity from "lodash/identity";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { Correlation, ILoadElementsOptions, ILoadElementsResult } from "../../../types";
import { AttributeFilterReducer } from "../store/state";

const loadCustomElementsRequest: AttributeFilterReducer<
    PayloadAction<{ options: ILoadElementsOptions; correlation: Correlation | undefined }>
> = identity;

const loadCustomElementsStart: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

const loadCustomElementsSuccess: AttributeFilterReducer<
    PayloadAction<
        ILoadElementsResult & {
            correlation?: Correlation;
        }
    >
> = identity;

const loadCustomElementsError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation | undefined }>
> = identity;

const loadCustomElementsCancelRequest: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

const loadCustomElementsCancel: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

/**
 * @internal
 */
export const loadCustomElementsReducers = {
    loadCustomElementsRequest,
    loadCustomElementsStart,
    loadCustomElementsSuccess,
    loadCustomElementsError,
    loadCustomElementsCancelRequest,
    loadCustomElementsCancel,
};
