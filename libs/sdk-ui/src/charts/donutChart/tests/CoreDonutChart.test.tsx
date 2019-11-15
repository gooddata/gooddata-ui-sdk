// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreDonutChart } from "../CoreDonutChart";
import { dummyExecution } from "../../tests/fixtures";
import { BaseChart } from "../../_base/BaseChart";

describe("DonutChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreDonutChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
