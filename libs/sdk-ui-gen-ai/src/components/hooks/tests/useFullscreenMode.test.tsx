// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { isFullscreenSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    setFullscreenAction,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../../../store/types.js";
import { type GenAIAssistantMode, useFullscreenMode } from "../useFullscreenMode.js";

const makeStore = () =>
    configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
        },
    });

const renderUseFullscreenMode = (
    store: ReturnType<typeof makeStore>,
    mode?: GenAIAssistantMode,
    onModeChange?: (mode: GenAIAssistantMode) => void,
) => {
    const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

    return renderHook(({ mode }: { mode?: GenAIAssistantMode }) => useFullscreenMode(mode, onModeChange), {
        wrapper,
        initialProps: { mode },
    });
};

const isFullscreen = (store: ReturnType<typeof makeStore>) =>
    isFullscreenSelector(store.getState() as RootState);

describe("useFullscreenMode", () => {
    it("should switch the store to fullscreen for the fullscreen mode", () => {
        const store = makeStore();

        renderUseFullscreenMode(store, "fullscreen");

        expect(isFullscreen(store)).toBe(true);
    });

    it("should switch the store back to docked when the mode changes", () => {
        const store = makeStore();

        const { rerender } = renderUseFullscreenMode(store, "fullscreen");
        rerender({ mode: "docked" });

        expect(isFullscreen(store)).toBe(false);
    });

    it("should leave the store untouched when no mode is provided", () => {
        const store = makeStore();
        store.dispatch(setFullscreenAction({ isFullscreen: true }));

        renderUseFullscreenMode(store, undefined);

        expect(isFullscreen(store)).toBe(true);
    });

    it("should not fight an internal toggle while the mode prop stays the same", () => {
        const store = makeStore();

        const { rerender } = renderUseFullscreenMode(store, "docked");
        store.dispatch(setFullscreenAction({ isFullscreen: true }));
        rerender({ mode: "docked" });

        expect(isFullscreen(store)).toBe(true);
    });

    it("should report a mode change the host did not ask for", () => {
        const store = makeStore();
        const onModeChange = vi.fn();

        renderUseFullscreenMode(store, "docked", onModeChange);
        act(() => {
            store.dispatch(setFullscreenAction({ isFullscreen: true }));
        });

        expect(onModeChange).toHaveBeenCalledWith("fullscreen");
    });

    it("should not report a mode change the host asked for", () => {
        const store = makeStore();
        const onModeChange = vi.fn();

        const { rerender } = renderUseFullscreenMode(store, "docked", onModeChange);
        rerender({ mode: "fullscreen" });

        expect(onModeChange).not.toHaveBeenCalled();
    });

    it("should not report anything on mount", () => {
        const store = makeStore();
        const onModeChange = vi.fn();
        store.dispatch(setFullscreenAction({ isFullscreen: true }));

        renderUseFullscreenMode(store, undefined, onModeChange);

        expect(onModeChange).not.toHaveBeenCalled();
    });

    it("should report store changes when the mode is uncontrolled", () => {
        const store = makeStore();
        const onModeChange = vi.fn();

        renderUseFullscreenMode(store, undefined, onModeChange);
        act(() => {
            store.dispatch(setFullscreenAction({ isFullscreen: true }));
        });

        expect(onModeChange).toHaveBeenCalledExactlyOnceWith("fullscreen");
    });
});
