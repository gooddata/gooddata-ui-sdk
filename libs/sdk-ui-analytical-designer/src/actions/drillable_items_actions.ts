// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import { ActionTypeKeys } from "../constants/actions.js";

export const conversionInit = createAction(
    ActionTypeKeys.CONVERT_DRILLABLE_ITEMS,
    (payload: IDrillableItemsCommandBody) => ({ payload }),
);

export const conversionDone = createAction(
    ActionTypeKeys.SET_DRILLABLE_ITEMS,
    (payload: IHeaderPredicate[]) => ({ payload }),
);
