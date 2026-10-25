// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../../utils/with_intl.js";

import {
    ComparedMeasuresDropdownItem,
    type IComparedMeasuresDropdownItemProps,
} from "./ComparedMeasuresDropdownItem.js";

describe("ComparedMeasuresDropdownItem", () => {
    function renderComponent(props: Partial<IComparedMeasuresDropdownItemProps> = {}) {
        const defaultProps: Partial<IComparedMeasuresDropdownItemProps> = {
            source: {
                title: "test",
                localIdentifier: "test-id",
                sequenceNumber: 0,
            },
        };

        const DropdownItemWrapper = withIntl(ComparedMeasuresDropdownItem);
        return render(<DropdownItemWrapper {...defaultProps} {...props} />);
    }

    it("should render properly", () => {
        const { container } = renderComponent();

        expect(container.querySelectorAll(".gd-list-item")).toHaveLength(1);
    });

    it("should have class 'disabled' when 'selected' prop is truthy", () => {
        const { container } = renderComponent({ selected: true });

        expect(container.querySelectorAll(".is-selected")).toHaveLength(1);
    });

    describe("callbacks", () => {
        it("should call 'onSelect' with selected item", () => {
            const onSelect = vi.fn();
            const { container } = renderComponent({ onSelect });

            fireEvent.click(container.querySelector(".s-compare-measures-list-item"));
            expect(onSelect).toBeCalledWith({
                title: "test",
                localIdentifier: "test-id",
                sequenceNumber: 0,
            });
        });

        it("should call 'onOnly' with selected item", () => {
            const onOnly = vi.fn();
            const { container } = renderComponent({ onOnly });

            fireEvent.click(container.querySelector(".gd-list-item-only"));
            expect(onOnly).toBeCalledWith({
                title: "test",
                localIdentifier: "test-id",
                sequenceNumber: 0,
            });
        });
    });
});
