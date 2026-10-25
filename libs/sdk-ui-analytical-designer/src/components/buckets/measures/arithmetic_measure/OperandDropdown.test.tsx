// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MEASURES } from "../../../../constants/bucket.js";
import { buildBucketItem } from "../../../../models/bucket_item.js";
import { initialState } from "../../../../reducers/initial_state.js";
import { itemCache, measureBucketItems } from "../../../../tests/constants.test.helpers.js";
import { withRoot } from "../../../../tests/state_builder.test.helpers.js";
import { withIntl } from "../../../../utils/with_intl.js";

import { type IOperandDropdownItem } from "./model/operand_dropdown_item.js";
import { type IOperandDropdownProps, OperandDropdownBase, OperandDropdownTest } from "./OperandDropdown.js";

describe("OperandDropdown", () => {
    describe("component", () => {
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

        const props: IOperandDropdownProps = {
            operandIndex: 33,
            localIdentifier: "measureId1",
            selectedMeasure: measures[0],
            onSelect: vi.fn(),
            availableMeasures: measures,
            setHighlightedBucketItems: vi.fn(),
            resetHighlightedBucketItems: vi.fn(),
        };

        function renderComponent(customProps: Partial<IOperandDropdownProps> = {}) {
            const Wrapped = withIntl(OperandDropdownBase);
            return render(<Wrapped {...props} {...customProps} />);
        }

        function toggleDropdown() {
            fireEvent.click(document.querySelector(".s-am-operand-button"));
        }

        it("should render closed dropdown with all contents", () => {
            renderComponent();
            expect(document.querySelector(".adi-am-selector-title-name").textContent).toEqual("M2");
            expect(document.querySelector(".adi-am-selector-title-subtitle").textContent).toEqual(
                " (Measure 1)",
            );
        });

        it("should render dropdown body when dropdown is opened", () => {
            renderComponent();

            expect(document.querySelector(".adi-am-selector-list")).not.toBeInTheDocument();

            toggleDropdown();

            const items = document.querySelectorAll(".s-ad-operand-item");

            expect(items).toHaveLength(2);
            expect(items[0]).toHaveClass("s-is-selected");
            expect(items[1]).not.toHaveClass("s-is-selected");
        });

        it("should disable dropdown when no available measures provided", () => {
            renderComponent({
                availableMeasures: [],
            });
            expect(document.querySelector(".s-am-operand-button")).toHaveClass("disabled");
        });

        describe("Opening dropdown", () => {
            it("should close dropdown when item is selected", () => {
                renderComponent();

                toggleDropdown();

                expect(document.querySelector(".adi-am-selector-list")).toBeInTheDocument();

                fireEvent.click(document.querySelector(".s-measure_1"));

                expect(document.querySelector(".adi-am-selector-list")).not.toBeInTheDocument();
            });

            it("should call onSelect when item is selected", () => {
                const onSelect = vi.fn();
                renderComponent({ onSelect });

                toggleDropdown();

                expect(onSelect).not.toBeCalled();

                fireEvent.click(document.querySelector(".s-measure_1"));

                expect(onSelect).toBeCalled();
            });

            it("should call setHighlightedBucketItems prop with localIdentifier when 'mouseEnter' event is fired on item", () => {
                const setHighlightedBucketItems = vi.fn();
                renderComponent({ setHighlightedBucketItems });

                toggleDropdown();

                expect(setHighlightedBucketItems).not.toBeCalled();

                fireEvent.mouseEnter(document.querySelector(".s-measure_1"));

                expect(setHighlightedBucketItems).toBeCalledWith(["measureId1"]);
            });

            it("should call resetHighlightedBucketItems prop when 'mouseLeave' event is fired on item", () => {
                const resetHighlightedBucketItems = vi.fn();
                renderComponent({ resetHighlightedBucketItems });

                toggleDropdown();

                expect(resetHighlightedBucketItems).not.toBeCalled();

                fireEvent.mouseEnter(document.querySelector(".s-measure_1"));
                fireEvent.mouseLeave(document.querySelector(".s-measure_1"));

                expect(resetHighlightedBucketItems).toBeCalled();
            });

            it("should call resetHighlightedBucketItems prop when item is selected", () => {
                const resetHighlightedBucketItems = vi.fn();
                renderComponent({ resetHighlightedBucketItems });

                toggleDropdown();

                expect(resetHighlightedBucketItems).not.toBeCalled();
                fireEvent.click(document.querySelector(".s-measure_1"));
                expect(resetHighlightedBucketItems).toBeCalled();
            });

            it("should call resetHighlightedBucketItems when dropdown is closed", () => {
                const resetHighlightedBucketItems = vi.fn();
                renderComponent({ resetHighlightedBucketItems });
                toggleDropdown();

                fireEvent.mouseEnter(document.querySelector(".s-measure_1"));
                expect(resetHighlightedBucketItems).not.toBeCalled();
                toggleDropdown();
                expect(resetHighlightedBucketItems).toBeCalled();
            });
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

        describe("createGetAvailableMeasuresSelector", () => {
            const arithmeticMeasureLocalIdentifier = "m5";
            const availableMeasures = OperandDropdownTest.createGetAvailableMeasuresSelector()(state, {
                localIdentifier: arithmeticMeasureLocalIdentifier,
                operandIndex: 0,
            });

            it("should contain simple measure", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m1";
                    }),
                ).toEqual(true);
            });

            it("should not contain itself", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m5";
                    }),
                ).toEqual(false);
            });

            it("should not contain empty arithmetic measure", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m9";
                    }),
                ).toEqual(false);
            });

            it("should not contain incomplete arithmetic measure", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m10";
                    }),
                ).toEqual(false);
            });

            it("should not contain arithmetic measure referencing given arithmetic measure /single hop/", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m6";
                    }),
                ).toEqual(false);
            });

            it("should not contain arithmetic measure referencing given arithmetic measure /several hops/", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m7";
                    }),
                ).toEqual(false);
            });

            it("should contain arithmetic measure without any reference to given arithmetic measure", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m8";
                    }),
                ).toEqual(true);
            });

            it("should not contain derived arithmetic measure to origin arithmetic measure", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m5_previous_period";
                    }),
                ).toEqual(false);
            });

            it("should not contain derived arithmetic measure to arithmetic measure in dependencies /several hops/", () => {
                expect(
                    availableMeasures.some((measure: IOperandDropdownItem) => {
                        return measure.localIdentifier === "m7_previous_period";
                    }),
                ).toEqual(false);
            });
        });

        describe("createGetSelectedMeasureSelector", () => {
            it("should be null when operand measure is not set", () => {
                const arithmeticMeasureLocalIdentifier = "m10";
                const selectedMeasure = OperandDropdownTest.createGetSelectedMeasureSelector()(state, {
                    localIdentifier: arithmeticMeasureLocalIdentifier,
                    operandIndex: 0,
                });

                expect(selectedMeasure).toEqual(null);
            });

            it("should be null when operand measure is not among available ones", () => {
                const arithmeticMeasureLocalIdentifier = "m11";
                const selectedMeasure = OperandDropdownTest.createGetSelectedMeasureSelector()(state, {
                    localIdentifier: arithmeticMeasureLocalIdentifier,
                    operandIndex: 0,
                });

                expect(selectedMeasure).toEqual(null);
            });

            it("should be first operand measure", () => {
                const arithmeticMeasureLocalIdentifier = "m5";
                const selectedMeasure = OperandDropdownTest.createGetSelectedMeasureSelector()(state, {
                    localIdentifier: arithmeticMeasureLocalIdentifier,
                    operandIndex: 0,
                });

                expect(selectedMeasure.localIdentifier).toEqual("m1");
            });

            it("should be second operand arithmetic measure", () => {
                const arithmeticMeasureLocalIdentifier = "m7";
                const selectedMeasure = OperandDropdownTest.createGetSelectedMeasureSelector()(state, {
                    localIdentifier: arithmeticMeasureLocalIdentifier,
                    operandIndex: 1,
                });

                expect(selectedMeasure.localIdentifier).toEqual("m6");
            });
        });
    });
});
