// (C) 2026 GoodData Corporation

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormMode } from "../../../shared/Form/data.js";
import { howToCreateMetricLink } from "../../../shared/links.js";
import { mountWithIntlComponent } from "../../../tests/render.test.utils.js";
import { emptyMetric } from "../../metric/emptyMetric.js";
import { TestFormProvider } from "../TestingFormProvider.js";

import { EditMetricContentFooter } from "./EditMetricContentFooter.js";

describe("EditMetricContentFooter", () => {
    it("announces that the help link opens in a new tab", () => {
        mountWithIntlComponent(
            <TestFormProvider metric={emptyMetric} canManageProject>
                <EditMetricContentFooter onCancel={vi.fn()} onDelete={vi.fn()} />
            </TestFormProvider>,
        );

        const link = screen.getByRole("link", {
            name: "How to create metrics? (opens in a new tab)",
        });
        expect(link).toHaveAttribute("href", howToCreateMetricLink);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveTextContent("How to create metrics?");
    });

    it("renders Delete as a native button, so Enter and Space activate it like a click", () => {
        const onDelete = vi.fn();
        mountWithIntlComponent(
            <TestFormProvider metric={emptyMetric} canManageProject mode={FormMode.Edit}>
                <EditMetricContentFooter onDelete={onDelete} onCancel={vi.fn()} />
            </TestFormProvider>,
        );

        const button = screen.getByRole("button", { name: "Delete" });

        // a native button turns Enter and Space into a click, an anchor without href does not
        expect(button.tagName).toBe("BUTTON");
        expect(button).toHaveAttribute("type", "button");
        expect(button).toHaveClass("s-button-delete");

        fireEvent.click(button);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
