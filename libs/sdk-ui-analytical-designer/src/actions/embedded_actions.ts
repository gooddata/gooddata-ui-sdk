// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export const setEmbedded = createAction(ActionTypeKeys.SET_EMBEDDED, (isEmbedded: boolean) => ({
    payload: { isEmbedded },
}));

export const setReadOnlyMode = createAction(ActionTypeKeys.SET_READ_ONLY_MODE, (isReadOnly: boolean) => ({
    payload: { isReadOnly },
}));
