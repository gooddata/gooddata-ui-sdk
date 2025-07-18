// (C) 2025 GoodData Corporation

import { KeyboardEvent } from "react";
import { describe, it, expect, vi } from "vitest";
import { makeMenuKeyboardNavigation } from "../keyboardNavigation.js";

describe("makeMenuKeyboardNavigation", () => {
    // Helper function to create a keyboard event
    const createKeyboardEvent = (code: string): KeyboardEvent => {
        const event = {
            code,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        } as unknown as KeyboardEvent;
        return event;
    };

    it("should call onFocusNext for ArrowDown key", () => {
        const onFocusNext = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onFocusNext });
        const event = createKeyboardEvent("ArrowDown");

        handler(event);

        expect(onFocusNext).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onFocusPrevious for ArrowUp key", () => {
        const onFocusPrevious = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onFocusPrevious });
        const event = createKeyboardEvent("ArrowUp");

        handler(event);

        expect(onFocusPrevious).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onLeaveLevel for ArrowLeft key", () => {
        const onLeaveLevel = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onLeaveLevel });
        const event = createKeyboardEvent("ArrowLeft");

        handler(event);

        expect(onLeaveLevel).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onEnterLevel for ArrowRight key", () => {
        const onEnterLevel = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onEnterLevel });
        const event = createKeyboardEvent("ArrowRight");

        handler(event);

        expect(onEnterLevel).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onFocusFirst for Home key", () => {
        const onFocusFirst = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onFocusFirst });
        const event = createKeyboardEvent("Home");

        handler(event);

        expect(onFocusFirst).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onFocusLast for End key", () => {
        const onFocusLast = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onFocusLast });
        const event = createKeyboardEvent("End");

        handler(event);

        expect(onFocusLast).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onSelect for Enter key", () => {
        const onSelect = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onSelect });
        const event = createKeyboardEvent("Enter");

        handler(event);

        expect(onSelect).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onSelect for Space key", () => {
        const onSelect = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onSelect });
        const event = createKeyboardEvent("Space");

        handler(event);

        expect(onSelect).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onClose for Escape key", () => {
        const onClose = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onClose });
        const event = createKeyboardEvent("Escape");

        handler(event);

        expect(onClose).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should call onUnhandledKeyDown for unhandled keys", () => {
        const onUnhandledKeyDown = vi.fn();
        const handler = makeMenuKeyboardNavigation({ onUnhandledKeyDown });
        const event = createKeyboardEvent("Tab");

        handler(event);

        expect(onUnhandledKeyDown).toHaveBeenCalledWith(event);
        // For unhandled keys, preventDefault and stopPropagation should not be called
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it("should not call any handler if not provided", () => {
        const handler = makeMenuKeyboardNavigation({});
        const event = createKeyboardEvent("ArrowDown");

        // This should not throw an error
        handler(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it("should respect shouldPreventDefault=false option", () => {
        const onFocusNext = vi.fn();
        const handler = makeMenuKeyboardNavigation(
            {
                onFocusNext,
            },
            {
                shouldPreventDefault: false,
            },
        );
        const event = createKeyboardEvent("ArrowDown");

        handler(event);

        expect(onFocusNext).toHaveBeenCalledWith(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("should respect shouldStopPropagation=false option", () => {
        const onFocusNext = vi.fn();
        const handler = makeMenuKeyboardNavigation(
            {
                onFocusNext,
            },
            { shouldStopPropagation: false },
        );
        const event = createKeyboardEvent("ArrowDown");

        handler(event);

        expect(onFocusNext).toHaveBeenCalledWith(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it("should handle multiple key handlers in one instance", () => {
        const onFocusNext = vi.fn();
        const onFocusPrevious = vi.fn();
        const onSelect = vi.fn();
        const onClose = vi.fn();

        const handler = makeMenuKeyboardNavigation({
            onFocusNext,
            onFocusPrevious,
            onSelect,
            onClose,
        });

        // Test ArrowDown
        let event = createKeyboardEvent("ArrowDown");
        handler(event);
        expect(onFocusNext).toHaveBeenCalledWith(event);

        // Test ArrowUp
        event = createKeyboardEvent("ArrowUp");
        handler(event);
        expect(onFocusPrevious).toHaveBeenCalledWith(event);

        // Test Enter
        event = createKeyboardEvent("Enter");
        handler(event);
        expect(onSelect).toHaveBeenCalledWith(event);

        // Test Escape
        event = createKeyboardEvent("Escape");
        handler(event);
        expect(onClose).toHaveBeenCalledWith(event);
    });
});
