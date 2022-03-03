// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { BarChart } from "../BarChart";
import { IChartConfig } from "../../../interfaces";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import {
    IAttributeOrMeasure,
    MeasureGroupIdentifier,
    newTwoDimensional,
    newAttributeSort,
} from "@gooddata/sdk-model";
import { CoreBarChart } from "../CoreBarChart";

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig): ReactWrapper {
    return mount(<BarChart config={config} workspace="foo" backend={dummyBackend()} measures={measures} />);
}

describe("BarChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = renderChart([]);
        expect(wrapper.find(CoreBarChart)).toHaveLength(1);
    });

    it("should render column chart and create correct stacking dimensions", () => {
        // note: this test was previously verifying that AFM is created correctly; that is pointless now as the
        //  transformation is tested elsewhere. the important thing to test is that dimensions are built as expected.
        const wrapper = mount(
            <BarChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                stackBy={ReferenceMd.Region}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const exceptedDimensions = newTwoDimensional(
            [ReferenceMd.Region],
            [ReferenceMd.Product.Name, MeasureGroupIdentifier],
        );

        expect(wrapper.find(CoreBarChart)).toHaveLength(1);
        expect(wrapper.find(CoreBarChart).prop("execution")).toBeDefined();

        const definition = wrapper.find(CoreBarChart).prop("execution").definition;

        expect(definition.dimensions).toEqual(exceptedDimensions);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([ReferenceMd.Amount], config);
            expect(wrapper.find(CoreBarChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([ReferenceMdExt.AmountWithRatio], config);
            expect(wrapper.find(CoreBarChart).prop("config")).toEqual({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
