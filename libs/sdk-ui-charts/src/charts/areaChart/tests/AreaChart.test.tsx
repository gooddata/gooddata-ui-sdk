// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";

import { AreaChart } from "../AreaChart";
import { IChartConfig } from "../../../highcharts";
import { AttributeOrMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { CoreAreaChart } from "../CoreAreaChart";

function renderChart(measures: AttributeOrMeasure[], config?: IChartConfig): ReactWrapper {
    return mount(<AreaChart config={config} workspace="test" backend={dummyBackend()} measures={measures} />);
}

describe("AreaChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = renderChart([ReferenceLdm.Amount]);
        expect(wrapper.find(CoreAreaChart)).toHaveLength(1);
    });

    describe("Stacking", () => {
        const config = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([ReferenceLdm.Amount], config);
            expect(wrapper.find(CoreAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([ReferenceLdmExt.AmountWithRatio], config);
            expect(wrapper.find(CoreAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
