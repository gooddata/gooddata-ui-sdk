// (C) 2025 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { EventEmitter } from "../eventEmitter.js";

describe("EventEmitter", () => {
    describe("on", () => {
        it("should register a keydown event handler", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent }>();
            const handler = vi.fn();
            const mockEvent = { key: "Enter" } as KeyboardEvent;

            emitter.on("keydown", handler);
            emitter.emit("keydown", mockEvent);

            expect(handler).toHaveBeenCalledWith(mockEvent);
        });

        it("should register a click event handler", () => {
            const emitter = new EventEmitter<{ click: MouseEvent }>();
            const handler = vi.fn();
            const mockEvent = { button: 0 } as MouseEvent;

            emitter.on("click", handler);
            emitter.emit("click", mockEvent);

            expect(handler).toHaveBeenCalledWith(mockEvent);
        });

        it("should register multiple handlers for the same event", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent }>();
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            const mockEvent = { key: "Escape" } as KeyboardEvent;

            emitter.on("keydown", handler1);
            emitter.on("keydown", handler2);

            emitter.emit("keydown", mockEvent);
            expect(handler1).toHaveBeenCalledWith(mockEvent);
            expect(handler2).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe("off", () => {
        it("should remove a specific event handler", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent }>();
            const handler = vi.fn();
            const mockEvent = { key: "Tab" } as KeyboardEvent;

            emitter.on("keydown", handler);
            emitter.off("keydown", handler);

            emitter.emit("keydown", mockEvent);
            expect(handler).not.toHaveBeenCalled();
        });

        it("should remove only the specified handler when multiple exist", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent }>();
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            const mockEvent = { key: "Space" } as KeyboardEvent;

            emitter.on("keydown", handler1);
            emitter.on("keydown", handler2);
            emitter.off("keydown", handler1);

            emitter.emit("keydown", mockEvent);
            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe("emit", () => {
        it("should call all registered handlers for an event", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent }>();
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            const handler3 = vi.fn();
            const mockEvent = { key: "ArrowDown" } as KeyboardEvent;

            emitter.on("keydown", handler1);
            emitter.on("keydown", handler2);
            emitter.on("keydown", handler3);

            emitter.emit("keydown", mockEvent);

            expect(handler1).toHaveBeenCalledWith(mockEvent);
            expect(handler2).toHaveBeenCalledWith(mockEvent);
            expect(handler3).toHaveBeenCalledWith(mockEvent);
        });

        it("should handle events with no registered handlers", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent }>();
            const mockEvent = { key: "Home" } as KeyboardEvent;
            expect(() => emitter.emit("keydown", mockEvent)).not.toThrow();
        });

        it("should handle multiple emissions", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent }>();
            const handler = vi.fn();
            const event1 = { key: "ArrowUp" } as KeyboardEvent;
            const event2 = { key: "ArrowDown" } as KeyboardEvent;

            emitter.on("keydown", handler);

            emitter.emit("keydown", event1);
            emitter.emit("keydown", event2);

            expect(handler).toHaveBeenCalledTimes(2);
            expect(handler).toHaveBeenNthCalledWith(1, event1);
            expect(handler).toHaveBeenNthCalledWith(2, event2);
        });

        it("should handle both keydown and click events", () => {
            const emitter = new EventEmitter<{ keydown: KeyboardEvent; click: MouseEvent }>();
            const keydownHandler = vi.fn();
            const clickHandler = vi.fn();
            const keydownEvent = { key: "Enter" } as KeyboardEvent;
            const clickEvent = { button: 0 } as MouseEvent;

            emitter.on("keydown", keydownHandler);
            emitter.on("click", clickHandler);

            emitter.emit("keydown", keydownEvent);
            emitter.emit("click", clickEvent);

            expect(keydownHandler).toHaveBeenCalledWith(keydownEvent);
            expect(clickHandler).toHaveBeenCalledWith(clickEvent);
        });
    });
});
