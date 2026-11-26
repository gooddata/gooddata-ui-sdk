// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { CheckboxSection } from "./CheckboxSection.js";

describe("CheckboxSection", () => {
    const Wrapped = withIntlForTest(CheckboxSection);

    it("should label each checkbox with its visible text", () => {
        const onExcludeChange = vi.fn();
        render(
            <>
                <Wrapped
                    excludeCurrentPeriod={{ value: false, onChange: onExcludeChange }}
                    emptyValuesHandling={{ mode: "include", checked: true, onChange: vi.fn() }}
                />
                <Wrapped excludeCurrentPeriod={{ value: false, onChange: vi.fn() }} />
            </>,
        );

        const excludeCheckboxes = screen.getAllByRole("checkbox", { name: "Exclude open period" });
        expect(excludeCheckboxes).toHaveLength(2);
        expect(excludeCheckboxes[0].getAttribute("aria-labelledby")).not.toEqual(
            excludeCheckboxes[1].getAttribute("aria-labelledby"),
        );
        expect(excludeCheckboxes[0]).not.toBeChecked();

        expect(screen.getAllByRole("checkbox")).toHaveLength(3);
        screen.getAllByRole("checkbox").forEach((checkbox) => {
            const labelledBy = checkbox.getAttribute("aria-labelledby");
            expect(labelledBy).toBeTruthy();
            expect(document.getElementById(labelledBy!)).toHaveClass("input-label-text");
        });
        expect(screen.getByRole("checkbox", { name: "Include empty values" })).toBeChecked();

        fireEvent.click(screen.getAllByText("Exclude open period")[0]);
        expect(onExcludeChange).toHaveBeenCalledWith(true);
    });

    it("should leave Space to the native checkbox and keep the focused node when toggled", () => {
        function Stateful() {
            const [checked, setChecked] = useState(false);
            return (
                <Wrapped
                    emptyValuesHandling={{ mode: "include", checked, onChange: setChecked }}
                    excludeCurrentPeriod={{ value: false, onChange: vi.fn() }}
                />
            );
        }
        render(<Stateful />);

        const checkbox = screen.getByRole("checkbox", { name: "Include empty values" });
        checkbox.focus();

        // The browser toggles a checkbox on Space only when keydown is not prevented.
        const notPrevented = fireEvent.keyDown(checkbox, { key: " ", code: "Space" });
        expect(notPrevented).toBe(true);
        expect(checkbox).not.toBeChecked();

        // Native activation of the checkbox on Space release.
        fireEvent.click(checkbox);
        const afterToggle = screen.getByRole("checkbox", { name: "Include empty values" });
        expect(afterToggle).toBe(checkbox);
        expect(afterToggle).toBeChecked();
        expect(document.activeElement).toBe(checkbox);

        fireEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(document.activeElement).toBe(checkbox);
    });
});
