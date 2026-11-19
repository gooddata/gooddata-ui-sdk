// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DateRangePicker, type IDateRangePickerProps } from "./DateRangePicker.js";
import { IntlDecorator } from "./IntlDecorators.js";
import { type IDateRange } from "./types.js";

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

    describe("calendar keyboard accessibility", () => {
        it("should render labelled calendar buttons after the date inputs", () => {
            renderComponent();

            const startButton = screen.getByRole("button", { name: "Choose start date" });
            const endButton = screen.getByRole("button", { name: "Choose end date" });
            expect(startButton).toHaveAttribute("aria-haspopup", "dialog");
            expect(startButton).toHaveAttribute("aria-expanded", "false");
            expect(endButton).toHaveAttribute("aria-expanded", "false");
            const position = getInput("05/05/2019").compareDocumentPosition(startButton);
            expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        });

        it("should open the calendar from the button and focus the selected start date", () => {
            renderComponent();
            const startButton = screen.getByRole("button", { name: "Choose start date" });
            fireEvent.click(startButton, { detail: 0 });

            const dialog = screen.getByRole("dialog", { name: "Choose start date" });
            expect(startButton).toHaveAttribute("aria-expanded", "true");
            expect(startButton).toHaveAttribute("aria-controls", dialog.id);
            expect(screen.getByRole("grid")).toHaveAccessibleName("May 2019");
            expect(document.activeElement).toHaveAccessibleName("Sunday, May 5th, 2019, selected");
            expect(document.activeElement?.closest("[role='gridcell']")).toHaveAttribute(
                "aria-selected",
                "true",
            );
        });

        it("should expose only the chosen date as selected", () => {
            renderComponent();
            fireEvent.click(screen.getByRole("button", { name: "Choose end date" }), { detail: 0 });

            const selectedCells = document.querySelectorAll("[role='gridcell'][aria-selected='true']");
            expect(selectedCells).toHaveLength(1);
            expect(selectedCells[0]).toHaveAttribute("data-day", "2019-05-15");
            expect(screen.getByRole("button", { name: "Sunday, May 5th, 2019" })).toBeInTheDocument();
        });

        it("should rename the grid when PageDown moves to the next month", () => {
            renderComponent();
            fireEvent.click(screen.getByRole("button", { name: "Choose start date" }), { detail: 0 });
            fireEvent.keyDown(document.activeElement!, { key: "PageDown" });

            expect(screen.getByRole("grid")).toHaveAccessibleName("June 2019");
            expect(document.activeElement).toHaveAccessibleName("Wednesday, June 5th, 2019");
        });

        it("should reach labelled previous and next month buttons with Tab", () => {
            renderComponent();
            fireEvent.click(screen.getByRole("button", { name: "Choose start date" }), { detail: 0 });
            const day = document.activeElement!;

            fireEvent.keyDown(day, { key: "Tab" });
            expect(document.activeElement).toHaveAccessibleName("Previous month");
            fireEvent.keyDown(document.activeElement!, { key: "Tab" });
            expect(document.activeElement).toHaveAccessibleName("Next month");
            fireEvent.keyDown(document.activeElement!, { key: "Tab" });
            expect(document.activeElement).toBe(day);
        });

        it("should open the calendar with Alt+ArrowDown and focus the selected end date", () => {
            renderComponent();
            fireEvent.keyDown(getInput("05/15/2019"), { key: "ArrowDown", altKey: true });

            expect(screen.getByRole("dialog", { name: "Choose end date" })).toBeInTheDocument();
            expect(document.activeElement).toHaveAccessibleName("Wednesday, May 15th, 2019, selected");
        });

        it("should select the focused day with Enter and return focus to the input", () => {
            const onRangeChange = vi.fn();
            renderComponent({ onRangeChange });
            const input = getInput("05/05/2019");
            fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });

            const day = document.activeElement as HTMLElement;
            fireEvent.keyDown(day, { key: "ArrowRight" });
            const nextDay = document.activeElement as HTMLElement;
            expect(nextDay).toHaveAccessibleName("Monday, May 6th, 2019");
            fireEvent.click(nextDay, { detail: 0 });

            expect(onRangeChange).toHaveBeenLastCalledWith({
                ...getDefaultRange(),
                from: new Date(2019, 4, 6),
            });
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(document.activeElement).toBe(getInput("05/06/2019"));

            fireEvent.keyDown(getInput("05/06/2019"), { key: "ArrowDown", altKey: true });
            expect(document.activeElement).toHaveAccessibleName("Monday, May 6th, 2019, selected");
        });

        it("should keep the navigated month when the open calendar's own button is pressed with the mouse", () => {
            renderComponent();
            const startButton = screen.getByRole("button", { name: "Choose start date" });
            fireEvent.click(startButton, { detail: 0 });
            fireEvent.keyDown(document.activeElement!, { key: "PageDown" });
            expect(screen.getByRole("grid")).toHaveAccessibleName("June 2019");

            fireEvent.mouseDown(startButton);
            fireEvent.click(startButton, { detail: 1 });
            expect(screen.getByRole("grid")).toHaveAccessibleName("June 2019");

            fireEvent.mouseDown(screen.getByRole("button", { name: "Choose end date" }));
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        it("should focus the date typed while the calendar was open with the mouse", () => {
            renderComponent();
            const input = getInput("05/05/2019");
            fireEvent.click(input);
            expect(screen.getByRole("dialog")).toBeInTheDocument();

            fireEvent.change(input, { target: { value: "05/20/2019" } });
            fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });

            expect(document.activeElement).toHaveAccessibleName("Monday, May 20th, 2019, selected");
        });

        it("should show the end date's month before focusing it when the calendar stayed open", () => {
            renderComponent({ range: { from: new Date(2019, 4, 5), to: new Date(2019, 7, 15) } });
            fireEvent.click(getInput("05/05/2019"));
            expect(screen.getByRole("grid")).toHaveAccessibleName("May 2019");
            const endInput = getInput("08/15/2019");
            fireEvent.click(endInput);
            expect(screen.getByRole("grid")).toHaveAccessibleName("May 2019");

            fireEvent.keyDown(endInput, { key: "ArrowDown", altKey: true });

            expect(screen.getByRole("grid")).toHaveAccessibleName("August 2019");
            expect(document.activeElement).toHaveAccessibleName("Thursday, August 15th, 2019, selected");
        });

        it("should close only the calendar on Escape and return focus to the input", () => {
            const onParentKeyDown = vi.fn();
            render(
                <div onKeyDown={onParentKeyDown}>
                    {IntlDecorator(
                        <DateRangePicker
                            dateFormat={defaultDateFormat}
                            range={getDefaultRange()}
                            onRangeChange={() => {}}
                            isMobile={false}
                            isTimeEnabled={false}
                            submitForm={() => {}}
                        />,
                    )}
                </div>,
            );
            fireEvent.keyDown(getInput("05/05/2019"), { key: "ArrowDown", altKey: true });
            fireEvent.keyDown(document.activeElement!, { key: "Escape" });

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(document.activeElement).toBe(getInput("05/05/2019"));
            expect(onParentKeyDown).not.toHaveBeenCalled();
        });

        it("should close only the calendar on Escape pressed on its focused button", () => {
            const onParentKeyDown = vi.fn();
            render(
                <div onKeyDown={onParentKeyDown}>
                    {IntlDecorator(
                        <DateRangePicker
                            dateFormat={defaultDateFormat}
                            range={getDefaultRange()}
                            onRangeChange={() => {}}
                            isMobile={false}
                            isTimeEnabled={false}
                            submitForm={() => {}}
                        />,
                    )}
                </div>,
            );
            const startButton = screen.getByRole("button", { name: "Choose start date" });
            fireEvent.click(startButton, { detail: 1 });
            expect(screen.getByRole("dialog")).toBeInTheDocument();

            fireEvent.keyDown(startButton, { key: "Escape" });

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(onParentKeyDown).not.toHaveBeenCalled();
        });

        it("should keep focus in the input when the calendar icon is clicked with the mouse", () => {
            renderComponent();
            const startButton = screen.getByRole("button", { name: "Choose start date" });

            const mouseDownAllowed = fireEvent.mouseDown(startButton);
            fireEvent.click(startButton, { detail: 1 });

            expect(mouseDownAllowed).toBe(false);
            expect(screen.getByRole("dialog")).toBeInTheDocument();
            expect(document.activeElement).toBe(getInput("05/05/2019"));
        });

        it("should mark today with aria-current", () => {
            renderComponent({ range: { from: new Date(), to: new Date() } });
            fireEvent.click(screen.getByRole("button", { name: "Choose start date" }), { detail: 0 });

            expect(document.activeElement).toHaveAttribute("aria-current", "date");
        });
    });

    describe("custom range hint", () => {
        it("should render custom content inside the hint area after the default format hint", () => {
            renderComponent({ customRangeHint: <div className="s-custom-range-hint">Custom hint</div> });

            const hintArea = document.querySelector(".gd-date-range__hint");
            expect(hintArea).toBeInTheDocument();
            expect(hintArea!.querySelector(".s-custom-range-hint")).toBeInTheDocument();
            expect(hintArea!.lastElementChild).toHaveClass("s-custom-range-hint");
        });

        it("should not render custom content on mobile where the hint area is not rendered", () => {
            renderComponent({
                isMobile: true,
                customRangeHint: <div className="s-custom-range-hint">Custom hint</div>,
            });

            expect(document.querySelector(".s-custom-range-hint")).not.toBeInTheDocument();
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
