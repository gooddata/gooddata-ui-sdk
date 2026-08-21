// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";

import { type DashboardEventHandler } from "../../eventHandlers/eventHandler.js";
import { type IReduxedDashboardStore } from "../../store/dashboardStore.js";
import { type IDashboardStoreProviderProps } from "../types.js";
import { useInitializeDashboardStore } from "../useInitializeDashboardStore.js";

const dashboardRef = idRef("test-dashboard");

function newBackend(): IAnalyticalBackend {
    return { capabilities: {}, config: {} } as unknown as IAnalyticalBackend;
}

type TestProps = {
    backend: IAnalyticalBackend;
    eventHandlers: DashboardEventHandler[] | undefined;
};

// Only the probe event is matched, so the events of the initial load stay out of the recording.
function recordingHandler(recorded: string[], name: string): DashboardEventHandler {
    return {
        eval: (event) => event.type === "CUSTOM/EVT.PROBE",
        handler: () => recorded.push(name),
    };
}

function emitProbe(dashboardStore: IReduxedDashboardStore | null) {
    dashboardStore?.store.dispatch({ type: "CUSTOM/EVT.PROBE" } as unknown as Action);
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

function renderDashboardStore(initialProps: TestProps) {
    return renderHook(
        (props: TestProps) =>
            useInitializeDashboardStore({
                backend: props.backend,
                workspace: "test-workspace",
                dashboard: dashboardRef,
                eventHandlers: props.eventHandlers,
                initialRenderMode: "view",
            } as IDashboardStoreProviderProps),
        { initialProps },
    );
}

describe("useInitializeDashboardStore", () => {
    it("delivers events to a handler added by a props change, without rebuilding the store", async () => {
        const recorded: string[] = [];
        const first = recordingHandler(recorded, "h1");
        const second = recordingHandler(recorded, "h2");
        const backend = newBackend();
        const { result, rerender } = renderDashboardStore({ backend, eventHandlers: [first] });
        await settle();
        const initialStore = result.current;

        rerender({ backend, eventHandlers: [first, second] });
        await settle();
        emitProbe(result.current);
        await settle();

        expect(result.current).toBe(initialStore);
        expect(recorded).toEqual(["h1", "h2"]);
    });

    it("stops delivering events to a handler removed by a props change", async () => {
        const recorded: string[] = [];
        const first = recordingHandler(recorded, "h1");
        const second = recordingHandler(recorded, "h2");
        const backend = newBackend();
        const { result, rerender } = renderDashboardStore({
            backend,
            eventHandlers: [first, second],
        });
        await settle();

        rerender({ backend, eventHandlers: [first] });
        await settle();
        emitProbe(result.current);
        await settle();

        expect(recorded).toEqual(["h1"]);
    });

    it("keeps unregisterEventHandler working for a handler passed in through props", async () => {
        const recorded: string[] = [];
        const handler = recordingHandler(recorded, "h1");
        const backend = newBackend();
        const { result, rerender } = renderDashboardStore({ backend, eventHandlers: [handler] });
        await settle();

        result.current?.unregisterEventHandler(handler);
        rerender({ backend, eventHandlers: [handler] });
        await settle();
        emitProbe(result.current);
        await settle();

        expect(recorded).toEqual([]);
    });

    it("handles event handlers going from undefined to populated and back", async () => {
        const recorded: string[] = [];
        const handler = recordingHandler(recorded, "h1");
        const backend = newBackend();
        const { result, rerender } = renderDashboardStore({ backend, eventHandlers: undefined });
        await settle();
        const initialStore = result.current;

        rerender({ backend, eventHandlers: [handler] });
        await settle();
        emitProbe(result.current);
        await settle();
        expect(result.current).toBe(initialStore);
        expect(recorded).toEqual(["h1"]);

        rerender({ backend, eventHandlers: undefined });
        await settle();
        emitProbe(result.current);
        await settle();
        expect(recorded).toEqual(["h1"]);
    });

    it("keeps delivering to a handler that was listed twice and is now listed once", async () => {
        const recorded: string[] = [];
        const handler = recordingHandler(recorded, "h1");
        const backend = newBackend();
        const { result, rerender } = renderDashboardStore({
            backend,
            eventHandlers: [handler, handler],
        });
        await settle();

        rerender({ backend, eventHandlers: [handler] });
        await settle();
        emitProbe(result.current);
        await settle();

        // Both copies were seeded and a repeat is not a removal, so both stay.
        expect(recorded).toEqual(["h1", "h1"]);
    });

    it("rebuilds the store when the backend changes, and seeds it exactly once", async () => {
        const recorded: string[] = [];
        const handler = recordingHandler(recorded, "h1");
        const { result, rerender } = renderDashboardStore({
            backend: newBackend(),
            eventHandlers: [handler],
        });
        await settle();
        const initialStore = result.current;

        rerender({ backend: newBackend(), eventHandlers: [handler] });
        await settle();
        emitProbe(result.current);
        await settle();

        expect(result.current).not.toBe(initialStore);
        expect(recorded).toEqual(["h1"]);
    });

    it("registers a handler again after it was removed and re-added", async () => {
        const recorded: string[] = [];
        const handler = recordingHandler(recorded, "h1");
        const backend = newBackend();
        const { result, rerender } = renderDashboardStore({ backend, eventHandlers: [handler] });
        await settle();

        rerender({ backend, eventHandlers: [] });
        await settle();
        rerender({ backend, eventHandlers: [handler] });
        await settle();
        emitProbe(result.current);
        await settle();

        expect(recorded).toEqual(["h1"]);
    });

    it("does not leave a handler behind when the handler identity changes on every render", async () => {
        const recorded: string[] = [];
        const backend = { current: newBackend() };
        let renderCount = 0;
        const { result, rerender } = renderHook(() => {
            renderCount += 1;
            const name = `h${renderCount}`;
            // A fresh handler identity every render, the seed of a store built from earlier props included.
            return useInitializeDashboardStore({
                backend: backend.current,
                workspace: "test-workspace",
                dashboard: dashboardRef,
                eventHandlers: [recordingHandler(recorded, name)],
                initialRenderMode: "view",
            } as IDashboardStoreProviderProps);
        });
        await settle();

        backend.current = newBackend();
        rerender();
        await settle();
        rerender();
        await settle();

        recorded.length = 0;
        emitProbe(result.current);
        await settle();

        expect(recorded).toHaveLength(1);
    });
});
