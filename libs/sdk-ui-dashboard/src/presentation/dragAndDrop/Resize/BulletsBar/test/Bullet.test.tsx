// (C) 2019-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { Bullet, BulletProps } from "../Bullet";

const defaultProps: BulletProps = {
    isInitial: false,
    isCurrent: false,
    index: 0,
};

function createComponent(customProps: Partial<BulletProps> = {}) {
    const props = { ...defaultProps, ...customProps };
    return mount(<Bullet {...props} />);
}

describe("Bullet", () => {
    it("should render svg icon with passive style when not isInitial and not isCurrent", () => {
        const wrapper = createComponent();
        const svgIcon = wrapper.find(".passive");
        expect(svgIcon.length).toBe(1);
    });

    it("should render svg icon with initial style when isInitial", () => {
        const wrapper = createComponent({ isInitial: true });
        const svgIcon = wrapper.find(".initial");
        expect(svgIcon.length).toBe(1);
    });

    it("should render svg icon with active style when isCurrent", () => {
        const wrapper = createComponent({ isCurrent: true });
        const svgIcon = wrapper.find(".active");
        expect(svgIcon.length).toBe(1);
    });

    it("should render svg icon with active style when isCurrent and isInitial", () => {
        const wrapper = createComponent({ isCurrent: true, isInitial: true });
        const svgIcon = wrapper.find(".active");
        expect(svgIcon.length).toBe(1);
    });
});
