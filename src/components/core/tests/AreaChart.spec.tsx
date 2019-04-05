// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { AreaChart } from "../AreaChart";
import { BaseChart } from "../base/BaseChart";
import { emptyDataSource } from "../../tests/mocks";

describe("AreaChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<AreaChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
