// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import Headline, { IHeadlineVisualizationProps } from "../Headline";

describe("Headline", () => {
    function createComponent(props: IHeadlineVisualizationProps) {
        return mount(<Headline {...props} />);
    }

    it("should call after render callback on componentDidMount & componentDidUpdate", () => {
        const onAfterRender = jest.fn();
        const wrapper = createComponent({
            onAfterRender,
            data: {
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Some metric",
                    value: "42",
                },
            },
        });

        expect(onAfterRender).toHaveBeenCalledTimes(1);

        wrapper.setProps({
            data: {
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Some metric",
                    value: "43",
                },
            },
        });

        expect(onAfterRender).toHaveBeenCalledTimes(2);
    });

    describe("with primary value", () => {
        it("should not produce any event upon click when fire handler but primary value is not drillable", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                    },
                },
            });

            const primaryValue = wrapper.find(".s-headline-primary-item .headline-value-wrapper");
            primaryValue.simulate("click");

            expect(onDrill).toHaveBeenCalledTimes(0);
        });

        it("should produce correct event upon click when fire handler is set and primary value is drillable", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                        isDrillable: true,
                    },
                },
            });

            const primaryValue = wrapper.find(".s-headline-primary-item .headline-value-wrapper");
            primaryValue.simulate("click", { target: "elementTarget" });

            expect(onDrill).toBeCalledWith(
                {
                    localIdentifier: "m1",
                    value: "42",
                    element: "primaryValue",
                },
                "elementTarget",
            );
        });

        it("should render headline item link with underline style when is drillable", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                        isDrillable: true,
                    },
                },
            });

            const linkComponent = wrapper.find(".s-headline-item-link");
            expect(linkComponent.find(".headline-link-style-underline").exists()).toBeTruthy();
        });

        it("should not render headline item link with underline style when is drillable and disableDrillUnderline is true", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "42",
                        isDrillable: true,
                    },
                },
                disableDrillUnderline: true,
            });

            const linkComponent = wrapper.find(".s-headline-item-link");
            expect(linkComponent.find(".headline-link-style-underline").exists()).toBeFalsy();
        });

        it("should have primary value written out as link even when the drillable value is invalid", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                        isDrillable: true,
                    },
                },
            });

            const primaryValueLink = wrapper.find(".s-headline-primary-item .s-headline-item-link");
            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();

            primaryValueLink.simulate("click", { target: "elementTarget" });

            expect(primaryValueLink.exists()).toBe(true);
            expect(primaryValueText).toEqual("–");

            expect(onDrill).toHaveBeenCalledTimes(1);
            expect(onDrill).toBeCalledWith(
                {
                    localIdentifier: "m1",
                    value: null,
                    element: "primaryValue",
                },
                "elementTarget",
            );
        });

        it("should have primary value written out as dash when empty string is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "",
                    },
                },
            });

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            expect(primaryValueText).toEqual("–");
        });

        it("should have primary value written out as dash when null is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                    },
                },
            });

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            expect(primaryValueText).toEqual("–");
        });

        it("should have primary value written out as specified in format when null value and format is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                        format: "[=null]EMPTY",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-primary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(false);

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            expect(primaryValueText).toEqual("EMPTY");
        });

        it("should have primary value written out as dash when undefined is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: undefined,
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-primary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(true);

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            expect(primaryValueText).toEqual("–");
        });

        it("should have primary value written out as dash when non number string is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "xyz",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-primary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(true);

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            expect(primaryValueText).toEqual("–");
        });

        it("should have primary value written out as it is when positive number string is provided without format", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234567890",
                    },
                },
            });

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            expect(primaryValueText).toEqual("1234567890");
        });

        it("should have primary value written out as it is when negative number string is provided without format", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "-12345678",
                    },
                },
            });

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            expect(primaryValueText).toEqual("-12345678");
        });

        it("should have style applied on primary value when format is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1666.105",
                        format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                    },
                },
            });

            const primaryValueText = wrapper.find(".s-headline-primary-item .s-headline-value").text();
            const primaryValueStyle = wrapper.find(".s-headline-primary-item").prop("style");

            expect(primaryValueText).toEqual("$1,666.11");
            expect(primaryValueStyle).toHaveProperty("color", "#9c46b5");
            expect(primaryValueStyle).toHaveProperty("backgroundColor", "#d2ccde");
        });
    });

    describe("with secondary value", () => {
        it("should not produce any event upon click when fire handler but secondary value is not drillable", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(false);

            const secondaryValue = wrapper.find(".s-headline-secondary-item .s-headline-value");
            secondaryValue.simulate("click");

            expect(onDrill).toHaveBeenCalledTimes(0);
        });

        it("should produce correct event upon click when fire handler is set and secondary value is drillable", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(false);

            const secondaryValue = wrapper.find(".s-headline-secondary-item .s-headline-value");
            secondaryValue.simulate("click", { target: "elementTarget" });

            expect(onDrill).toBeCalledWith(
                {
                    localIdentifier: "m2",
                    value: "4321",
                    element: "secondaryValue",
                },
                "elementTarget",
            );
        });

        it("should render headline item link with underline style when is drillable", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const linkComponent = wrapper.find(".s-headline-item-link");
            expect(linkComponent.find(".headline-link-style-underline").exists()).toBeTruthy();
        });

        it("should not render headline item link with underline style when is drillable and disableDrillUnderline is true", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
                disableDrillUnderline: true,
            });

            const linkComponent = wrapper.find(".s-headline-item-link");
            expect(linkComponent.find(".headline-link-style-underline").exists()).toBeFalsy();
        });

        it("should have secondary value written out as link even when the drillable value is invalid", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: null,
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(true);

            const secondaryValue = wrapper.find(".s-headline-secondary-item .s-headline-item-link");
            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();

            secondaryValue.simulate("click", { target: "elementTarget" });

            expect(secondaryValue.exists()).toBe(true);
            expect(secondaryValueText).toEqual("–");

            expect(onDrill).toHaveBeenCalledTimes(1);
            expect(onDrill).toBeCalledWith(
                {
                    localIdentifier: "m2",
                    value: null,
                    element: "secondaryValue",
                },
                "elementTarget",
            );
        });

        it("should have secondary value written out as dash when empty string is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(true);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            expect(secondaryValueText).toEqual("–");
        });

        it("should have secondary value written out as dash when null is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "",
                        format: "$#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "11",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(true);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            expect(secondaryValueText).toEqual("–");
        });

        it("should have secondary value written out as specified in format when null value and format is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: null,
                        format: "[=null]EMPTY",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: null,
                        format: "[=null]EMPTY",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: null,
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(false);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            expect(secondaryValueText).toEqual("EMPTY");
        });

        it("should have secondary value written out as dash when undefined is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: undefined,
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: undefined,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: null,
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(true);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            expect(secondaryValueText).toEqual("–");
        });

        it("should have secondary value written out as dash when non number string is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "xyz",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "xyz",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: null,
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(true);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            expect(secondaryValueText).toEqual("–");
        });

        it("should have secondary value written out as it is when positive number string is provided without format", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1234567890",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "1234567890",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(false);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            expect(secondaryValueText).toEqual("1234567890");
        });

        it("should have secondary value written out as it is when negative number string is provided without format", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "-12345678",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "-12345678",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(false);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            expect(secondaryValueText).toEqual("-12345678");
        });

        it("should have style applied on secondary value when format is provided", () => {
            const wrapper = createComponent({
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Some metric",
                        value: "1666.105",
                        format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "1666.105",
                        format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const emptyValueElement = wrapper.find(".s-headline-secondary-item .s-headline-value--empty");
            expect(emptyValueElement.exists()).toEqual(false);

            const secondaryValueText = wrapper.find(".s-headline-secondary-item .s-headline-value").text();
            const secondaryValueStyle = wrapper
                .find(".s-headline-secondary-item")
                .find(".s-headline-value-wrapper")
                .prop("style");

            expect(secondaryValueText).toEqual("$1,666.11");
            expect(secondaryValueStyle).toHaveProperty("color", "#9c46b5");
            expect(secondaryValueStyle).toHaveProperty("backgroundColor", "#d2ccde");
        });
    });

    describe("with tertiary value", () => {
        it("should have written out as formatted value when correct value is provided", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "4321",
                        format: "$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: "110",
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const tertiaryValueText = wrapper
                .find(".s-headline-tertiary-item .s-headline-value-wrapper")
                .text();
            expect(tertiaryValueText).toEqual("110%");
        });

        it("should have written out as dash when undefined value is provided", () => {
            const onDrill = jest.fn();
            const wrapper = createComponent({
                onDrill,
                data: {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "1234",
                        format: "$#,##0.00",
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: null,
                        format: "$#,##0.00",
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        value: null,
                        format: null,
                        title: "Versus",
                    },
                },
            });

            const tertiaryValueText = wrapper
                .find(".s-headline-tertiary-item .s-headline-value-wrapper")
                .text();
            expect(tertiaryValueText).toEqual("–");
        });
    });
});
