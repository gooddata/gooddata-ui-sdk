// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../constants/actions.js";

export const workspacePermissionsRequest = createAction(
    ActionTypeKeys.WORKSPACE_PERMISSIONS_REQUEST,
    (workspaceId: string) => ({ payload: { workspaceId } }),
);

export const workspacePermissionsSuccess = createAction(
    ActionTypeKeys.WORKSPACE_PERMISSIONS_SUCCESS,
    (workspaceId: string, permissions: IWorkspacePermissions) => ({
        payload: { workspaceId, permissions },
    }),
);

export const workspacePermissionsError = createAction(
    ActionTypeKeys.WORKSPACE_PERMISSIONS_ERROR,
    (workspaceId: string, error: unknown) => ({ payload: { workspaceId, error } }),
);
