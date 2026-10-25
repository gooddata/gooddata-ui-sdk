// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../../utils/with_intl.js";

import { type IOperandDropdownItem } from "./model/operand_dropdown_item.js";
import { type IOperandDropdownItemProps, OperandDropdownItem } from "./OperandDropdownItem.js";

describe("OperandDropdownItem", () => {
    const measure: IOperandDropdownItem = {
        localIdentifier: "measureId1",
        title: "Measure 1",
        sequenceNumber: 2,
    };

    const props: IOperandDropdownItemProps = {
        selected: false,
        source: measure,
        onSelect: vi.fn(),
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
    };

    function renderComponent(customProps: Partial<IOperandDropdownItemProps> = {}) {
        const Wrapped = withIntl(OperandDropdownItem);

        return render(<Wrapped {...props} {...customProps} />);
    }

    it("should call onMouseEnter prop with localIdentifier when 'mouseEnter' event is fired on item", () => {
        const onMouseEnter = vi.fn();
        const { container } = renderComponent({ onMouseEnter });

        expect(onMouseEnter).not.toBeCalled();

        fireEvent.mouseEnter(container.querySelectorAll(".gd-list-item")[0]);

        expect(onMouseEnter).toBeCalledWith("measureId1");
    });

    it("should call onMouseLeave prop when 'mouseLeave' event is fired on item", () => {
        const onMouseLeave = vi.fn();
        const { container } = renderComponent({ onMouseLeave });

        expect(onMouseLeave).not.toBeCalled();

        fireEvent.mouseLeave(container.querySelectorAll(".gd-list-item")[0]);

        expect(onMouseLeave).toBeCalled();
    });
});
