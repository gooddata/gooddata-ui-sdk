// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { FunnelChart } from "../FunnelChart";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreFunnelChart } from "../CoreFunnelChart";

describe("FunnelChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <FunnelChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />,
        );
        expect(wrapper.find(CoreFunnelChart)).toHaveLength(1);
    });

    it("should render funnel chart and convert the buckets to AFM", () => {
        const wrapper = mount(
            <FunnelChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional([MeasureGroupIdentifier], [ReferenceMd.Product.Name]);

        expect(wrapper.find(CoreFunnelChart)).toHaveLength(1);
        expect(wrapper.find(CoreFunnelChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
