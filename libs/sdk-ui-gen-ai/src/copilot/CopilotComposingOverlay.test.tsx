// (C) 2026 GoodData Corporation

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardAiComposingOverlay } from "./CopilotComposingOverlay.js";

describe("CopilotComposingOverlay", () => {
    let width: number;
    let height: number;
    let time: number;
    let frameId: number;
    let reducedMotion: boolean;
    let mediaQuery: MediaQueryList;
    let resize: () => void;
    const frames = new Map<number, FrameRequestCallback>();
    const observe = vi.fn<ResizeObserver["observe"]>();
    const disconnect = vi.fn<ResizeObserver["disconnect"]>();
    const cancelFrame = vi.fn<typeof cancelAnimationFrame>((id) => {
        frames.delete(id);
    });

    beforeEach(() => {
        width = 802;
        height = 402;
        time = 0;
        frameId = 0;
        reducedMotion = false;
        frames.clear();
        observe.mockClear();
        disconnect.mockClear();
        cancelFrame.mockClear();
        vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
        vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(() => height);
        vi.spyOn(performance, "now").mockImplementation(() => time);
        mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        vi.spyOn(mediaQuery, "matches", "get").mockImplementation(() => reducedMotion);
        vi.spyOn(window, "matchMedia").mockReturnValue(mediaQuery);
        vi.stubGlobal(
            "requestAnimationFrame",
            vi.fn<typeof requestAnimationFrame>((callback) => {
                frames.set(++frameId, callback);
                return frameId;
            }),
        );
        vi.stubGlobal("cancelAnimationFrame", cancelFrame);
        vi.stubGlobal(
            "ResizeObserver",
            class implements ResizeObserver {
                constructor(callback: ResizeObserverCallback) {
                    resize = () => callback([], this);
                }
                observe = observe;
                unobserve = vi.fn<ResizeObserver["unobserve"]>();
                disconnect = disconnect;
            },
        );
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    function advanceFrames(count: number) {
        act(() => {
            for (let i = 0; i < count; i++) {
                time += 1000 / 60;
                const callbacks = Array.from(frames.values());
                frames.clear();
                callbacks.forEach((callback) => callback(time));
            }
        });
    }

    function rect(layer: string) {
        const element = screen
            .getByTestId("gd-copilot-composing-overlay")
            .querySelector<SVGRectElement>(`.gd-copilot-composing-overlay__${layer} rect`);
        if (!element) {
            throw new Error(`Missing ${layer} animation layer`);
        }
        return element;
    }

    function changeMotionPreference(matches: boolean) {
        act(() => {
            reducedMotion = matches;
            mediaQuery.dispatchEvent(new Event("change"));
        });
    }

    it.each(["observer", "window"])("updates measured SVG geometry on %s resize", (source) => {
        reducedMotion = true;
        render(<DashboardAiComposingOverlay isWaiting={false} />);

        for (const layer of ["bloom", "glow", "tail", "core"]) {
            expect(rect(layer)).toHaveAttribute("x", "1");
            expect(rect(layer)).toHaveAttribute("y", "1");
            expect(rect(layer)).toHaveAttribute("width", "800");
            expect(rect(layer)).toHaveAttribute("height", "400");
        }
        expect(rect("tail").style.strokeDasharray).toBe("600 1800");
        expect(rect("tail").style.strokeDashoffset).toBe("-100");
        for (const layer of ["bloom", "glow", "core"]) {
            expect(rect(layer).style.strokeDasharray).toBe("330 2070");
            expect(rect(layer).style.strokeDashoffset).toBe("-370");
        }

        width = 402;
        height = 202;
        act(() => {
            if (source === "observer") {
                resize();
            } else {
                window.dispatchEvent(new Event("resize"));
            }
        });

        for (const layer of ["bloom", "glow", "tail", "core"]) {
            expect(rect(layer)).toHaveAttribute("width", "400");
            expect(rect(layer)).toHaveAttribute("height", "200");
        }
        expect(rect("tail").style.strokeDasharray).toBe("300 900");
        expect(rect("tail").style.strokeDashoffset).toBe("-50");
        expect(rect("core").style.strokeDasharray).toBe("165 1035");
        expect(rect("core").style.strokeDashoffset).toBe("-185");
        expect(frames.size).toBe(0);
    });

    it("waits for a nonzero measurement before starting animation", () => {
        width = 1;
        height = 0;
        render(<DashboardAiComposingOverlay isWaiting={false} />);

        expect(rect("tail")).toHaveAttribute("width", "0");
        expect(rect("tail")).toHaveAttribute("height", "0");
        expect(requestAnimationFrame).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);

        width = 802;
        height = 402;
        act(() => resize());

        expect(rect("tail")).toHaveAttribute("width", "800");
        expect(rect("tail")).toHaveAttribute("height", "400");
        expect(rect("tail").style.strokeDasharray).toBe("600 1800");
        expect(frames.size).toBe(1);
        const offset = rect("tail").style.strokeDashoffset;
        advanceFrames(1);
        expect(rect("tail").style.strokeDashoffset).not.toBe(offset);
    });

    it.each([false, true])("renders a static beam with reduced motion, waiting: %s", (isWaiting) => {
        reducedMotion = true;
        render(<DashboardAiComposingOverlay isWaiting={isWaiting} />);

        expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
        expect(rect("tail").style.strokeDasharray).toBe(isWaiting ? "120 2280" : "600 1800");
        expect(rect("tail").style.strokeDashoffset).toBe(isWaiting ? "-340" : "-100");
        expect(frames.size).toBe(0);
        advanceFrames(60);
        expect(rect("tail").style.strokeDashoffset).toBe(isWaiting ? "-340" : "-100");
        expect(requestAnimationFrame).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
    });

    it("cancels animation when reduced motion is enabled and resumes when disabled", () => {
        render(<DashboardAiComposingOverlay isWaiting={false} />);
        const initialOffset = rect("tail").style.strokeDashoffset;
        advanceFrames(60);
        expect(rect("tail").style.strokeDashoffset).not.toBe(initialOffset);
        expect(frames.size).toBe(1);
        const pendingFrame = Array.from(frames.keys())[0];

        changeMotionPreference(true);

        expect(cancelFrame).toHaveBeenCalledWith(pendingFrame);
        expect(rect("tail").style.strokeDasharray).toBe("600 1800");
        expect(rect("tail").style.strokeDashoffset).toBe("-100");
        expect(frames.size).toBe(0);
        advanceFrames(60);
        expect(rect("tail").style.strokeDashoffset).toBe("-100");

        changeMotionPreference(false);

        expect(frames.size).toBe(1);
        advanceFrames(60);
        expect(rect("tail").style.strokeDashoffset).not.toBe("-100");
        expect(frames.size).toBe(1);
    });

    it("settles at the top while waiting, follows resize, and resumes without resetting the beam", () => {
        const { rerender } = render(<DashboardAiComposingOverlay isWaiting={false} />);
        advanceFrames(30);
        const runningOffset = rect("tail").style.strokeDashoffset;

        rerender(<DashboardAiComposingOverlay isWaiting />);

        expect(rect("tail").style.strokeDashoffset).toBe(runningOffset);
        advanceFrames(900);
        expect(rect("tail").style.strokeDasharray).toBe("120 2280");
        expect(rect("tail").style.strokeDashoffset).toBe("-340");
        expect(rect("core").style.strokeDasharray).toBe("66 2334");
        expect(rect("core").style.strokeDashoffset).toBe("-367");
        expect(frames.size).toBe(0);

        width = 1002;
        act(() => resize());
        expect(frames.size).toBe(1);
        advanceFrames(600);
        expect(rect("tail").style.strokeDasharray).toBe("120 2680");
        expect(rect("tail").style.strokeDashoffset).toBe("-440");
        expect(frames.size).toBe(0);

        rerender(<DashboardAiComposingOverlay isWaiting={false} />);

        expect(rect("tail").style.strokeDasharray).toBe("120 2680");
        expect(rect("tail").style.strokeDashoffset).toBe("-440");
        expect(frames.size).toBe(1);
        advanceFrames(60);
        expect(Number.parseFloat(rect("tail").style.strokeDasharray)).toBeGreaterThan(120);
        expect(rect("tail").style.strokeDashoffset).not.toBe("-440");
        advanceFrames(600);
        expect(Number.parseFloat(rect("tail").style.strokeDasharray)).toBeCloseTo(600, 1);
        expect(frames.size).toBe(1);
    });

    it("cancels the pending frame and detaches observers and listeners on unmount", () => {
        const addWindowListener = vi.spyOn(window, "addEventListener");
        const removeWindowListener = vi.spyOn(window, "removeEventListener");
        const addMediaListener = vi.spyOn(mediaQuery, "addEventListener");
        const removeMediaListener = vi.spyOn(mediaQuery, "removeEventListener");
        const { unmount } = render(<DashboardAiComposingOverlay isWaiting={false} />);
        const resizeListener = addWindowListener.mock.calls.find(([type]) => type === "resize")?.[1];
        const motionListener = addMediaListener.mock.calls.find(([type]) => type === "change")?.[1];
        const pendingFrame = Array.from(frames.keys())[0];

        expect(observe).toHaveBeenCalledWith(screen.getByTestId("gd-copilot-composing-overlay"));
        expect(resizeListener).toEqual(expect.any(Function));
        expect(motionListener).toEqual(expect.any(Function));
        expect(frames.size).toBe(1);

        unmount();

        expect(cancelFrame).toHaveBeenCalledWith(pendingFrame);
        expect(frames.size).toBe(0);
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(removeWindowListener).toHaveBeenCalledWith("resize", resizeListener);
        expect(removeMediaListener).toHaveBeenCalledWith("change", motionListener);
        window.dispatchEvent(new Event("resize"));
        changeMotionPreference(true);
        expect(frames.size).toBe(0);
        expect(cancelFrame).toHaveBeenCalledTimes(1);
    });
});
