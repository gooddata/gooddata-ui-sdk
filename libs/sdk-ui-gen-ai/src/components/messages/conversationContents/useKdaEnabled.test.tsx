// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../../../store/chatWindow/chatWindowSlice.js";

import { useKdaEnabled } from "./useKdaEnabled.js";

function renderUseKdaEnabled(
    enableKeyDriverAnalysis: boolean | undefined,
    isKeyDriverAnalysisMounted: boolean,
) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
        },
        preloadedState: {
            [chatWindowSliceName]: {
                ...getInitialChatWindowState(),
                isKeyDriverAnalysisMounted,
            },
        },
    });
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;

    return renderHook(() => useKdaEnabled(enableKeyDriverAnalysis), { wrapper }).result.current;
}

describe("useKdaEnabled", () => {
    it("should be disabled when Key Driver Analysis is not mounted", () => {
        expect(renderUseKdaEnabled(true, false)).toBe(false);
    });

    it("should use the explicit customization value before the workspace setting", () => {
        expect(renderUseKdaEnabled(false, true)).toBe(false);
        expect(renderUseKdaEnabled(true, true)).toBe(true);
    });

    it("should fall back to true", () => {
        expect(renderUseKdaEnabled(undefined, true)).toBe(true);
        expect(renderUseKdaEnabled(undefined, true)).toBe(true);
    });

    it("should be enabled when no enablement value is configured", () => {
        expect(renderUseKdaEnabled(undefined, true)).toBe(true);
    });
});
