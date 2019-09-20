// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";

import { AreaChart } from "../AreaChart";
import { M1, M1WithRatio } from "../../tests/fixtures/buckets";
import { INewChartConfig } from "../../../interfaces/Config";
import { AttributeOrMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreAreaChart } from "../CoreAreaChart";

function renderChart(measures: AttributeOrMeasure[], config?: INewChartConfig): ShallowWrapper {
    return shallow(
        <AreaChart config={config} workspace="test" backend={dummyBackend()} measures={measures} />,
    );
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
