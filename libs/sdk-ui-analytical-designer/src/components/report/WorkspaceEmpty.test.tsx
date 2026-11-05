// (C) 2021-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IAppState } from "../../store/types.js";
import { withRoot } from "../../tests/state_builder.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { WorkspaceEmpty } from "./WorkspaceEmpty.js";

describe("WorkspaceEmpty", () => {
    function createComponent({ canManageProject = true }: { canManageProject?: boolean }) {
        const seed = (state: IAppState) =>
            withRoot(state, {
                workspacePermissions: { ...state.workspacePermissions, canManageProject },
            });
        const Wrapped = withRedux(withIntl(WorkspaceEmpty), seed);
        return render(<Wrapped />);
    }

    it("should not display message about data load when can't manage project", () => {
        const { container } = createComponent({ canManageProject: false });

        expect(container.querySelector(".s-workspace-empty-data-load")).toBeFalsy();
        expect(container.querySelector(".s-workspace-empty")).toBeTruthy();
    });

    it("should display message about data load when can manage project", () => {
        const { container } = createComponent({ canManageProject: true });

        expect(container.querySelector(".s-workspace-empty-data-load")).toBeTruthy();
    });
});
