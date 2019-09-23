// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreColumnChart } from "../CoreColumnChart";
import { BaseChart } from "../../_base/BaseChart";
import { dummyExecution } from "../../tests/mocks";

describe("ColumnChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreColumnChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
