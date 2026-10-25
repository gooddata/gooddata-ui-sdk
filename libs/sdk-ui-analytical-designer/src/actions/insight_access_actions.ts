// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type AccessGranularPermission } from "@gooddata/sdk-model";
import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { ActionTypeKeys } from "../constants/actions.js";

export const insightAccessDraftChanged = createAction(
    ActionTypeKeys.INSIGHT_ACCESS_DRAFT_CHANGED,
    (draft: IObjectShareDraft) => ({ payload: { draft } }),
);

export const insightAccessDraftApplied = createAction(ActionTypeKeys.INSIGHT_ACCESS_DRAFT_APPLIED);

export const insightShareDialogClosed = createAction(
    ActionTypeKeys.INSIGHT_SHARE_DIALOG_CLOSED,
    (identifier: string) => ({
        payload: { identifier },
    }),
);

export const savedInsightPermissionsLoaded = createAction(
    ActionTypeKeys.SAVED_INSIGHT_PERMISSIONS_LOADED,
    (identifier: string, permissions: AccessGranularPermission[] | undefined) => ({
        payload: { identifier, permissions },
    }),
);
