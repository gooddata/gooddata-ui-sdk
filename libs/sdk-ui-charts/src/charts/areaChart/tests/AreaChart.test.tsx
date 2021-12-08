// (C) 2007-2021 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";

import { AreaChart } from "../AreaChart";
import { IChartConfig } from "../../../interfaces";
import { IAttributeOrMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { CoreAreaChart } from "../CoreAreaChart";

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig): ReactWrapper {
    return mount(<AreaChart config={config} workspace="test" backend={dummyBackend()} measures={measures} />);
}

describe("AreaChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = renderChart([ReferenceMd.Amount]);
        expect(wrapper.find(CoreAreaChart)).toHaveLength(1);
    });

    describe("Stacking", () => {
        const config = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([ReferenceMd.Amount], config);
            expect(wrapper.find(CoreAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([ReferenceMdExt.AmountWithRatio], config);
            expect(wrapper.find(CoreAreaChart).prop("config")).toEqual({
                stacking: true,
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
