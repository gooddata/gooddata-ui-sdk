// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export const requestExplain = createAction(ActionTypeKeys.REQUEST_EXPLAIN);
