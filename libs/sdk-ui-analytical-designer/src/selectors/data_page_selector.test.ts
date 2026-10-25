// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { buildInitialState } from "../reducers/initial_state.js";
import { type IAppState } from "../store/types.js";
import { withRoot } from "../tests/state_builder.test.helpers.js";

import { getLinkToDatasourcePage, getLinkToLoadDataPage } from "./data_page_selector.js";

describe("data pages selector", () => {
    const projectId = "project123";
    const state = withRoot(buildInitialState() as IAppState, { projectId: projectId });

    describe("getLinkToLoadDataPage", () => {
        it("should use projectId to create link", () => {
            expect(getLinkToLoadDataPage(state)).toEqual("/admin/load/#/workspaces/project123");
        });
    });

    describe("getLinkToDataPage", () => {
        it("should use projectId to create link", () => {
            expect(getLinkToDatasourcePage(state)).toEqual(
                "/admin/connect/#/workspaces/project123/datasource",
            );
        });
    });
});
