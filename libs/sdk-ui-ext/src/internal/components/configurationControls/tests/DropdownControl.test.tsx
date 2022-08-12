// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import noop from "lodash/noop";
import DropdownControl, { IDropdownControlProps } from "../DropdownControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { IDropdownItem } from "../../../interfaces/Dropdown";
import { setupComponent } from "../../../tests/testHelper";

describe("DropdownControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        labelText: "properties.legend.title",
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IDropdownControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return setupComponent(
            <InternalIntlWrapper>
                <DropdownControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render dropdown control", () => {
        const { getByRole } = createComponent();

        expect(getByRole("button")).toHaveClass("dropdown-button");
    });

    it("should be enabled by default", () => {
        const { getByRole } = createComponent();
        expect(getByRole("button")).not.toHaveClass("disabled");
    });

    it("should render disabled button", () => {
        const { getByRole } = createComponent({ disabled: true });
        expect(getByRole("button")).toHaveClass("disabled");
    });

    describe("rendered list items", () => {
        const iconItems: IDropdownItem[] = [
            {
                title: "My item",
                value: "42",
                icon: "se-icon",
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
            ["item with icon", iconItems, "icon"],
            ["separator item", separatorItems, "item-separator"],
            ["header item", headerItems, "item-header"],
            ["item with info", itemsWithInfo, "item-info"],
        ])("should render %s", async (_testType, items: IDropdownItem[], role: string) => {
            const { getByRole, user } = createComponent({ items });

            await user.click(getByRole("button"));
            await waitFor(() => {
                expect(getByRole(role)).toBeInTheDocument();
            });
        });
    });
});
