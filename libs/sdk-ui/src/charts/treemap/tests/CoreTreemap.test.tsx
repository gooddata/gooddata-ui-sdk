// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreTreemap } from "../CoreTreemap";
import { dummyExecution } from "../../tests/fixtures";
import { BaseChart } from "../../_base/BaseChart";

describe("Treemap", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreTreemap execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
