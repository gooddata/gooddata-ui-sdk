// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { ScatterPlot } from "../ScatterPlot";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreScatterPlot } from "../CoreScatterPlot";
import { ReferenceLdm } from "@gooddata/reference-workspace";

describe("ScatterPlot", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <ScatterPlot workspace="foo" backend={dummyBackend()} xAxisMeasure={ReferenceLdm.Amount} />,
        );
        expect(wrapper.find(CoreScatterPlot)).toHaveLength(1);
    });
});
