// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { DashboardLayoutSectionHeaderDescription } from "../DashboardLayoutSectionHeaderDescription";

describe("DashboardLayoutSectionHeaderDescription", () => {
    it("should render description", () => {
        const description = "Test description";
        const wrapper = shallow(<DashboardLayoutSectionHeaderDescription description={description} />);
        expect(wrapper.text()).toBe(description);
    });
});
