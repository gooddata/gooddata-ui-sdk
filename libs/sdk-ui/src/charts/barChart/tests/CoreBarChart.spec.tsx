// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreBarChart } from "../CoreBarChart";
import { dummyExecution } from "../../tests/mocks";
import { BaseChart } from "../../_base/BaseChart";

describe("BarChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreBarChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
