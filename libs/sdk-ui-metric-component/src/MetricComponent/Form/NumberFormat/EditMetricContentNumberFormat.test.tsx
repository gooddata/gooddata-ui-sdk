// (C) 2007-2026 GoodData Corporation

import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mountWithIntlComponent } from "../../../tests/render.test.utils.js";
import { emptyMetric } from "../../metric/emptyMetric.js";
import { TestFormProvider } from "../TestingFormProvider.js";

import { EditMetricContentNumberFormat } from "./EditMetricContentNumberFormat.js";

describe("EditMetricContentNumberFormat", () => {
    it.each([
        ["s-format-preset-rounded", "#,##0"],
        ["s-format-preset-name-decimal__1_", "#,##0.0"],
        ["s-format-preset-name-decimal__2_", "#,##0.00"],
        ["s-format-preset-name-percent__rounded_", "#,##0%"],
        ["s-format-preset-name-percent__1_", "#,##0.0%"],
        ["s-format-preset-name-percent__2_", "#,##0.00%"],
    ])(".add(%s, %s)", async (className: string, format: string) => {
        const setFormat = vi.fn();
        mountWithIntlComponent(
            <TestFormProvider
                metric={{ ...emptyMetric, format: "" }}
                canManageProject
                onValueChange={({ format }) => setFormat(format)}
            >
                <EditMetricContentNumberFormat />
            </TestFormProvider>,
        );

        // Find button by class and trigger mouseup
        const formatButton = document.querySelector(".s-metric_number_format_button_wrapper button");
        expect(formatButton).not.toBeNull();
        if (formatButton) {
            fireEvent.mouseUp(formatButton);
        }

        // Wait for dropdown to appear and find the format option
        await waitFor(() => {
            const element = document.getElementsByClassName(className)[0] as HTMLElement;
            expect(element).toBeDefined();
            return element;
        });

        const element: HTMLElement = document.getElementsByClassName(className)[0] as HTMLElement;
        fireEvent.click(element);

        // Wait for the callback to be called
        await waitFor(() => {
            expect(setFormat).toHaveBeenLastCalledWith(format);
        });
    });

    it("disabled number format", async () => {
        const setFormat = vi.fn();
        mountWithIntlComponent(
            <TestFormProvider
                canManageProject={false}
                metric={{ ...emptyMetric, format: "#,##0.0" }}
                onValueChange={({ format }) => setFormat(format)}
            >
                <EditMetricContentNumberFormat />
            </TestFormProvider>,
        );

        const button = document.querySelector(".s-metric_number_format_button_wrapper button");

        // Check if button is disabled through aria-disabled or disabled attribute
        await waitFor(() => {
            expect(
                button?.getAttribute("aria-disabled") === "true" ||
                    button?.hasAttribute("disabled") ||
                    button?.classList.contains("gd-button-disabled") ||
                    button?.classList.contains("disabled"),
            ).toBeTruthy();
        });
    });

    it("does not render metric type field when feature flag disabled", () => {
        mountWithIntlComponent(
            <TestFormProvider metric={emptyMetric} canManageProject>
                <EditMetricContentNumberFormat />
            </TestFormProvider>,
        );

        expect(document.querySelector(".s-metric-type-field")).toBeNull();
    });

    it("renders metric type field when feature flag enabled", () => {
        mountWithIntlComponent(
            <TestFormProvider metric={emptyMetric} canManageProject>
                <EditMetricContentNumberFormat enableMetricFormatOverrides />
            </TestFormProvider>,
        );

        expect(document.querySelector(".s-metric-type-field")).not.toBeNull();
    });
});
