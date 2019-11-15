// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreLineChart } from "../CoreLineChart";
import { dummyExecution } from "../../tests/fixtures";
import { BaseChart } from "../../_base/BaseChart";

describe("LineChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreLineChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
