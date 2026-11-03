// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-base";

import { selectIsAiLoading } from "../store/config/configSelectors.js";
import { configSliceReducer } from "../store/config/index.js";
import { type createDashboardStore } from "../store/dashboardStore.js";
import { type DashboardConfig, type ResolvedDashboardConfig } from "../types/commonTypes.js";

vi.hoisted(() => {
    vi.resetModules();
});

const { createStore } = vi.hoisted(() => ({ createStore: vi.fn() }));

vi.mock("../store/dashboardStore.js", async (importOriginal) => ({
    ...(await importOriginal<{ createDashboardStore: typeof createDashboardStore }>()),
    createDashboardStore: createStore,
}));

const { useInitializeDashboardStore } = await import("./useInitializeDashboardStore.js");

describe("useInitializeDashboardStore AI mode config", () => {
    it("should update stored AI modes while preserving the remaining resolved config", () => {
        const store = configureStore({
            reducer: { config: configSliceReducer },
            preloadedState: {
                config: { config: { aiMode: "building", locale: "en-US" } as ResolvedDashboardConfig },
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({ serializableCheck: { ignoredActionPaths: ["ctx"] } }),
        });
        const dashboardStore = { store, rootSagaTask: { cancel: vi.fn() } };
        createStore.mockReturnValue(dashboardStore);
        const backend = dummyBackend();
        const { result, rerender } = renderHook(
            ({ config }: { config: DashboardConfig | undefined }) =>
                useInitializeDashboardStore({ backend, workspace: "test-workspace", config }),
            {
                initialProps: {
                    config: { aiMode: "building" } as DashboardConfig | undefined,
                },
            },
        );

        expect(selectIsAiLoading(result.current!.store.getState())).toBe(true);
        for (const aiMode of ["generating", "waiting", "building", "active", null, undefined] as const) {
            rerender({ config: { aiMode } });
            expect(store.getState().config.config).toEqual({ aiMode, locale: "en-US" });
            expect(selectIsAiLoading(result.current!.store.getState())).toBe(
                aiMode === "generating" || aiMode === "waiting" || aiMode === "building",
            );
        }
        rerender({ config: { aiMode: "building" } });
        rerender({ config: {} });
        expect(store.getState().config.config).toEqual({ aiMode: undefined, locale: "en-US" });
        rerender({ config: { aiMode: "waiting" } });
        rerender({ config: undefined });
        expect(store.getState().config.config).toEqual({ aiMode: undefined, locale: "en-US" });
        expect(selectIsAiLoading(result.current!.store.getState())).toBe(false);
        expect(result.current).toBe(dashboardStore);
        expect(createStore).toHaveBeenCalledTimes(1);
        expect(dashboardStore.rootSagaTask.cancel).not.toHaveBeenCalled();
    });

    it("should synchronize modes and reset omitted or null modes without reinitializing the dashboard", () => {
        const dispatch = vi.fn();
        const dashboardStore = { store: { dispatch }, rootSagaTask: { cancel: vi.fn() } };
        createStore.mockReturnValue(dashboardStore);
        const backend = dummyBackend();
        const { result, rerender } = renderHook(
            ({ config }: { config: DashboardConfig | undefined }) =>
                useInitializeDashboardStore({ backend, workspace: "test-workspace", config }),
            { initialProps: { config: { aiMode: "active" } as DashboardConfig | undefined } },
        );

        expect(dispatch).toHaveBeenCalledWith({ type: "config/setAiMode", payload: "active" });
        dispatch.mockClear();

        for (const aiMode of ["generating", "waiting", "building", "active", null, "building"] as const) {
            rerender({ config: { aiMode } });
            expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "config/setAiMode", payload: aiMode });
            dispatch.mockClear();
        }

        rerender({ config: {} });
        expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "config/setAiMode", payload: undefined });
        rerender({ config: { aiMode: "building" } });
        dispatch.mockClear();
        rerender({ config: undefined });
        expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "config/setAiMode", payload: undefined });
        expect(result.current).toBe(dashboardStore);
        expect(createStore).toHaveBeenCalledTimes(1);
        expect(dashboardStore.rootSagaTask.cancel).not.toHaveBeenCalled();
    });
});
