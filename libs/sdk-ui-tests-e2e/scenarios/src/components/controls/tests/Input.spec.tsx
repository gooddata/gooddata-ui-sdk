import React from "react";
import { shallow } from "enzyme";

import Input from "../Input";

describe("Input component", () => {
    it("should render type correctly", () => {
        const type = "number";
        const wrapper = shallow(<Input type={type} />);
        expect(wrapper.find({ type })).toHaveLength(1);
    });
});
