// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { PieChart } from "../PieChart";
import {
    newAttributeSort,
    MeasureGroupIdentifier,
    newTwoDimensional,
    attributeLocalId,
} from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CorePieChart } from "../CorePieChart";

describe("PieChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <PieChart workspace="foo" backend={dummyBackend()} measures={[ReferenceLdm.Amount]} />,
        );
        expect(wrapper.find(CorePieChart)).toHaveLength(1);
    });

    it("should render pie chart and convert the buckets to AFM", () => {
        const wrapper = mount(
            <PieChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceLdm.Amount]}
                viewBy={ReferenceLdm.Product.Name}
                sortBy={[newAttributeSort(ReferenceLdm.Product.Name, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [MeasureGroupIdentifier],
            [attributeLocalId(ReferenceLdm.Product.Name)],
        );

        expect(wrapper.find(CorePieChart)).toHaveLength(1);
        expect(wrapper.find(CorePieChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CorePieChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
