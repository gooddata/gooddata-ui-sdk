// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IVisualizationClassesState } from "../../store/visualization_classes/visualization_classes_state.js";
import { columnVisualizationClass, tableVisualizationClass } from "../../tests/constants.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";

import { ReportHasNegativeValues } from "./ReportHasNegativeValues.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

describe("ReportHasNegativeValues", () => {
    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    function renderReportMessage(visualizationClasses: IVisualizationClassesState) {
        useSelectorMock.mockReturnValue(visualizationClasses);

        const Wrapped = withIntl(ReportHasNegativeValues);
        return render(<Wrapped />);
    }

    it("should render title and default description when table is NOT deprecated", () => {
        const { container } = renderReportMessage([columnVisualizationClass]);
        expect(container.querySelectorAll(".s-report-message-title").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-description").length).toBe(1);
        expect(container.querySelectorAll("div.s-error-negative-value").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-type-negative_values").length).toBe(1);
        expect(container.querySelectorAll(".s-error-negative-value-without-switch").length).toBe(0);
    });

    it("should render title and alternative description when table is deprecated", () => {
        const { container } = renderReportMessage([tableVisualizationClass]);
        expect(container.querySelectorAll(".s-report-message-title").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-description").length).toBe(1);
        expect(container.querySelectorAll("div.s-error-negative-value").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-type-negative_values").length).toBe(1);
        expect(container.querySelectorAll(".s-error-negative-value-without-switch").length).toBe(1);
    });
});
