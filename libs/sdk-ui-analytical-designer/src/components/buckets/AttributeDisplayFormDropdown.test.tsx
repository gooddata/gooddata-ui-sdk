// (C) 2021-2026 GoodData Corporation

import { type RenderResult, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { simplifyText } from "@gooddata/util";

import { withIntl } from "../../utils/with_intl.js";

import {
    AttributeDisplayFormDropdown,
    type IAttributeDisplayFormDropdownProps,
} from "./AttributeDisplayFormDropdown.js";

class AttributeDisplayFormDropdownFragment {
    container: RenderResult;

    constructor(container: RenderResult) {
        this.container = container;
    }

    getButton() {
        return document.querySelector(".s-attribute-display-form-button");
    }

    toggle() {
        fireEvent.click(this.getButton());
    }

    getItem(title: string) {
        return document.querySelector(`.s-attribute-display-form-name-${simplifyText(title)}`);
    }
}

const renderDropdown = (props: Partial<IAttributeDisplayFormDropdownProps> = {}) => {
    const Wrapper = withIntl(AttributeDisplayFormDropdown);
    return new AttributeDisplayFormDropdownFragment(
        render(
            <Wrapper
                displayForms={[
                    {
                        id: "id1",
                        uri: "/md/id1",
                        ref: idRef("id1"),
                        type: undefined,
                        title: "First",
                    },
                    {
                        id: "id2",
                        uri: "/md/id2",
                        ref: idRef("id2"),
                        type: "GDC.link",
                        title: "Second",
                    },
                ]}
                selectedDisplayForm={idRef("id1")}
                onSelect={vi.fn()}
                {...props}
            />,
        ),
    );
};

describe("AttributeDisplayFormDropdown", () => {
    it("should render selected display form on button", () => {
        const dropdown = renderDropdown();
        expect(dropdown.getButton().textContent).toEqual("Display as: First");
    });

    it("should open and close dropdown on button click", () => {
        const dropdown = renderDropdown();
        dropdown.toggle();
        expect(dropdown.getItem("First")).toBeInTheDocument();

        dropdown.toggle();
        expect(dropdown.getItem("First")).not.toBeInTheDocument();
    });

    it("should mark selected item as selected", () => {
        const dropdown = renderDropdown();
        dropdown.toggle();
        expect(dropdown.getItem("First")).toHaveClass("is-selected");
        expect(dropdown.getItem("Second")).not.toHaveClass("is-selected");
    });

    it("should call onSelect when non selected item is clicked upon", () => {
        const onSelect = vi.fn();
        const dropdown = renderDropdown({ onSelect });
        dropdown.toggle();
        fireEvent.click(dropdown.getItem("Second"));
        expect(onSelect).toBeCalledWith(idRef("id2"));
    });

    it("should not call onSelect when selected item is clicked upon", () => {
        const onSelect = vi.fn();
        const dropdown = renderDropdown({ onSelect });
        dropdown.toggle();
        fireEvent.click(dropdown.getItem("First"));
        expect(onSelect).not.toBeCalled();
    });
});
