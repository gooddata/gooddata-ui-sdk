// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export const resetForPluggableMount = createAction(ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT);
