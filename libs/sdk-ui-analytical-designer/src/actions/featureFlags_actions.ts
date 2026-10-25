// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IUserSettings, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { ActionTypeKeys } from "../constants/actions.js";

export const featureFlagsRequest = createAction(
    ActionTypeKeys.STORE_FEATURE_FLAGS_REQUEST,
    (workspaceId: string) => ({ payload: { workspaceId } }),
);

export const featureFlagsError = createAction(
    ActionTypeKeys.STORE_FEATURE_FLAGS_ERROR,
    (workspaceId: string, error?: unknown) => ({ payload: { workspaceId, error } }),
);

export const setFeatureFlagsItems = createAction(
    ActionTypeKeys.STORE_FEATURE_FLAGS_DATA,
    (configs: IUserWorkspaceSettings | IUserSettings) => ({ payload: { configs } }),
);
