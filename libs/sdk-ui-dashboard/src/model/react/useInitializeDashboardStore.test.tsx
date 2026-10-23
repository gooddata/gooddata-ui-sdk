// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-base";

import { selectAiReasoningTitle } from "../store/config/configSelectors.js";
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
    it("should synchronize reasoning titles including clearing without reinitializing the dashboard", () => {
        const store = configureStore({
            reducer: { config: configSliceReducer },
            preloadedState: { config: { config: { aiMode: "building" } as ResolvedDashboardConfig } },
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
                    config: { aiMode: "building", aiReasoningTitle: "Exploring data" } as
                        | DashboardConfig
                        | undefined,
                },
            },
        );

        const getTitle = () => selectAiReasoningTitle(result.current!.store.getState());
        expect(getTitle()).toBe("Exploring data");
        rerender({ config: { aiMode: "building", aiReasoningTitle: "Choosing charts" } });
        expect(getTitle()).toBe("Choosing charts");
        expect(store.getState().config.config?.aiMode).toBe("building");
        rerender({ config: { aiMode: "waiting", aiReasoningTitle: "Choosing charts" } });
        expect(getTitle()).toBe("Choosing charts");
        rerender({ config: { aiMode: "building", aiReasoningTitle: undefined } });
        expect(getTitle()).toBeUndefined();
        rerender({ config: { aiMode: "building", aiReasoningTitle: "Exploring data" } });
        expect(getTitle()).toBe("Exploring data");
        rerender({ config: { aiMode: "building" } });
        expect(getTitle()).toBeUndefined();
        rerender({ config: { aiReasoningTitle: "Choosing charts" } });
        expect(getTitle()).toBe("Choosing charts");
        rerender({ config: undefined });
        expect(getTitle()).toBeUndefined();
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
