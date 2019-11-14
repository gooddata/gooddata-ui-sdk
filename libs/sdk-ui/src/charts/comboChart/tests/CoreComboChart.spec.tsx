// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreComboChart } from "../CoreComboChart";
import { dummyExecution } from "../../tests/fixtures";
import { BaseChart } from "../../_base/BaseChart";

describe("ComboChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreComboChart execution={dummyExecution} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
