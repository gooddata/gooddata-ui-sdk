// (C) 2026 GoodData Corporation

import { type DragDropManager } from "dnd-core";
import { afterEach, describe, expect, it } from "vitest";

import { TouchBackend } from "./custom_mouse_backend.js";

function createBackend() {
    const manager = {
        getActions: () => ({}),
        getMonitor: () => ({}),
        getRegistry: () => ({}),
    } as unknown as DragDropManager;
    const backend = new TouchBackend(manager, { enableMouseEvents: true, enableTouchEvents: false });
    const source = document.createElement("div");
    document.body.appendChild(source);
    backend.sourceNodes["source"] = source;
    return { backend, source };
}

// jsdom lays every element out as a 0x0 rect at the origin, so a press at (0, 0)
// hits the source by coordinates wherever it lands in the DOM.
function pressOn(backend: TouchBackend, target: HTMLElement) {
    const event = new MouseEvent("mousedown", { clientX: 0, clientY: 0, bubbles: true, cancelable: true });
    Object.defineProperty(event, "target", { value: target });
    backend.handleTopMoveStart(event);
    return event;
}

describe("TouchBackend.handleTopMoveStart", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("blurs the focused element when the press lands inside a drag source", () => {
        const { backend, source } = createBackend();
        const input = document.createElement("input");
        document.body.appendChild(input);
        input.focus();

        const event = pressOn(backend, source);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(document.body);
    });

    it("keeps focus when the press lands on an element covering a drag source", () => {
        const { backend } = createBackend();
        const backdrop = document.createElement("div");
        const input = document.createElement("input");
        document.body.append(backdrop, input);
        input.focus();

        const event = pressOn(backend, backdrop);

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(input);
    });
});
