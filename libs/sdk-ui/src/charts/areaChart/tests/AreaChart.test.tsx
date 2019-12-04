// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";

import { AreaChart } from "../AreaChart";
import { IChartConfig } from "../../../highcharts";
import { AttributeOrMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreAreaChart } from "../CoreAreaChart";
import { M1, M1WithRatio } from "../../tests/fixtures";

function renderChart(measures: AttributeOrMeasure[], config?: IChartConfig): ReactWrapper {
    return mount(<AreaChart config={config} workspace="test" backend={dummyBackend()} measures={measures} />);
}

describe("AreaChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = renderChart([M1]);
        expect(wrapper.find(CoreAreaChart)).toHaveLength(1);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([M1], config);
            expect(wrapper.find(CoreAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([M1WithRatio], config);
            expect(wrapper.find(CoreAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
