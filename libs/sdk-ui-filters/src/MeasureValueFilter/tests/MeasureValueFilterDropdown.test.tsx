// (C) 2019-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IMeasureValueFilter,
    localIdRef,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
} from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import {
    type IMeasureValueFilterDropdownProps,
    MeasureValueFilterDropdown,
} from "../MeasureValueFilterDropdown.js";
import { type IWarningMessage } from "../typings.js";
import { MeasureValueFilterFragment as MVFDropdownFragment } from "./fragments/MeasureValueFilterDropdown.js";

// we cannot use factory here, it does not allow creating empty filters
const emptyFilter: IMeasureValueFilter = {
    measureValueFilter: {
        measure: localIdRef("myMeasure"),
    },
};

const renderComponent = (props?: Partial<IMeasureValueFilterDropdownProps>) => {
    const defaultProps: IMeasureValueFilterDropdownProps = {
        onApply: () => {},
        onCancel: () => {},
        measureIdentifier: "myMeasure",
        filter: emptyFilter,
    };
    const Wrapped = withIntl(MeasureValueFilterDropdown);
    return render(<Wrapped {...defaultProps} {...props} />);
};

const component = new MVFDropdownFragment();

describe("Measure value filter dropdown", () => {
    it("should render single value input when comparison type operator is selected", () => {
        renderComponent();

        component.openOperatorDropdown().selectOperator("GREATER_THAN");

        expect(component.getRangeFromInput()).not.toBeInTheDocument();
        expect(component.getRangeToInput()).not.toBeInTheDocument();
        expect(component.getComparisonValueInput()).toBeInTheDocument();
    });

    it("should render from and to inputs when range type operator is selected", () => {
        renderComponent();

        component.openOperatorDropdown().selectOperator("BETWEEN");

        expect(component.getRangeFromInput()).toBeInTheDocument();
        expect(component.getRangeToInput()).toBeInTheDocument();
        expect(component.getComparisonValueInput()).not.toBeInTheDocument();
    });

    it("should have All operator preselected and no inputs rendered if there is no filter provided", () => {
        renderComponent();

        expect(component.getSelectedOperatorTitle()).toEqual("All");
        expect(component.getRangeFromInput()).not.toBeInTheDocument();
        expect(component.getRangeToInput()).not.toBeInTheDocument();
        expect(component.getComparisonValueInput()).not.toBeInTheDocument();
    });

    it("should have given operator preselected and values filled if filter is provided", () => {
        const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 100);
        renderComponent({ filter });

        expect(component.getSelectedOperatorTitle()).toEqual("Less than");
        expect(component.getComparisonValueInput().value).toEqual("100");
    });

    it("should have selected operator highlighted in operator dropdown", () => {
        const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 100);
        renderComponent({ filter });

        expect(component.openOperatorDropdown().getOperator("LESS_THAN")).toHaveClass("is-selected");
    });

    it("should have empty from and to inputs when filter is empty when using percentage with between operator", () => {
        renderComponent({ usePercentage: true });

        component.openOperatorDropdown().selectOperator("BETWEEN");

        expect(component.getRangeFromInput().value).toEqual("");
        expect(component.getRangeToInput().value).toEqual("");
    });

    it("should have empty from and to inputs when filter is empty when using percentage with not between operator", () => {
        renderComponent({ usePercentage: true });

        component.openOperatorDropdown().selectOperator("NOT_BETWEEN");

        expect(component.getRangeFromInput().value).toEqual("");
        expect(component.getRangeToInput().value).toEqual("");
    });

    it("should render an input suffix for comparison value input field to display percentage sign if the measure is native percent", () => {
        renderComponent({ usePercentage: true });

        component.openOperatorDropdown().selectOperator("GREATER_THAN");

        expect(component.getInputSuffixes().length).toEqual(1);
    });

    it("should render an input suffix for each range value input field to display percentage sign if the measure is native percent", () => {
        renderComponent({ usePercentage: true });

        component.openOperatorDropdown().selectOperator("BETWEEN");

        expect(component.getInputSuffixes().length).toEqual(2);
    });

    it("should render disabled operator button if enableOperatorSelection is false", () => {
        renderComponent({ enableOperatorSelection: false });

        expect(component.getOperatorDropdownButton()).toHaveClass("disabled");
    });

    it("should render preview reflecting current form state including dimensionality titles concatenation", () => {
        renderComponent({
            measureTitle: "# of Returned",
            isDimensionalityEnabled: true,
            dimensionality: [
                { identifier: localIdRef("product"), title: "Product", type: "attribute" },
                { identifier: localIdRef("brand"), title: "Brand", type: "attribute" },
            ],
        });

        component.openOperatorDropdown().selectOperator("GREATER_THAN");
        component.setComparisonValue("300");

        const preview = component.getPreview();
        expect(preview).toBeInTheDocument();
        expect(preview!.textContent).toContain("# of Returned is greater than 300 for each Product & Brand");
    });

    it("should render preview without dimensionality when all dimensionality titles are empty", () => {
        renderComponent({
            measureTitle: "# of Returned",
            isDimensionalityEnabled: true,
            dimensionality: [
                { identifier: localIdRef("product"), title: "", type: "attribute" },
                { identifier: localIdRef("brand"), title: "", type: "attribute" },
            ],
        });

        component.openOperatorDropdown().selectOperator("GREATER_THAN");
        component.setComparisonValue("300");

        const preview = component.getPreview();
        expect(preview).toBeInTheDocument();
        // Should use "filterWithoutDimensionality" template, not contain "for each undefined"
        expect(preview!.textContent).not.toContain("for each");
        expect(preview!.textContent).not.toContain("undefined");
        expect(preview!.textContent).toContain("# of Returned is greater than 300");
    });

    it("should not render preview when measureTitle is not provided", () => {
        renderComponent();

        component.openOperatorDropdown().selectOperator("GREATER_THAN");
        component.setComparisonValue("300");

        const preview = component.getPreview();
        expect(preview).not.toBeInTheDocument();
    });

    describe("warning message", () => {
        it("should not render warning message if not provided", () => {
            renderComponent();

            expect(component.getWarningMessage()).not.toBeInTheDocument();
        });

        it("should render low severity warning message if string provided", () => {
            const warningMessage = "The filter uses actual measure values, not percentage.";
            renderComponent({ warningMessage });
            const messageElement = component.getWarningMessage();

            expect(messageElement).toBeInTheDocument();
            expect(messageElement!.textContent).toEqual(warningMessage);
            expect(component.getWarningMessageBySeverity("low")).toBeInTheDocument();
        });

        it("should render low severity warning message if low severity warning message object provided", () => {
            const warningMessage: IWarningMessage = {
                severity: "low",
                text: "The filter uses actual measure values, not percentage.",
            };
            renderComponent({ warningMessage });
            const messageElement = component.getWarningMessage();

            expect(messageElement).toBeInTheDocument();
            expect(messageElement!.textContent).toEqual(warningMessage.text);
            expect(component.getWarningMessageBySeverity("low")).toBeInTheDocument();
        });

        it("should render medium severity warning message if medium severity warning message object provided", () => {
            const warningMessage: IWarningMessage = {
                severity: "medium",
                text: "The filter uses actual measure values, not percentage.",
            };
            renderComponent({ warningMessage });
            const messageElement = component.getWarningMessage();

            expect(messageElement).toBeInTheDocument();
            expect(messageElement!.textContent).toEqual(warningMessage.text);
            expect(component.getWarningMessageBySeverity("medium")).toBeInTheDocument();
        });

        it("should render high severity warning message if high severity warning message object provided", () => {
            const warningMessage: IWarningMessage = {
                severity: "high",
                text: "The filter uses actual measure values, not percentage.",
            };
            renderComponent({ warningMessage });
            const messageElement = component.getWarningMessage();

            expect(messageElement).toBeInTheDocument();
            expect(messageElement!.textContent).toEqual(warningMessage.text);
            expect(component.getWarningMessageBySeverity("high")).toBeInTheDocument();
        });
    });

    describe("tooltip", () => {
        it.each`
            operator                      | length
            ${"BETWEEN"}                  | ${1}
            ${"NOT_BETWEEN"}              | ${1}
            ${"GREATER_THAN_OR_EQUAL_TO"} | ${0}
            ${"LESS_THAN"}                | ${0}
            ${"LESS_THAN_OR_EQUAL_TO"}    | ${0}
            ${"EQUAL_TO"}                 | ${0}
            ${"NOT_EQUAL_TO"}             | ${0}
            ${"GREATER_THAN"}             | ${0}
            ${"ALL"}                      | ${0}
        `("should return $showTooltip when operator is $operator", ({ operator, length }) => {
            renderComponent();

            component.openOperatorDropdown();

            expect(component.getOperatorBubbles(operator)).toHaveLength(length);
        });
    });

    describe("onApply callback", () => {
        it("should be called with comparison type measure value filter when comparison operator is selected and value is filled", () => {
            const onApply = vi.fn();
            renderComponent({ onApply });

            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "GREATER_THAN", 100);

            component
                .openOperatorDropdown()
                .selectOperator("GREATER_THAN")
                .setComparisonValue("100")
                .clickApply();

            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should be called with range type measure value filter when range operator is selected and both values are filled", () => {
            const onApply = vi.fn();
            renderComponent({ onApply });

            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 100, 200);

            component
                .openOperatorDropdown()
                .selectOperator("BETWEEN")
                .setRangeFrom("100")
                .setRangeTo("200")
                .clickApply();

            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should be called with null value when All operator is applied", () => {
            const onApply = vi.fn();
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 100);
            renderComponent({ filter, onApply });

            component.openOperatorDropdown().selectOperator("ALL").clickApply();

            const expectedFilter = newMeasureValueFilterWithOptions(localIdRef("myMeasure"), {
                operator: "ALL",
            });
            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should be called with raw value when the measure is displayed as percentage with a comparison type measure value filter", () => {
            const onApply = vi.fn();
            renderComponent({ onApply, usePercentage: true });

            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "GREATER_THAN", 1);

            component
                .openOperatorDropdown()
                .selectOperator("GREATER_THAN")
                .setComparisonValue("100")
                .clickApply();

            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should be called with raw value when the measure is displayed as percentage with a range type measure value filter", () => {
            const onApply = vi.fn();
            renderComponent({ onApply, usePercentage: true });

            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 1, 2);

            component
                .openOperatorDropdown()
                .selectOperator("BETWEEN")
                .setRangeFrom("100")
                .setRangeTo("200")
                .clickApply();

            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should be called with null value when All operator is applied when the measure is displayed as percentage", () => {
            const onApply = vi.fn();
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 100);
            renderComponent({ filter, onApply, usePercentage: true });

            component.openOperatorDropdown().selectOperator("ALL").clickApply();

            const expectedFilter = newMeasureValueFilterWithOptions(localIdRef("myMeasure"), {
                operator: "ALL",
            });
            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should compensate for JavaScript division result precision problem for comparison filter", () => {
            const onApply = vi.fn();
            renderComponent({ onApply, usePercentage: true });

            component
                .openOperatorDropdown()
                .selectOperator("GREATER_THAN")
                .setComparisonValue("42.1")
                .clickApply();

            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "GREATER_THAN", 0.421);
            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should compensate for JavaScript division result precision problem for range filter", () => {
            const onApply = vi.fn();
            renderComponent({ onApply, usePercentage: true });

            component
                .openOperatorDropdown()
                .selectOperator("BETWEEN")
                .setRangeFrom("42.1")
                .setRangeTo("1151.545")
                .clickApply();

            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 0.421, 11.51545);
            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should compensate for JavaScript multiplication result precision problem for comparison filter", () => {
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 46.001);

            renderComponent({ filter, usePercentage: true });

            expect(component.getComparisonValueInput().value).toEqual("4,600.1");
        });

        it("should compensate for JavaScript multiplication result precision problem for range filter", () => {
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "NOT_BETWEEN", 1.11, 4.44);
            renderComponent({ filter, usePercentage: true });

            expect(component.getRangeFromInput().value).toEqual("111");
            expect(component.getRangeToInput().value).toEqual("444");
        });

        describe("apply button", () => {
            it("should enable apply button when operator is changed to all from comparison operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "EQUAL_TO", 10);
                renderComponent({ filter });

                component.openOperatorDropdown().selectOperator("ALL");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it("should enable apply button when value changes with comparison operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "EQUAL_TO", 10);
                renderComponent({ filter });

                component.setComparisonValue("1000");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it("should disable apply button when value is empty with comparison operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "EQUAL_TO", 10);
                renderComponent({ filter });

                component.setComparisonValue("");

                expect(component.isApplyButtonDisabled()).toEqual(true);
            });

            it("should disable apply button when value is equal to prop value with comparison operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "EQUAL_TO", 10);
                renderComponent({ filter });

                component.setComparisonValue("100").setComparisonValue("10");

                expect(component.isApplyButtonDisabled()).toEqual(true);
            });

            it('should enable apply button when "from" value changes', () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 10, 10);
                renderComponent({ filter });

                component.setRangeFrom("100");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it('should enable apply button when "to" value changes', () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 10, 10);
                renderComponent({ filter });

                component.setRangeTo("100");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it('should disable apply button when "to" value is empty', () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 10, 10);
                renderComponent({ filter });

                component.setRangeTo("");

                expect(component.isApplyButtonDisabled()).toEqual(true);
            });

            it('should disable apply button when "from" value is empty', () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 10, 10);
                renderComponent({ filter });

                component.setRangeFrom("");

                expect(component.isApplyButtonDisabled()).toEqual(true);
            });

            it("should disable apply button when value is equal to prop value with range operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 10, 10);
                renderComponent({ filter });

                component.setRangeTo("100").setRangeTo("10");

                expect(component.isApplyButtonDisabled()).toEqual(true);
            });

            it("should enable apply button when operator is changed but value is same with comparison operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 10);
                renderComponent({ filter });

                component.openOperatorDropdown().selectOperator("GREATER_THAN");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it("should enable apply button when operator is changed but value is same with range operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 10, 10);
                renderComponent({ filter });

                component.openOperatorDropdown().selectOperator("NOT_BETWEEN");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it("should enable apply button when operator and value is unchanged, but treat-null-values-as checkbox has been toggled", () => {
                // Use LESS_THAN 10 so zero is in the interval and checkbox is shown
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 10);

                renderComponent({ filter, displayTreatNullAsZeroOption: true });

                expect(component.isApplyButtonDisabled()).toEqual(true);

                component.clickTreatNullAsCheckbox();

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it("should disable apply button when value in percentage mode is equivalent but not equal to prop value with comparison operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "EQUAL_TO", 42.123);
                renderComponent({ filter, usePercentage: true });

                component.setComparisonValue("0").setComparisonValue("4212.3");

                expect(component.isApplyButtonDisabled()).toEqual(true);
            });

            it("should enable apply button when value in percentage mode is equal but not equivalent to prop value with comparison operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "EQUAL_TO", 42.123);
                renderComponent({ filter, usePercentage: true });

                component.setComparisonValue("4200").setComparisonValue("42.123");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it("should disable apply button when values in percentage mode are equivalent but not equal to prop values with range operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 24.123, 42.246);
                renderComponent({ filter, usePercentage: true });

                component.setRangeFrom("0").setRangeFrom("2412.3");
                component.setRangeTo("0").setRangeTo("4224.6");

                expect(component.isApplyButtonDisabled()).toEqual(true);
            });

            it("should enable apply button when values in percentage mode are equal but not equivalent to prop values with range operator", () => {
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 24.123, 42.246);
                renderComponent({ filter, usePercentage: true });

                component.setRangeFrom("2400").setRangeFrom("24.123");
                component.setRangeTo("4200").setRangeTo("42.246");

                expect(component.isApplyButtonDisabled()).toEqual(false);
            });

            it("should handle the change from comparison to range filter", () => {
                const onApply = vi.fn();
                renderComponent({ usePercentage: true, onApply });

                const expectedComparisonFilter = newMeasureValueFilter(
                    localIdRef("myMeasure"),
                    "GREATER_THAN",
                    1,
                );

                component
                    .openOperatorDropdown()
                    .selectOperator("GREATER_THAN")
                    .setComparisonValue("100")
                    .clickApply();

                expect(onApply).toBeCalledWith(expectedComparisonFilter);

                const expectedRangeFilter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", 2, 5);

                component
                    .openOperatorDropdown()
                    .selectOperator("BETWEEN")
                    .setRangeFrom("200")
                    .setRangeTo("500")
                    .clickApply();

                expect(onApply).nthCalledWith(2, expectedRangeFilter);
            });
        });
    });

    describe("press enter", () => {
        it("should be able to press enter to apply when apply button is enabled", () => {
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 10);
            const onApply = vi.fn();
            renderComponent({ filter, onApply });

            component.setComparisonValue("20").pressEnterInComparisonInput();

            expect(onApply).toHaveBeenCalledTimes(1);
        });

        it("should not be able to press enter to apply when apply button is disabled", () => {
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 10);
            const onApply = vi.fn();
            renderComponent({ filter, onApply });

            component.pressEnterInComparisonInput();

            expect(onApply).toHaveBeenCalledTimes(0);
        });
    });

    describe("onCancel feedback", () => {
        it("should be called when cancelled", () => {
            const onCancel = vi.fn();
            renderComponent({ onCancel });

            component.openOperatorDropdown().selectOperator("BETWEEN").setRangeFrom("100").clickCancel();

            expect(onCancel).toBeCalled();
        });
    });

    describe("filter with treat-null-values-as", () => {
        it("should contain 'treatNullValuesAs' property if checked", () => {
            const onApply = vi.fn();
            // Use GREATER_THAN -10 so zero is in the interval ((-10, ∞) includes zero)
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "GREATER_THAN", -10);
            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "GREATER_THAN", -10, 0);

            renderComponent({
                filter,
                onApply,
                displayTreatNullAsZeroOption: true,
            });

            component.clickTreatNullAsCheckbox().clickApply();

            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should contain 'treatNullValuesAs' equal to 0 if checked, but no 'treatNullAsZeroDefaultValue' was provided", () => {
            const onApply = vi.fn();
            // Use LESS_THAN 10 so zero is in the interval ((-∞, 10) includes zero)
            const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 10);
            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 10, 0);

            renderComponent({
                filter,
                onApply,
                displayTreatNullAsZeroOption: true,
            });

            component.clickTreatNullAsCheckbox().clickApply();

            expect(onApply).toBeCalledWith(expectedFilter);
        });

        it("should be called with filter not containing 'treatNullValuesAs' property if treat-null-values-as checkbox was unchecked", () => {
            const onApply = vi.fn();

            // Use BETWEEN -5 and 5 so zero is in the interval ([-5, 5] includes zero)
            const filterWithTreatNullValuesAsZero = newMeasureValueFilter(
                localIdRef("myMeasure"),
                "BETWEEN",
                -5,
                5,
                0,
            );
            const expectedFilter = newMeasureValueFilter(localIdRef("myMeasure"), "BETWEEN", -5, 5);

            renderComponent({
                filter: filterWithTreatNullValuesAsZero,
                onApply,
                displayTreatNullAsZeroOption: true,
            });

            component.clickTreatNullAsCheckbox().clickApply();

            expect(onApply).toBeCalledWith(expectedFilter);
        });
    });

    describe("treat-null-values-as checkbox", () => {
        it("should not be displayed by default", () => {
            renderComponent();

            expect(component.getTreatNullAsCheckbox()).not.toBeInTheDocument();
        });

        it("should not be displayed when all operator is selected", () => {
            renderComponent({ displayTreatNullAsZeroOption: true });

            expect(component.getTreatNullAsCheckbox()).not.toBeInTheDocument();
        });

        it("should be displayed when enabled by 'displayOptionTreatNullValuesAs' prop and zero is in the interval", () => {
            renderComponent({ displayTreatNullAsZeroOption: true });

            // LESS_THAN 10 creates interval (-∞, 10) which includes zero
            component.openOperatorDropdown().selectOperator("LESS_THAN");
            component.setComparisonValue("10");

            expect(component.getTreatNullAsCheckbox()).toBeInTheDocument();
        });

        it("should not be displayed when zero is not in the interval", () => {
            renderComponent({ displayTreatNullAsZeroOption: true });

            // GREATER_THAN 100 creates interval (100, ∞) which does NOT include zero
            component.openOperatorDropdown().selectOperator("GREATER_THAN");
            component.setComparisonValue("100");

            expect(component.getTreatNullAsCheckbox()).not.toBeInTheDocument();
        });

        it("should be displayed for range operator when zero is in the interval", () => {
            renderComponent({ displayTreatNullAsZeroOption: true });

            // BETWEEN -5 and 5 creates interval [-5, 5] which includes zero
            component.openOperatorDropdown().selectOperator("BETWEEN");
            component.setRangeFrom("-5");
            component.setRangeTo("5");

            expect(component.getTreatNullAsCheckbox()).toBeInTheDocument();
        });

        it("should not be displayed for range operator when zero is not in the interval", () => {
            renderComponent({ displayTreatNullAsZeroOption: true });

            // BETWEEN 10 and 20 creates interval [10, 20] which does NOT include zero
            component.openOperatorDropdown().selectOperator("BETWEEN");
            component.setRangeFrom("10");
            component.setRangeTo("20");

            expect(component.getTreatNullAsCheckbox()).not.toBeInTheDocument();
        });

        describe("checked state", () => {
            const renderComponentWithTreatNullAsZeroOption = (
                props?: Partial<IMeasureValueFilterDropdownProps>,
            ) => renderComponent({ displayTreatNullAsZeroOption: true, ...props });

            it("should be checked when passed filter is empty and 'treatNullAsZeroDefaultValue' property is truthy", () => {
                renderComponentWithTreatNullAsZeroOption({
                    treatNullAsZeroDefaultValue: true,
                    filter: emptyFilter,
                });

                // Use LESS_THAN 10 so zero is in the interval and checkbox is shown
                component.openOperatorDropdown().selectOperator("LESS_THAN");
                component.setComparisonValue("10");

                expect(component.getTreatNullAsCheckbox()!.checked).toEqual(true);
            });

            it("should not be checked when passed filter is empty and 'treatNullAsZeroDefaultValue' property is set to false", () => {
                renderComponentWithTreatNullAsZeroOption({
                    treatNullAsZeroDefaultValue: false,
                    filter: emptyFilter,
                });

                // Use LESS_THAN 10 so zero is in the interval and checkbox is shown
                component.openOperatorDropdown().selectOperator("LESS_THAN");
                component.setComparisonValue("10");

                expect(component.getTreatNullAsCheckbox()!.checked).toEqual(false);
            });

            it("should be checked when passed filter has a condition with 'treatNullValuesAsZero' property set to true", () => {
                // Use GREATER_THAN -10 so zero is in the interval ((-10, ∞) includes zero)
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "GREATER_THAN", -10, 0);
                renderComponentWithTreatNullAsZeroOption({ filter });

                expect(component.getTreatNullAsCheckbox()!.checked).toEqual(true);
            });

            it("should not be checked when passed filter has a condition without 'treatNullValuesAsZero' property even if 'treatNullAsZeroDefaultValue' property is truthy", () => {
                // Use LESS_THAN 10 so zero is in the interval ((-∞, 10) includes zero)
                const filter = newMeasureValueFilter(localIdRef("myMeasure"), "LESS_THAN", 10);
                renderComponentWithTreatNullAsZeroOption({ filter });

                expect(component.getTreatNullAsCheckbox()!.checked).toEqual(false);
            });
        });
    });
});
