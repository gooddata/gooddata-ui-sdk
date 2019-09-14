// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreTreemap } from "../CoreTreemap";
import { BaseChart } from "../../../_defunct/to_delete/BaseChart";
import { emptyDataSource } from "../../tests/mocks";

describe("Treemap", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreTreemap dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
