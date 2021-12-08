// (C) 2007-2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { ScatterPlot } from "../ScatterPlot";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreScatterPlot } from "../CoreScatterPlot";
import { ReferenceMd } from "@gooddata/reference-workspace";

describe("ScatterPlot", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <ScatterPlot workspace="foo" backend={dummyBackend()} xAxisMeasure={ReferenceMd.Amount} />,
        );
        expect(wrapper.find(CoreScatterPlot)).toHaveLength(1);
    });
});
