// (C) 2026 GoodData Corporation

import { type EditorView } from "@codemirror/view";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutofocus } from "./useAutofocus.js";

describe("useAutofocus", () => {
    let element: HTMLDivElement;
    let height: number;
    let focus: ReturnType<typeof vi.fn>;
    let editor: EditorView;

    beforeEach(() => {
        vi.useFakeTimers();

        // hidden until "shown", like an editor in a dialog whose overlay isn't aligned yet
        height = 0;
        element = document.createElement("div");
        Object.defineProperty(element, "offsetHeight", { configurable: true, get: () => height });
        document.body.appendChild(element);

        focus = vi.fn();
        editor = { focus } as unknown as EditorView;
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    function addButton(): HTMLButtonElement {
        const button = document.createElement("button");
        document.body.appendChild(button);
        return button;
    }

    it("focuses the editor once it is visible", () => {
        renderHook(() => useAutofocus(element, editor, true));

        vi.advanceTimersByTime(100);
        expect(focus).not.toHaveBeenCalled();

        height = 100;
        vi.advanceTimersByTime(100);
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it("keeps waiting while the control that opened the editor still has the focus", () => {
        addButton().focus();
        renderHook(() => useAutofocus(element, editor, true));

        height = 100;
        vi.advanceTimersByTime(100);
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it("keeps waiting when the focused control goes away and the focus falls to the page", () => {
        const opener = addButton();
        opener.focus();
        renderHook(() => useAutofocus(element, editor, true));

        opener.remove();
        height = 100;
        vi.advanceTimersByTime(100);
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it("does not take the focus from a dialog opened over the editor while it waits", () => {
        renderHook(() => useAutofocus(element, editor, true));

        // e.g. the unsaved changes dialog, which takes the focus before the editor is shown
        addButton().focus();
        height = 100;
        vi.advanceTimersByTime(1000);
        expect(focus).not.toHaveBeenCalled();
    });

    it("does nothing without autofocus", () => {
        height = 100;
        renderHook(() => useAutofocus(element, editor, false));

        vi.advanceTimersByTime(100);
        expect(focus).not.toHaveBeenCalled();
    });
});
