// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    ArithmeticOperatorType,
    type IOperatorDropdownItem,
} from "../../../../typings/arithmetic_measure.js";
import { withIntl } from "../../../../utils/with_intl.js";

import { type IOperatorDropdownBodyProps, OperatorDropdownBody } from "./OperatorDropdownBody.js";

describe("OperatorDropdownBody", () => {
    const availableOperators: IOperatorDropdownItem[] = [
        {
            type: ArithmeticOperatorType.SUM,
        },
        {
            type: ArithmeticOperatorType.RATIO,
        },
    ];

    function renderComponent(props: Partial<IOperatorDropdownBodyProps> = {}) {
        const defaultProps: IOperatorDropdownBodyProps = {
            width: 100,
            availableOperators,
            selectedOperator: ArithmeticOperatorType.RATIO,
            onSelect: vi.fn(),
        };
        const Wrapped = withIntl(OperatorDropdownBody);
        return render(<Wrapped {...defaultProps} {...props} />);
    }

    describe("rendering SingleSelectList", () => {
        it("should pass expected params to SingleSelectList", () => {
            renderComponent();
            expect(document.querySelectorAll(".s-gd-list-item")).toHaveLength(2);
            expect(document.querySelector(".s-adi-am-operator-selector-item-sum")).toBeInTheDocument();
            expect(document.querySelector(".s-adi-am-operator-selector-item-ratio")).toBeInTheDocument();
            expect(document.querySelector(".s-is-selected").textContent).toEqual("Ratio");
        });

        it("should call onSelect when SingleSelectList called its onSelect", () => {
            const onSelect = vi.fn();
            renderComponent({ onSelect });
            fireEvent.click(document.querySelector(".s-adi-am-operator-selector-item-sum"));

            expect(onSelect).toHaveBeenCalledWith(ArithmeticOperatorType.SUM);
        });
    });
});
