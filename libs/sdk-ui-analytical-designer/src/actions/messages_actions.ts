// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

export const hideMessage = createAction(ActionTypeKeys.HIDE_MESSAGE, (messageId: string) => ({
    payload: { messageId },
}));

export const showErrorMessage = createAction(
    ActionTypeKeys.SHOW_ERROR_MESSAGE,
    (message: string, error: unknown = {}) => ({
        payload: { message, error },
        error: true as const,
    }),
);

export const dataSourceError = createAction(ActionTypeKeys.MESSAGES_DATA_SOURCE_ERROR, (error: unknown) => ({
    payload: { error },
    error: true as const,
}));

export const showWarningMessage = createAction(ActionTypeKeys.SHOW_WARNING_MESSAGE, (message: string) => ({
    payload: { message },
}));

/** The long-saving toast. */
export const delayedLongSaving = createAction(ActionTypeKeys.MESSAGES_DELAYED_LONG_SAVING);

export interface IShowAddMessagePayload {
    translationKey: string;
    type: "error" | "success" | "warning";
    /**
     * Explicit message id; defaults to the translationKey. Lets a saga-produced message share an id
     * with a reducer-produced one so the usual remove-by-id flows keep working (used by the export
     * too-many-rows toast).
     */
    id?: string;
    durationInMs?: number;
    values?: Record<string, string>;
    errorDetails?: {
        id: string;
        values: Record<string, string>;
    };
}

export const addMessage = createAction(ActionTypeKeys.MESSAGES_ADD, (payload: IShowAddMessagePayload) => ({
    payload,
}));

export type IShowAddMessageAction = ReturnType<typeof addMessage>;
