// (C) 2007-2020 GoodData Corporation
import React, { PropsWithChildren } from "react";
import { mount, ReactWrapper } from "enzyme";
import moment from "moment";
import { createIntlMock, withIntl } from "@gooddata/sdk-ui";

import { TimePickerProps, WrappedTimepicker } from "../Timepicker";
import { List, SingleSelectListItem } from "../../List";
import { DropdownButton, Dropdown, DropdownList, IDropdownProps } from "../../Dropdown";

describe("TimePicker", () => {
    const TEST_TIME = new Date();
    TEST_TIME.setHours(9);
    TEST_TIME.setMinutes(15);
    TEST_TIME.setSeconds(0);
    TEST_TIME.setMilliseconds(0);

    const defaultProps = {
        intl: createIntlMock(),
        time: TEST_TIME,
    };

    function mountComponent(customProps: Partial<TimePickerProps> = {}) {
        const props = {
            ...defaultProps,
            ...customProps,
        };
        const Wrapped = withIntl(WrappedTimepicker);
        return mount<TimePickerProps>(<Wrapped {...props} />);
    }

    function getTimePickerButton(component: ReactWrapper) {
        return component.find(DropdownButton);
    }

    function openTimePicker(component: ReactWrapper) {
        getTimePickerButton(component).simulate("click");
    }

    function getTimePickerValue(component: ReactWrapper) {
        const button = getTimePickerButton(component);
        const buttonValue = button.find(".gd-button-text");
        return buttonValue.text();
    }

    function select1Hour30Minutes(component: ReactWrapper) {
        const dropdownBody = component.find(DropdownList);
        const list = dropdownBody.find(List);
        const item = list.find(SingleSelectListItem).at(3);
        item.simulate("click");
    }

    describe("initial state", () => {
        it("should render time picker", () => {
            const component = mountComponent();
            const timePickerExists = component.find(".gd-timepicker").exists();
            expect(timePickerExists).toEqual(true);
        });

        describe("props", () => {
            it("should process time property", () => {
                const component = mountComponent();

                const currentTime = getTimePickerValue(component);
                expect(currentTime).toBe("09:30 AM");
            });

            it("should pass overlayPositionType and overlayZIndex to Dropdown", () => {
                const overlayPositionType = "sameAsTarget";
                const overlayZIndex = 5002;
                const component = mountComponent({
                    overlayPositionType,
                    overlayZIndex,
                });
                openTimePicker(component);

                const dropdownBody: ReactWrapper<PropsWithChildren<IDropdownProps>, never, unknown> =
                    component.find(Dropdown);
                const dropdownBodyProps = dropdownBody.props();
                expect(dropdownBodyProps.overlayPositionType).toBe(overlayPositionType);
                expect(dropdownBodyProps.overlayZIndex).toBe(overlayZIndex);
            });

            it("should pass maxVisibleItemsCount to DropdownBody", () => {
                const maxVisibleItemsCount = 5;
                const component = mountComponent({
                    maxVisibleItemsCount,
                });
                openTimePicker(component);

                const dropdownBody = component.find(List);
                expect(dropdownBody.props().maxVisibleItemsCount).toBe(maxVisibleItemsCount);
            });

            it("should call onChange with time", () => {
                const onChange = jest.fn();
                const component = mountComponent({
                    onChange,
                });
                openTimePicker(component);
                select1Hour30Minutes(component);

                const expectedTime = moment(TEST_TIME);
                expectedTime.hours(1).minutes(30);

                expect(onChange).toHaveBeenCalledTimes(1);
                expect(onChange).toHaveBeenCalledWith(expectedTime.toDate());
            });
        });
    });

    describe("localization", () => {
        it("should translate time in zh-Hans locale", () => {
            const component = mountComponent({
                intl: createIntlMock({}, "zh-Hans"),
            });

            const currentTime = getTimePickerValue(component);
            expect(currentTime).toBe("09:30 上午");
        });
    });
});
