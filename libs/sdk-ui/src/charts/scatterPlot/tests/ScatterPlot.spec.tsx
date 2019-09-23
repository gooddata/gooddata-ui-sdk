// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { ScatterPlot } from "../ScatterPlot";
import { M1 } from "../../tests/fixtures/buckets";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreScatterPlot } from "../CoreScatterPlot";

describe("ScatterPlot", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(<ScatterPlot workspace="foo" backend={dummyBackend()} xAxisMeasure={M1} />);
        expect(wrapper.find(CoreScatterPlot)).toHaveLength(1);
    });
});
