// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreHeatmap } from "../CoreHeatmap";
import { BaseChart } from "../../../_defunct/to_delete/BaseChart";
import { emptyDataSource } from "../../tests/mocks";

describe("Heatmap", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreHeatmap dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
