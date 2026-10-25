// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type CopyCodeOriginType, type EmbedType } from "@gooddata/sdk-ui-kit";

import { ActionTypeKeys } from "../constants/actions.js";

export const createEmbedDialogCopyCodeAction = createAction(
    ActionTypeKeys.UI_EMBED_DIALOG_COPY_CODE,
    (code: string, originType: CopyCodeOriginType, codeType: EmbedType) => ({
        payload: { code, originType, codeType },
    }),
);

export type IEmbedDialogCopyCodeAction = ReturnType<typeof createEmbedDialogCopyCodeAction>;

export const createEmbedDialogOpenAction = createAction(ActionTypeKeys.UI_EMBED_DIALOG_OPEN);
