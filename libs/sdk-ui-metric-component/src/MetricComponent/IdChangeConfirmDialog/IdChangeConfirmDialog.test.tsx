// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mountWithIntlComponent } from "../../tests/render.test.utils.js";

import { IdChangeConfirmDialog } from "./IdChangeConfirmDialog.js";

const ORIGINAL_ID = "81795f33-0b5f-4b24-a206-607c4e3c06da";

function render(conflictWith: string[] = []) {
    return mountWithIntlComponent(
        <IdChangeConfirmDialog
            mode={undefined}
            metricId={ORIGINAL_ID}
            newMetricId="new_id"
            metricIdChanged
            conflicts={{ conflictWith, usableIds: [] }}
            onClose={vi.fn()}
            onCancel={vi.fn()}
            onSubmit={vi.fn()}
        />,
    );
}

describe("IdChangeConfirmDialog", () => {
    it("describes the dialog with its warning message", () => {
        render();

        // The overlay is rendered outside the accessible tree in jsdom, so include hidden elements.
        const dialog = screen.getByRole("dialog", { hidden: true });
        const labelledBy = dialog.getAttribute("aria-labelledby");
        expect(document.getElementById(labelledBy!)).toHaveTextContent("Change metric ID?");

        const describedBy = dialog.getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();
        const description = document.getElementById(describedBy!);
        expect(description).not.toBeNull();
        expect(description!).toHaveTextContent(ORIGINAL_ID);
        expect(description!).not.toHaveTextContent("Change metric ID?");
    });

    it("keeps the decorative warning icons out of the description", () => {
        render(["other_metric"]);

        const dialog = screen.getByRole("dialog", { hidden: true });
        const description = document.getElementById(dialog.getAttribute("aria-describedby")!)!;
        const icons = description.querySelectorAll(".gd-icon-warning");
        expect(icons.length).toBeGreaterThan(0);
        icons.forEach((icon) => expect(icon).toHaveAttribute("aria-hidden", "true"));
    });

    it("does not make the close button repeat the title", () => {
        render();

        const dialog = screen.getByRole("dialog", { hidden: true });
        const closeButton = screen.getByTestId("close_dialog");
        expect(closeButton.getAttribute("aria-describedby")).toBe(dialog.getAttribute("aria-describedby"));
    });
});
