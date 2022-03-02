// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { ColumnChart } from "../ColumnChart";
import { IChartConfig } from "../../../interfaces";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    IAttributeOrMeasure,
    newMeasureSort,
    newTwoDimensional,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { CoreColumnChart } from "../CoreColumnChart";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig): ReactWrapper {
    return mount(
        <ColumnChart config={config} workspace="foo" backend={dummyBackend()} measures={measures} />,
    );
}

describe("ColumnChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = renderChart([]);
        expect(wrapper.find(CoreColumnChart)).toHaveLength(1);
    });

    it("should render column chart and convert the buckets to AFM", () => {
        const wrapper = mount(
            <ColumnChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                stackBy={ReferenceMd.Region}
                sortBy={[newMeasureSort(ReferenceMd.Amount, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [ReferenceMd.Region],
            [ReferenceMd.Product.Name, MeasureGroupIdentifier],
        );

        expect(wrapper.find(CoreColumnChart)).toHaveLength(1);
        expect(wrapper.find(CoreColumnChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CoreColumnChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([ReferenceMd.Amount], config);
            expect(wrapper.find(CoreColumnChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([ReferenceMdExt.AmountWithRatio], config);
            expect(wrapper.find(CoreColumnChart).prop("config")).toEqual({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
