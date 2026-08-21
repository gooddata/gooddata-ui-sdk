// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import moment from "moment";
import { RawIntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createIntlMock } from "@gooddata/sdk-ui";

import { type TimePickerProps, WrappedTimepicker } from "../Timepicker.js";

// Rendering the component switches moment's *global* locale to the one it is given, and moment has
// no per-instance locale to scope that to. Left behind, it reformats every later time in the run
// (`timeUtilities`' "07:15 AM" comes back as "07:15 上午"), so it is put back after each test.
const MOMENT_LOCALE = moment.locale();
afterEach(() => {
    moment.locale(MOMENT_LOCALE);
});

describe("TimePicker", () => {
    const TEST_TIME = new Date();
    TEST_TIME.setHours(9);
    TEST_TIME.setMinutes(15);
    TEST_TIME.setSeconds(0);
    TEST_TIME.setMilliseconds(0);

    const defaultProps = {
        time: TEST_TIME,
    };

    function renderComponent(customProps: Partial<TimePickerProps> = {}, locale = "en-US") {
        const props = {
            ...defaultProps,
            ...customProps,
        };
        return render(
            <RawIntlProvider value={createIntlMock({}, locale)}>
                <WrappedTimepicker {...props} />
            </RawIntlProvider>,
        );
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
                const onChange = vi.fn();
                const expectedTime = moment(TEST_TIME);
                expectedTime.hours(1).minutes(30);
                renderComponent({
                    onChange,
                });

                fireEvent.click(screen.getByText("09:30 AM"));
                fireEvent.click(screen.getByText("01:30 AM"));

                expect(onChange).toHaveBeenCalledTimes(1);
                await waitFor(() => {
                    expect(onChange).toHaveBeenCalledWith(expectedTime.toDate());
                });
            });
        });
    });

    describe("localization", () => {
        it("should translate time in zh-Hans locale", () => {
            renderComponent({}, "zh-Hans");
            expect(screen.getByText("09:30 上午")).toBeInTheDocument();
        });
    });
});
