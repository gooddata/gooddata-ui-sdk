// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { ColumnChart } from "../ColumnChart";
import { IChartConfig } from "../../../highcharts";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    AttributeOrMeasure,
    newMeasureSort,
    newTwoDimensional,
    attributeLocalId,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { CoreColumnChart } from "../CoreColumnChart";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";

function renderChart(measures: AttributeOrMeasure[], config?: IChartConfig): ReactWrapper {
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
                measures={[ReferenceLdm.Amount]}
                viewBy={ReferenceLdm.Product.Name}
                stackBy={ReferenceLdm.Region}
                sortBy={[newMeasureSort(ReferenceLdm.Won, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [attributeLocalId(ReferenceLdm.Region)],
            [attributeLocalId(ReferenceLdm.Product.Name), MeasureGroupIdentifier],
        );

        expect(wrapper.find(CoreColumnChart)).toHaveLength(1);
        expect(wrapper.find(CoreColumnChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CoreColumnChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([ReferenceLdm.Amount], config);
            expect(wrapper.find(CoreColumnChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([ReferenceLdmExt.AmountWithRatio], config);
            expect(wrapper.find(CoreColumnChart).prop("config")).toEqual({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
