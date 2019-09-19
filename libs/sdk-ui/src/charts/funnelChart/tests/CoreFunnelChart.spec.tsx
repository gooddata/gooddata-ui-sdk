// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreFunnelChart } from "../CoreFunnelChart";
import { dummyExecution } from "../../tests/mocks";
import { BaseChart } from "../../_base/BaseChart";

describe("FunnelChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreFunnelChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
