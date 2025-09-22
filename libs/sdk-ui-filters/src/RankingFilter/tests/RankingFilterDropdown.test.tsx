// (C) 2020-2025 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { newRankingFilter } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { RankingFilterDropdownFragment } from "./fragments/RankingFilterDropdown.js";
import * as Mock from "./mocks.js";
import {
    IRankingFilterDropdownProps,
    RankingFilterDropdown,
    prepareRankingFilterState,
} from "../RankingFilterDropdown.js";

const renderComponent = (props?: Partial<IRankingFilterDropdownProps>) => {
    const defaultProps: IRankingFilterDropdownProps = {
        measureItems: Mock.measureItems,
        attributeItems: Mock.attributeItems,
        filter: Mock.defaultFilter,
        onApply: () => {},
        onCancel: () => {},
    };
    const Wrapped = withIntl(RankingFilterDropdown);
    return render(<Wrapped {...defaultProps} {...props} />);
};

const component = new RankingFilterDropdownFragment();

describe("RankingFilterDropdown", () => {
    describe("prepareRankingFilterState", () => {
        it("should return object without attributes when attributes not provided", () => {
            const result = prepareRankingFilterState(Mock.defaultFilter);

            expect(result).toEqual({
                rankingFilter: {
                    measure: Mock.measure1Ref,
                    operator: "TOP",
                    value: 10,
                },
            });
        });

        it("should return object with first attribute when attributes provided", () => {
            const result = prepareRankingFilterState(Mock.filterWithRichSetting);

            expect(result).toEqual({
                rankingFilter: {
                    measure: Mock.measure3Ref,
                    attributes: [Mock.attribute1Ref],
                    operator: "BOTTOM",
                    value: 100,
                },
            });
        });
    });

    describe("Filter", () => {
        it("should set correct OperatorDropdown value", () => {
            renderComponent({ filter: Mock.filterWithRichSetting });

            expect(component.getOperator()).toEqual("Bottom");
        });

        it("should set correct ValueDropdown value", () => {
            renderComponent({ filter: Mock.filterWithRichSetting });

            expect(component.getValue()).toEqual("100");
        });

        it("should set MeasureDropdown to first measure", () => {
            renderComponent({ filter: Mock.filterWithRichSetting });

            expect(component.getMeasure()).toEqual("Measure 3");
        });

        it("should set AttributeDropdown to first attribute", () => {
            renderComponent({ filter: Mock.filterWithRichSetting });

            expect(component.getAttribute()).toEqual("Attribute 1");
        });

        it("should set AttributeDropdown to 'All' when no attributes provided", () => {
            renderComponent({ filter: Mock.defaultFilter });

            expect(component.getAttribute()).toEqual("All");
        });
    });

    describe("Buttons", () => {
        it("should toggle apply button disabled class when operator changed", () => {
            renderComponent();
            expect(component.isApplyButtonDisabled()).toEqual(true);
            component.openOperatorDropdown().setOperator("BOTTOM");
            expect(component.isApplyButtonDisabled()).toEqual(false);
        });

        it("should toggle apply button disabled class when value changed", () => {
            renderComponent();
            expect(component.isApplyButtonDisabled()).toEqual(true);
            component.setValue("100");
            expect(component.isApplyButtonDisabled()).toEqual(false);
        });

        it("should toggle apply button disabled class when measure changed", () => {
            renderComponent();
            expect(component.isApplyButtonDisabled()).toEqual(true);
            component.openMeasureDropdown().setMeasureItem("Measure 2");
            expect(component.isApplyButtonDisabled()).toEqual(false);
        });

        it("should toggle apply button disabled class when attribute changed", () => {
            renderComponent();
            expect(component.isApplyButtonDisabled()).toEqual(true);
            component.openAttributeDropdown().setAttributeItem("Attribute 2");
            expect(component.isApplyButtonDisabled()).toEqual(false);
        });

        it("should call onApply with attributes when Apply button clicked", () => {
            const onApply = vi.fn();
            renderComponent({ onApply });
            component.openOperatorDropdown().setOperator("BOTTOM");
            component.setValue("100");
            component.openMeasureDropdown().setMeasureItem("Measure 3");
            component.openAttributeDropdown().setAttributeItem("Attribute 2");
            component.clickApply();

            expect(onApply).toHaveBeenCalledWith({
                rankingFilter: {
                    measure: Mock.measure3Ref,
                    attributes: [Mock.attribute2Ref],
                    operator: "BOTTOM",
                    value: 100,
                },
            });
        });

        it("should call onApply without attributes when Apply button clicked", () => {
            const onApply = vi.fn();
            renderComponent({ onApply });
            component.openOperatorDropdown().setOperator("BOTTOM");
            component.setValue("100");
            component.openMeasureDropdown().setMeasureItem("Measure 3");
            component.openAttributeDropdown().setAttributeToAllRecords();
            component.clickApply();

            expect(onApply).toHaveBeenCalledWith({
                rankingFilter: {
                    measure: Mock.measure3Ref,
                    operator: "BOTTOM",
                    value: 100,
                },
            });
        });

        it("should call onCancel when Cancel button clicked", () => {
            const onCancel = vi.fn();
            renderComponent({ onCancel });
            component.clickCancel();

            expect(onCancel).toHaveBeenCalled();
        });
    });

    describe("AttributeDropdown", () => {
        it("should call onDropDownItemMouseOver on item mouseOver", () => {
            const onDropDownItemMouseOver = vi.fn();
            renderComponent({ onDropDownItemMouseOver });
            fireEvent.mouseOver(component.openAttributeDropdown().getAttributeItem("Attribute 1"));

            expect(onDropDownItemMouseOver).toHaveBeenCalled();
            expect(onDropDownItemMouseOver).toHaveBeenCalledWith({ uri: "attribute1" });
        });

        it("should call onDropDownItemMouseOut on item mouseOut", () => {
            const onDropDownItemMouseOut = vi.fn();
            renderComponent({ onDropDownItemMouseOut });

            fireEvent.mouseOut(component.openAttributeDropdown().getAttributeItem("Attribute 1"));

            expect(onDropDownItemMouseOut).toHaveBeenCalled();
        });

        it("should call onDropDownItemMouseOut on dropdown close", () => {
            const onDropDownItemMouseOut = vi.fn();
            renderComponent({ onDropDownItemMouseOut });
            component.openAttributeDropdown().setAttributeItem("Attribute 2");

            expect(onDropDownItemMouseOut).toHaveBeenCalled();
        });

        it("should not have disabled items when customGranularitySelection is not provided", () => {
            renderComponent();
            component.openAttributeDropdown();

            expect(component.getAttributeDropdownDisabledButtons()).toHaveLength(0);
        });

        it("should not have disabled items when customGranularitySelection 'enable' property is true", () => {
            const customGranularitySelection = { enable: true, warningMessage: "warning" };
            renderComponent({ customGranularitySelection });

            component.openAttributeDropdown();

            expect(component.getAttributeDropdownDisabledButtons()).toHaveLength(0);
        });

        it("should have disabled items when customGranularitySelection 'enable' property is false", () => {
            const customGranularitySelection = { enable: false, warningMessage: "warning" };
            renderComponent({ customGranularitySelection });
            component.openAttributeDropdown();

            expect(component.getAttributeDropdownDisabledButtons()).toHaveLength(5);
        });
    });

    describe("MeasureDropdown", () => {
        it("should call onDropDownItemMouseOver on item mouseOver", () => {
            const onDropDownItemMouseOver = vi.fn();
            renderComponent({ onDropDownItemMouseOver });

            fireEvent.mouseOver(component.openMeasureDropdown().getMeasureItem("Measure 1"));

            expect(onDropDownItemMouseOver).toHaveBeenCalled();
            expect(onDropDownItemMouseOver).toHaveBeenCalledWith({ localIdentifier: "measure1" });
        });

        it("should call onDropDownItemMouseOut on item mouseOut", () => {
            const onDropDownItemMouseOut = vi.fn();
            renderComponent({ onDropDownItemMouseOut });

            fireEvent.mouseOut(component.openMeasureDropdown().getMeasureItem("Measure 1"));

            expect(onDropDownItemMouseOut).toHaveBeenCalled();
        });

        it("should call onDropDownItemMouseOut on dropdown close", () => {
            const onDropDownItemMouseOut = vi.fn();
            renderComponent({ onDropDownItemMouseOut });

            component.openMeasureDropdown().setMeasureItem("Measure 2");

            expect(onDropDownItemMouseOut).toHaveBeenCalled();
        });
    });

    describe("ValueDropdown", () => {
        it("should render 8 default items when input value is empty", () => {
            renderComponent();
            component.changeInputValue("");

            expect(component.getValueDropdownItems()).toHaveLength(8);
        });

        it("should render list item with input value as text", () => {
            renderComponent();
            component.changeInputValue("100");

            expect(component.getValueDropdown().textContent).toEqual("100");
        });

        it("should render list items with matching items", () => {
            renderComponent();
            component.changeInputValue("1");

            // items with label 10, 15, 100
            expect(component.getValueDropdown().textContent).toEqual("1015100");
        });

        it("should not render list items when none matches the entered value", () => {
            renderComponent();
            component.changeInputValue("42");

            expect(component.isValueDropdownVisible()).toBe(false);
        });

        it("should render error message when input value lower than 1", () => {
            renderComponent();
            component.changeInputValue("-100");

            expect(component.getValueDropdown().textContent).toEqual(
                "Input value should be a positive number.",
            );
        });

        it("should render error message when input value larger than 999999", () => {
            renderComponent();
            component.changeInputValue("1000000");

            expect(component.getValueDropdown().textContent).toEqual("Input value too large.");
        });

        it("should render error message when input value is string without numbers", () => {
            renderComponent();
            component.changeInputValue("test");

            expect(component.getValueDropdown().textContent).toEqual(
                "Input value should be a positive number.",
            );
        });

        it("should set custom value via input blur handler", () => {
            const onApply = vi.fn();
            renderComponent({ onApply });
            component.setValueByBlur("42");
            component.clickApply();
            expect(component.getValue()).toEqual("42");
            expect(onApply).toHaveBeenCalledWith({
                rankingFilter: {
                    measure: Mock.measure1Ref,
                    operator: "TOP",
                    value: 42,
                },
            });
        });

        it("should set one of the default values via input blur handler", () => {
            renderComponent();
            component.setValueByBlur("10");

            expect(component.getValue()).toEqual("10");
            expect(component.isValueDropdownVisible()).toBe(false);
        });

        it("should set custom value via input change handler", () => {
            const onApply = vi.fn();
            renderComponent({ onApply });

            expect(component.isApplyButtonDisabled()).toBe(true);

            component.changeInputValue("42");

            expect(component.isApplyButtonDisabled()).toBe(false);

            component.clickApply();

            expect(onApply).toHaveBeenCalledWith({
                rankingFilter: {
                    measure: Mock.measure1Ref,
                    operator: "TOP",
                    value: 42,
                },
            });
        });

        it.each([["0"], ["1000000"], ["test"]])(
            "should not set value via input blur handler when invalid value '%s' is entered",
            (invalidValue) => {
                renderComponent();
                component.setValueByBlur(invalidValue);
                expect(component.getValue()).toEqual("10");
                expect(component.isApplyButtonDisabled()).toBe(true);
            },
        );

        it("should have set non default value", () => {
            renderComponent({
                filter: newRankingFilter(Mock.measure1Ref, "TOP", 42),
            });
            expect(component.getValue()).toEqual("42");
        });
    });

    describe("AttributeDropdown button", () => {
        it("should be disabled when only one attribute item provided", () => {
            renderComponent({ attributeItems: [Mock.attributeItems[0]] });
            expect(component.isAttributeButtonDisabled()).toEqual(true);
        });
    });

    describe("Preview", () => {
        it.each([
            ["top of measure", newRankingFilter(Mock.measure1Ref, "TOP", 42), "Top 42 of Measure 1"],
            [
                "top out of attribute based on measure",
                newRankingFilter(Mock.measure2Ref, [Mock.attribute1Ref], "TOP", 5),
                "Top 5 out of Attribute 1 based on Measure 2",
            ],
            ["bottom of measure", newRankingFilter(Mock.measure1Ref, "BOTTOM", 3), "Bottom 3 of Measure 1"],
            [
                "bottom out of attribute based on measure",
                newRankingFilter(Mock.measure2Ref, [Mock.date1Ref], "BOTTOM", 10),
                "Bottom 10 out of Date based on Measure 2",
            ],
        ])("should render expected preview for %s", (_, filter, expectedPreview) => {
            renderComponent({
                filter,
            });
            expect(component.getPreview()).toEqual(expectedPreview);
        });
    });
});
