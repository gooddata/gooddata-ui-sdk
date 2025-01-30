// (C) 2019-2025 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import DropdownControl, { IDropdownControlProps } from "../DropdownControl.js";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { IDropdownItem } from "../../../interfaces/Dropdown.js";
import { describe, it, expect } from "vitest";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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

        expect(screen.getByRole("button")).toHaveClass("dropdown-button");
    });

    it("should be enabled by default", () => {
        createComponent();
        expect(screen.getByRole("button")).not.toHaveClass("disabled");
    });

    it("should render disabled button", () => {
        createComponent({ disabled: true });
        expect(screen.getByRole("button")).toHaveClass("disabled");
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

            await userEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole(role, { hidden: true })).toBeInTheDocument();
            });
        });
    });
});
