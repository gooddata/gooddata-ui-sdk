// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiFocusManager } from "./UiFocusManager.js";

function renderContent(enableFocusTrap: boolean) {
    return (
        <UiFocusManager enableFocusTrap={enableFocusTrap}>
            <button>first</button>
            <button>second</button>
        </UiFocusManager>
    );
}

describe("UiFocusManager", () => {
    it("moves focus on the first Tab when the focus trap gets enabled after mount", () => {
        const { rerender } = render(renderContent(false));
        rerender(renderContent(true));

        const first = screen.getByText("first");
        first.focus();

        const notPrevented = fireEvent.keyDown(first, { key: "Tab", code: "Tab" });

        expect(notPrevented).toBe(false);
        expect(screen.getByText("second")).toHaveFocus();
    });
});
