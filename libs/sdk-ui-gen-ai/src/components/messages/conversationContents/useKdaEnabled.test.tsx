// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../../../store/chatWindow/chatWindowSlice.js";

import { useKdaEnabled } from "./useKdaEnabled.js";

function renderUseKdaEnabled(
    enableKeyDriverAnalysis: boolean | undefined,
    isKeyDriverAnalysisMounted: boolean,
    enableChangeAnalysis: boolean | undefined,
) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
        },
        preloadedState: {
            [chatWindowSliceName]: {
                ...getInitialChatWindowState(),
                isKeyDriverAnalysisMounted,
                settings:
                    enableChangeAnalysis === undefined
                        ? undefined
                        : ({ enableChangeAnalysis } as IUserWorkspaceSettings),
            },
        },
    });
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;

    return renderHook(() => useKdaEnabled(enableKeyDriverAnalysis), { wrapper }).result.current;
}

describe("useKdaEnabled", () => {
    it("should be disabled when Key Driver Analysis is not mounted", () => {
        expect(renderUseKdaEnabled(true, false, true)).toBe(false);
    });

    it("should use the explicit customization value before the workspace setting", () => {
        expect(renderUseKdaEnabled(false, true, true)).toBe(false);
        expect(renderUseKdaEnabled(true, true, false)).toBe(true);
    });

    it("should fall back to the workspace setting", () => {
        expect(renderUseKdaEnabled(undefined, true, true)).toBe(true);
        expect(renderUseKdaEnabled(undefined, true, false)).toBe(false);
    });

    it("should be disabled when no enablement value is configured", () => {
        expect(renderUseKdaEnabled(undefined, true, undefined)).toBe(false);
    });
});
