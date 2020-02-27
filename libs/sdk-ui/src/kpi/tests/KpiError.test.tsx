// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { KpiError } from "../KpiError";

describe("KpiError", () => {
    it("should render with correct message", () => {
        const message = "ERROR!";
        const wrapper = shallow(<KpiError message={message} />);

        expect(wrapper.find(".gdc-kpi-error").text()).toBe(message);
    });
});
