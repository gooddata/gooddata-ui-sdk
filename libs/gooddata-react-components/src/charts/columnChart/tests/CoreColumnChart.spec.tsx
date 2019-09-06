// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreColumnChart } from "../CoreColumnChart";
import { BaseChart } from "../../../components/core/base/BaseChart";
import { emptyDataSource } from "../../../components/tests/mocks";

describe("ColumnChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreColumnChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
