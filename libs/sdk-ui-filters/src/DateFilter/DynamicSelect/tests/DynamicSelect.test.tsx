// (C) 2019-2025 GoodData Corporation
import React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import range from "lodash/range.js";
import { describe, expect, it, vi } from "vitest";

import { DateFilterGranularity } from "@gooddata/sdk-model";

import { IMessageTranslator } from "../../utils/Translations/Translators.js";
import { DynamicSelect, IDynamicSelectProps } from "../DynamicSelect.js";
import { DynamicSelectItem } from "../types.js";
import { DAY, MONTH, QUARTER, WEEK_US, YEAR, getRelativeDateFilterItems } from "../utils.js";

const optionTranslator =
    (lastOneString: string, thisString: string, nextOneString: string, plural: string) =>
    ({ offset }: { offset: number }) => {
        if (offset === -1) {
            return lastOneString;
        }
        if (offset === 0) {
            return thisString;
        }
        if (offset === 1) {
            return nextOneString;
        }

        return `${Math.abs(offset)} ${plural} ${offset > 0 ? "ahead" : "ago"}`;
    };

const translations: Record<string, any> = {
    "filters.floatingRange.option.day": optionTranslator("yesterday", "today", "tomorrow", "days"),
    "filters.floatingRange.option.week": optionTranslator("last week", "this week", "next week", "weeks"),
    "filters.floatingRange.option.month": optionTranslator(
        "last month",
        "this month",
        "next month",
        "months",
    ),
    "filters.floatingRange.option.quarter": optionTranslator(
        "last quarter",
        "this quarter",
        "next quarter",
        "quarters",
    ),
    "filters.floatingRange.option.year": optionTranslator("last year", "this year", "next year", "years"),
    "filters.floatingRange.noMatch": () => "no match",
    "filters.floatingRange.tooBig": ({ limit }: { limit: number }) => `too big ${limit}`,
};

const mockTranslator: IMessageTranslator = {
    formatMessage: ({ id }: { id: string }, values: { [key: string]: any }) => {
        const translator = translations[id.replace(/\.offset\..+/, "")];
        return translator ? translator(values) : id;
    },
};

describe("DynamicSelect", () => {
    const mountDynamicSelect = (props: Partial<IDynamicSelectProps> = {}) => {
        const defaultProps = {
            getItems: (inputString: string) =>
                getRelativeDateFilterItems(inputString, "GDC.time.date", mockTranslator),
        };
        return render(<DynamicSelect {...defaultProps} {...props} />);
    };

    it("should render an input", () => {
        mountDynamicSelect();

        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should highlight current period by default", () => {
        mountDynamicSelect();

        fireEvent.focus(screen.getByRole("textbox"));

        const option = screen.getByText("today");
        expect(option).toBeInTheDocument();
        expect(option).toHaveClass("gd-select-option-is-focused");
    });

    it("should pre-fill input and highlight the active item", () => {
        mountDynamicSelect({
            value: -1,
        });

        expect(screen.getByDisplayValue("yesterday")).toBeInTheDocument();
    });

    it("should pre-fill input and highlight the active item for value=0 (RAIL-1519)", () => {
        mountDynamicSelect({
            value: 0,
        });

        expect(screen.getByDisplayValue("today")).toBeInTheDocument();
    });

    it.each([
        ["   ", 25, 2, 0],
        ["0", 1, 0, 0],
        ["day", 2, 0, 0],
        ["no match", 0, 0, 1],
    ])(
        'should render menu and items on input value "%s"',
        (inputValue, optionCount: number, separatorCount: number, noMatchHeadingCount: number) => {
            const { container } = mountDynamicSelect();

            fireEvent.change(screen.getByRole("textbox"), { target: { value: inputValue } });

            expect(container.querySelectorAll(".gd-select-option")).toHaveLength(optionCount);
            expect(container.querySelectorAll(".gd-select-separator")).toHaveLength(separatorCount);
            expect(container.querySelectorAll(".gd-select-heading")).toHaveLength(noMatchHeadingCount);
        },
    );

    it("should highlight first option when filtered", () => {
        mountDynamicSelect();

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "to" } });

        const option = screen.getByText("today");
        expect(option).toBeInTheDocument();
        expect(option).toHaveClass("gd-select-option-is-focused");
    });

    it("should highlight current period after input is cleared", () => {
        mountDynamicSelect();

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "to" } });
        fireEvent.change(input, { target: { value: "" } });

        const option = screen.getByText("today");
        expect(option).toBeInTheDocument();
        expect(option).toHaveClass("gd-select-option-is-focused");
    });

    it("should call onChange when option is selected after searching for white-space string", () => {
        const onChange = vi.fn();
        mountDynamicSelect({ onChange });

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } });
        fireEvent.click(screen.getByText("12 days ahead"));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(12);
    });

    it("should not call onChange when blurred", () => {
        const onChange = vi.fn();
        mountDynamicSelect({ onChange, value: 1 });

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalledTimes(0);
    });

    it("should call onChange when option is selected after searching for non-white-space string", () => {
        const onChange = vi.fn();
        mountDynamicSelect({ onChange });

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "tod" } });
        fireEvent.click(screen.getByText("today"));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(0);
    });

    it("should move the highlight on arrow press", () => {
        const onChange = vi.fn();
        mountDynamicSelect({ onChange });

        const input = screen.getByRole("textbox");
        fireEvent.click(input);
        fireEvent.keyDown(input, { key: "ArrowDown", keyCode: 40, which: 40 });

        const option = screen.getByText("tomorrow");
        expect(option).toBeInTheDocument();
        expect(option).toHaveClass("gd-select-option-is-focused");
    });

    it("should select the highlighted item on Enter", () => {
        const onChange = vi.fn();
        mountDynamicSelect({ onChange });

        const input = screen.getByRole("textbox");
        fireEvent.click(input);
        fireEvent.keyDown(input, { key: "ArrowDown", keyCode: 40, which: 40 });
        fireEvent.keyDown(input, { key: "Enter", keyCode: 13, which: 13 });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(1);
    });

    describe("getRelativeDateFilterItems", () => {
        const sampleOptions: {
            [key: string]: DynamicSelectItem;
        } = {
            "-99999": { type: "option", value: -99999, label: "99999 days ago" },
            "-2": { type: "option", value: -2, label: "2 days ago" },
            "-1": { type: "option", value: -1, label: "yesterday" },
            "0": { type: "option", value: 0, label: "today" },
            "1": { type: "option", value: 1, label: "tomorrow" },
            "2": { type: "option", value: 2, label: "2 days ahead" },
            "99999": { type: "option", value: 99999, label: "99999 days ahead" },
            no_match: { label: "no match", type: "error" },
        };

        it.each([
            [
                365,
                DAY,
                [
                    ...range(-365, -1).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${-offset} days ago`,
                    })),
                    { type: "option", value: -1, label: "yesterday" },
                    { type: "separator" },
                    { type: "option", value: 0, label: "today" },
                    { type: "separator" },
                    { type: "option", value: 1, label: "tomorrow" },
                    ...range(2, 366).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${offset} days ahead`,
                    })),
                ],
            ],
            [
                104,
                WEEK_US,
                [
                    ...range(-104, -1).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${-offset} weeks ago`,
                    })),
                    { type: "option", value: -1, label: "last week" },
                    { type: "separator" },
                    { type: "option", value: 0, label: "this week" },
                    { type: "separator" },
                    { type: "option", value: 1, label: "next week" },
                    ...range(2, 105).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${offset} weeks ahead`,
                    })),
                ],
            ],
            [
                60,
                MONTH,
                [
                    ...range(-60, -1).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${-offset} months ago`,
                    })),
                    { type: "option", value: -1, label: "last month" },
                    { type: "separator" },
                    { type: "option", value: 0, label: "this month" },
                    { type: "separator" },
                    { type: "option", value: 1, label: "next month" },
                    ...range(2, 61).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${offset} months ahead`,
                    })),
                ],
            ],
            [
                20,
                QUARTER,
                [
                    ...range(-20, -1).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${-offset} quarters ago`,
                    })),
                    { type: "option", value: -1, label: "last quarter" },
                    { type: "separator" },
                    { type: "option", value: 0, label: "this quarter" },
                    { type: "separator" },
                    { type: "option", value: 1, label: "next quarter" },
                    ...range(2, 21).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${offset} quarters ahead`,
                    })),
                ],
            ],
            [
                20,
                YEAR,
                [
                    ...range(-20, -1).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${-offset} years ago`,
                    })),
                    { type: "option", value: -1, label: "last year" },
                    { type: "separator" },
                    { type: "option", value: 0, label: "this year" },
                    { type: "separator" },
                    { type: "option", value: 1, label: "next year" },
                    ...range(2, 21).map((offset) => ({
                        type: "option",
                        value: offset,
                        label: `${offset} years ahead`,
                    })),
                ],
            ],
        ])(
            "should return default +/- %i relativeFilter items for granularity %s",
            (_count, granularity: DateFilterGranularity, items) => {
                const actual = getRelativeDateFilterItems("", granularity, mockTranslator);
                expect(actual).toEqual(items);
            },
        );

        it.each([
            ["0", [sampleOptions[0]]],
            [" 1 ", [sampleOptions[1], sampleOptions[-1]]],
            ["-2", [sampleOptions[-2]]],
            ["99999", [sampleOptions[99999], sampleOptions[-99999]]],
            ["-99999", [sampleOptions[-99999]]],
            [" day ", [sampleOptions[-1], sampleOptions[0]]],
        ])("should return relativeFilter options matching input %s", (input: string, items) => {
            const actual = getRelativeDateFilterItems(input, DAY, mockTranslator);
            expect(actual).toEqual(items);
        });

        it.each(["no match", "1.5", "1,5", "-1.5", "-1,5", "ago", "AGO", "aGo", "ahead"])(
            'should return "No match found" for %p',
            (input: string) => {
                const actual = getRelativeDateFilterItems(input, DAY, mockTranslator);
                expect(actual).toEqual([sampleOptions.no_match]);
            },
        );

        it.each(["100000", "-100000"])('should return "Too big" for %p', (input: string) => {
            const actual = getRelativeDateFilterItems(input, DAY, mockTranslator);
            expect(actual).toEqual([{ label: "too big 99999", type: "error" }]);
        });
    });
});
