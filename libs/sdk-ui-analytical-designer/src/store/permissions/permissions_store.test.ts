// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { workspacePermissionsSuccess } from "../../actions/permissions_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { canManageProject, workspacePermissions } from "../../selectors/permissions_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

describe("workspacePermissions store", () => {
    it("is empty before the bootstrap flow stores the permissions", () => {
        expect(workspacePermissions(getInitializedState())).toBeNull();
        // the pre-init state reads through the selector's null handling
        expect(workspacePermissions(initialState)).toBeNull();
    });

    it("stores the permissions of WORKSPACE_PERMISSIONS_SUCCESS", () => {
        const permissions = { canManageProject: true } as IWorkspacePermissions;

        const state = combinedRootReducer(
            getInitializedState(),
            workspacePermissionsSuccess("w1", permissions),
        );

        expect(workspacePermissions(state)).toEqual(permissions);
    });

    it("derived permission selectors guard the not-yet-loaded state", () => {
        expect(canManageProject(getInitializedState())).toBe(false);

        const state = combinedRootReducer(
            getInitializedState(),
            workspacePermissionsSuccess("w1", { canManageProject: true } as IWorkspacePermissions),
        );
        expect(canManageProject(state)).toBe(true);
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
});
