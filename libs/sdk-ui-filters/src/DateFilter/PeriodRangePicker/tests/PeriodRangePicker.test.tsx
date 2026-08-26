// (C) 2026 GoodData Corporation

import { fireEvent, render, waitFor } from "@testing-library/react";
import moment from "moment";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IntlDecorator } from "../../DateRangePicker/IntlDecorators.js";
import { PeriodRangePicker } from "../PeriodRangePicker.js";
// The rendering cases below target the implementation directly rather than the lazy `PeriodRangePicker`
// wrapper, so they stay synchronous; the wrapper itself is covered by the "lazy wrapper" case.
import { PeriodRangePickerImpl, resolveSelectedRange } from "../PeriodRangePickerImpl.js";
import { type IPeriodRange, type PeriodRangePickerGranularity } from "../types.js";

const granularities: PeriodRangePickerGranularity[] = [
    "GDC.time.date",
    "GDC.time.week_us",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

const PANEL_CLASS_BY_GRANULARITY: Record<PeriodRangePickerGranularity, string> = {
    "GDC.time.date": "rc-picker-date-panel",
    "GDC.time.week_us": "rc-picker-week-panel",
    "GDC.time.month": "rc-picker-month-panel",
    "GDC.time.quarter": "rc-picker-quarter-panel",
    "GDC.time.year": "rc-picker-year-panel",
};

interface IRenderResult {
    onRangeChange: ReturnType<typeof vi.fn>;
    submitForm: ReturnType<typeof vi.fn>;
}

function renderPicker(
    granularity: PeriodRangePickerGranularity,
    range: IPeriodRange = { from: "2026-03-01", to: "2026-05-31" },
    withoutApply = false,
    weekStart?: "Monday" | "Sunday",
): IRenderResult {
    const onRangeChange = vi.fn();
    const submitForm = vi.fn();
    render(
        IntlDecorator(
            <PeriodRangePickerImpl
                granularity={granularity}
                range={range}
                onRangeChange={onRangeChange}
                isMobile={false}
                submitForm={submitForm}
                withoutApply={withoutApply}
                weekStart={weekStart}
            />,
        ),
    );
    return { onRangeChange, submitForm };
}

function openPicker(): void {
    const input = document.querySelectorAll("input")[0];
    fireEvent.mouseDown(input);
    fireEvent.focus(input);
    fireEvent.click(input);
}

function clickCell(title: string): void {
    const cell = document.querySelector(`[title="${title}"] .rc-picker-cell-inner`);
    expect(cell).toBeInTheDocument();
    fireEvent.click(cell!);
}

describe("PeriodRangePicker", () => {
    describe("lazy wrapper", () => {
        // `PeriodRangePicker` defers the rc-picker-importing module behind a dynamic import so that the
        // package barrel stays importable under plain Node ESM (see PeriodRangePicker.tsx). This asserts the
        // deferred chunk actually mounts the picker.
        it("resolves and renders the picker implementation", async () => {
            render(
                IntlDecorator(
                    <PeriodRangePicker
                        granularity="GDC.time.month"
                        range={{ from: "2026-03-01", to: "2026-05-31" }}
                        onRangeChange={vi.fn()}
                        isMobile={false}
                        submitForm={vi.fn()}
                    />,
                ),
            );
            await waitFor(() => {
                expect(document.querySelector(".s-period-range-picker")).toBeInTheDocument();
            });
            expect(document.querySelectorAll(".rc-picker input")).toHaveLength(2);
        });
    });

    describe("should render", () => {
        it.each(granularities)("without crashing for %s", (granularity) => {
            renderPicker(granularity);
            expect(document.querySelector(".s-period-range-picker")).toBeInTheDocument();
        });
    });

    describe("granularity mapping", () => {
        it.each(granularities)("opens the %s picker panel", (granularity) => {
            renderPicker(granularity);
            openPicker();
            expect(document.querySelector(`.${PANEL_CLASS_BY_GRANULARITY[granularity]}`)).toBeInTheDocument();
        });
    });

    describe("week start rendering", () => {
        // Checks the rendered header order, not just the resolved range: resolvePeriodBoundaries computes the
        // week boundary from `weekStart` independently of what the picker visually renders, so a range-selection
        // assertion alone can't catch the grid itself still visually starting on the wrong day.
        function firstHeaderDayName(): string | undefined {
            return Array.from(document.querySelectorAll(".rc-picker-content thead th"))
                .map((th) => th.textContent ?? "")
                .filter((text) => text !== "Week")[0];
        }

        it("renders Sunday as the first weekday column by default", () => {
            renderPicker("GDC.time.week_us");
            openPicker();
            expect(firstHeaderDayName()).toBe("Su");
        });

        it("renders Monday as the first weekday column with an explicit Monday week start", () => {
            renderPicker("GDC.time.week_us", { from: "2026-03-01", to: "2026-05-31" }, false, "Monday");
            openPicker();
            expect(firstHeaderDayName()).toBe("Mo");
        });
    });

    describe("closed-state display", () => {
        it("shows the provided month range in the inputs", () => {
            renderPicker("GDC.time.month");
            const values = Array.from(document.querySelectorAll<HTMLInputElement>(".rc-picker input")).map(
                (input) => input.value,
            );
            expect(values).toEqual(["2026-03", "2026-05"]);
        });
    });

    describe("range selection", () => {
        // rc-picker's RangePicker fires onChange more than once per completed gesture (confirmed empirically —
        // both firings carry the same, correct final value), so assertions key off the LAST call rather than an
        // exact call count, which would just be re-testing rc-picker's own internals.
        it("resolves a Month selection to the first/last day of the picked months", () => {
            const { onRangeChange } = renderPicker("GDC.time.month");
            openPicker();
            clickCell("2026-01");
            clickCell("2026-06");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-01-01", to: "2026-06-30" });
        });

        it("resolves a Quarter selection to the first/last day of the picked quarters", () => {
            const { onRangeChange } = renderPicker("GDC.time.quarter");
            openPicker();
            clickCell("2026-Q1");
            clickCell("2026-Q3");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-01-01", to: "2026-09-30" });
        });

        it("resolves a Year selection to the first/last day of the picked years", () => {
            const { onRangeChange } = renderPicker("GDC.time.year");
            openPicker();
            clickCell("2025");
            clickCell("2027");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2025-01-01", to: "2027-12-31" });
        });

        it("resolves a Week selection to the whole week containing the clicked day", () => {
            // 2026-03-02 is a Monday; with the default Sunday week start the containing week is Mar 1 - Mar 7
            const { onRangeChange } = renderPicker("GDC.time.week_us");
            openPicker();
            clickCell("2026-03-02");
            clickCell("2026-03-02");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-01", to: "2026-03-07" });
        });

        it("resolves a Week selection against an explicitly configured Monday week start", () => {
            // Exercises the synthetic-locale wiring (weekStartMomentLocale.ts), not just resolvePeriodBoundaries
            // directly — confirms the picker itself renders/accepts the cloned locale without erroring.
            // 2026-03-02 is a Monday, so with Monday week start the containing week is Mar 2 - Mar 8.
            const { onRangeChange } = renderPicker(
                "GDC.time.week_us",
                { from: "2026-03-01", to: "2026-05-31" },
                false,
                "Monday",
            );
            openPicker();
            clickCell("2026-03-02");
            clickCell("2026-03-02");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-03-08" });
        });

        it("passes Day selections straight through with no period expansion", () => {
            const { onRangeChange } = renderPicker("GDC.time.date");
            openPicker();
            clickCell("2026-03-02");
            clickCell("2026-03-10");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-03-10" });
        });

        it("clearing the value reports an empty range", () => {
            const { onRangeChange } = renderPicker("GDC.time.month");
            const clearButton = document.querySelector(".rc-picker-clear");
            expect(clearButton).toBeInTheDocument();
            fireEvent.click(clearButton!);
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: undefined, to: undefined });
        });
    });

    describe("withoutApply", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        it("defers a submitForm call once a complete range is selected", () => {
            const { submitForm } = renderPicker("GDC.time.month", { from: undefined, to: undefined }, true);
            openPicker();
            clickCell("2026-01");
            clickCell("2026-06");
            expect(submitForm).not.toHaveBeenCalled();
            vi.runAllTimers();
            expect(submitForm).toHaveBeenCalledTimes(1);
        });

        it("does not submit when withoutApply is false", () => {
            const { submitForm } = renderPicker("GDC.time.month", { from: undefined, to: undefined }, false);
            openPicker();
            clickCell("2026-01");
            clickCell("2026-06");
            vi.runAllTimers();
            expect(submitForm).not.toHaveBeenCalled();
        });
    });
});

describe("resolveSelectedRange", () => {
    it("expands a Month anchor pair to the first/last day of those months", () => {
        expect(
            resolveSelectedRange("GDC.time.month", moment("2026-02-01"), moment("2026-04-01"), "Sunday"),
        ).toEqual({ from: "2026-02-01", to: "2026-04-30" });
    });

    it("expands a Quarter anchor pair to the first/last day of those quarters", () => {
        expect(
            resolveSelectedRange("GDC.time.quarter", moment("2026-01-01"), moment("2026-04-01"), "Sunday"),
        ).toEqual({ from: "2026-01-01", to: "2026-06-30" });
    });

    it("respects an explicit Monday week start", () => {
        // 2026-07-21 is a Tuesday
        expect(
            resolveSelectedRange("GDC.time.week_us", moment("2026-07-21"), moment("2026-07-21"), "Monday"),
        ).toEqual({ from: "2026-07-20", to: "2026-07-26" });
    });

    it("passes Day anchors straight through with no expansion", () => {
        expect(
            resolveSelectedRange("GDC.time.date", moment("2026-07-21"), moment("2026-07-23"), "Sunday"),
        ).toEqual({
            from: "2026-07-21",
            to: "2026-07-23",
        });
    });
});
