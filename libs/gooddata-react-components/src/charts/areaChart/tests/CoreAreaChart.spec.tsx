// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreAreaChart } from "../CoreAreaChart";
import { BaseChart } from "../../../_defunct/to_delete/BaseChart";
import { emptyDataSource } from "../../../components/tests/mocks";

describe("AreaChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreAreaChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
