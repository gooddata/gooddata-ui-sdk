// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import DropdownControl, { IDropdownControlProps } from "../DropdownControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { IDropdownItem } from "../../../interfaces/Dropdown";

describe("DropdownControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        labelText: "properties.legend.title",
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IDropdownControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(
            <InternalIntlWrapper>
                <DropdownControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render dropdown control", () => {
        const wrapper = createComponent();

        expect(wrapper.find(Dropdown).length).toBe(1);
    });

    it("should be enabled by default", () => {
        const wrapper = createComponent();

        expect(wrapper.find("button").hasClass("disabled")).toBeFalsy();
    });

    it("should render disabled button", () => {
        const wrapper = createComponent({ disabled: true });

        expect(wrapper.find("button").hasClass("disabled")).toBeTruthy();
    });

    describe("rendered list items", () => {
        const iconItems: IDropdownItem[] = [
            {
                title: "My item",
                value: "42",
                icon: "s-icon",
            },
        ];

        const separatorItems: IDropdownItem[] = [
            {
                type: "separator",
            },
        ];

        const headerItems: IDropdownItem[] = [
            {
                type: "header",
            },
        ];

        const itemsWithInfo: IDropdownItem[] = [
            {
                title: "My item with info",
                value: "42",
                info: "This is item info.",
            },
        ];

        it.each([
            ["item with icon", iconItems, ".s-icon"],
            ["separator item", separatorItems, ".s-list-separator"],
            ["header item", headerItems, ".s-list-header"],
            ["item with info", itemsWithInfo, ".s-list-item-info"],
        ])("should render %s", (_testType, items: IDropdownItem[], expectedSelector: string) => {
            const wrapper = createComponent({ items });

            wrapper.find("button").simulate("click");
            expect(wrapper.find(expectedSelector).length).toBe(1);
        });
    });
});
