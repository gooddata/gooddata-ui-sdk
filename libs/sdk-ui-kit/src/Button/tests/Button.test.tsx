// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { Button } from "../Button";
import { IButtonProps } from "../typings";

function renderButton(options: Partial<IButtonProps>) {
    return mount(<Button {...options} />);
}

describe("ReactButton", () => {
    describe("click on button", () => {
        let onClick: IButtonProps["onClick"];
        beforeEach(() => {
            onClick = jest.fn();
        });

        it("should call onClick callback on click", () => {
            const wrapper = renderButton({
                type: "primary",
                disabled: false,
                onClick,
            });

            wrapper.find("button").simulate("click");
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it("should not call onClick callback on click when disabled", () => {
            const wrapper = renderButton({
                type: "primary",
                disabled: true,
                onClick,
            });

            wrapper.find("button").simulate("click");
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe("selenium class", () => {
        it("should have correct selenium class", () => {
            const wrapper = renderButton({
                type: "primary",
                disabled: false,
                className: "s-button-class",
                value: "My button",
            });
            const btn = wrapper.find("button");
            expect(btn.hasClass("s-button-class")).toEqual(true);
            expect(btn.hasClass("s-my_button")).toEqual(true);
        });
    });

    describe("render as link", () => {
        it("it should be possible to render as anchor", () => {
            const wrapper = renderButton({
                type: "link",
                tagName: "a",
                value: "My link",
            });

            expect(wrapper.find("a")).toHaveLength(1);
        });

        it("it should be rendered as HTML button by default", () => {
            const wrapper = renderButton({
                type: "link",
                value: "My link",
            });

            expect(wrapper.find("button")).toHaveLength(1);
        });
    });

    describe("render button value", () => {
        it("should render simple text value", () => {
            const wrapper = renderButton({
                value: "text value",
            });

            expect(wrapper.find(".gd-button-text")).toHaveLength(1);
        });

        it("should render icon in button", () => {
            const wrapper = renderButton({
                value: "text value",
                iconLeft: "icon-class",
            });

            expect(wrapper.find(".icon-class")).toHaveLength(1);
        });
    });
});
