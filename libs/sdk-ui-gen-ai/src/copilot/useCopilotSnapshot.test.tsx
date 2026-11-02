// (C) 2026 GoodData Corporation

import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { CopilotHandler } from "./CopilotHandler.js";
import { CopilotBuildType, type ICopilotConfiguration, type ICopilotSnapshot } from "./types.js";
import { useCopilotSnapshot } from "./useCopilotSnapshot.js";

function trackSubscription<TBuild extends string>(handler: CopilotHandler<TBuild>) {
    const subscribe = handler.subscribe;
    const unsubscribe = vi.fn<() => void>();
    const subscription = vi.spyOn(handler, "subscribe").mockImplementation((listener) => {
        const stop = subscribe(listener);
        return () => {
            unsubscribe();
            stop();
        };
    });

    return { subscription, unsubscribe };
}

describe("useCopilotSnapshot", () => {
    it("renders generation updates from a real handler", () => {
        const handler = new CopilotHandler({ registrations: [] });

        function Generation() {
            const snapshot = useCopilotSnapshot(handler);
            return <span>{snapshot.generation ?? "idle"}</span>;
        }

        render(<Generation />);
        expect(screen.getByText("idle")).toBeInTheDocument();

        act(() => handler.startGeneration(CopilotBuildType.Dashboard));
        expect(screen.getByText(CopilotBuildType.Dashboard)).toBeInTheDocument();

        act(() => handler.cancelGeneration(CopilotBuildType.Dashboard));
        expect(screen.getByText("idle")).toBeInTheDocument();
    });

    it("reads existing state and preserves a custom workflow type", () => {
        const configuration: ICopilotConfiguration<"report"> = { registrations: [] };
        const handler = new CopilotHandler<"report">(configuration);
        handler.startGeneration("report");

        const { result } = renderHook(() => useCopilotSnapshot(handler));

        expectTypeOf(result.current).toEqualTypeOf<ICopilotSnapshot<"report">>();
        expect(result.current).toBe(handler.getSnapshot());
        expect(result.current.generation).toBe("report");

        act(() => handler.cancelGeneration("report"));
        expect(result.current.generation).toBeUndefined();
    });

    it("keeps snapshots and subscriptions stable when state has not changed", () => {
        const handler = new CopilotHandler({ registrations: [] });
        const subscribe = vi.spyOn(handler, "subscribe");
        const rendered = vi.fn<() => void>();
        const { result, rerender } = renderHook(() => {
            rendered();
            return useCopilotSnapshot(handler);
        });
        const initial = result.current;

        expectTypeOf(result.current).toEqualTypeOf<ICopilotSnapshot>();
        expect(handler.getSnapshot()).toBe(initial);
        expect(handler.getSnapshot()).toBe(initial);

        rerender();
        expect(result.current).toBe(initial);
        expect(subscribe).toHaveBeenCalledTimes(1);

        rendered.mockClear();
        act(() => handler.cancelGeneration(CopilotBuildType.Dashboard));
        expect(result.current).toBe(initial);
        expect(rendered).not.toHaveBeenCalled();

        act(() => handler.startGeneration(CopilotBuildType.Dashboard));
        expect(result.current).not.toBe(initial);
        expect(result.current).toBe(handler.getSnapshot());
        expect(subscribe).toHaveBeenCalledTimes(1);
    });

    it("unsubscribes from the previous handler when the handler changes", () => {
        const first = new CopilotHandler({ registrations: [] });
        const second = new CopilotHandler({ registrations: [] });
        const firstSubscription = trackSubscription(first);
        const secondSubscription = trackSubscription(second);
        const rendered = vi.fn<() => void>();
        second.startGeneration(CopilotBuildType.Dashboard);

        const { result, rerender } = renderHook(
            ({ handler }) => {
                rendered();
                return useCopilotSnapshot(handler);
            },
            { initialProps: { handler: first } },
        );
        expect(result.current).toBe(first.getSnapshot());

        rerender({ handler: second });
        expect(firstSubscription.unsubscribe).toHaveBeenCalledTimes(1);
        expect(secondSubscription.subscription).toHaveBeenCalledTimes(1);
        expect(secondSubscription.unsubscribe).not.toHaveBeenCalled();
        expect(result.current).toBe(second.getSnapshot());
        expect(result.current.generation).toBe(CopilotBuildType.Dashboard);

        rendered.mockClear();
        act(() => first.startGeneration(CopilotBuildType.Dashboard));
        expect(result.current).toBe(second.getSnapshot());
        expect(rendered).not.toHaveBeenCalled();

        act(() => second.cancelGeneration(CopilotBuildType.Dashboard));
        expect(result.current.generation).toBeUndefined();
        expect(result.current).toBe(second.getSnapshot());
    });

    it("unsubscribes on unmount without disposing the handler", () => {
        const handler = new CopilotHandler({ registrations: [] });
        const { subscription, unsubscribe } = trackSubscription(handler);
        const dispose = vi.spyOn(handler, "dispose");
        const rendered = vi.fn<() => void>();
        const { unmount } = renderHook(() => {
            rendered();
            return useCopilotSnapshot(handler);
        });

        expect(subscription).toHaveBeenCalledTimes(1);
        unmount();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
        expect(dispose).not.toHaveBeenCalled();

        rendered.mockClear();
        act(() => handler.startGeneration(CopilotBuildType.Dashboard));
        expect(rendered).not.toHaveBeenCalled();
        expect(handler.getSnapshot().generation).toBe(CopilotBuildType.Dashboard);
    });

    it("keeps independent handler instances isolated", () => {
        const first = new CopilotHandler({ registrations: [] });
        const second = new CopilotHandler({ registrations: [] });
        const firstRendered = vi.fn<() => void>();
        const secondRendered = vi.fn<() => void>();
        const firstHook = renderHook(() => {
            firstRendered();
            return useCopilotSnapshot(first);
        });
        const secondHook = renderHook(() => {
            secondRendered();
            return useCopilotSnapshot(second);
        });
        const secondInitial = secondHook.result.current;

        secondRendered.mockClear();
        act(() => first.startGeneration(CopilotBuildType.Dashboard));
        expect(firstHook.result.current.generation).toBe(CopilotBuildType.Dashboard);
        expect(secondHook.result.current).toBe(secondInitial);
        expect(secondRendered).not.toHaveBeenCalled();

        const firstGenerating = firstHook.result.current;
        firstRendered.mockClear();
        act(() => second.startGeneration(CopilotBuildType.Dashboard));
        expect(secondHook.result.current.generation).toBe(CopilotBuildType.Dashboard);
        expect(firstHook.result.current).toBe(firstGenerating);
        expect(firstRendered).not.toHaveBeenCalled();

        act(() => first.cancelGeneration(CopilotBuildType.Dashboard));
        expect(firstHook.result.current.generation).toBeUndefined();
        expect(secondHook.result.current.generation).toBe(CopilotBuildType.Dashboard);
    });
});
