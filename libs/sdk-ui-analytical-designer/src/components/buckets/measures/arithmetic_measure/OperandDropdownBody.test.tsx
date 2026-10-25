// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../../utils/with_intl.js";

import { type IOperandDropdownItem } from "./model/operand_dropdown_item.js";
import { type IOperandDropdownBodyProps, OperandDropdownBody } from "./OperandDropdownBody.js";

describe("OperandDropdownBody", () => {
    const measures: IOperandDropdownItem[] = [
        {
            localIdentifier: "measureId1",
            title: "Measure 1",
            sequenceNumber: 2,
        },
        {
            localIdentifier: "measureId2",
            title: "Measure 2",
            sequenceNumber: 3,
        },
    ];

    function renderComponent(props: Partial<IOperandDropdownBodyProps> = {}) {
        const defaultProps: IOperandDropdownBodyProps = {
            width: 100,
            measures,
            selectedMeasureLocalIdentifier: "measureId1",
            onSelect: vi.fn(),
            onItemMouseEnter: vi.fn(),
            onItemMouseLeave: vi.fn(),
        };
        const Wrapped = withIntl(OperandDropdownBody);
        return render(<Wrapped {...defaultProps} {...props} />);
    }

    describe("rendering SingleSelectList", () => {
        it("should pass expected params to SingleSelectList", () => {
            renderComponent();
            expect(document.querySelectorAll(".s-ad-operand-item")).toHaveLength(2);
            expect(document.querySelector(".s-measure_1")).toBeInTheDocument();
            expect(document.querySelector(".s-measure_2")).toBeInTheDocument();
            expect(document.querySelector(".s-is-selected").textContent).toEqual("M2 (Measure 1)");
        });

        it("should call onSelect when SingleSelectList called its onSelect", () => {
            const onSelect = vi.fn();
            renderComponent({ onSelect });
            fireEvent.click(document.querySelector(".s-measure_1"));

            expect(onSelect).toHaveBeenCalledWith("measureId1");
        });
    });
});
