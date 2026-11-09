// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { runSaga } from "redux-saga";
import { call } from "redux-saga/effects";
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

describe("useInitializeDashboardStore lifecycle", () => {
    it("deinitializes the dashboard before cancelling its running sagas on unmount", () => {
        const dispatch = vi.fn();
        const cancel = vi.fn();
        createStore.mockReturnValue({ store: { dispatch }, rootSagaTask: { cancel } });
        const backend = dummyBackend();
        const { unmount } = renderHook(() =>
            useInitializeDashboardStore({ backend, workspace: "test-workspace" }),
        );
        dispatch.mockClear();

        unmount();

        expect(dispatch).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ type: "GDC.DASH/EVT.DEINITIALIZED" }),
        );
        expect(cancel).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(cancel.mock.invocationCallOrder[0]);
    });

    it("does not publish a late initialization from an unmounted dashboard after a replacement mounts", async () => {
        let finishInitialization!: () => void;
        const initialization = new Promise<void>((resolve) => {
            finishInitialization = resolve;
        });
        const publishInitialized = vi.fn();
        const rootSagaTask = runSaga({}, function* () {
            yield call(() => initialization);
            publishInitialized();
        });
        createStore.mockReturnValueOnce({ store: { dispatch: vi.fn() }, rootSagaTask });
        const backend = dummyBackend();
        const first = renderHook(() => useInitializeDashboardStore({ backend, workspace: "test-workspace" }));

        first.unmount();

        const replacement = { store: { dispatch: vi.fn() }, rootSagaTask: { cancel: vi.fn() } };
        createStore.mockReturnValue(replacement);
        const second = renderHook(() =>
            useInitializeDashboardStore({ backend, workspace: "test-workspace" }),
        );
        finishInitialization();
        await rootSagaTask.toPromise();

        expect(publishInitialized).not.toHaveBeenCalled();
        expect(rootSagaTask.isCancelled()).toBe(true);
        expect(second.result.current).toBe(replacement);
        expect(replacement.rootSagaTask.cancel).not.toHaveBeenCalled();
    });
});
