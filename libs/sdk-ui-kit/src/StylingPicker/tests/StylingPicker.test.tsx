// (C) 2022 GoodData Corporation

import React from "react";
import { mount } from "enzyme";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { IStylingPickerProps, StylingPicker } from "../StylingPicker";
import { defaultThemeMock, customThemesMock } from "./mocks";
import * as useMediaQuery from "../../responsive/useMediaQuery";

describe("StylingPicker", () => {
    const renderComponent = (props: Partial<IStylingPickerProps>) => {
        const defaultProps = {
            title: "Styling picker",
            basicItem: defaultThemeMock,
            customItems: customThemesMock,
            emptyMessageElement: <span className="s-empty-message-test" />,
        };

        return mount(
            <IntlWrapper locale="en-US">
                <StylingPicker {...defaultProps} {...props} />
            </IntlWrapper>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render component", () => {
        const component = renderComponent({});

        expect(component.find(".s-styling-picker")).toExist();
    });

    it("should be loading", () => {
        const component = renderComponent({ isLoading: true });

        expect(component.find(".s-styling-picker-list-item")).not.toExist();
        expect(component.find(".s-styling-picker-list-loading")).toExist();
    });

    it("should render provided basic and custom items", () => {
        const component = renderComponent({});

        expect(component.find(".s-styling-picker-list-item").length).toBe(3);
        expect(component.find(".s-styling-picker-list-item-default_theme")).toExist();
    });

    it("should render empty message when no custom items are provided", () => {
        const component = renderComponent({
            customItems: [],
        });

        expect(component.find(".s-empty-message-test")).toExist();
    });

    it("should select basic item by default", () => {
        const component = renderComponent({});

        expect(component.find(".s-styling-picker-list-item-default_theme input").prop("checked")).toBe(true);
    });

    it("should select provided selected item", () => {
        const selectedItemRef = customThemesMock[0].ref;
        const component = renderComponent({ selectedItemRef });

        expect(component.find(".s-styling-picker-list-item-first_theme input").prop("checked")).toBe(true);
    });

    it("should not render footer buttons when selected item is not provided (hence, basic item is selected)", () => {
        const component = renderComponent({});

        expect(component.find(".s-styling-picker-footer-buttons")).not.toExist();
    });

    it("should not render footer buttons when no custom items are provided", () => {
        const component = renderComponent({ customItems: [] });

        expect(component.find(".s-styling-picker-footer-buttons")).not.toExist();
    });

    it("should render footer buttons when selected item is different from basic item", () => {
        const selectedItemRef = customThemesMock[0].ref;
        const component = renderComponent({ selectedItemRef });

        expect(component.find(".s-styling-picker-footer-buttons")).toExist();
    });

    it("should disable footer buttons when currently selected item is the same as provided selected item", () => {
        const selectedItemRef = customThemesMock[0].ref;
        const component = renderComponent({ selectedItemRef });

        expect(component.find(".s-cancel").hasClass("disabled")).toBe(true);
        expect(component.find(".s-apply").hasClass("disabled")).toBe(true);
    });

    it("should enable footer buttons after click on item that is not the same as provided selected item", () => {
        const selectedItemRef = customThemesMock[0].ref;
        const component = renderComponent({ selectedItemRef });

        expect(component.find(".s-cancel").hasClass("disabled")).toBe(true);
        expect(component.find(".s-apply").hasClass("disabled")).toBe(true);

        component.find(".s-styling-picker-list-item-second_theme input").simulate("click");

        expect(component.find(".s-cancel").hasClass("disabled")).toBe(false);
        expect(component.find(".s-apply").hasClass("disabled")).toBe(false);
    });

    it("should reset list selection to provided selected item when cancel button is clicked", () => {
        const selectedItemRef = customThemesMock[0].ref;
        const component = renderComponent({ selectedItemRef });

        expect(component.find(".s-styling-picker-list-item-first_theme input").prop("checked")).toBe(true);
        expect(component.find(".s-styling-picker-list-item-second_theme input").prop("checked")).toBe(false);

        component.find(".s-styling-picker-list-item-second_theme input").simulate("click");

        expect(component.find(".s-styling-picker-list-item-first_theme input").prop("checked")).toBe(false);
        expect(component.find(".s-styling-picker-list-item-second_theme input").prop("checked")).toBe(true);

        component.find(".s-cancel").simulate("click");

        expect(component.find(".s-styling-picker-list-item-first_theme input").prop("checked")).toBe(true);
        expect(component.find(".s-styling-picker-list-item-second_theme input").prop("checked")).toBe(false);
    });

    it("should call onListButtonClick when list action link is clicked", () => {
        const onListActionClick = jest.fn();
        const component = renderComponent({ onListActionClick });

        component.find(".s-styling-picker-list-header a").simulate("click");

        expect(onListActionClick).toHaveBeenCalled();
    });

    it("should call onApply when apply button is clicked", () => {
        const onApply = jest.fn();
        const component = renderComponent({ onApply });

        component.find(".s-styling-picker-list-item-first_theme input").simulate("click");
        component.find(".s-apply").simulate("click");

        expect(onApply).toHaveBeenCalled();
    });

    it("should not render list action link on mobile device", () => {
        jest.spyOn(useMediaQuery, "useMediaQuery").mockReturnValue(true);

        const component = renderComponent({});

        expect(component.find(".s-styling-picker-list-header a")).not.toExist();
    });
});
