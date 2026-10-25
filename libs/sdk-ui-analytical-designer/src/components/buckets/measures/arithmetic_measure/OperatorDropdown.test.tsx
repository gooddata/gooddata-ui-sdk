// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MEASURES } from "../../../../constants/bucket.js";
import { buildBucketItem } from "../../../../models/bucket_item.js";
import { initialState } from "../../../../reducers/initial_state.js";
import { itemCache, measureBucketItems } from "../../../../tests/constants.test.helpers.js";
import { withRoot } from "../../../../tests/state_builder.test.helpers.js";
import { ArithmeticOperatorType } from "../../../../typings/arithmetic_measure.js";
import { withIntl } from "../../../../utils/with_intl.js";

import {
    type IOperatorDropdownProps,
    OperatorDropdownBase,
    OperatorDropdownTest,
} from "./OperatorDropdown.js";

describe("OperatorDropdown", () => {
    describe("component", () => {
        const props: IOperatorDropdownProps = {
            localIdentifier: "measureId1",
            selectedOperator: ArithmeticOperatorType.RATIO,
            onSelect: vi.fn(),
        };

        function renderComponent(customProps: Partial<IOperatorDropdownProps> = {}) {
            const Wrapped = withIntl(OperatorDropdownBase);
            return render(<Wrapped {...props} {...customProps} />);
        }

        function openDropdown() {
            fireEvent.click(document.querySelector(".s-adi-am-operator-selector-title"));
        }

        it("should render closed dropdown with all contents", () => {
            renderComponent();
            expect(document.querySelector(".s-adi-am-operator-selector-title").textContent).toEqual("Ratio");
        });

        it("should render dropdown body when dropdown is opened", () => {
            renderComponent();

            expect(document.querySelectorAll(".s-adi-am-operator-selector-list")).toHaveLength(0);

            openDropdown();

            expect(document.querySelectorAll(".s-adi-am-operator-selector-list")).toHaveLength(1);
            expect(document.querySelector(".s-is-selected").textContent).toEqual("Ratio");
        });

        it("should close dropdown when item is selected", () => {
            renderComponent();

            openDropdown();

            expect(document.querySelectorAll(".s-adi-am-operator-selector-list")).toHaveLength(1);

            fireEvent.click(document.querySelectorAll(".s-gd-list-item")[0]);

            expect(document.querySelectorAll(".s-adi-am-operator-selector-list")).toHaveLength(0);
        });

        it("should call onSelect when item is selected", () => {
            const onSelect = vi.fn();
            renderComponent({ onSelect });

            openDropdown();

            expect(onSelect).not.toBeCalled();

            fireEvent.click(document.querySelectorAll(".s-gd-list-item")[0]);

            expect(onSelect).toBeCalledWith("measureId1", "sum");
        });

        it("should render multiplication and change operation item with a help icon", () => {
            renderComponent();
            openDropdown();

            expect(
                document.querySelectorAll(".s-adi-arithmetic-measure-operand-bubble-trigger"),
            ).toHaveLength(2);
            expect(
                document.querySelectorAll(".s-adi-arithmetic-measure-operand-bubble-trigger-multiplication"),
            ).toHaveLength(1);
            expect(
                document.querySelectorAll(".s-adi-arithmetic-measure-operand-bubble-trigger-change"),
            ).toHaveLength(1);
        });
    });

    describe("selector", () => {
        const measuresBucket = {
            localIdentifier: MEASURES,
            items: measureBucketItems.map(buildBucketItem),
        };

        const state = withRoot(
            withRoot(initialState, { data: { ...initialState.data, itemCache: itemCache } }),
            {
                data: {
                    ...withRoot(initialState, { data: { ...initialState.data, itemCache: itemCache } }).data,
                    buckets: [measuresBucket],
                },
            },
        );

        it("should return null as operator on non-arithmetic measures", () => {
            const selectorResult = OperatorDropdownTest.createSelectedOperatorSelector()(state, {
                localIdentifier: "m1",
            });
            expect(selectorResult).toBeNull();
        });

        it("should return correct operator for measure specified by local identifier", () => {
            const selectorResult = OperatorDropdownTest.createSelectedOperatorSelector()(state, {
                localIdentifier: "m6",
            });
            expect(selectorResult).toEqual(ArithmeticOperatorType.RATIO);
        });
    });
});
