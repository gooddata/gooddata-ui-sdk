// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreFunnelChart } from "../CoreFunnelChart";
import { BaseChart } from "../../../_defunct/to_delete/BaseChart";
import { emptyDataSource } from "../../../components/tests/mocks";

describe("FunnelChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(<CoreFunnelChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
