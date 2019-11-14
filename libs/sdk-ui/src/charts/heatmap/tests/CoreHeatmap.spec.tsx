// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreHeatmap } from "../CoreHeatmap";
import { dummyExecution } from "../../tests/fixtures";
import { BaseChart } from "../../_base/BaseChart";

describe("Heatmap", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreHeatmap execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
