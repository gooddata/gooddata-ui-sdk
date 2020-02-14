// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { FunnelChart } from "../FunnelChart";
import {
    newAttributeSort,
    attributeLocalId,
    newTwoDimensional,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreFunnelChart } from "../CoreFunnelChart";

describe("FunnelChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <FunnelChart workspace="foo" backend={dummyBackend()} measures={[ReferenceLdm.Amount]} />,
        );
        expect(wrapper.find(CoreFunnelChart)).toHaveLength(1);
    });

    it("should render funnel chart and convert the buckets to AFM", () => {
        const wrapper = mount(
            <FunnelChart
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

        expect(wrapper.find(CoreFunnelChart)).toHaveLength(1);
        expect(wrapper.find(CoreFunnelChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
