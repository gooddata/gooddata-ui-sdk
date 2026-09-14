// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../../test/render.js";
import { UiListbox } from "../UiListbox/UiListbox.js";

import { type IUiDropdownProps } from "./types.js";
import { UiDropdown } from "./UiDropdown.js";

function renderDropdown(
    accessibilityConfig: IUiDropdownProps["accessibilityConfig"],
    { nameAfterTrigger = false }: { nameAfterTrigger?: boolean } = {},
) {
    return render(
        <UiDropdown
            openOnInit
            accessibilityConfig={accessibilityConfig}
            renderButton={({ ref, ariaAttributes, toggleDropdown }) => (
                <button
                    ref={ref as never}
                    type="button"
                    aria-label="Open"
                    onClick={toggleDropdown}
                    {...ariaAttributes}
                >
                    Open
                </button>
            )}
            renderBody={({ ariaAttributes, triggerId }) => (
                <UiListbox
                    items={[{ type: "interactive", id: "a", stringTitle: "A", data: "a" }]}
                    ariaAttributes={
                        nameAfterTrigger
                            ? { ...ariaAttributes, "aria-labelledby": triggerId }
                            : ariaAttributes
                    }
                    onSelect={() => {}}
                />
            )}
        />,
    );
}

describe("UiDropdown", () => {
    // A listbox inside a listbox is not allowed; the body is the widget, the panel only holds it.
    it("leaves a widget role to the body", () => {
        renderDropdown({ triggerRole: "combobox", popupRole: "listbox" });

        const trigger = screen.getByRole("combobox", { name: "Open" });
        const listbox = screen.getByRole("listbox");
        expect(listbox).toHaveAttribute("id", trigger.getAttribute("aria-controls"));
        expect(document.querySelector(".gd-ui-kit-floating-element")).not.toHaveAttribute("role");
    });

    it("lets a body without a name of its own take the trigger's", () => {
        renderDropdown({ triggerRole: "button", popupRole: "listbox" }, { nameAfterTrigger: true });

        expect(screen.getByRole("listbox", { name: "Open" })).toBeInTheDocument();
    });

    it("makes the panel itself the dialog, named after the trigger", () => {
        renderDropdown({ triggerRole: "button", popupRole: "dialog" });

        const trigger = screen.getByRole("button", { name: "Open" });
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("gd-ui-kit-floating-element");
        expect(dialog).toHaveAttribute("aria-labelledby", trigger.parentElement!.id);
    });
});
