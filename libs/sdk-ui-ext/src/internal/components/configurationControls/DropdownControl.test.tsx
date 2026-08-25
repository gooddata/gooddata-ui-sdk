// (C) 2019-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { type IDropdownItem } from "../../interfaces/Dropdown.js";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider.js";

import { DropdownControl, type IDropdownControlProps } from "./DropdownControl.js";

describe("DropdownControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        labelText: "properties.legend.title",
        properties: {},
        pushData: () => {},
    };

    function createComponent(customProps: Partial<IDropdownControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        // delay: null keeps the full event sequence but drops the real-timer waits between events
        const user = userEvent.setup({ delay: null });
        render(
            <InternalIntlWrapper>
                <DropdownControl {...props} />
            </InternalIntlWrapper>,
        );
        return { user };
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
            const { user } = createComponent({ items });

            // the click is act-wrapped, so the dropdown body is already flushed to the DOM
            await user.click(screen.getByRole("combobox"));

            expect(screen.getByTestId(role)).toBeInTheDocument();
        });
    });
});
