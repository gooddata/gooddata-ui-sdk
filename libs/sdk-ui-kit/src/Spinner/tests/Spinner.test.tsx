// (C) 2007-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";

import { Spinner } from "../Spinner";

describe("Spinner", () => {
    it("should render dots", () => {
        const wrapper = shallow(<Spinner />);
        expect(wrapper.find(".gd-dot-spinner > div")).toHaveLength(8);
    });
});
