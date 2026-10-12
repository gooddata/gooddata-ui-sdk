// (C) 2026 GoodData Corporation

import { FloatingPortal } from "@floating-ui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { describe, expect, it } from "vitest";

import { UiModalDialog } from "../UiModalDialog/UiModalDialog.js";

import { UiFocusTrap } from "./UiFocusTrap.js";
import { defaultFocusCheckFn } from "./utils.js";

describe("UiFocusTrap", () => {
    it("cycles Tab through its own content", () => {
        render(
            <UiFocusTrap>
                <button>first</button>
                <button>last</button>
            </UiFocusTrap>,
        );
        const last = screen.getByText("last");
        last.focus();

        const notPrevented = fireEvent.keyDown(last, { key: "Tab", code: "Tab" });

        expect(notPrevented).toBe(false);
        expect(screen.getByText("first")).toHaveFocus();
    });

    it("keeps focus that an element hands over to its own child", () => {
        render(
            <UiFocusTrap focusCheckFn={defaultFocusCheckFn}>
                <button>first</button>
                <div tabIndex={0} onFocus={(e) => e.currentTarget.querySelector("span")?.focus()}>
                    <span tabIndex={-1}>chart column</span>
                </div>
                <button>last</button>
            </UiFocusTrap>,
        );
        const first = screen.getByText("first");
        first.focus();

        fireEvent.keyDown(first, { key: "Tab", code: "Tab" });

        expect(screen.getByText("chart column")).toHaveFocus();
    });

    it.each([
        ["in the dialog", "in modal"],
        ["in a menu the dialog portals out of its card", "in modal menu"],
    ])("leaves Tab pressed %s to a modal dialog opened from the trapped content", (_, label) => {
        render(
            <UiFocusTrap>
                <button>trapped</button>
                <UiModalDialog isOpen onClose={() => {}}>
                    <button>in modal</button>
                    <FloatingPortal>
                        <button>in modal menu</button>
                    </FloatingPortal>
                </UiModalDialog>
            </UiFocusTrap>,
        );
        const pressed = screen.getByText(label);
        pressed.focus();

        fireEvent.keyDown(pressed, { key: "Tab", code: "Tab" });

        expect(screen.getByText("trapped")).not.toHaveFocus();
    });

    it("keeps Tab pressed in a portaled popup that is not a modal inside the trap", () => {
        render(
            <UiFocusTrap>
                <button>trapped</button>
                {createPortal(<button>in popup</button>, document.body)}
            </UiFocusTrap>,
        );
        const inPopup = screen.getByText("in popup");
        inPopup.focus();

        const notPrevented = fireEvent.keyDown(inPopup, { key: "Tab", code: "Tab" });

        expect(notPrevented).toBe(false);
        expect(screen.getByText("trapped")).toHaveFocus();
    });
});
