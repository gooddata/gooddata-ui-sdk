// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreBubbleChart } from "../CoreBubbleChart";
import { dummyExecution } from "../../tests/mocks";
import { BaseChart } from "../../_base/BaseChart";

describe("BubbleChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreBubbleChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
