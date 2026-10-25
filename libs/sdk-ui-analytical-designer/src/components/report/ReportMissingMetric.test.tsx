// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IAppState } from "../../store/types.js";
import { type IVisualizationClassesState } from "../../store/visualization_classes/visualization_classes_state.js";
import { columnVisualizationClass, tableVisualizationClass } from "../../tests/constants.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { ReportMissingMetric } from "./ReportMissingMetric.js";

describe("ReportMissingMetric", () => {
    // the component reads the visualization classes from the store, so the tests seed that subtree
    function renderReportMessage(visualizationClasses: IVisualizationClassesState) {
        const seed = (state: IAppState) => withData(state, { visualizationClasses: visualizationClasses });
        const Wrapped = withRedux(withIntl(ReportMissingMetric), seed);
        return render(<Wrapped />);
    }

    it("should render title and description when table is NOT deprecated", () => {
        const { container } = renderReportMessage([tableVisualizationClass]);
        expect(container.querySelectorAll(".s-report-message-title").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-description").length).toBe(1);
        expect(container.querySelectorAll("div.s-error-missing-metric").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-type-missing_metric").length).toBe(1);
    });

    it("should render only a title when table is deprecated", () => {
        const { container } = renderReportMessage([columnVisualizationClass]);
        expect(container.querySelectorAll(".s-report-message-title").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-description").length).toBe(0);
        expect(container.querySelectorAll("div.s-error-missing-metric").length).toBe(1);
        expect(container.querySelectorAll(".s-report-message-type-missing_metric").length).toBe(1);
    });
});
