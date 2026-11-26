// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
});
