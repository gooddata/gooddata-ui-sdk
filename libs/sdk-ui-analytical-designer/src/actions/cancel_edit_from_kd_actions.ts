// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export const cancelEditFromKDAction = createAction(ActionTypeKeys.CANCEL_EDIT_FROM_KD);
