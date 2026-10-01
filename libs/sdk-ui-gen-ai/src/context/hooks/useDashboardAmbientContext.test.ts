// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DashboardSelectorEvaluator } from "@gooddata/sdk-ui-dashboard";

import { setAmbientUserContextAction } from "../../store/chatWindow/chatWindowSlice.js";

import { useDashboardAmbientContext } from "./useDashboardAmbientContext.js";

const { dispatchMock } = vi.hoisted(() => {
    vi.resetModules();
    return {
        dispatchMock: vi.fn(),
    };
});

vi.mock("react-redux", () => ({
    useDispatch: () => dispatchMock,
}));

const state = {
    executionResults: {
        entities: {},
    },
};

const evaluator: DashboardSelectorEvaluator = (selector) => selector(state as never);

describe("useDashboardAmbientContext", () => {
    beforeEach(() => {
        dispatchMock.mockClear();
    });

    it("sets ambient context when dashboard selector is provided", async () => {
        renderHook(() => useDashboardAmbientContext(evaluator));

        await waitFor(() => expect(dispatchMock).toHaveBeenCalledTimes(1));

        const [action] = dispatchMock.mock.calls[0];
        expect(action).toEqual(expect.objectContaining({ type: setAmbientUserContextAction.type }));
        expect(action.payload.userContext).toBeDefined();
    });

    it("does not dispatch anything when dashboard selector is undefined", () => {
        renderHook(() => useDashboardAmbientContext(undefined));

        expect(dispatchMock).not.toHaveBeenCalled();
    });

    it("clears ambient context when selector changes from value to undefined", async () => {
        const { rerender } = renderHook<void, { selector?: DashboardSelectorEvaluator | null }>(
            ({ selector }) => useDashboardAmbientContext(selector),
            {
                initialProps: {
                    selector: evaluator,
                },
            },
        );

        await waitFor(() => expect(dispatchMock).toHaveBeenCalledTimes(1));

        rerender({ selector: undefined });

        await waitFor(() => expect(dispatchMock).toHaveBeenCalledTimes(2));
        expect(dispatchMock).toHaveBeenLastCalledWith(
            setAmbientUserContextAction({ userContext: undefined }),
        );
    });

    it("clears ambient context when selector is explicitly null", async () => {
        renderHook(() => useDashboardAmbientContext(null));

        await waitFor(() => expect(dispatchMock).toHaveBeenCalledTimes(1));
        expect(dispatchMock).toHaveBeenLastCalledWith(
            setAmbientUserContextAction({ userContext: undefined }),
        );
    });
});
