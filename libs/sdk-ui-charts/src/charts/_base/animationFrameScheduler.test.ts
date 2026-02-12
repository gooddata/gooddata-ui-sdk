// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import {
    type AnimationFrameHandle,
    cancelScheduledAnimationFrame,
    scheduleAnimationFrame,
} from "./animationFrameScheduler.js";

describe("animationFrameScheduler", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("should schedule callback to next animation frame", () => {
        let frameCallback: FrameRequestCallback | undefined;
        const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
            frameCallback = callback;
            return 42;
        });
        const cancelAnimationFrameMock = vi.fn();
        vi.stubGlobal("requestAnimationFrame", requestAnimationFrameMock);
        vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);

        const handle: AnimationFrameHandle = { frameId: null };
        const callback = vi.fn();

        scheduleAnimationFrame(handle, callback);

        expect(requestAnimationFrameMock).toHaveBeenCalledOnce();
        expect(cancelAnimationFrameMock).not.toHaveBeenCalled();
        expect(handle.frameId).toBe(42);
        expect(callback).not.toHaveBeenCalled();

        expect(frameCallback).toBeDefined();
        frameCallback?.(0);

        expect(handle.frameId).toBeNull();
        expect(callback).toHaveBeenCalledOnce();
    });

    it("should cancel previous frame before scheduling a new one", () => {
        const requestAnimationFrameMock = vi.fn(() => 42);
        const cancelAnimationFrameMock = vi.fn();
        vi.stubGlobal("requestAnimationFrame", requestAnimationFrameMock);
        vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);

        const handle: AnimationFrameHandle = { frameId: 10 };

        scheduleAnimationFrame(handle, () => undefined);

        expect(cancelAnimationFrameMock).toHaveBeenCalledWith(10);
        expect(handle.frameId).toBe(42);
    });

    it("should cancel and clear a pending frame", () => {
        const cancelAnimationFrameMock = vi.fn();
        vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);

        const handle: AnimationFrameHandle = { frameId: 10 };

        cancelScheduledAnimationFrame(handle);

        expect(cancelAnimationFrameMock).toHaveBeenCalledWith(10);
        expect(handle.frameId).toBeNull();
    });

    it("should do nothing when no frame is pending", () => {
        const cancelAnimationFrameMock = vi.fn();
        vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);

        const handle: AnimationFrameHandle = { frameId: null };

        cancelScheduledAnimationFrame(handle);

        expect(cancelAnimationFrameMock).not.toHaveBeenCalled();
        expect(handle.frameId).toBeNull();
    });
});
