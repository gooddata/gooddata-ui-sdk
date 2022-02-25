// (C) 2022 GoodData Corporation
import React from "react";
import { IntlProvider } from "react-intl";
import { pickCorrectWording, messagesMap } from "@gooddata/sdk-ui";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { ChartSortingOwnProps, ChartSortingWithIntl } from "../ChartSorting";
import {
    singleNormalAttributeSortConfig,
    singleAreaAttributeSortConfig,
    multipleAttributesSortConfig,
} from "./mock";
import {
    clickAttributeDropdown,
    changeDropdownValue,
    getTextValue,
    findSelector,
    buildAttributeButtonSelector,
    changeMeasureDropdownValue,
    clickMeasureDropdown,
} from "./testHelpers";
import { IBucketItemNames } from "../types";

const bucketItemNames: IBucketItemNames = {
    m1: {
        name: "Snapshot",
        sequenceNumber: "M1",
    },
    m2: {
        name: "Timeline",
        sequenceNumber: "M2",
    },
    m3: {
        name: "NrOfOppor.",
        sequenceNumber: "M3",
    },
    a1: {
        name: "Account",
    },
    a2: {
        name: "Activity",
    },
};

const DefaultLocale = "en-US";

const messages = pickCorrectWording(messagesMap[DefaultLocale], {
    workspace: "mockWorkspace",
    enableRenamingMeasureToMetric: true,
});

const renderComponent = (props?: Partial<ChartSortingOwnProps>) => {
    const defaultProps: ChartSortingOwnProps = {
        ...singleNormalAttributeSortConfig,
        bucketItemNames,
        onApply: noop,
        onCancel: noop,
    };

    return mount(
        <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
            <ChartSortingWithIntl {...defaultProps} {...props} />
        </IntlProvider>,
    );
};

describe("ChartSorting", () => {
    describe("Attribute Normal Sort with no metrics", () => {
        const component = renderComponent();

        it("should render dialog with correct values", () => {
            expect(getTextValue(component, buildAttributeButtonSelector(0))).toEqual("Z to A");
        });

        it("should set correct attribute dropdown value", () => {
            clickAttributeDropdown(component, 0);
            changeDropdownValue(component, "A to Z");

            expect(getTextValue(component, buildAttributeButtonSelector(0))).toEqual("A to Z");
        });
    });

    describe("Attribute Area Sort with no metrics", () => {
        const component = renderComponent({
            ...singleAreaAttributeSortConfig,
        });

        it("should render dialog with correct values and measure dropdown disabled", () => {
            expect(findSelector(component, "Sum of all metrics (total)")).toEqual(true);
            expect(getTextValue(component, buildAttributeButtonSelector(0))).toEqual("Smallest to largest");
            expect(component.find(".s-sum_of_all_metrics__total_").hostNodes().hasClass("disabled")).toEqual(
                true,
            );
        });

        it("should allow to set normal attribute sort item and hide measure dropdown", () => {
            clickAttributeDropdown(component, 0);

            expect(findSelector(component, "A to Z")).toEqual(true);
            expect(findSelector(component, "Smallest to Largest")).toEqual(true);

            changeDropdownValue(component, "Z to A");

            expect(getTextValue(component, buildAttributeButtonSelector(0))).toEqual("Z to A");
            expect(findSelector(component, "Sum of all metrics (total)")).toEqual(false);
        });
    });

    describe("Attribute Area sort with multiple Metrics", () => {
        const component = renderComponent({
            ...multipleAttributesSortConfig,
        });

        it("should render dialog with correct values", () => {
            const firstAttribute = component.find(buildAttributeButtonSelector(0)).hostNodes().text();
            const secondAttribute = component.find(buildAttributeButtonSelector(1)).hostNodes().text();

            expect(firstAttribute).toBe("Largest to smallest");
            expect(secondAttribute).toBe("Smallest to largest");
        });

        it("should allow to change metric dropdown", () => {
            clickMeasureDropdown(component);

            changeMeasureDropdownValue(component, "Timeline");

            expect(component.find(".s-inner-measure-dropdown-button").at(1).text()).toBe("Timeline (M2)");
        });
    });

    describe("onCancel", () => {
        it("should call onCancel when Cancel button is clicked", () => {
            const onCancel = jest.fn();
            const component = renderComponent({ onCancel });

            component.find(".s-sorting-dropdown-cancel").hostNodes().simulate("click");

            expect(onCancel).toHaveBeenCalled();
        });
    });

    describe("onApply", () => {
        it("should call onApply when Apply button is clicked", () => {
            const onApply = jest.fn();
            const component = renderComponent({ onApply });
            component.find(".s-sorting-dropdown-apply").hostNodes().simulate("click");

            expect(onApply).toHaveBeenCalled();
        });

        it("should call onApply for simple normal attribute with correct SortItem payload", () => {
            const onApply = jest.fn();
            const component = renderComponent({
                onApply,
                ...singleNormalAttributeSortConfig,
            });
            component.find(".s-sorting-dropdown-apply").hostNodes().simulate("click");

            expect(onApply).toHaveBeenCalledWith([
                {
                    attributeSortItem: {
                        attributeIdentifier: "a1",
                        direction: "desc",
                    },
                },
            ]);
        });

        it("should call onApply for simple area attribute with correct SortItem payload", () => {
            const onApply = jest.fn();
            const component = renderComponent({
                onApply,
                ...singleAreaAttributeSortConfig,
            });
            component.find(".s-sorting-dropdown-apply").hostNodes().simulate("click");

            expect(onApply).toHaveBeenCalledWith([
                {
                    attributeSortItem: {
                        aggregation: "sum",
                        attributeIdentifier: "a1",
                        direction: "asc",
                    },
                },
            ]);
        });

        it("should call onApply for multiple attributes with correct SortItem payload", () => {
            const onApply = jest.fn();
            const component = renderComponent({
                onApply,
                ...multipleAttributesSortConfig,
            });
            component.find(".s-sorting-dropdown-apply").hostNodes().simulate("click");

            expect(onApply).toHaveBeenCalledWith([
                {
                    measureSortItem: {
                        direction: "desc",
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: "m1",
                                },
                            },
                        ],
                    },
                },
                {
                    attributeSortItem: {
                        attributeIdentifier: "a2",
                        direction: "asc",
                        aggregation: "sum",
                    },
                },
            ]);
        });
    });
});
