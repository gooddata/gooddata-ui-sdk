// (C) 2020-2025 GoodData Corporation
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import parseDate from "date-fns/parse/index.js";
import defaultUserEvent from "@testing-library/user-event";
import { WrappedDatePicker, DatePickerProps } from "../Datepicker.js";
import { createIntlMock } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

const defaultDateFormat = "MM/dd/yyyy";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("DatePicker", () => {
    const defaultProps = {
        align: "tr tl",
        intl: createIntlMock(),
        dateFormat: defaultDateFormat,
    };

    function createComponent(customProps: Partial<DatePickerProps> = {}) {
        const props = {
            ...defaultProps,
            ...customProps,
        };
        return render(<WrappedDatePicker {...props} />);
    }

    const openCalendar = async () => {
        await userEvent.click(screen.getByRole("combobox"));
    };

    const closeCalendar = async () => {
        await userEvent.click(document.body);
    };

    const testOpenCalendar = () => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    };

    const testClosedCalendar = () => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    };

    const setDate = async (value: string) => {
        await userEvent.clear(screen.getByRole("combobox"));
        await userEvent.paste(value);
    };

    it("should align when window resizes", async () => {
        const onAlign = vi.fn();
        createComponent({ onAlign });

        testClosedCalendar();
        await openCalendar();
        testOpenCalendar();
        expect(onAlign).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new Event("resize", {}));
        await waitFor(() => {
            expect(onAlign).toHaveBeenCalledTimes(2);
        });
    });

    it("should close datepicker once clicked outside", async () => {
        createComponent();

        testClosedCalendar();
        await openCalendar();
        testOpenCalendar();
        await closeCalendar();
        testClosedCalendar();
    });

    it("should set css overlay classes according to default alignment state", async () => {
        createComponent();

        await openCalendar();

        expect(screen.getByRole("datepicker")).toHaveClass("gd-datepicker-focused");
        expect(document.querySelector(".gd-datepicker-OverlayWrapper-bl-xx")).toBeInTheDocument();
        expect(document.querySelector(".gd-datepicker-OverlayWrapper-xx-tl")).toBeInTheDocument();
    });

    it("should set css classes according to focused state", async () => {
        createComponent();

        expect(screen.getByRole("datepicker")).not.toHaveClass("gd-datepicker-focused");

        await openCalendar();
        expect(screen.getByRole("datepicker")).toHaveClass("gd-datepicker-focused");

        await closeCalendar();
        testClosedCalendar();
    });

    it("should translate calendar in zh-Hans locale and searches for Sunday string", async () => {
        createComponent({
            intl: createIntlMock({}, "zh-Hans"),
        });

        await openCalendar();

        expect(screen.getByRole("datepicker")).toHaveClass("gd-datepicker-focused");
        expect(screen.getByLabelText("星期日")).toBeInTheDocument();
    });

    describe("initial state", () => {
        it("should initially render date input", () => {
            createComponent();

            expect(screen.getByRole("combobox")).toBeInTheDocument();
        });

        it("should initially render without date picker", () => {
            createComponent();
            testClosedCalendar();
        });

        it("should initially has set focused state as false", () => {
            createComponent();
            expect(screen.getByRole("datepicker")).not.toHaveClass("gd-datepicker-focused");
        });

        describe("props", () => {
            it("should process date property", () => {
                createComponent({
                    date: parseDate("01/01/2015", defaultDateFormat, new Date()),
                });

                expect(screen.getByRole("combobox")).toHaveValue("01/01/2015");
            });

            it("should show date in provided format", () => {
                createComponent({
                    intl: createIntlMock({}, "cs"),
                    date: parseDate("02/01/2015", defaultDateFormat, new Date()),
                    dateFormat: "yyyy/MM/dd",
                });

                expect(screen.getByRole("combobox")).toHaveValue("2015/02/01");
            });

            it("should use provided className", () => {
                const className = "testClassName";
                createComponent({
                    className,
                });

                expect(screen.getByRole("datepicker")).toHaveClass(className);
            });

            it("should use provided placeholder", () => {
                const placeholder = "MM/DD/YYYY";
                createComponent({
                    placeholder,
                });

                expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
            });

            it("should use provided size as CSS class", () => {
                const smallClass = "small";
                createComponent({
                    size: smallClass,
                });

                expect(screen.getByRole("datepicker")).toHaveClass(smallClass);
                expect(screen.getByRole("combobox")).toHaveClass(smallClass);
            });

            it("should use provided tabIndex", () => {
                createComponent({
                    tabIndex: 4,
                });

                expect(screen.getByRole("combobox")).toHaveProperty("tabIndex", 4);
            });

            describe("onChange", () => {
                it("should call onChange with date when input value is valid format DD/MM/YYYY", async () => {
                    const onChange = vi.fn();
                    createComponent({
                        onChange,
                    });

                    await setDate("01/01/2015");
                    await waitFor(() => {
                        expect(onChange).toHaveBeenCalledWith(
                            parseDate("01/01/2015", defaultDateFormat, new Date()),
                        );
                    });
                    expect(onChange).toHaveBeenCalledTimes(2); // clear & paste
                });

                it("should call onChange with date when input value is valid format D/M/YYYY", async () => {
                    const onChange = vi.fn();
                    createComponent({
                        onChange,
                        dateFormat: "d/M/yyyy",
                    });

                    await setDate("1/1/2015");
                    await waitFor(() => {
                        expect(onChange).toHaveBeenCalledWith(
                            parseDate("1/1/2015", defaultDateFormat, new Date()),
                        );
                    });
                });

                it("should call onChange with valid date in zh-Hans locale", async () => {
                    const onChange = vi.fn();
                    createComponent({
                        onChange,
                        intl: createIntlMock({}, "zh-Hans"),
                        dateFormat: "yyyy/MM/dd",
                    });

                    await setDate("2019/01/20");
                    await waitFor(() => {
                        expect(onChange).not.toHaveBeenCalledWith(2, null);
                    });
                });

                it("should call onChange with null when input value is invalid", async () => {
                    const onChange = vi.fn();
                    createComponent({
                        onChange,
                    });

                    await setDate("invalidDate");
                    await waitFor(() => {
                        expect(onChange).toHaveBeenCalledWith(null);
                    });
                });

                it("should call onChange with date when different day is clicked in calendar", async () => {
                    const onChange = vi.fn();
                    createComponent({
                        onChange,
                    });

                    await openCalendar();

                    fireEvent.click(document.querySelectorAll(".rdp-day_outside")[0]);
                    await waitFor(() => {
                        expect(onChange).toHaveBeenCalledWith(expect.any(Date));
                    });
                    expect(onChange).toHaveBeenCalledTimes(1);
                });

                it("should NOT call onChange with date when same day is clicked in calendar", async () => {
                    const onChange = vi.fn();
                    createComponent({
                        onChange,
                    });

                    await openCalendar();

                    fireEvent.click(document.querySelectorAll(".rdp-day_today")[0]);
                    await waitFor(() => {
                        expect(onChange).toHaveBeenCalledTimes(0);
                    });
                });
            });
        });
    });

    describe("input actions", () => {
        it("should open date picker on click", async () => {
            createComponent();

            await openCalendar();
            testOpenCalendar();
        });

        it("should close date picker once some day is selected", async () => {
            createComponent();

            await openCalendar();
            testOpenCalendar();

            fireEvent.click(document.querySelectorAll(".rdp-day")[0]);
            testClosedCalendar();
        });
    });
});
