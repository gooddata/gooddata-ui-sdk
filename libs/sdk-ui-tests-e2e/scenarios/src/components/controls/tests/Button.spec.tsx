import React from "react";
import { shallow } from "enzyme";

import Button from "../Button";

describe("Button component", () => {
    it("should render children", () => {
        const childrenClassName = "children";
        const children = <div className={childrenClassName} />;
        const wrapper = shallow(<Button children={children} />);
        expect(wrapper.exists(`.${childrenClassName}`)).toEqual(true);
    });
});
