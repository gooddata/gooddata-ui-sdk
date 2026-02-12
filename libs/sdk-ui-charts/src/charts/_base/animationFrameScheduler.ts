// (C) 2026 GoodData Corporation

/**
 * Mutable holder for a single scheduled animation frame.
 */
export type AnimationFrameHandle = {
    frameId: number | null;
};

/**
 * Schedules callback for the next animation frame.
 * Any previously scheduled frame in this handle is canceled first.
 */
export function scheduleAnimationFrame(handle: AnimationFrameHandle, callback: () => void): void {
    cancelScheduledAnimationFrame(handle);
    handle.frameId = requestAnimationFrame(() => {
        handle.frameId = null;
        callback();
    });
}

/**
 * Cancels a scheduled animation frame and clears the handle.
 */
export function cancelScheduledAnimationFrame(handle: AnimationFrameHandle): void {
    if (handle.frameId !== null) {
        cancelAnimationFrame(handle.frameId);
        handle.frameId = null;
    }
}
