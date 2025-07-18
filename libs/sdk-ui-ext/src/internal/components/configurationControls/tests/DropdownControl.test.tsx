// (C) 2019-2025 GoodData Corporation
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import noop from "lodash/noop.js";
import DropdownControl, { IDropdownControlProps } from "../DropdownControl.js";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { IDropdownItem } from "../../../interfaces/Dropdown.js";
import { describe, it, expect } from "vitest";

describe("DropdownControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        labelText: "properties.legend.title",
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IDropdownControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <DropdownControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render dropdown control", () => {
        createComponent();

        expect(screen.getByRole("combobox")).toHaveClass("dropdown-button");
    });

    it("should be enabled by default", () => {
        createComponent();
        expect(screen.getByRole("combobox")).not.toHaveClass("disabled");
    });

    it("should render disabled button", () => {
        createComponent({ disabled: true });
        expect(screen.getByRole("combobox")).toHaveClass("disabled");
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
            createComponent({ items });

            await userEvent.click(screen.getByRole("combobox"));
            await waitFor(() => {
                expect(screen.getByTestId(role)).toBeInTheDocument();
            });
        });
    });
});
