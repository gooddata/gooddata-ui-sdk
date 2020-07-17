// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { BubbleChart } from "../BubbleChart";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreBubbleChart } from "../CoreBubbleChart";
import {
    newAttributeSort,
    newTwoDimensional,
    MeasureGroupIdentifier,
    attributeLocalId,
} from "@gooddata/sdk-model";

describe("BubbleChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <BubbleChart workspace="foo" backend={dummyBackend()} xAxisMeasure={ReferenceLdm.Amount} />,
        );
        expect(wrapper.find(CoreBubbleChart)).toHaveLength(1);
    });

    it("should render scatter plot and convert the buckets to AFM", () => {
        const wrapper = mount(
            <BubbleChart
                workspace="foo"
                backend={dummyBackend()}
                xAxisMeasure={ReferenceLdm.Amount}
                yAxisMeasure={ReferenceLdm.WinRate}
                size={ReferenceLdm.Probability}
                viewBy={ReferenceLdm.Product.Name}
                sortBy={[newAttributeSort(ReferenceLdm.Product.Name, "desc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [attributeLocalId(ReferenceLdm.Product.Name)],
            [MeasureGroupIdentifier],
        );

        expect(wrapper.find(CoreBubbleChart)).toHaveLength(1);
        expect(wrapper.find(CoreBubbleChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CoreBubbleChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
