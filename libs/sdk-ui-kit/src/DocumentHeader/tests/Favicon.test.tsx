// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import Favicon from "../Favicon";

describe("Favicon", () => {
    it("should render", () => {
        const wrapper = mount(<Favicon url="./?FaviconTest" />);
        expect(document.querySelectorAll('link[href="./?FaviconTest"]').length).toEqual(1);
        wrapper.unmount();
    });
});
