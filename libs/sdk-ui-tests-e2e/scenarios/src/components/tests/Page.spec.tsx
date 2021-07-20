import React from "react";
import { shallow } from "enzyme";

import Page from "../Page";
import Header from "../Header/Header";
import Footer from "../Footer";

describe("Page component", () => {
    it("should render Header", () => {
        const wrapper = shallow(<Page />);
        expect(wrapper.find(Header).length).toBe(1);
    });

    it("should render main children", () => {
        const childrenClassName = "children";
        const children = <div className={childrenClassName} />;
        const wrapper = shallow(<Page children={children} />);
        expect(wrapper.exists(`.${childrenClassName}`)).toEqual(true);
    });

    it("should render Footer", () => {
        const wrapper = shallow(<Page />);
        expect(wrapper.find(Footer).length).toBe(1);
    });
});
