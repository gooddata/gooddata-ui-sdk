// (C) 2019-2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDropdownHeight } from "./DropdownWrapperHook.js";

const MINIMUM_DROPDOWN_HEIGHT = 170;
const MAXIMUM_DROPDOWN_HEIGHT = 410;

function createMockButtonNode(buttonTop = 50) {
    const mockButtonNode = document.createElement("button");
    mockButtonNode.getBoundingClientRect = () => {
        return {
            bottom: 0,
            height: 30,
            left: 0,
            right: 0,
            top: buttonTop,
            width: 0,
            x: 0,
            y: 0,
            toJSON: () => null,
        };
    };
    return mockButtonNode;
}

interface IListener {
    eventType: string;
    callback: () => void;
}

const mockWindow = {
    // props and methods for simulating window listeners
    _listeners: [] as IListener[],
    _invokeListener(eventName: string) {
        this._listeners.forEach((listener) => {
            if (listener.eventType === eventName) {
                listener.callback();
            }
        });
    },
    _invokeResize(newSize: number) {
        this.innerHeight = newSize;
        this._invokeListener("resize");
    },
    _resetListeners() {
        this._listeners = [];
    },
    _listenersCount() {
        return this._listeners.length;
    },

    innerHeight: 300,
    addEventListener(event: string, func: () => void) {
        this._listeners.push({
            eventType: event,
            callback: func,
        });
    },
    removeEventListener(event: string, func: () => void) {
        const index = this._listeners.findIndex(
            (listener) => listener.eventType === event && listener.callback === func,
        );
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    },
};

// the fake clock is installed and uninstalled per test so it does not leak into other test files
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("DropdownWrapperHook", () => {
    describe("useDropdownHeight", () => {
        afterEach(() => {
            mockWindow._resetListeners();
        });

        it("should compute the dropdown height when more space is below the button", () => {
            const { result } = renderHook(() =>
                useDropdownHeight(
                    createMockButtonNode(),
                    MINIMUM_DROPDOWN_HEIGHT,
                    MAXIMUM_DROPDOWN_HEIGHT,
                    5,
                    10,
                    mockWindow,
                ),
            );
            // window height - button top - button height - offset - window padding
            // 300           - 50         - 30            - 5      - 10
            expect(result.current).toBe(205);
        });

        it("should compute the dropdown height when more space is above the button", () => {
            const { result } = renderHook(() =>
                useDropdownHeight(
                    createMockButtonNode(250),
                    MINIMUM_DROPDOWN_HEIGHT,
                    MAXIMUM_DROPDOWN_HEIGHT,
                    5,
                    10,
                    mockWindow,
                ),
            );
            // buttonTop - offset - window padding
            // 250       - 5     - 10
            expect(result.current).toBe(235);
        });

        it("should recompute dialogHeight on resize event", () => {
            const { result } = renderHook(() =>
                useDropdownHeight(
                    createMockButtonNode(),
                    MINIMUM_DROPDOWN_HEIGHT,
                    MAXIMUM_DROPDOWN_HEIGHT,
                    5,
                    10,
                    mockWindow,
                ),
            );

            vi.runAllTimers();
            act(() => mockWindow._invokeResize(500));

            expect(result.current).toBe(405);
        });

        it("should not be smaller than the minimum height", () => {
            const { result } = renderHook(() =>
                useDropdownHeight(
                    createMockButtonNode(),
                    MINIMUM_DROPDOWN_HEIGHT,
                    MAXIMUM_DROPDOWN_HEIGHT,
                    5,
                    10,
                    mockWindow,
                ),
            );

            vi.runAllTimers();
            act(() => mockWindow._invokeResize(50));

            expect(result.current).toBe(MINIMUM_DROPDOWN_HEIGHT);
        });

        it("should not be bigger than the maximum height", () => {
            const { result } = renderHook(() =>
                useDropdownHeight(
                    createMockButtonNode(),
                    MINIMUM_DROPDOWN_HEIGHT,
                    MAXIMUM_DROPDOWN_HEIGHT,
                    5,
                    10,
                    mockWindow,
                ),
            );

            vi.runAllTimers();
            act(() => mockWindow._invokeResize(2000));

            expect(result.current).toBe(MAXIMUM_DROPDOWN_HEIGHT);
        });

        it("should remove event listeners from window when unmounting", () => {
            const { unmount } = renderHook(() =>
                useDropdownHeight(
                    createMockButtonNode(),
                    MINIMUM_DROPDOWN_HEIGHT,
                    MAXIMUM_DROPDOWN_HEIGHT,
                    5,
                    10,
                    mockWindow,
                ),
            );

            expect(mockWindow._listenersCount()).toBe(2);

            unmount();

            expect(mockWindow._listenersCount()).toBe(0);
        });
    });
});
