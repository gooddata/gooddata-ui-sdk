// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withRoot } from "../../tests/state_builder.test.helpers.js";

import { getWorkspaceId } from "./custom_variables.js";

describe("custom variables", () => {
    describe("getWorkspaceId", () => {
        it("should return undefined when workspace ID is not in the state", () => {
            const workspaceId = getWorkspaceId(getInitializedState());
            expect(workspaceId).toEqual(undefined);
        });

        it("should return ID of workspace if it is found in the state", () => {
            const state = withRoot(getInitializedState(), { projectId: "my-workspace" });
            const workspaceId = getWorkspaceId(state);
            expect(workspaceId).toEqual("my-workspace");
        });
    });
});
