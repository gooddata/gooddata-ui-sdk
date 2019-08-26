// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { BubbleChart } from "../BubbleChart";
import { BaseChart } from "../base/BaseChart";
import { emptyDataSource } from "../../tests/mocks";

describe("BubbleChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<BubbleChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
