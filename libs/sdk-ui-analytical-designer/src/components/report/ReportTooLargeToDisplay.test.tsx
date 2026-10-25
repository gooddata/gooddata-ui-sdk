// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    currentVisualizationTypeSelector,
    visualizationClassesSelector,
} from "../../selectors/report_too_large_to_display_selector.js";
import { type IVisualizationClassesState } from "../../store/visualization_classes/visualization_classes_state.js";
import { columnVisualizationClass, tableVisualizationClass } from "../../tests/constants.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { ReportTooLargeToDisplay } from "./ReportTooLargeToDisplay.js";

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

describe("ReportTooLarge", () => {
    const Wrapped = withIntl(withRedux(ReportTooLargeToDisplay));

    function renderReportMessage(
        visualizationClasses: IVisualizationClassesState,
        currentVisualizationType = "",
    ) {
        useSelectorMock.mockImplementation((selector: unknown) => {
            switch (selector) {
                case visualizationClassesSelector:
                    return visualizationClasses;
                case currentVisualizationTypeSelector:
                    return currentVisualizationType;
                default:
                    return undefined;
            }
        });

        return render(<Wrapped />);
    }

    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    it("should render title and description when data is too large to display and table is NOT deprecated", () => {
        const { container } = renderReportMessage([tableVisualizationClass]);
        expect(container.querySelectorAll(".s-report-message-title").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-description").length).toBe(1);
        expect(container.querySelectorAll("div.s-error-too-many-data-points").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-type-too_large_to_display").length).toBe(1);
    });

    it("should render only a title when data is too large to display and table is deprecated", () => {
        const { container } = renderReportMessage([columnVisualizationClass]);
        expect(container.querySelectorAll(".s-report-message-title").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-description").length).toBe(0);
        expect(container.querySelectorAll("div.s-error-too-many-data-points").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-type-too_large_to_display").length).toBe(1);
    });

    it("should not display switch to table when table is not supported", () => {
        const { container } = renderReportMessage([columnVisualizationClass]);
        expect(container.querySelectorAll(".s-canvas-link-switch").length).toBe(0);
    });

    it("should not display switch to table when the current visualization type is table", () => {
        const { container } = renderReportMessage(
            [tableVisualizationClass, columnVisualizationClass],
            "table",
        );
        expect(container.querySelectorAll(".s-canvas-link-switch").length).toBe(0);
    });

    it("should display switch to table when the current visualization type is not table and table is supported", () => {
        const { container } = renderReportMessage(
            [tableVisualizationClass, columnVisualizationClass],
            "column",
        );
        expect(container.querySelectorAll(".s-canvas-link-switch").length).toBe(1);
    });
});
