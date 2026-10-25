// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../../utils/with_intl.js";

import { ComparedMeasuresDropdownBody } from "./ComparedMeasuresDropdownBody.js";
import { type IComparedMeasure } from "./model/compared_measure_typing.js";

describe("ComparedMeasuresDropdownBody", () => {
    const compatibleDecoratedMeasureItems: IComparedMeasure[] = [
        {
            localIdentifier: "m1",
            title: "Sum of ad-hoc measure SUM",
            sequenceNumber: 1,
        },
        {
            localIdentifier: "m2",
            title: "measure with title",
            sequenceNumber: 2,
        },
        {
            localIdentifier: "m3",
            alias: "an alias",
            title: "measure with alias",
            sequenceNumber: 3,
        },
    ];

    function renderComponent(props = {}) {
        const DropdownBodyWrapper = withIntl(ComparedMeasuresDropdownBody);
        return render(
            <DropdownBodyWrapper
                measures={compatibleDecoratedMeasureItems}
                listItemHeight={15}
                selectedMeasures={[]}
                onApply={() => {}}
                onClose={() => {}}
                {...props}
            />,
        );
    }

    it("should render multi select list", () => {
        renderComponent();
        expect(document.querySelectorAll(".s-compare-apply-measures-list")).toHaveLength(1);
    });

    it("should pass all props (exl. callbacks) to multi select list", () => {
        renderComponent();
        expect(document.querySelectorAll(".s-compare-measures-list-item")).toHaveLength(3);
    });

    it("should render buttons", () => {
        renderComponent();
        expect(document.querySelectorAll(".s-compare-apply-measures-cancel")).toHaveLength(1);
        expect(document.querySelectorAll(".s-compare-apply-measures-apply")).toHaveLength(1);
    });

    it("should transform compatible measures for 'OverTimeComparisonTypesDropdownItem' component", () => {
        renderComponent();
        const items = document.querySelectorAll(".s-compare-measures-list-item");
        expect(items[0].querySelector(".s-compare-measures-list-item-sequence").textContent).toEqual("M1");
        expect(items[1].querySelector(".s-compare-measures-list-item-sequence").textContent).toEqual("M2");
        expect(items[2].querySelector(".s-compare-measures-list-item-sequence").textContent).toEqual("M3");
    });

    it("should properly flag items as isSelected", () => {
        renderComponent({
            selectedMeasures: ["m1"],
        });
        const items = document.querySelectorAll(".s-compare-measures-list-item");
        expect(items[0]).toHaveClass("is-selected");
        expect(items[1]).not.toHaveClass("is-selected");
    });

    describe("callbacks", () => {
        it("should select and apply selection on particular item", () => {
            const onApply = vi.fn();
            renderComponent({
                onApply,
            });

            fireEvent.click(document.querySelector(".s-sum_of_ad_hoc_measure_sum"));
            fireEvent.click(document.querySelector(".s-compare-apply-measures-apply"));

            expect(onApply).toHaveBeenCalledWith(["m1"]);
        });

        it("should select and apply selection on all items", () => {
            const onApply = vi.fn();
            renderComponent({
                onApply,
            });

            fireEvent.click(screen.getByText("Select all"));
            fireEvent.click(document.querySelector(".s-compare-apply-measures-apply"));

            expect(onApply).toHaveBeenCalledWith(["m1", "m2", "m3"]);
        });

        it("should select and apply selection on only item", () => {
            const onApply = vi.fn();
            renderComponent({
                onApply,
            });

            fireEvent.click(document.querySelector(".s-sum_of_ad_hoc_measure_sum"));
            fireEvent.click(screen.queryAllByText("Only")[1]);
            fireEvent.click(document.querySelector(".s-compare-apply-measures-apply"));

            expect(onApply).toHaveBeenCalledWith(["m2"]);
        });
    });
});
