// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import HeaderIcon from "../HeaderIcon";

describe("HeaderIcon", () => {
    it("should not render when url is not present", () => {
        const wrapper = mount(<HeaderIcon rel="apple-touch-icon" type="image/png" />);
        expect(document.querySelectorAll('link[href="./?HeaderIconTest"]').length).toEqual(0);

        wrapper.unmount();
    });

    it("should create link", () => {
        const wrapper = mount(<HeaderIcon rel="apple-touch-icon" type="image/png" url="./?HeaderIconTest" />);
        expect(document.querySelectorAll('link[href="./?HeaderIconTest"]').length).toEqual(1);

        wrapper.setProps({ type: "image/x-icon" });
        expect(document.querySelectorAll('link[type="image/x-icon"]').length).toEqual(1);

        wrapper.unmount();
    });
});
