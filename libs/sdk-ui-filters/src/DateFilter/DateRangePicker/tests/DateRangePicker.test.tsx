// (C) 2007-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntlDecorator } from "./IntlDecorators.js";
import { DateRangePicker, IDateRangePickerProps } from "../DateRangePicker.js";
import { IDateRange } from "../types.js";

const defaultDateFormat = "MM/dd/yyyy";
const getDefaultRange = (): IDateRange => ({
    from: new Date(2019, 4, 5),
    to: new Date(2019, 4, 15),
});

const writeToInput = (value: string, element: Element) => {
    fireEvent.change(element, {
        target: {
            value,
        },
    });
    fireEvent.blur(element);
};

const getInput = (value: string) => {
    return screen.getByDisplayValue(value);
};

const renderComponent = (props?: Partial<IDateRangePickerProps>) => {
    return render(
        IntlDecorator(
            <DateRangePicker
                dateFormat={defaultDateFormat}
                range={getDefaultRange()}
                onRangeChange={() => {}}
                isMobile={false}
                isTimeEnabled={false}
                submitForm={() => {}}
                {...props}
            />,
        ),
    );
};

describe("DateRangePicker", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("time disabled", () => {
        it("should call the appropriate callback when from input changes", () => {
            const onRangeChange = vi.fn();
            renderComponent({ onRangeChange });
            writeToInput("05/01/2019", getInput("05/05/2019"));
            expect(onRangeChange).toHaveBeenCalledWith({ ...getDefaultRange(), from: new Date(2019, 4, 1) });
        });

        it("should call the appropriate callback when to input changes", () => {
            const onRangeChange = vi.fn();
            renderComponent({ onRangeChange });
            writeToInput("06/01/2019", getInput("05/15/2019"));
            expect(onRangeChange).toHaveBeenCalledWith({ ...getDefaultRange(), to: new Date(2019, 5, 1) });
        });

        it("should call the appropriate callback when from picker is clicked", () => {
            const onRangeChange = vi.fn();
            renderComponent({ onRangeChange });
            fireEvent.click(getInput("05/05/2019"));
            fireEvent.click(screen.getByText("6"));

            // Cannot test on exact match, because the dates are local.
            // See https://github.com/gpbl/react-day-picker/blob/b08661717076249f1b6c1085174bb1d92aad6b08/test/daypicker/events.js#L37-L54
            const from = onRangeChange.mock.calls[0][0].from;
            expect(from.getFullYear()).toEqual(2019);
            expect(from.getMonth()).toEqual(4);
        });

        it("should call the appropriate callback when to picker is clicked", () => {
            const onRangeChange = vi.fn();
            renderComponent({ onRangeChange });
            fireEvent.click(getInput("05/15/2019"));
            fireEvent.click(screen.getByText("6"));

            const to = onRangeChange.mock.calls[0][0].to;
            expect(to.getFullYear()).toEqual(2019);
            expect(to.getMonth()).toEqual(4);
        });

        it("should not be able to configure FROM/TO time since it is not enabled", () => {
            renderComponent();

            expect(
                document.querySelector(
                    ".s-date-range-picker-from .s-date-range-picker-input-time .input-text",
                ),
            ).not.toBeInTheDocument();
            expect(
                document.querySelector(".s-date-range-picker-to .s-date-range-picker-input-time .input-text"),
            ).not.toBeInTheDocument();
        });
    });

    describe("time enabled", () => {
        it("should call the appropriate callback when FROM time configured to 11", () => {
            const onRangeChange = vi.fn();
            renderComponent({ onRangeChange, isTimeEnabled: true });
            const input = screen.getAllByDisplayValue("00:00")[0];
            writeToInput("11:00", input);

            expect(onRangeChange).toHaveBeenCalledWith({
                ...getDefaultRange(),
                from: new Date(2019, 4, 5, 11, 0),
            });
        });

        const toScenarios: Array<[string, string, Date]> = [
            ["TO time configured to 09", "09:00", new Date(2019, 4, 15, 9, 0)],
            ["TO time configured to 16", "16:00", new Date(2019, 4, 15, 16, 0)],
            ["TO time configured to 1555", "15:55", new Date(2019, 4, 15, 15, 55)],
        ];

        it.each(toScenarios)(
            "should call the appropriate callback when %s",
            (_desc, value, expectedResult) => {
                const onRangeChange = vi.fn();
                renderComponent({ onRangeChange, isTimeEnabled: true });
                const input = screen.getAllByDisplayValue("00:00")[1];
                writeToInput(value, input);

                expect(onRangeChange).toHaveBeenCalledWith({ ...getDefaultRange(), to: expectedResult });
            },
        );
    });
});
