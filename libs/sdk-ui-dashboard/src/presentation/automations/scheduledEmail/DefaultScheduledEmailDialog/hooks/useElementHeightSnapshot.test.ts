// (C) 2026 GoodData Corporation

import { useRef } from "react";

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useElementHeightSnapshot } from "./useElementHeightSnapshot.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// happy-dom's built-in ResizeObserver never fires, so a broken subscription would still pass.
// This mock captures the callback/observed node so tests can trigger it explicitly and assert
// the resulting behavior.
class MockResizeObserver {
    static instances: MockResizeObserver[] = [];

    disconnected = false;
    observedNode: unknown = null;

    constructor(public callback: ResizeObserverCallback) {
        MockResizeObserver.instances.push(this);
    }

    observe(node: unknown) {
        this.observedNode = node;
    }

    unobserve() {}

    disconnect() {
        this.disconnected = true;
    }
}

function createFakeNode(scrollHeight: number): HTMLElement {
    return { scrollHeight } as unknown as HTMLElement;
}

function useTestSubject(node: HTMLElement | null, resubscribeKey: unknown) {
    const ref = useRef<HTMLElement | null>(null);
    ref.current = node;
    return useElementHeightSnapshot(ref, resubscribeKey);
}

beforeEach(() => {
    MockResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useElementHeightSnapshot", () => {
    it("returns undefined when there is no node to observe", () => {
        const { result } = renderHook(() => useTestSubject(null, "general"));
        expect(result.current).toBeUndefined();
    });

    it("measures the node's scrollHeight once it is available", () => {
        const node = createFakeNode(100);
        const { result } = renderHook(() => useTestSubject(node, "general"));
        expect(result.current).toBe(100);
    });

    it("updates when the ResizeObserver callback fires", () => {
        const node = createFakeNode(50);
        const { result } = renderHook(() => useTestSubject(node, "general"));
        expect(result.current).toBe(50);

        (node as unknown as { scrollHeight: number }).scrollHeight = 120;
        const observer = MockResizeObserver.instances[0];
        act(() => {
            observer.callback([], observer as unknown as ResizeObserver);
        });

        expect(result.current).toBe(120);
    });

    it("resubscribes to a new node when resubscribeKey changes", () => {
        const nodeA = createFakeNode(80);
        const { result, rerender } = renderHook(
            ({ node, key }: { node: HTMLElement; key: unknown }) => useTestSubject(node, key),
            { initialProps: { node: nodeA, key: "general" } },
        );
        expect(result.current).toBe(80);
        const firstObserver = MockResizeObserver.instances[0];

        const nodeB = createFakeNode(200);
        rerender({ node: nodeB, key: "general-remounted" });

        expect(firstObserver.disconnected).toBe(true);
        expect(result.current).toBe(200);
    });

    it("still performs a one-shot measurement when ResizeObserver is unavailable", () => {
        vi.stubGlobal("ResizeObserver", undefined);

        const node = createFakeNode(64);
        const { result } = renderHook(() => useTestSubject(node, "general"));

        expect(result.current).toBe(64);
    });
});
