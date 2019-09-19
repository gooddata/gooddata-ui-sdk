// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CorePieChart } from "../CorePieChart";
import { dummyExecution } from "../../tests/mocks";
import { BaseChart } from "../../_base/BaseChart";

describe("PieChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CorePieChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
