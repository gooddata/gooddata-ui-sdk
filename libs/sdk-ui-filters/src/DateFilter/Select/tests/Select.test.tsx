// (C) 2007-2025 GoodData Corporation
import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ISelectProps, Select } from "../Select.js";
import { ISelectMenuProps, SelectMenu } from "../SelectMenu.js";
import { ISelectItem, ISelectItemHeading, ISelectItemOption, ISelectItemSeparator } from "../types.js";
import { getSelectableItems } from "../utils.js";

describe("Select", () => {
    const optionFirst: ISelectItemOption<string> = { type: "option", value: "first", label: "First" };
    const optionLast: ISelectItemOption<string> = { type: "option", value: "last", label: "Last" };
    const itemSeparator: ISelectItemSeparator = { type: "separator" };
    const itemHeading: ISelectItemHeading = { type: "heading", label: "heading" };

    const sampleItems: Array<ISelectItem<string>> = [optionFirst, itemSeparator, itemHeading, optionLast];

    const mountSelect = (props: Partial<ISelectProps<string>> = {}) => {
        const defaultProps = {
            items: sampleItems,
        };
        return render(<Select {...defaultProps} {...props} />);
    };

    it("should render a select button with first option selected by default", () => {
        mountSelect();
        expect(screen.getByText("First")).toBeInTheDocument();
    });

    it("should render menu and items on button click and highlight selected item", () => {
        const { container } = mountSelect();

        fireEvent.click(screen.getByText("First"));

        const firstItemOccurances = screen.getAllByText("First");
        expect(screen.getByText("heading")).toBeInTheDocument();
        expect(screen.getByText("Last")).toBeInTheDocument();
        expect(firstItemOccurances).toHaveLength(2);
        expect(firstItemOccurances[1]).toHaveClass("gd-select-option-is-selected");
        expect(container.querySelectorAll(".gd-select-separator")).toHaveLength(1);
    });

    it("should call onChange when option is selected", () => {
        const onChange = vi.fn();
        mountSelect({ onChange });

        // First option is selected by default
        fireEvent.click(screen.getByText("First"));
        fireEvent.click(screen.getByText("Last"));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(optionLast);
    });

    describe("SelectMenu", () => {
        it("should set className and option className", () => {
            const props: ISelectMenuProps<string> = {
                className: "menuClassName",
                items: sampleItems,
                getItemProps: (f) => f,
                getMenuProps: (f) => f,
                highlightedIndex: 0,
                optionClassName: "optionClassName",
                selectedItem: optionLast,
            };
            const { container } = render(<SelectMenu {...props} />);
            expect(container.querySelector("div.menuClassName")).toBeInTheDocument();
            expect(screen.getByText("First")).toHaveClass("optionClassName");
            expect(screen.getByText("Last")).toHaveClass("optionClassName");
        });
    });

    describe("getSelectableOptions", () => {
        it('should filter items and return only items with type "option"', () => {
            expect(getSelectableItems(sampleItems)).toEqual([optionFirst, optionLast]);
        });
    });
});
