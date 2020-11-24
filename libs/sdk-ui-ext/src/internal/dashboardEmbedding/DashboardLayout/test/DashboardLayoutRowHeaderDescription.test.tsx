// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { DashboardLayoutRowHeaderDescription } from "../DashboardLayoutRowHeaderDescription";

describe("DashboardLayoutRowHeaderDescription", () => {
    it("should render description", () => {
        const description = "Test description";
        const wrapper = shallow(<DashboardLayoutRowHeaderDescription description={description} />);
        expect(wrapper.text()).toBe(description);
    });
});
