// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { LineChart } from "../LineChart";
import {
    newAttributeSort,
    newTwoDimensional,
    attributeLocalId,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { CoreLineChart } from "../CoreLineChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

describe("LineChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <LineChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />,
        );
        expect(wrapper.find(CoreLineChart)).toHaveLength(1);
    });

    it("should render pie chart and convert the buckets to AFM", () => {
        const wrapper = mount(
            <LineChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                trendBy={ReferenceMd.CreatedQuarterYear}
                segmentBy={ReferenceMd.Region}
                sortBy={[newAttributeSort(ReferenceMd.CreatedQuarterYear, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [attributeLocalId(ReferenceMd.Region)],
            [attributeLocalId(ReferenceMd.CreatedQuarterYear), MeasureGroupIdentifier],
        );

        expect(wrapper.find(CoreLineChart)).toHaveLength(1);
        expect(wrapper.find(CoreLineChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CoreLineChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
