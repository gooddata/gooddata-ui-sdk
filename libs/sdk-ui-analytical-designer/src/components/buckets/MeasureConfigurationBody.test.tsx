// (C) 2019-2026 GoodData Corporation

import { memo } from "react";

import { render } from "@testing-library/react";
import { afterAll, describe, expect, it, vi } from "vitest";

import { AREA_CHART_TYPE, COLUMN_CHART_TYPE, LINE_CHART_TYPE } from "../../constants/measure_chart_types.js";
import { withIntl } from "../../utils/with_intl.js";

import { type IOperandDropdownBodyProps, MeasureConfigurationBody } from "./MeasureConfigurationBody.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./OptionalStacking", () => {
    return {
        OptionalStacking: memo(function OptionalStacking() {
            return <div className="s-optional-stacking" />;
        }),
    };
});

afterAll(() => {
    // Drop this file's mocked OptionalStacking from the shared (isolate:false) registry so it does
    // not leak into sibling files that render the real one (e.g. MeasureConfiguration.test.tsx).
    vi.resetModules();
});

describe("MeasureConfigurationBody", () => {
    function renderComponent(customProps = {}) {
        const props: IOperandDropdownBodyProps = {
            isDualAxisEnabled: false,
            isSecondaryAxisCheckboxVisible: false,
            selectedChartType: LINE_CHART_TYPE,
            supportedChartTypes: [],
            isOptionalStackingSupported: false,
            onSelect: () => {},
            toggleDualAxis: () => {},
            ...customProps,
        };
        const Wrapped = withIntl(MeasureConfigurationBody);
        return render(<Wrapped {...props} />);
    }

    it("should render measure configuration body component", () => {
        renderComponent();
        expect(document.querySelector(".s-measure-configuration-body")).toBeInTheDocument();
    });

    it("should return column, line, area chart types on both measures configuaration", () => {
        renderComponent({
            supportedChartTypes: [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE],
        });

        expect(document.querySelector(".gd-vis-item-type-column")).toBeInTheDocument();
        expect(document.querySelector(".gd-vis-item-type-line")).toBeInTheDocument();
        expect(document.querySelector(".gd-vis-item-type-area")).toBeInTheDocument();
    });

    it("should primary measure render measure configuration body without secondary axis checkbox", () => {
        renderComponent({
            supportedChartTypes: [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE],
            isSecondaryAxisCheckboxVisible: false,
        });

        expect(document.querySelector(".s-show-on-secondary-axis")).not.toBeInTheDocument();
    });

    it.each([
        [COLUMN_CHART_TYPE, true],
        [AREA_CHART_TYPE, true],
    ])(
        "should render optional stacking checkbox in measure configuration body in primary measure when selected chart type is %s and stacking is %s",
        (chartType: string, isStacking: boolean) => {
            renderComponent({
                supportedChartTypes: [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE],
                selectedChartType: chartType,
                isSecondaryAxisCheckboxVisible: false,
                isOptionalStackingSupported: isStacking,
            });

            const optionalStackingCheckbox = document.querySelector(".s-optional-stacking");
            expect(optionalStackingCheckbox).toBeInTheDocument();
        },
    );

    it("should not render optional stacking checkbox in measure configuration body in primary measure when selected chart type is line and stacking is false", () => {
        renderComponent({
            supportedChartTypes: [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE],
            selectedChartType: LINE_CHART_TYPE,
            isSecondaryAxisCheckboxVisible: false,
            isOptionalStackingSupported: false,
        });

        const optionalStackingCheckbox = document.querySelector(".s-optional-stacking");
        expect(optionalStackingCheckbox).not.toBeInTheDocument();
    });

    it("should render measure configuration body in secondary measure without stacking measure", () => {
        renderComponent({
            supportedChartTypes: [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE],
            isOptionalStackingSupported: false,
        });

        expect(document.querySelector(".s-optional-stacking")).not.toBeInTheDocument();
    });

    it("should secondary measure render measure configuration body with secondary axis checkbox", () => {
        renderComponent({
            supportedChartTypes: [COLUMN_CHART_TYPE, LINE_CHART_TYPE, AREA_CHART_TYPE],
            isSecondaryAxisCheckboxVisible: true,
            isDualAxisEnabled: true,
        });

        const measureConfigurationFooter = document.querySelector(".s-measure-configuration-footer");
        const showOnSecondaryCheckbox = document.querySelector(".s-show-on-secondary-axis");

        expect(measureConfigurationFooter).toBeInTheDocument();
        expect(showOnSecondaryCheckbox).toBeInTheDocument();
    });
});
