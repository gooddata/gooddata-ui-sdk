// (C) 2026 GoodData Corporation

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
});
