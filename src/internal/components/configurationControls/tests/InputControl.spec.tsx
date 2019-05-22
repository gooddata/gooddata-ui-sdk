// (C) 2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import noop = require("lodash/noop");
import InputControl, { IInputControlProps } from "../InputControl";

describe("InputControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        properties: {},
        propertiesMeta: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IInputControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return shallow<InputControl, null>(<InputControl {...props} />, { lifecycleExperimental: true });
    }

    it("should render input control", () => {
        const wrapper = createComponent();

        expect(wrapper.find(".input-label-text").length).toBe(1);
    });

    it("should be enabled by default", () => {
        const wrapper = createComponent();

        expect(wrapper.find(".gd-input-field").props().disabled).toBeFalsy();
    });

    it("should render disabled checkbox", () => {
        const wrapper = createComponent({ disabled: true });

        expect(wrapper.find(".gd-input-field").props().disabled).toBeTruthy();
    });

    it("should render label provided by props", () => {
        const wrapper = createComponent({ labelText: "foo" });
        expect(wrapper.find(".input-label-text").text()).toEqual("foo");
    });

    it("should render input control with given value", () => {
        const wrapper = createComponent({
            value: "foo",
        });

        expect(wrapper.find(".gd-input-field").props().value).toEqual("foo");
    });

    it("should pushData when press Enter and value in state is different than in props", () => {
        const pushData = jest.fn();

        const wrapper = createComponent({
            value: "foo",
            pushData,
        });

        wrapper.setState({
            value: "bar",
        });

        wrapper.find(".gd-input-field").simulate("keypress", { key: "Enter" });
        expect(pushData).toHaveBeenCalledTimes(1);
        expect(pushData).toHaveBeenCalledWith({
            properties: { controls: { valuePath: "bar" } },
        });
    });

    it("should not call pushData when value is the same", () => {
        const pushData = jest.fn();

        const wrapper = createComponent({
            value: "4",
            pushData,
        });

        wrapper.setState({
            value: "4",
        });

        wrapper.find(".gd-input-field").simulate("blur");
        expect(pushData).toHaveBeenCalledTimes(0);
    });

    it("should pushData when focus is changed and value in state is different than in props", () => {
        const pushData = jest.fn();

        const wrapper = createComponent({
            value: "foo",
            pushData,
        });

        wrapper.setState({
            value: "bar",
        });

        wrapper.find(".gd-input-field").simulate("blur");
        expect(pushData).toHaveBeenCalledTimes(1);
    });

    it("should pushData with value", () => {
        const pushData = jest.fn();

        const wrapper = createComponent({
            value: "foo",
            pushData,
        });

        wrapper.setState({
            value: "4",
        });

        wrapper.find(".gd-input-field").simulate("blur");
        expect(pushData).toHaveBeenCalledWith({
            properties: { controls: { valuePath: "4" } },
        });
    });

    it("should remove trailing dot when type:number", () => {
        const pushData = jest.fn();

        const wrapper = createComponent({
            type: "number",
            value: "foo",
            pushData,
        });

        wrapper.setState({
            value: "4.",
        });

        wrapper.find(".gd-input-field").simulate("blur");
        expect(pushData).toHaveBeenCalledWith({
            properties: { controls: { valuePath: "4" } },
        });
    });
});
