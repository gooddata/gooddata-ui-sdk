// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiIconButton } from "./UiIconButton.js";

describe("UiIconButton", () => {
    it("is named by its label when the accessibility config does not set a label", () => {
        render(
            <UiIconButton
                icon="plus"
                label="Add attachments"
                accessibilityConfig={{ ariaExpanded: false, ariaHaspopup: "dialog" }}
            />,
        );

        const button = screen.getByRole("button", { name: "Add attachments" });
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
    });
});
