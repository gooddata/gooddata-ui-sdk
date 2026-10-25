// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type BootstrapError } from "../actions/app_context_actions.js";
import {
    ACCESS_DESIGNER_DENIED_ERROR,
    ACCESS_WORKBENCH_DENIED_ERROR,
    CREATE_REPORT_DENIED_ERROR,
    NOT_AUTHORIZED_ERROR,
    NO_PROJECT_AVAILABLE_ERROR,
    PROJECT_NOT_FOUND_ERROR,
} from "../constants/errors.js";
import { buildInitialState } from "../reducers/initial_state.js";
import { type IAppState } from "../store/types.js";
import { withAppState, withRoot } from "../tests/state_builder.test.helpers.js";
import { withIntl } from "../utils/with_intl.js";

import { Error } from "./Error.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

describe("Error component", () => {
    function renderError(errors: BootstrapError[]) {
        const emptyState: IAppState = buildInitialState();
        const state = withAppState(withRoot(emptyState, { projectId: "projectId" }), { errors: errors });
        useSelectorMock.mockImplementation((selector: (state: IAppState) => unknown) => selector(state));

        const Wrapped = withIntl(Error);
        return render(<Wrapped />);
    }

    function getErrorMessage(errorType = "") {
        switch (errorType) {
            case ACCESS_DESIGNER_DENIED_ERROR:
            case NOT_AUTHORIZED_ERROR:
            case CREATE_REPORT_DENIED_ERROR:
                return "Sorry, you don't have access to this page.";
            case ACCESS_WORKBENCH_DENIED_ERROR:
                return "Sorry, you don't have access to this workspace.";
            case PROJECT_NOT_FOUND_ERROR:
                return "Workspace `projectId` not found.";
            case NO_PROJECT_AVAILABLE_ERROR:
                return "No available workspace found.";
            default:
                return "Workspace `projectId` error";
        }
    }

    it("should render last error in array", () => {
        renderError([{ type: CREATE_REPORT_DENIED_ERROR }, { type: NO_PROJECT_AVAILABLE_ERROR }]);

        const messageElement = document.querySelector(".s-canvas-message");
        expect(messageElement.textContent).toContain("No available workspace found.");
    });

    it("should render last error in array with workspace text", () => {
        renderError([{ type: CREATE_REPORT_DENIED_ERROR }, { type: NO_PROJECT_AVAILABLE_ERROR }]);

        const messageElement = document.querySelector(".s-canvas-message");
        expect(messageElement.textContent).toContain("No available workspace found.");
    });

    it.each([
        [""],
        ["ACCESS_DESIGNER_DENIED_ERROR"],
        ["NOT_AUTHORIZED_ERROR"],
        ["CREATE_REPORT_DENIED_ERROR"],
        ["ACCESS_WORKBENCH_DENIED_ERROR"],
        ["PROJECT_NOT_FOUND_ERROR"],
        ["NO_PROJECT_AVAILABLE_ERROR"],
    ])("should render the errorType '%s' correctly", (errorType: string) => {
        renderError([{ type: errorType }]);

        const messageElement = document.querySelector(".s-canvas-message");
        expect(messageElement.textContent).toContain(getErrorMessage(errorType));
    });
});
