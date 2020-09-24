// (C) 2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import moment from "moment";
import { WrappedDatePicker, DatePickerProps } from "../Datepicker";
import { createIntlMock } from "@gooddata/sdk-ui";

describe("DatePicker", () => {
    const defaultProps = {
        intl: createIntlMock(),
    };

    function mountComponent(customProps: Partial<DatePickerProps> = {}) {
        const props = {
            ...defaultProps,
            ...customProps,
        };
        return mount<DatePickerProps, null>(<WrappedDatePicker {...props} />);
    }

    function getDatePickerCalendar(datePicker: ReactWrapper) {
        return datePicker.find(".gd-datepicker-picker");
    }

    function getDatePickerInput(datePicker: ReactWrapper) {
        return datePicker.find(".gd-datepicker-input");
    }

    function getDatePickerInputField(datePicker: ReactWrapper) {
        return getDatePickerInput(datePicker).find(".gd-datepicker-input input.input-text");
    }

    function openDatePickerCalendar(datePicker: ReactWrapper) {
        getDatePickerInputField(datePicker).simulate("focus");
    }

    function closeDatePickerCalendar(datePicker: ReactWrapper) {
        getDatePickerInputField(datePicker).simulate("blur");
    }

    it("should align when window resizes", () => {
        jest.useFakeTimers();

        const onAlign = jest.fn();
        const component = mountComponent({ onAlign });

        openDatePickerCalendar(component);
        expect(onAlign).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new Event("resize", {}));
        jest.runAllTimers();
        expect(onAlign).toHaveBeenCalledTimes(2);

        jest.useRealTimers();
    });

    it("should update state when opening and closing", () => {
        jest.useFakeTimers();
        const component = mountComponent();
        const instance = component.instance() as any;

        expect(instance.state.focused).toBe(false);
        expect(instance.datePickerContainer).toBeFalsy();

        openDatePickerCalendar(component);
        jest.runAllTimers();
        component.update();
        expect(instance.state.focused).toBe(true);
        expect(instance.datePickerContainer).toBeTruthy();

        closeDatePickerCalendar(component);
        jest.runAllTimers();
        component.update();
        expect(instance.state.focused).toBe(false);
        expect(instance.datePickerContainer).toBeFalsy();
        jest.useRealTimers();
    });

    it("should set css overlay classes according to alignment state", () => {
        const component = mountComponent();
        const instance = component.instance();

        openDatePickerCalendar(component);
        expect(component.find(".gd-datepicker-focused").exists()).toBe(true);
        expect(component.find(".gd-datepicker-OverlayWrapper-bl-xx").exists()).toBe(true);
        expect(component.find(".gd-datepicker-OverlayWrapper-xx-tl").exists()).toBe(true);

        instance.setState({ align: "tr br" });
        openDatePickerCalendar(component);

        expect(component.find(".gd-datepicker-OverlayWrapper-tr-xx").exists()).toBe(true);
        expect(component.find(".gd-datepicker-OverlayWrapper-xx-br").exists()).toBe(true);
    });

    it("should set css classes according to focused state", () => {
        const component = mountComponent();

        expect(component.find(".gd-datepicker-focused").exists()).toBe(false);

        openDatePickerCalendar(component);
        expect(component.find(".gd-datepicker-focused").exists()).toBe(true);

        closeDatePickerCalendar(component);
        expect(component.find(".gd-datepicker-focused").exists()).toBe(false);
    });

    it("should translate calendar in zh-Hans locale", () => {
        const component = mountComponent({
            intl: createIntlMock({}, "zh-Hans"),
        });

        openDatePickerCalendar(component);
        const shortSundayText = component.find(".DayPicker-Weekday abbr").first().text();
        expect(shortSundayText).toBe("一");
    });

    describe("initial state", () => {
        it("should initially render date input", () => {
            const component = mountComponent();
            const inputExists = getDatePickerInputField(component).exists();
            expect(inputExists).toEqual(true);
        });

        it("should initially render without date picker", () => {
            const component = mountComponent();
            const pickerExists = getDatePickerCalendar(component).exists();
            expect(pickerExists).toEqual(false);
        });

        it("should initially has set focused state as false", () => {
            const component = mountComponent();
            expect((component.instance() as any).state.focused).toBeFalsy();
        });

        describe("props", () => {
            it("should process date property", () => {
                const component = mountComponent({
                    date: moment("01/01/2015", "l", true).toDate(),
                });

                const dateValue = getDatePickerInputField(component).prop("value");
                expect(dateValue).toEqual("01/01/2015");
            });

            it("should show date in provided format", () => {
                const component = mountComponent({
                    intl: createIntlMock({}, "cs"),
                    date: moment("02/01/2015", "l", true).toDate(),
                });

                const dateValue = getDatePickerInputField(component).prop("value");
                expect(dateValue).toEqual("01.02.2015");
            });

            it("should use provided className", () => {
                const component = mountComponent({
                    className: "testName",
                });

                expect(component.find(".gd-datepicker.testName").exists()).toEqual(true);
            });

            it("should use provided placeholder", () => {
                const placeholder = "MM/DD/YYYY";
                const component = mountComponent({
                    placeholder,
                });

                const placeholderProperty = getDatePickerInputField(component).prop("placeholder");
                expect(placeholderProperty).toEqual(placeholder);
            });

            it("should use provided size as CSS class", () => {
                const component = mountComponent({
                    size: "small",
                });

                expect(component.find(".gd-datepicker.small").exists()).toEqual(true);
                expect(component.find("input.input-text.small").exists()).toEqual(true);
            });

            it("should use provided tabIndex", () => {
                const component = mountComponent({
                    tabIndex: 4,
                });

                const tabIndex = getDatePickerInputField(component).prop("tabIndex");
                expect(tabIndex).toEqual(4);
            });

            describe("onChange", () => {
                it("should call onChange with date when input value is valid format DD/MM/YYYY", () => {
                    const component = mountComponent({
                        onChange: jest.fn(),
                    });
                    const event = {
                        target: {
                            value: "01/01/2015",
                        },
                    };
                    getDatePickerInputField(component).simulate("change", event);

                    const onChange = component.prop("onChange");
                    expect(onChange).toHaveBeenCalledTimes(1);
                    expect(onChange).toHaveBeenCalledWith(moment("01/01/2015", "l", true).toDate());
                });

                it("should call onChange with date when input value is valid format D/M/YYYY", () => {
                    const component = mountComponent({
                        onChange: jest.fn(),
                    });
                    const event = {
                        target: {
                            value: "1/1/2015",
                        },
                    };
                    getDatePickerInputField(component).simulate("blur", event);

                    const onChange = component.prop("onChange");
                    expect(onChange).toHaveBeenCalledTimes(1);
                    expect(onChange).toHaveBeenCalledWith(moment("01/01/2015", "l", true).toDate());
                });

                it("should call onChange with valid date in zh-Hans locale", () => {
                    const component = mountComponent({
                        onChange: jest.fn(),
                        intl: createIntlMock({}, "zh-Hans"),
                    });
                    const event = {
                        target: {
                            value: "2019/01/20",
                        },
                    };
                    getDatePickerInputField(component).simulate("blur", event);

                    const onChange = component.prop("onChange");
                    expect(onChange).toHaveBeenCalledTimes(1);
                    expect(onChange).not.toHaveBeenCalledWith(null);
                });

                it("should call onChange with null when input value is invalid", () => {
                    const component = mountComponent({
                        onChange: jest.fn(),
                    });
                    const event = {
                        target: {
                            value: "invalidDate",
                        },
                    };
                    getDatePickerInputField(component).simulate("blur", event);

                    const onChange = component.prop("onChange");
                    expect(onChange).toHaveBeenCalledTimes(1);
                    expect(onChange).toHaveBeenCalledWith(null);
                });

                it("should call onChange with date when different day is clicked in calendar", () => {
                    const component = mountComponent({
                        onChange: jest.fn(),
                    });
                    openDatePickerCalendar(component);
                    component.find(".DayPicker-Day--outside").first().simulate("click");

                    const onChange = component.prop("onChange");
                    expect(onChange).toHaveBeenCalledTimes(1);
                    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
                });

                it("should NOT call onChange with date when same day is clicked in calendar", () => {
                    const component = mountComponent({
                        onChange: jest.fn(),
                    });
                    openDatePickerCalendar(component);
                    component.find(".DayPicker-Day--today").first().simulate("click");

                    const onChange = component.prop("onChange");
                    expect(onChange).toHaveBeenCalledTimes(0);
                });

                it("should update selected month in the calendar when date property changed externally", () => {
                    let component = mountComponent({
                        onChange: jest.fn(),
                        date: new Date(2011, 9, 25),
                    });

                    component = component.setProps({ date: new Date(2017, 0, 18) });

                    openDatePickerCalendar(component);
                    const calendarHeaderText = component.find(".DayPicker-Caption div").first().text();
                    expect(calendarHeaderText).toBe("January 2017");
                });
            });
        });
    });

    describe("input actions", () => {
        it("should open date picker on click", () => {
            const component = mountComponent();
            getDatePickerInputField(component).simulate("click");

            const pickerExists = getDatePickerCalendar(component).exists();
            expect(pickerExists).toEqual(true);
        });

        it("should open date picker on focus", () => {
            const component = mountComponent();
            getDatePickerInputField(component).simulate("focus");

            const pickerExists = getDatePickerCalendar(component).exists();
            expect(pickerExists).toEqual(true);
        });

        it("should close date picker on blur", () => {
            jest.useFakeTimers();
            const component = mountComponent();
            openDatePickerCalendar(component);

            let pickerExists = getDatePickerCalendar(component).exists();
            expect(pickerExists).toEqual(true);

            getDatePickerInputField(component).simulate("blur");
            jest.runAllTimers();
            component.update();
            pickerExists = getDatePickerCalendar(component).exists();
            expect(pickerExists).toEqual(false);
            jest.useRealTimers();
        });

        describe("input field value changes", () => {
            const initialDate = new Date(2011, 11, 11);
            const testCases = [
                {
                    inputValue: "",
                    expectedState: {
                        selectedDate: initialDate,
                        align: "bl tl",
                        focused: true,
                    },
                },
                {
                    inputValue: "12/12/2012",
                    expectedState: {
                        selectedDate: new Date(2012, 11, 12),
                        align: "bl tl",
                        focused: true,
                    },
                },
                {
                    inputValue: "blabla",
                    expectedState: {
                        selectedDate: initialDate,
                        align: "bl tl",
                        focused: true,
                    },
                },
            ];
            testCases.forEach((testCase) => {
                it(`should update component state when input value changed to "${testCase.inputValue}"`, () => {
                    const component = mountComponent({ date: initialDate });
                    openDatePickerCalendar(component);

                    getDatePickerInputField(component).simulate("change", {
                        target: { value: testCase.inputValue },
                    });

                    expect(component.state()).toEqual(testCase.expectedState);
                });
            });

            it.each([
                ["not reset", false, 1],
                ["reset", true, 0],
            ])(
                "should %s value when input value was invalid and resetOnInvalidValue is %s",
                (_expectedAction, resetOnInvalidValue, expectedCalledTimes) => {
                    const component = mountComponent({
                        date: initialDate,
                        resetOnInvalidValue,
                        onChange: jest.fn(),
                    });
                    openDatePickerCalendar(component);

                    getDatePickerInputField(component).simulate("change", {
                        target: { value: "blabla" },
                    });

                    closeDatePickerCalendar(component);

                    const onChange = component.prop("onChange");
                    expect(onChange).toHaveBeenCalledTimes(expectedCalledTimes);

                    expect(component.state()).toEqual({
                        selectedDate: initialDate,
                        align: "bl tl",
                        focused: false,
                    });
                },
            );
        });
    });
});
