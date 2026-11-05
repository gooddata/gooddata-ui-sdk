// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    ACCESS_DESIGNER_DENIED_ERROR,
    ACCESS_WORKBENCH_DENIED_ERROR,
    CREATE_REPORT_DENIED_ERROR,
    NOT_AUTHORIZED_ERROR,
    NO_PROJECT_AVAILABLE_ERROR,
    PROJECT_NOT_FOUND_ERROR,
} from "../constants/errors.js";
import { initialState } from "../reducers/initial_state.js";
import { type IAppState } from "../store/types.js";
import { withMeta } from "../tests/state_builder.test.helpers.js";

import { getErrorHandler } from "./bootstrap_error_service.js";

vi.hoisted(() => {
    vi.resetModules();
});

// Hack that will get `vi.spyOn` work on ESM module (that is immutable) in CommonJS vitest environment
// if they are imported as `import * as some_dependency from "some_dependency"` pattern.
vi.mock("../backend", async () => {
    const actualModule = await vi.importActual("../backend");
    return {
        __esModule: true,
        ...actualModule,
    };
});

describe("getErrorHandler", () => {
    let state: IAppState;

    function createAction(error: string) {
        return {
            payload: {
                projectId: "my-project-123",
                error: {
                    type: error,
                },
            },
        };
    }

    function expectError(error: string, uri: string) {
        const location = { href: "/analyze" } as Location;
        const action = createAction(error);
        const handler = getErrorHandler(state, action);

        handler({ projectId: "my-project-123", location });

        expect(location.href).toEqual(uri);
    }

    function expectNoHandler(error: string) {
        const action = createAction(error);
        const handler = getErrorHandler(state, action);

        expect(handler).toEqual(undefined);
    }

    describe("non-embedded", () => {
        beforeEach(() => {
            state = initialState;
        });

        it("should redirect to dashboard if user has role view, and backend is Tiger", () => {
            expectError(ACCESS_DESIGNER_DENIED_ERROR, "/workspace/my-project-123/dashboards");
        });

        it.each([NOT_AUTHORIZED_ERROR, ACCESS_WORKBENCH_DENIED_ERROR])(
            "should redirect to the host landing on %s",
            (error) => {
                expectError(error, "/");
            },
        );

        it("should not redirect to dashboard if user has role view and can not create report, and backend is Tiger", () => {
            expectError(CREATE_REPORT_DENIED_ERROR, "/analyze");
        });
    });

    describe("embedded", () => {
        beforeEach(() => {
            state = withMeta(initialState, { isEmbedded: true });
        });

        it("should return other errors in state and not redirect", () => {
            expectNoHandler(NOT_AUTHORIZED_ERROR);
            expectNoHandler(ACCESS_WORKBENCH_DENIED_ERROR);
            expectNoHandler(ACCESS_DESIGNER_DENIED_ERROR);
            expectNoHandler(CREATE_REPORT_DENIED_ERROR);
            expectNoHandler(PROJECT_NOT_FOUND_ERROR);
            expectNoHandler(NO_PROJECT_AVAILABLE_ERROR);
        });
    });
});
