// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import moment from "moment";
import { createIntlMock, withIntl } from "@gooddata/sdk-ui";

import { TimePickerProps, WrappedTimepicker } from "../Timepicker";

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

    function renderComponent(customProps: Partial<TimePickerProps> = {}) {
        const props = {
            ...defaultProps,
            ...customProps,
        };
        const Wrapped = withIntl(WrappedTimepicker);
        return render(<Wrapped {...props} />);
    }

    describe("initial state", () => {
        it("should render time picker", () => {
            renderComponent();
            expect(screen.getByText("09:30 AM")).toBeInTheDocument();
        });

        describe("props", () => {
            it.each([
                [9, 15, false, "09:30 AM"],
                [9, 30, false, "10:00 AM"],
                [14, 29, false, "02:30 PM"],
                [9, 15, true, "09:15 AM"],
                [9, 30, true, "09:30 AM"],
                [17, 0, true, "05:00 PM"],
            ])(
                "should processed time property (%s, %s) with skipNormalizeTime=%s be equal to %s",
                (hours: number, mins: number, skipNormalizeTime: boolean, expected: string) => {
                    const alignedTime = new Date();
                    alignedTime.setHours(hours);
                    alignedTime.setMinutes(mins);
                    alignedTime.setSeconds(0);
                    alignedTime.setMilliseconds(0);

                    renderComponent({
                        time: alignedTime,
                        skipNormalizeTime,
                    });

                    expect(screen.getByText(expected)).toBeInTheDocument();
                },
            );

            it("should call onChange with time", async () => {
                const onChange = jest.fn();
                const expectedTime = moment(TEST_TIME);
                expectedTime.hours(1).minutes(30);
                renderComponent({
                    onChange,
                });

                await userEvent.click(screen.getByText("09:30 AM"));
                await userEvent.click(screen.getByText("01:30 AM"));

                expect(onChange).toHaveBeenCalledTimes(1);
                await waitFor(() => {
                    expect(onChange).toHaveBeenCalledWith(expectedTime.toDate());
                });
            });
        });
    });

    describe("localization", () => {
        it("should translate time in zh-Hans locale", () => {
            renderComponent({
                intl: createIntlMock({}, "zh-Hans"),
            });
            expect(screen.getByText("09:30 上午")).toBeInTheDocument();
        });
    });
});
