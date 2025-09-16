// (C) 2023-2025 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import CalculationListItem from "../CalculationListItem.js";

const ITEM_SELECTED_SELECTOR = ".s-calculation-list-item.is-selected";
const ITEM_SELECTOR = ".s-calculation-list-item";

describe("CalculationListItem", () => {
    const mockOnClick = vi.fn();
    const DEFAULT_ITEM = {
        title: "default_title",
        info: "change",
        icon: "gd-icon-item-change",
        isSelected: false,
        onClick: mockOnClick,
    };

    const renderCalculationListItem = (
        props: { title?: string; info?: string; isSelected?: boolean; onClick?: () => void } = DEFAULT_ITEM,
    ) => {
        return render(
            <InternalIntlWrapper>
                <CalculationListItem {...props} />
            </InternalIntlWrapper>,
        );
    };

    it("Should render title correctly", () => {
        const { getByText } = renderCalculationListItem();
        expect(getByText(DEFAULT_ITEM.title)).toBeInTheDocument();
    });

    it("Should render icon correctly", () => {
        const { container } = renderCalculationListItem();
        expect(container.querySelector(`.${DEFAULT_ITEM.icon}`)).toBeInTheDocument();
    });

    it("Should render as un-selected item", () => {
        const { container } = renderCalculationListItem({
            ...DEFAULT_ITEM,
            isSelected: false,
        });
        expect(container.querySelector(ITEM_SELECTED_SELECTOR)).not.toBeInTheDocument();
    });

    it("Should render as selected item", () => {
        const { container } = renderCalculationListItem({
            ...DEFAULT_ITEM,
            isSelected: true,
        });
        expect(container.querySelector(ITEM_SELECTED_SELECTOR)).toBeInTheDocument();
    });

    it("Should show call on-click method while clicking on the item", () => {
        const { container } = renderCalculationListItem({
            ...DEFAULT_ITEM,
            onClick: mockOnClick,
        });
        fireEvent.click(container.querySelector(ITEM_SELECTOR));
        expect(mockOnClick).toHaveBeenCalled();
    });
});
