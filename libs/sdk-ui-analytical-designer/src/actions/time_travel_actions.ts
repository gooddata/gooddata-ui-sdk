// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

/**
 * `meta.updateCatalog` is preserved verbatim although nothing reads it: a prepare callback keeps the
 * shipped action shape, and the postMessage observers see these actions.
 */
export const undo = createAction(ActionTypeKeys.UNDO_ACTION, () => ({
    payload: undefined,
    meta: { updateCatalog: true },
}));

export const redo = createAction(ActionTypeKeys.REDO_ACTION, () => ({
    payload: undefined,
    meta: { updateCatalog: true },
}));

export const disableRedo = createAction(ActionTypeKeys.DISABLE_REDO_ACTION);
