// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreScatterPlot } from "../CoreScatterPlot";
import { dummyExecution } from "../../tests/fixtures";
import { BaseChart } from "../../_base/BaseChart";

describe("ScatterPlot", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreScatterPlot execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
