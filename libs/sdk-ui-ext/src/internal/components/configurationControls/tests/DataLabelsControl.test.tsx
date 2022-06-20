// (C) 2019-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import DataLabelsControl, { IDataLabelsControlProps } from "../DataLabelsControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { IDataLabelsVisible } from "@gooddata/sdk-ui-charts";

describe("DataLabelsControl", () => {
    const HIDE_LABEL = "hide";
    const VISIBLE_LABEL = "show";
    const AUTO_LABEL = "auto (default)";
    const dataLabelsButtonSelector = ".s-data-labels-config .dropdown-button";
    const dataLabelsButtonTextSelector = ".s-data-labels-config .dropdown-button .gd-button-text:first-child";

    const defaultProps = {
        properties: {},
        pushData: noop,
        isDisabled: false,
    };

    function createComponent(customProps: Partial<IDataLabelsControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(
            <InternalIntlWrapper>
                <DataLabelsControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    const visibleValueToText = (value: IDataLabelsVisible) => {
        switch (value) {
            case true:
                return VISIBLE_LABEL;
            case false:
                return HIDE_LABEL;
            case "auto":
                return AUTO_LABEL;
        }
    };

    describe("Rendering", () => {
        it("should render data labels control", () => {
            const wrapper = createComponent();

            expect(wrapper.find(DataLabelsControl).length).toBe(1);
        });

        it("should render dropdown as disabled when disabled", () => {
            const wrapper = createComponent({
                isDisabled: true,
            });

            expect(wrapper.find(`${dataLabelsButtonSelector}.disabled`).length).toBe(1);
        });

        it("should pass showDisabledMessage property to the dropdown control", () => {
            const wrapper = createComponent({
                showDisabledMessage: true,
            });

            const dropdown = wrapper.find("DropdownControl").first();

            expect(dropdown.prop("showDisabledMessage")).toBeTruthy();
        });

        it("should have `auto` by default", () => {
            const wrapper = createComponent();

            expect(wrapper.find(dataLabelsButtonTextSelector).first().text()).toEqual(AUTO_LABEL);
        });

        it("should show value that was passed", () => {
            const wrapper = createComponent({
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
            });

            expect(wrapper.find(dataLabelsButtonTextSelector).first().text()).toEqual(VISIBLE_LABEL);
        });

        it.each([
            [true, true],
            [true, false],
            ["auto", true],
            [false, "auto"],
        ])(
            "should render dropdowns based on the provided values (visible: %s, totalsVisible: %s)",
            (visible: IDataLabelsVisible, totalsVisible: IDataLabelsVisible) => {
                const wrapper = createComponent({
                    properties: {
                        controls: {
                            dataLabels: {
                                visible,
                                totalsVisible,
                            },
                        },
                    },
                });

                expect(wrapper.find(dataLabelsButtonTextSelector).at(0).text()).toEqual(
                    visibleValueToText(visible),
                );

                // once FF enableSeparateTotalLabels is enabled by default then add totalsVisible test here
            },
        );
    });
});
