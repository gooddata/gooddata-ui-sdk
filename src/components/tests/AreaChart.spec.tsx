// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { factory } from "@gooddata/gooddata-js";
import { VisualizationInput } from "@gooddata/typings";

import { AreaChart as AfmAreaChart } from "../afm/AreaChart";
import { AreaChart } from "../AreaChart";
import { M1, M1WithRatio } from "./fixtures/buckets";
import { IChartConfig } from "../../interfaces/Config";

function renderChart(
    measures: VisualizationInput.AttributeOrMeasure[],
    config?: IChartConfig,
): ShallowWrapper {
    return shallow(
        <AreaChart
            config={config}
            projectId="foo"
            measures={measures}
            sdk={factory({ domain: "example.com" })}
        />,
    );
}

describe("AreaChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = renderChart([M1]);
        expect(wrapper.find(AfmAreaChart)).toHaveLength(1);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([M1], config);
            expect(wrapper.find(AfmAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([M1WithRatio], config);
            expect(wrapper.find(AfmAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
