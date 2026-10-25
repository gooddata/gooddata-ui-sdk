// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArithmeticOperatorType } from "../../../../typings/arithmetic_measure.js";
import { withIntl } from "../../../../utils/with_intl.js";

import { type IOperatorDropdownItemProps, OperatorDropdownItem } from "./OperatorDropdownItem.js";

describe("OperatorDropdownItem", () => {
    const props: IOperatorDropdownItemProps = {
        onSelect: vi.fn(),
        selected: false,
        source: {
            type: ArithmeticOperatorType.RATIO,
            tooltip: false,
        },
    };

    function renderComponent(customProps: Partial<IOperatorDropdownItemProps> = {}) {
        const Wrapped = withIntl(OperatorDropdownItem);
        return render(<Wrapped {...props} {...customProps} />);
    }

    it("should render item that is not selected", () => {
        const { container } = renderComponent();

        expect(container.querySelectorAll(".s-gd-list-item")).toHaveLength(1);
        expect(container.querySelectorAll(".s-is-selected")).toHaveLength(0);
        expect(container.querySelectorAll(".s-adi-am-operator-selector-item-ratio")).toHaveLength(1);
    });

    it("should render item that is selected", () => {
        const { container } = renderComponent({
            selected: true,
        });

        expect(container.querySelectorAll(".s-gd-list-item")).toHaveLength(1);
        expect(container.querySelectorAll(".s-is-selected")).toHaveLength(1);
        expect(container.querySelectorAll(".s-adi-am-operator-selector-item-ratio")).toHaveLength(1);
    });

    it("should render item without tooltip", () => {
        const { container } = renderComponent();

        expect(container.querySelectorAll(".s-adi-arithmetic-measure-operand-bubble-trigger")).toHaveLength(
            0,
        );
    });

    it("should render item with tooltip", () => {
        const { container } = renderComponent({
            source: {
                type: ArithmeticOperatorType.RATIO,
                tooltip: true,
            },
        });

        expect(container.querySelectorAll(".s-adi-arithmetic-measure-operand-bubble-trigger")).toHaveLength(
            1,
        );
    });

    it("should call onSelect callback when clicked upon", () => {
        const onSelect = vi.fn();
        const { container } = renderComponent({ onSelect });

        expect(onSelect).not.toHaveBeenCalled();

        fireEvent.click(container.querySelector(".s-gd-list-item"));

        expect(onSelect).toHaveBeenCalled();
    });
});
