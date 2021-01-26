// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import AppleTouchIcon from "../AppleTouchIcon";

describe("AppleTouchIcon", () => {
    it("should render", () => {
        const wrapper = mount(<AppleTouchIcon url="./?AppleTouchIconTest" />);
        expect(document.querySelectorAll('link[href="./?AppleTouchIconTest"]').length).toEqual(1);
        wrapper.unmount();
    });
});
