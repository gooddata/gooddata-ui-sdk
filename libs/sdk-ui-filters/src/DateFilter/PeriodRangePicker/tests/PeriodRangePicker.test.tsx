// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IntlDecorator } from "../../DateRangePicker/IntlDecorators.js";
import { PeriodRangePicker } from "../PeriodRangePicker.js";
// The rendering cases below target the implementation directly rather than the lazy `PeriodRangePicker`
// wrapper, so they stay synchronous; the wrapper itself is covered by the "lazy wrapper" case.
import {
    DATE_FNS_PICKER_FORMATS,
    PREVIEW_ANNOUNCEMENT_DELAY,
    PeriodRangePickerImpl,
} from "../PeriodRangePickerImpl.js";
import { ANNOUNCEMENT_LIFETIME } from "../PreviewAnnouncer.js";
import { type IPeriodRange, type PeriodRangePickerGranularity } from "../types.js";
import { getYearPageStart } from "../YearRangePanel.js";

const granularities: PeriodRangePickerGranularity[] = [
    "GDC.time.date",
    "GDC.time.week",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

const PANEL_CLASS_BY_GRANULARITY: Record<PeriodRangePickerGranularity, string> = {
    "GDC.time.date": "rc-picker-date-panel",
    "GDC.time.week": "rc-picker-week-panel",
    "GDC.time.month": "rc-picker-month-panel",
    "GDC.time.quarter": "rc-picker-quarter-panel",
    "GDC.time.year": "rc-picker-year-panel",
};

interface IRenderResult {
    onRangeChange: ReturnType<typeof vi.fn>;
    submitForm: ReturnType<typeof vi.fn>;
    /** Re-renders the same picker instance with a new `range` prop (a fresh object each call, mirroring how
     * `AbsoluteDateFilterForm` builds `range` on every render). */
    rerenderWithRange: (newRange: IPeriodRange) => void;
}

const DEFAULT_RANGE_BY_GRANULARITY: Record<PeriodRangePickerGranularity, IPeriodRange> = {
    "GDC.time.date": { from: "2026-03-01", to: "2026-05-31" },
    "GDC.time.week": { from: "2026-10", to: "2026-23" },
    "GDC.time.month": { from: "2026-03", to: "2026-05" },
    "GDC.time.quarter": { from: "2026-1", to: "2026-2" },
    "GDC.time.year": { from: "2025", to: "2026" },
};

function renderPicker(
    granularity: PeriodRangePickerGranularity,
    range: IPeriodRange = DEFAULT_RANGE_BY_GRANULARITY[granularity],
    withoutApply = false,
    weekStart?: "Monday" | "Sunday",
    dateFormat?: string,
    customRangeHint?: ReactNode,
): IRenderResult {
    const onRangeChange = vi.fn();
    const submitForm = vi.fn();
    const renderPickerElement = (currentRange: IPeriodRange) =>
        IntlDecorator(
            <PeriodRangePickerImpl
                granularity={granularity}
                range={currentRange}
                onRangeChange={onRangeChange}
                isMobile={false}
                submitForm={submitForm}
                withoutApply={withoutApply}
                weekStart={weekStart}
                dateFormat={dateFormat}
                customRangeHint={customRangeHint}
            />,
        );
    const { rerender } = render(renderPickerElement(range));
    return {
        onRangeChange,
        submitForm,
        rerenderWithRange: (newRange) => rerender(renderPickerElement(newRange)),
    };
}

/**
 * Like {@link renderPicker}, but with the parent actually holding the range in state and feeding every
 * `onRangeChange` back in as the `range` prop - the way `AbsoluteDateFilterForm` does. The plain
 * harness above never closes that loop, so anything the picker breaks by round-tripping a value
 * through its own parent stays invisible to it.
 */
function renderControlledPicker(
    granularity: PeriodRangePickerGranularity,
    initialRange: IPeriodRange,
    withoutApply = false,
    dateFormat?: string,
): { onRangeChange: ReturnType<typeof vi.fn>; submitForm: ReturnType<typeof vi.fn> } {
    const onRangeChange = vi.fn();
    const submitForm = vi.fn();

    function Harness() {
        const [range, setRange] = useState<IPeriodRange>(initialRange);
        return (
            <PeriodRangePickerImpl
                granularity={granularity}
                range={range}
                onRangeChange={(newRange) => {
                    onRangeChange(newRange);
                    setRange(newRange);
                }}
                isMobile={false}
                submitForm={submitForm}
                withoutApply={withoutApply}
                dateFormat={dateFormat}
            />
        );
    }

    render(IntlDecorator(<Harness />));
    return { onRangeChange, submitForm };
}

function openPicker(): void {
    const input = document.querySelectorAll("input")[0];
    fireEvent.mouseDown(input);
    fireEvent.focus(input);
    fireEvent.click(input);
}

function getFields(): [HTMLInputElement, HTMLInputElement] {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(".rc-picker input"));
    return [inputs[0], inputs[1]];
}

function typeIntoField(input: HTMLInputElement, text: string): void {
    fireEvent.change(input, { target: { value: text } });
}

/**
 * jsdom doesn't move focus on Tab natively, so this simulates the blur/focus transition a real Tab press
 * causes - confirmed empirically to trigger the same rc-picker "confirm this field, switch to the next" path
 * that a real Tab keypress does.
 */
function tabToNextField(fromInput: HTMLInputElement, toInput: HTMLInputElement): void {
    fireEvent.keyDown(fromInput, { key: "Tab", code: "Tab" });
    fireEvent.blur(fromInput);
    fireEvent.focus(toInput);
}

function clickCell(title: string): void {
    const cell = document.querySelector(`[title="${title}"] .rc-picker-cell-inner`);
    expect(cell).toBeInTheDocument();
    fireEvent.click(cell!);
}

/**
 * Presses an element like a mouse does in a browser, where an unprevented mousedown moves focus to the
 * nearest focusable ancestor. jsdom moves no focus on mousedown.
 */
function pressElement(element: Element): void {
    if (fireEvent.mouseDown(element)) {
        const focusTarget = element.closest<HTMLElement>("input, button, [tabindex]");
        act(() => (focusTarget ? focusTarget.focus() : (document.activeElement as HTMLElement).blur()));
    }
    fireEvent.mouseUp(element);
    fireEvent.click(element);
}

function pressCell(title: string): void {
    const cell = document.querySelector(`[title="${title}"] .rc-picker-cell-inner`);
    expect(cell).toBeInTheDocument();
    pressElement(cell!);
}

function describedByText(input: HTMLInputElement): string | undefined {
    const id = input.getAttribute("aria-describedby");
    return id ? (document.getElementById(id)?.textContent ?? undefined) : undefined;
}

function hintText(): string {
    return document.querySelector(".gd-period-range-picker__hint")?.textContent ?? "";
}

/**
 * Once opened at least once, rc-picker keeps its panel container mounted (for its own close transition) and
 * merely toggles a "hidden" class on the dropdown wrapper around it - so an already-opened calendar's closed
 * state has to be read off that class, not off the panel container's presence in the DOM.
 */
function isCalendarVisuallyOpen(): boolean {
    const dropdown = document.querySelector(".rc-picker-dropdown");
    return !!dropdown && !dropdown.classList.contains("rc-picker-dropdown-hidden");
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

    describe("calendar icon", () => {
        it("renders one leading icon inside each field box, and none trailing the row", () => {
            renderPicker("GDC.time.month");

            const fieldBoxes = Array.from(document.querySelectorAll(".gd-period-range-picker__field"));
            expect(fieldBoxes).toHaveLength(2);
            for (const box of fieldBoxes) {
                const icon = box.querySelector(".gd-icon-calendar");
                expect(icon).toBeInTheDocument();
                expect(box.firstElementChild).toBe(icon);
                expect(icon).toHaveAttribute("aria-hidden", "true");
            }
            // The single row-level suffixIcon this replaced would land outside either field box.
            expect(document.querySelector(".rc-picker-suffix .gd-icon-calendar")).not.toBeInTheDocument();
        });

        it("adds no tab stop - the icon is decorative and the two inputs stay the only focusables", () => {
            renderPicker("GDC.time.month");
            const focusable = document.querySelectorAll(
                '.s-period-range-picker input, .s-period-range-picker button, .s-period-range-picker [tabindex]:not([tabindex="-1"])',
            );
            expect(focusable).toHaveLength(2);
        });
    });

    describe("placeholder", () => {
        it.each(granularities)("shows the same placeholder in both empty fields for %s", (granularity) => {
            renderPicker(granularity, {});
            const [startInput, endInput] = getFields();
            expect(startInput).toHaveAttribute("placeholder", "Type or select");
            expect(endInput).toHaveAttribute("placeholder", "Type or select");
        });
    });

    describe("custom range hint", () => {
        it("should render custom content inside the hint area after the built-in format hint", () => {
            renderPicker(
                "GDC.time.date",
                undefined,
                false,
                undefined,
                undefined,
                <div className="s-custom-range-hint">Custom hint</div>,
            );

            const hintArea = document.querySelector(".gd-period-range-picker__hint");
            expect(hintArea).toBeInTheDocument();
            expect(hintArea!.querySelector(".s-custom-range-hint")).toBeInTheDocument();
            expect(hintArea!.lastElementChild).toHaveClass("s-custom-range-hint");
        });
    });

    describe("format hint worked example", () => {
        const FIXED_RANGE: IPeriodRange = { from: "2026-03-01", to: "2026-05-31" };

        it("shows the Day hint with no worked example", () => {
            renderPicker("GDC.time.date", FIXED_RANGE);
            expect(hintText()).toBe("Date format: YYYY-MM-dd");
        });

        it("adds a worked example to the Week hint", () => {
            renderPicker("GDC.time.week", FIXED_RANGE);
            expect(hintText()).toBe("Date format: W/YYYY (e.g. 13/2026)");
        });

        it("adds a worked example to the Month hint", () => {
            renderPicker("GDC.time.month", FIXED_RANGE);
            expect(hintText()).toBe("Date format: M/YYYY (e.g. 3/2026)");
        });

        it("adds a worked example to the Quarter hint", () => {
            renderPicker("GDC.time.quarter", FIXED_RANGE);
            expect(hintText()).toBe("Date format: Q/YYYY (e.g. Q1/2026)");
        });

        it("adds a worked example to the Year hint", () => {
            renderPicker("GDC.time.year", FIXED_RANGE);
            expect(hintText()).toBe("Date format: YYYY (e.g. 2026)");
        });

        it("shows a Day hint given an ICU-style pattern with year rewritten for display", () => {
            renderPicker("GDC.time.date", FIXED_RANGE, false, undefined, "M/d/y");
            expect(hintText()).toBe("Date format: M/d/YYYY");
        });

        it("shows a Day hint with a quoted literal as the text to type", () => {
            renderPicker("GDC.time.date", FIXED_RANGE, false, undefined, "yyyy-'test'-MM-dd");
            expect(hintText()).toBe("Date format: YYYY-test-MM-dd");
        });
    });

    describe("range preview", () => {
        const getPreview = () => document.querySelector(".s-period-range-picker-preview");

        it("does not render for the Day granularity, where it would repeat the inputs", () => {
            renderPicker(
                "GDC.time.date",
                { from: "2026-03-01", to: "2026-05-31" },
                false,
                undefined,
                "M/d/yyyy",
            );
            expect(getPreview()).not.toBeInTheDocument();
        });

        it.each([
            ["GDC.time.month", { from: "2026-03", to: "2026-05" }, "Preview: 3/1/2026 – 5/31/2026"],
            ["GDC.time.quarter", { from: "2026-1", to: "2026-2" }, "Preview: 1/1/2026 – 6/30/2026"],
            ["GDC.time.year", { from: "2025", to: "2026" }, "Preview: 1/1/2025 – 12/31/2026"],
            ["GDC.time.week", { from: "2026-10", to: "2026-10" }, "Preview: 3/1/2026 – 3/7/2026"],
        ] as const)("renders the day-level range for %s", (granularity, range, expected) => {
            renderPicker(granularity, range, false, undefined, "M/d/yyyy");
            expect(getPreview()).toHaveTextContent(expected);
        });

        it("honors a custom dateFormat", () => {
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "d.M.y");
            expect(getPreview()).toHaveTextContent("Preview: 1.3.2026 – 31.5.2026");
        });

        it.each([
            ["an empty range", {}],
            ["a range with only the start set", { from: "2026-03" }],
            ["a range with only the end set", { to: "2026-05" }],
        ])("keeps the row with a dash placeholder for %s", (_label, range) => {
            renderPicker("GDC.time.month", range, false, undefined, "M/d/yyyy");
            expect(getPreview()).toHaveTextContent("Preview: –");
        });

        it("falls back to the default date format when none is given", () => {
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" });
            expect(getPreview()).toHaveTextContent("Preview: 03/01/2026 – 05/31/2026");
        });

        it("falls back to the placeholder while a field holds unparsable text", () => {
            // `liveValue` keeps the last parsed dates, so an unguarded preview contradicts the error.
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "garbage");
            expect(describedByText(startInput)).toContain("Invalid start month");
            expect(getPreview()).toHaveTextContent("Preview: \u2013");
        });

        it("falls back to the placeholder while the start is after the end", () => {
            // A backwards range can never be applied, so previewing it contradicts the error on the field.
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "9/2026");
            expect(describedByText(startInput)).toContain("end period can't be before the start period");
            expect(getPreview()).toHaveTextContent("Preview: \u2013");
        });

        it("does not keep showing the previous range after the first calendar cell click", () => {
            // The whole reason the preview reads `liveValue` rather than the committed `range`: the picker's
            // onChange bails out on an incomplete round, so a range-sourced preview would still be showing
            // March-May here while the start field already reads "1/2026".
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            expect(getPreview()).toHaveTextContent("Preview: 3/1/2026 – 5/31/2026");
            openPicker();
            clickCell("1/2026");
            expect(getPreview()).not.toHaveTextContent("Preview: 3/1/2026 – 5/31/2026");
        });
    });

    describe("preview announcement", () => {
        const getRegion = () => document.querySelector<HTMLElement>('[role="status"]');
        const getMessages = () => Array.from(getRegion()?.children ?? []).map((child) => child.textContent);
        const getPreview = () => document.querySelector(".s-period-range-picker-preview");
        // Wrapped in `act` so the state update the timer causes is committed, and one `advance` per delay:
        // an announcement's own removal timer is only scheduled by the effect that follows its commit, so a
        // single long jump would schedule it in the past and it would never fire.
        const advance = (ms: number) =>
            act(() => {
                vi.advanceTimersByTime(ms);
            });

        beforeEach(() => {
            vi.useFakeTimers({ shouldAdvanceTime: true });
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("announces the resolved range once typing has stopped", () => {
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            expect(getMessages()).toEqual([]);

            advance(PREVIEW_ANNOUNCEMENT_DELAY);
            expect(getMessages()).toEqual(["Preview: 3/1/2026 – 5/31/2026"]);
        });

        it("empties the region again, so it leaves no duplicate of the visible preview behind", () => {
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            advance(PREVIEW_ANNOUNCEMENT_DELAY);
            advance(ANNOUNCEMENT_LIFETIME);

            expect(getMessages()).toEqual([]);
            // The visible row is unaffected - it is what browse-mode users read.
            expect(getPreview()).toHaveTextContent("Preview: 3/1/2026 – 5/31/2026");
        });

        it("adds each announcement as a new child instead of rewriting the previous one", () => {
            // Load-bearing, not an implementation detail: screen readers were measured to ignore a live
            // region whose only child is rewritten or swapped, and to announce an added child reliably.
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            advance(PREVIEW_ANNOUNCEMENT_DELAY);

            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "1/2026");
            advance(PREVIEW_ANNOUNCEMENT_DELAY);

            expect(getMessages()).toEqual(["Preview: 3/1/2026 – 5/31/2026", "Preview: 1/1/2026 – 5/31/2026"]);
        });

        it("expires each announcement on its own clock rather than on the next one", () => {
            // A second message must not postpone the first one's removal, or the region grows without bound
            // and every announcement is read out longer than the last.
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            advance(PREVIEW_ANNOUNCEMENT_DELAY);

            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "1/2026");
            advance(PREVIEW_ANNOUNCEMENT_DELAY);
            expect(getMessages()).toHaveLength(2);

            // Enough for the first message's lifetime to run out, but not the second's.
            advance(ANNOUNCEMENT_LIFETIME - PREVIEW_ANNOUNCEMENT_DELAY);
            expect(getMessages()).toEqual(["Preview: 1/1/2026 – 5/31/2026"]);
        });

        it("stays silent for the Day granularity, which has no preview to mirror", () => {
            renderPicker(
                "GDC.time.date",
                { from: "2026-03-01", to: "2026-05-31" },
                false,
                undefined,
                "M/d/yyyy",
            );
            advance(PREVIEW_ANNOUNCEMENT_DELAY);

            expect(getMessages()).toEqual([]);
        });

        it("stays silent while a field holds unparsable text", () => {
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" }, false, undefined, "M/d/yyyy");
            advance(PREVIEW_ANNOUNCEMENT_DELAY);
            advance(ANNOUNCEMENT_LIFETIME);

            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "garbage");
            advance(PREVIEW_ANNOUNCEMENT_DELAY);

            expect(getMessages()).toEqual([]);
        });
    });

    describe("granularity mapping", () => {
        it.each(granularities)("opens the %s picker panel", (granularity) => {
            renderPicker(granularity);
            openPicker();
            expect(document.querySelector(`.${PANEL_CLASS_BY_GRANULARITY[granularity]}`)).toBeInTheDocument();
        });
    });

    describe("date-fns format pinning", () => {
        // rc-picker is date-library agnostic and keeps its own field/header/cell format defaults in moment
        // notation. Some tokens (e.g. "D", "Y") are legal in both moment and date-fns notation with
        // different meanings, so a format falling back to one of rc-picker's own defaults doesn't crash -
        // it silently renders the wrong thing under date-fns's interpretation. These cases render each mode
        // and assert the exact visible strings, so any such drift shows up as a content mismatch rather than
        // going unnoticed.
        const FIXED_RANGE: IPeriodRange = { from: "2026-03-01", to: "2026-05-31" };

        afterEach(() => {
            vi.useRealTimers();
        });

        function fieldTexts(): [string, string] {
            const [startInput, endInput] = getFields();
            return [startInput.value, endInput.value];
        }

        function panelHeaderText(): string {
            return document.querySelector(".rc-picker-header-view")?.textContent ?? "";
        }

        it("renders the Day field, header and day-cell in date-fns notation", () => {
            renderPicker("GDC.time.date", FIXED_RANGE);
            expect(fieldTexts()).toEqual(["2026-03-01", "2026-05-31"]);
            openPicker();
            expect(panelHeaderText()).toBe("Mar2026");
            // The important check: rc-picker's own default `cellDateFormat` is the moment token "D", which
            // under date-fns notation means day-of-year, not day-of-month - the 1 March cell would silently
            // read "60" instead of "1" if the format ever fell back to that default unpinned.
            const dayCell = document.querySelector('[title="2026-03-01"] .rc-picker-cell-inner');
            expect(dayCell?.textContent).toBe("1");
        });

        it("renders the Week field and header in date-fns notation", () => {
            renderPicker("GDC.time.week", { from: "2026-10", to: "2026-23" });
            expect(fieldTexts()).toEqual(["10/2026", "23/2026"]);
            openPicker();
            expect(panelHeaderText()).toBe("Mar2026");
        });

        it("renders the Month field and header in date-fns notation", () => {
            renderPicker("GDC.time.month", { from: "2026-03", to: "2026-05" });
            expect(fieldTexts()).toEqual(["3/2026", "5/2026"]);
            openPicker();
            expect(panelHeaderText()).toBe("2026");
        });

        it("renders the Quarter field and header in date-fns notation", () => {
            renderPicker("GDC.time.quarter", { from: "2026-1", to: "2026-2" });
            expect(fieldTexts()).toEqual(["Q1/2026", "Q2/2026"]);
            openPicker();
            expect(panelHeaderText()).toBe("2026");
        });

        it("renders the Year field and header in date-fns notation", () => {
            vi.setSystemTime(new Date(2026, 2, 25));
            renderPicker("GDC.time.year", { from: "2026", to: "2026" });
            expect(fieldTexts()).toEqual(["2026", "2026"]);
            openPicker();
            expect(panelHeaderText()).toBe("2019 – 2033");
        });

        it("pins every locale format field rc-picker's own fillLocale would otherwise default", () => {
            // Mirrors rc-picker@1.12.0's own default list (`@rc-component/picker/lib/hooks/useLocale.js`,
            // `fillLocale`).
            const FIELDS_FILLED_BY_RC_PICKER = [
                "fieldDateTimeFormat",
                "fieldDateFormat",
                "fieldTimeFormat",
                "fieldMonthFormat",
                "fieldYearFormat",
                "fieldWeekFormat",
                "fieldQuarterFormat",
                "yearFormat",
                "cellYearFormat",
                "cellQuarterFormat",
                "cellDateFormat",
            ];
            for (const field of FIELDS_FILLED_BY_RC_PICKER) {
                expect(Object.keys(DATE_FNS_PICKER_FORMATS)).toContain(field);
            }
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
            renderPicker("GDC.time.week");
            openPicker();
            expect(firstHeaderDayName()).toBe("Su");
        });

        it("renders Monday as the first weekday column with an explicit Monday week start", () => {
            renderPicker("GDC.time.week", { from: "2026-10", to: "2026-23" }, false, "Monday");
            openPicker();
            expect(firstHeaderDayName()).toBe("Mo");
        });

        it("renders Monday as the first weekday column of the Day grid with an explicit Monday week start", () => {
            // The Day grid's calendar rows are week rows too, so an explicit weekStart must apply there as
            // well, not just to the Week granularity's own panel.
            renderPicker("GDC.time.date", { from: "2026-03-01", to: "2026-05-31" }, false, "Monday");
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
            expect(values).toEqual(["3/2026", "5/2026"]);
        });
    });

    describe("range selection", () => {
        // rc-picker's RangePicker fires onChange more than once per completed gesture (confirmed empirically —
        // both firings carry the same, correct final value), so assertions key off the LAST call rather than an
        // exact call count, which would just be re-testing rc-picker's own internals.
        it("reports a Month selection as the picked months", () => {
            const { onRangeChange } = renderPicker("GDC.time.month");
            openPicker();
            clickCell("1/2026");
            clickCell("6/2026");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-01", to: "2026-06" });
        });

        it("reports a Quarter selection as the picked quarters", () => {
            const { onRangeChange } = renderPicker("GDC.time.quarter");
            openPicker();
            clickCell("Q1/2026");
            clickCell("Q3/2026");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-1", to: "2026-3" });
        });

        it("reports a Year selection as the picked years", () => {
            const { onRangeChange } = renderPicker("GDC.time.year");
            openPicker();
            clickCell("2025");
            clickCell("2027");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2025", to: "2027" });
        });

        it("reports a Week selection as the week literal of the Sunday week containing the clicked day", () => {
            // 2026-03-08 is a Sunday, so the containing week is Mar 8 - Mar 14, the ISO week of its Monday
            const { onRangeChange } = renderPicker("GDC.time.week");
            openPicker();
            clickCell("2026-03-08");
            clickCell("2026-03-08");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-11", to: "2026-11" });
        });

        it("reports a Week selection against an explicitly configured Monday week start", () => {
            // Exercises the synthetic-locale wiring (weekStartDateFnsLocale.ts), not just resolvePeriodBoundaries
            // directly — confirms the picker itself renders/accepts the cloned locale without erroring.
            // 2026-03-08 is a Sunday, so with Monday week start the containing week is Mar 2 - Mar 8.
            const { onRangeChange } = renderPicker(
                "GDC.time.week",
                { from: "2026-10", to: "2026-23" },
                false,
                "Monday",
            );
            openPicker();
            clickCell("2026-03-08");
            clickCell("2026-03-08");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-10", to: "2026-10" });
        });

        it("passes Day selections straight through with no period expansion", () => {
            const { onRangeChange } = renderPicker("GDC.time.date");
            openPicker();
            clickCell("2026-03-02");
            clickCell("2026-03-10");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-03-10" });
        });
    });

    describe("year grid", () => {
        const YEAR_RANGE: IPeriodRange = { from: "2025", to: "2026" };

        beforeEach(() => {
            vi.setSystemTime(new Date(2026, 2, 25));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        function yearPanel(): Element {
            const panel = document.querySelector(".rc-picker-year-panel");
            expect(panel).toBeInTheDocument();
            return panel!;
        }

        function headerText(): string | null | undefined {
            return yearPanel().querySelector(".rc-picker-header-view")?.textContent;
        }

        function clickHeaderButton(selector: string): void {
            const button = yearPanel().querySelector(selector);
            expect(button).toBeInTheDocument();
            fireEvent.click(button!);
        }

        it.each([
            [2019, 2019],
            [2033, 2019],
            [2026, 2019],
            [2018, 2004],
            [1989, 1989],
            [2034, 2034],
        ])("puts %i on the page starting in %i when the current year is 2026", (year, pageStart) => {
            expect(getYearPageStart(year, 2026)).toBe(pageStart);
        });

        it("shows the 15 years of the current year's page in 3 rows of 5", () => {
            renderPicker("GDC.time.year", YEAR_RANGE);
            openPicker();
            expect(headerText()).toBe("2019 – 2033");
            const rows = Array.from(yearPanel().querySelectorAll("tbody tr")).map((row) =>
                Array.from(row.querySelectorAll(".rc-picker-cell")).map((cell) => cell.textContent),
            );
            expect(rows).toEqual([
                ["2019", "2020", "2021", "2022", "2023"],
                ["2024", "2025", "2026", "2027", "2028"],
                ["2029", "2030", "2031", "2032", "2033"],
            ]);
            const outOfViewCells = yearPanel().querySelectorAll(
                ".rc-picker-cell:not(.rc-picker-cell-in-view)",
            );
            expect(outOfViewCells).toHaveLength(0);
        });

        it("renders each year cell once, with no hidden second grid", () => {
            // A start early in its page puts the range picker's second panel, ten years on, on the same page.
            renderPicker("GDC.time.year", { from: "2020", to: "2021" });
            openPicker();
            expect(document.querySelectorAll(".rc-picker-year-panel")).toHaveLength(1);
            expect(document.querySelectorAll('.rc-picker-cell-in-view[title="2025"]')).toHaveLength(1);
        });

        it("shows the 15-year grid in the Day picker's year view", () => {
            renderPicker("GDC.time.date");
            openPicker();
            const yearButton = document.querySelector(".rc-picker-year-btn");
            expect(yearButton).toBeInTheDocument();
            fireEvent.click(yearButton!);
            expect(headerText()).toBe("2019 – 2033");
            expect(yearPanel().querySelectorAll(".rc-picker-cell")).toHaveLength(15);
        });

        it("labels the header buttons for screen readers", () => {
            renderPicker("GDC.time.year", YEAR_RANGE);
            openPicker();
            const label = (selector: string) =>
                yearPanel().querySelector(selector)?.getAttribute("aria-label");
            expect(label(".rc-picker-header-prev-btn")).toBe("Previous 15 years");
            expect(label(".rc-picker-header-next-btn")).toBe("Next 15 years");
        });

        it("pages by 15 years with the arrows", () => {
            renderPicker("GDC.time.year", YEAR_RANGE);
            openPicker();
            clickHeaderButton(".rc-picker-header-prev-btn");
            expect(headerText()).toBe("2004 – 2018");
            clickHeaderButton(".rc-picker-header-next-btn");
            clickHeaderButton(".rc-picker-header-next-btn");
            expect(headerText()).toBe("2034 – 2048");
        });

        it("selects a range whose ends are on different pages", () => {
            const { onRangeChange } = renderPicker("GDC.time.year", YEAR_RANGE);
            openPicker();
            clickCell("2020");
            clickHeaderButton(".rc-picker-header-next-btn");
            expect(headerText()).toBe("2034 – 2048");
            clickCell("2040");
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2020", to: "2040" });
        });

        it("keeps the title as plain text, since decades do not line up with the 15-year pages", () => {
            renderPicker("GDC.time.year", YEAR_RANGE);
            openPicker();
            expect(yearPanel().querySelector(".rc-picker-header-view button")).toBeNull();
        });

        describe("page on open", () => {
            const WIDE_RANGE: IPeriodRange = { from: "2000", to: "2050" };

            // A real focus, so that the click opening the calendar leaves focus in this field.
            function openFromField(input: HTMLInputElement): void {
                act(() => input.focus());
                fireEvent.click(input);
            }

            it("shows the end year when opened from the end field", () => {
                renderPicker("GDC.time.year", WIDE_RANGE);
                openFromField(getFields()[1]);
                expect(headerText()).toBe("2049 – 2063");
            });

            it("shows the start year when opened from the start field", () => {
                renderPicker("GDC.time.year", WIDE_RANGE);
                openFromField(getFields()[0]);
                expect(headerText()).toBe("1989 – 2003");
            });

            it("shows the other field's year when the field it was opened from is empty", () => {
                renderPicker("GDC.time.year", { from: WIDE_RANGE.from, to: undefined });
                openFromField(getFields()[1]);
                expect(headerText()).toBe("1989 – 2003");
            });

            it("shows the current year's page when both fields are empty", () => {
                renderPicker("GDC.time.year", { from: undefined, to: undefined });
                openFromField(getFields()[1]);
                expect(headerText()).toBe("2019 – 2033");
            });

            it("keeps the page when picking the start moves focus to the end field", () => {
                renderPicker("GDC.time.year", WIDE_RANGE);
                openFromField(getFields()[0]);
                clickCell("2001");
                expect(getFields()[1].closest(".rc-picker-input")).toHaveClass("rc-picker-input-active");
                expect(headerText()).toBe("1989 – 2003");
            });

            it("moves to the page of a year typed into the end field", () => {
                renderPicker("GDC.time.year", YEAR_RANGE);
                const [, endInput] = getFields();
                openFromField(endInput);
                typeIntoField(endInput, "2050");
                expect(headerText()).toBe("2049 – 2063");
            });

            it("pages with the arrows from the page it opened on", () => {
                renderPicker("GDC.time.year", WIDE_RANGE);
                openFromField(getFields()[1]);
                clickHeaderButton(".rc-picker-header-prev-btn");
                expect(headerText()).toBe("2034 – 2048");
            });

            it("leaves the month picker's pages to rc-picker", () => {
                renderPicker("GDC.time.month", { from: "2020-01", to: "2030-12" });
                openFromField(getFields()[1]);
                const headers = Array.from(
                    document.querySelectorAll(".rc-picker-month-panel .rc-picker-header-view"),
                ).map((header) => header.textContent);
                expect(headers).toEqual(["2029", "2030"]);
            });
        });
    });

    describe("range highlighting", () => {
        it("shades the cells between an already-selected start and end date when reopened", () => {
            renderPicker("GDC.time.date", { from: "2026-03-02", to: "2026-03-10" });
            openPicker();
            expect(document.querySelector(".rc-picker-cell-range-start")).toBeInTheDocument();
            expect(document.querySelector(".rc-picker-cell-range-end")).toBeInTheDocument();
            expect(document.querySelectorAll(".rc-picker-cell-in-range").length).toBeGreaterThan(0);
        });
    });

    describe("withoutApply", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        it("does not submit after a complete range is selected via calendar clicks - only Apply/Enter do", () => {
            const { submitForm } = renderPicker("GDC.time.month", { from: undefined, to: undefined }, false);
            openPicker();
            clickCell("1/2026");
            clickCell("6/2026");
            vi.runAllTimers();
            expect(submitForm).not.toHaveBeenCalled();
        });

        it("does not submit when withoutApply is true, even on Enter", () => {
            const { submitForm } = renderPicker("GDC.time.date", { from: undefined, to: undefined }, true);
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-10");
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            vi.runAllTimers();
            expect(submitForm).not.toHaveBeenCalled();
        });

        it("defers a submitForm call once a complete range is typed and committed with Enter", () => {
            const { submitForm } = renderPicker("GDC.time.date", { from: undefined, to: undefined }, false);
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-10");
            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            expect(submitForm).not.toHaveBeenCalled();
            vi.runAllTimers();
            expect(submitForm).toHaveBeenCalledTimes(1);
        });
    });

    describe("Enter commits the whole range in INDIVIDUAL mode", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        it("applies the whole range when Enter is pressed on the first field", () => {
            const { onRangeChange, submitForm } = renderPicker("GDC.time.date", {
                from: undefined,
                to: undefined,
            });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-10");
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-03-10" });
            vi.runAllTimers();
            expect(submitForm).toHaveBeenCalledTimes(1);
        });

        it("commits only the first field, without submitting, when Enter is pressed while the second is still empty", () => {
            const { onRangeChange, submitForm } = renderPicker("GDC.time.date", {
                from: undefined,
                to: undefined,
            });
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: undefined });
            vi.runAllTimers();
            expect(submitForm).not.toHaveBeenCalled();
        });

        it("commits only its own field, without submitting, when the other field is unparsable", () => {
            const { onRangeChange, submitForm } = renderPicker("GDC.time.date", {
                from: undefined,
                to: undefined,
            });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "garbage");
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: undefined });
            vi.runAllTimers();
            expect(submitForm).not.toHaveBeenCalled();
        });

        it("commits only its own field, without submitting, when the typed range is reversed (start after end)", () => {
            const { onRangeChange, submitForm } = renderPicker("GDC.time.date", {
                from: undefined,
                to: undefined,
            });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-10");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-01");
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-10", to: undefined });
            expect(onRangeChange).not.toHaveBeenCalledWith({ from: "2026-03-10", to: "2026-03-01" });
            vi.runAllTimers();
            expect(submitForm).not.toHaveBeenCalled();
        });

        it("stays inert on Enter when withoutApply (ALL_AT_ONCE) is true", () => {
            const { onRangeChange, submitForm } = renderPicker(
                "GDC.time.date",
                { from: undefined, to: undefined },
                true,
            );
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-10");
            const callsBeforeEnter = onRangeChange.mock.calls.length;
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            // Tab already committed "start" - blur commits regardless of withoutApply; Enter itself stays inert.
            expect(onRangeChange).toHaveBeenCalledTimes(callsBeforeEnter);
            vi.runAllTimers();
            expect(submitForm).not.toHaveBeenCalled();
        });
    });

    describe("per-field commit on blur (Tab)", () => {
        it("commits only the tabbed-from field, leaving the other side untouched", () => {
            const { onRangeChange } = renderPicker("GDC.time.date", { from: undefined, to: "2026-05-31" });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-05-31" });
        });

        it("does not commit a field left with unparsable text, leaving its previous value in effect", () => {
            const { onRangeChange } = renderPicker("GDC.time.date", { from: "2026-03-01", to: "2026-05-31" });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "garbage");
            tabToNextField(startInput, endInput);
            expect(onRangeChange).not.toHaveBeenCalled();
        });

        it("commits undefined for a cleared field and leaves it empty, rather than reverting it", () => {
            const { onRangeChange } = renderPicker("GDC.time.date", { from: "2026-03-01", to: "2026-05-31" });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "");
            tabToNextField(startInput, endInput);
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: undefined, to: "2026-05-31" });
            expect(startInput.value).toBe("");
        });
    });

    describe("keyboard typing", () => {
        // jsdom has no native <input type="date">-style calendar UI, so typing is exercised directly against
        // the rc-picker <input> elements rather than through openPicker()'s click-driven cell selection.

        it("never shows a calendar panel while typing and tabbing through a full range via keyboard only", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined });
            const [startInput, endInput] = getFields();
            startInput.focus();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-10");
            expect(document.querySelector(".rc-picker-panel-container")).toBeNull();
        });

        it("commits a typed range after Tab-advancing from the start field to the end field", () => {
            const { onRangeChange } = renderPicker("GDC.time.date", { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-10");
            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-03-10" });
        });

        it("treats an apostrophe-quoted literal segment in a custom dateFormat as literal text, not tokens", () => {
            renderPicker(
                "GDC.time.date",
                { from: "2026-03-02", to: "2026-03-02" },
                false,
                undefined,
                "yyyy-'test'-MM-dd",
            );
            const [startInput] = getFields();
            expect(startInput.value).toBe("2026-test-03-02");
        });

        it("accepts typed input that exactly matches a custom dateFormat's own literal text", () => {
            const { onRangeChange } = renderPicker(
                "GDC.time.date",
                { from: undefined, to: undefined },
                false,
                undefined,
                "yyyy-'test'-MM-dd",
            );
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-test-03-02");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-test-03-10");
            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-03-10" });
        });

        it("honors a custom dateFormat when interpreting typed Day input", () => {
            // "dd/MM/yyyy" is day-first: "02/03/2026" means 2 March, not 3 February
            const { onRangeChange } = renderPicker(
                "GDC.time.date",
                { from: undefined, to: undefined },
                false,
                undefined,
                "dd/MM/yyyy",
            );
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "02/03/2026");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "02/03/2026");
            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-03-02" });
        });

        it("falls back to YYYY-MM-DD for the Day picker when no dateFormat is given", () => {
            renderPicker("GDC.time.date");
            const [startInput, endInput] = getFields();
            expect(startInput.value).toBe("2026-03-01");
            expect(endInput.value).toBe("2026-05-31");
            // The hint must agree with what the field itself actually accepts.
            expect(describedByText(startInput)).toContain("YYYY-MM-dd");
        });

        it("flags invalid typed input as aria-invalid and clears it once corrected", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined }, false, undefined, "dd/MM/yyyy");
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "not-a-date");
            expect(startInput).toHaveAttribute("aria-invalid", "true");
            typeIntoField(startInput, "02/03/2026");
            expect(startInput).toHaveAttribute("aria-invalid", "false");
        });

        it("reports a typed Month value in the padded MM/yyyy alternate", () => {
            const { onRangeChange } = renderPicker("GDC.time.month", { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "01/2026");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "06/2026");
            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-01", to: "2026-06" });
        });

        it("shows the Week field without zero-padding, as the design spec and the backend spell it", () => {
            renderPicker("GDC.time.week", { from: "2026-07", to: "2026-07" });
            const [startInput] = getFields();
            expect(startInput.value).toBe("7/2026");
        });

        // rc-picker re-spells anything that parses, right under the caret. Padding every year token is what
        // keeps a partial year from parsing - drop it on any granularity and its rows here start failing.
        it.each([
            ["GDC.time.month", "3/2"],
            ["GDC.time.month", "03/2"],
            ["GDC.time.month", "3/202"],
            ["GDC.time.week", "7/2"],
            ["GDC.time.week", "07/2"],
            ["GDC.time.week", "07/20"],
            ["GDC.time.quarter", "Q1/2"],
            ["GDC.time.quarter", "1/202"],
            ["GDC.time.year", "202"],
        ] as const)(
            "does not re-format a %s field mid-edit, while %s is still half-typed",
            (granularity, typed) => {
                renderPicker(granularity, { from: undefined, to: undefined });
                openPicker();
                const [startInput] = getFields();
                typeIntoField(startInput, typed);
                expect(startInput.value).toBe(typed);
            },
        );

        it("labels a Monday-start week spanning a year boundary using ISO week numbering", () => {
            // Dec 28, 2026 (Monday) - Jan 3, 2027 (Sunday) is a single Monday-start week. Pairing
            // firstWeekContainsDate with a Monday weekStart uses ISO numbering, which puts this week at week 53
            // of 2026 - an unpaired firstWeekContainsDate (inherited from the US-convention base locale) would
            // instead mislabel it week 1 of 2027.
            renderPicker("GDC.time.week", { from: "2026-53", to: "2026-53" }, false, "Monday");
            const [startInput] = getFields();
            expect(startInput.value).toBe("53/2026");
        });

        it("completes a Week field edit correctly once the intended value is finished", async () => {
            const { onRangeChange } = renderPicker("GDC.time.week", {
                from: "2026-14",
                to: "2026-15",
            });
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "1");
            typeIntoField(startInput, "15/2026");
            // Enter alone commits here - no trailing blur: a blur on the same field right after Enter, with
            // no re-render in between (this mock onRangeChange doesn't feed a new `range` prop back), would
            // have the blur handler recompute against the still-stale `range` prop and clobber what Enter
            // just committed.
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            await waitFor(() => {
                expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-15", to: "2026-15" });
            });
        });
    });

    describe("padded and unpadded period entry", () => {
        // Both spellings commit the same range; only the unpadded one is displayed back.
        it.each([
            ["GDC.time.month", "3/2026", "5/2026", { from: "2026-03", to: "2026-05" }],
            ["GDC.time.month", "03/2026", "05/2026", { from: "2026-03", to: "2026-05" }],
            ["GDC.time.week", "7/2026", "8/2026", { from: "2026-07", to: "2026-08" }],
            ["GDC.time.week", "07/2026", "08/2026", { from: "2026-07", to: "2026-08" }],
            ["GDC.time.quarter", "Q1/2026", "Q2/2026", { from: "2026-1", to: "2026-2" }],
            ["GDC.time.quarter", "1/2026", "2/2026", { from: "2026-1", to: "2026-2" }],
            ["GDC.time.year", "2025", "2026", { from: "2025", to: "2026" }],
        ] as const)("commits %s typed as %s - %s", (granularity, from, to, expected) => {
            const { onRangeChange } = renderPicker(granularity, { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, from);
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, to);
            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith(expected);
        });

        it.each([
            ["GDC.time.month", "03/2026", "3/2026"],
            ["GDC.time.week", "07/2026", "7/2026"],
            ["GDC.time.quarter", "1/2026", "Q1/2026"],
        ] as const)(
            "re-displays a %s entry typed as %s in the canonical %s spelling",
            (granularity, typed, displayed) => {
                renderPicker(granularity, { from: undefined, to: undefined });
                openPicker();
                const [startInput] = getFields();
                typeIntoField(startInput, typed);
                expect(startInput.value).toBe(displayed);
            },
        );

        it.each([
            ["GDC.time.month", "13/2026"],
            ["GDC.time.week", "54/2026"],
            ["GDC.time.quarter", "5/2026"],
            // A month spelling in a quarter field must error, not silently commit a different quarter.
            ["GDC.time.quarter", "01/2026"],
        ] as const)("still rejects an invalid %s entry (%s)", (granularity, typed) => {
            renderPicker(granularity, { from: undefined, to: undefined });
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, typed);
            expect(startInput).toHaveAttribute("aria-invalid", "true");
        });
    });

    describe("keyboard: calendar-only Escape/Tab handling (issue #4)", () => {
        it("stops Escape from bubbling out of the field while the calendar is open, closing only the calendar", async () => {
            renderPicker("GDC.time.date");
            openPicker();
            expect(document.querySelector(".rc-picker-panel-container")).toBeInTheDocument();

            const [startInput] = getFields();
            const bubbledKeyDown = vi.fn();
            document.addEventListener("keydown", bubbledKeyDown);
            fireEvent.keyDown(startInput, { key: "Escape", code: "Escape" });
            document.removeEventListener("keydown", bubbledKeyDown);

            await waitFor(() => {
                expect(isCalendarVisuallyOpen()).toBe(false);
            });
            expect(bubbledKeyDown).not.toHaveBeenCalled();
        });

        it("lets Escape bubble normally once the calendar is already closed", () => {
            renderPicker("GDC.time.date");
            const [startInput] = getFields();
            const bubbledKeyDown = vi.fn();
            document.addEventListener("keydown", bubbledKeyDown);
            fireEvent.keyDown(startInput, { key: "Escape", code: "Escape" });
            document.removeEventListener("keydown", bubbledKeyDown);

            expect(bubbledKeyDown).toHaveBeenCalledTimes(1);
        });

        it("stops Tab from bubbling out of the field while the calendar is open", () => {
            renderPicker("GDC.time.date");
            openPicker();
            const [startInput] = getFields();
            const bubbledKeyDown = vi.fn();
            document.addEventListener("keydown", bubbledKeyDown);
            fireEvent.keyDown(startInput, { key: "Tab", code: "Tab" });
            document.removeEventListener("keydown", bubbledKeyDown);

            expect(bubbledKeyDown).not.toHaveBeenCalled();
        });

        it("lets Tab bubble normally once the calendar is already closed", () => {
            renderPicker("GDC.time.date");
            const [startInput] = getFields();
            const bubbledKeyDown = vi.fn();
            document.addEventListener("keydown", bubbledKeyDown);
            fireEvent.keyDown(startInput, { key: "Tab", code: "Tab" });
            document.removeEventListener("keydown", bubbledKeyDown);

            expect(bubbledKeyDown).toHaveBeenCalledTimes(1);
        });
    });

    describe("keyboard: opening the calendar (issue #5)", () => {
        it("opens the calendar on Alt+ArrowDown while it is closed", () => {
            renderPicker("GDC.time.date");
            const [startInput] = getFields();
            expect(document.querySelector(".rc-picker-panel-container")).toBeNull();

            fireEvent.keyDown(startInput, { key: "ArrowDown", code: "ArrowDown", altKey: true });

            expect(document.querySelector(".rc-picker-panel-container")).toBeInTheDocument();
        });

        it("does not open the calendar on Enter - Enter means confirm, not open", () => {
            renderPicker("GDC.time.date");
            const [startInput] = getFields();
            expect(document.querySelector(".rc-picker-panel-container")).toBeNull();

            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });

            expect(document.querySelector(".rc-picker-panel-container")).toBeNull();
        });

        it("does not open the calendar on a plain ArrowDown - it only steps the focused date segment", () => {
            renderPicker("GDC.time.date");
            const [startInput] = getFields();

            fireEvent.keyDown(startInput, { key: "ArrowDown", code: "ArrowDown" });

            expect(document.querySelector(".rc-picker-panel-container")).toBeNull();
        });
    });

    describe("live-typing resilience", () => {
        it("keeps in-progress typed input across a parent re-render with an equal but new range object", () => {
            const { rerenderWithRange } = renderPicker("GDC.time.date", {
                from: "2026-03-01",
                to: "2026-05-31",
            });
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "2026-03-1");

            // A new object with the same from/to values, as AbsoluteDateFilterForm builds on every render.
            rerenderWithRange({ from: "2026-03-01", to: "2026-05-31" });

            expect(getFields()[0].value).toBe("2026-03-1");
        });
    });

    describe("accessibility", () => {
        it.each([
            ["GDC.time.date", "Start date", "End date"],
            ["GDC.time.week", "Start week", "End week"],
            ["GDC.time.month", "Start month", "End month"],
            ["GDC.time.quarter", "Start quarter", "End quarter"],
            ["GDC.time.year", "Start year", "End year"],
        ] as const)(
            "labels the %s fields visibly, as their accessible name",
            (granularity, startLabel, endLabel) => {
                renderPicker(granularity);
                const [startInput, endInput] = getFields();
                expect(screen.getByRole("textbox", { name: startLabel })).toBe(startInput);
                expect(screen.getByRole("textbox", { name: endLabel })).toBe(endInput);
            },
        );

        it("focuses the end field, not the start field, when its label is clicked from outside the picker", () => {
            renderPicker("GDC.time.month", { from: undefined, to: undefined });
            const [startInput, endInput] = getFields();
            const endLabel = screen.getByText("End month");
            // Unlike a browser, the test DOM clicks the control before React sees the label click; cancel it.
            endLabel.addEventListener("click", (e) => e.preventDefault());

            fireEvent.mouseDown(endLabel);
            fireEvent.click(endLabel);
            fireEvent.click(endInput);

            expect(document.activeElement).toBe(endInput);
            expect(startInput).toHaveAttribute("aria-invalid", "false");
        });

        it("marks the start and end fields with a date-range attribute", () => {
            renderPicker("GDC.time.date");
            const [startInput, endInput] = getFields();
            expect(startInput).toHaveAttribute("date-range", "start");
            expect(endInput).toHaveAttribute("date-range", "end");
        });

        it("describes a valid field with the format hint", () => {
            renderPicker("GDC.time.date");
            const [startInput] = getFields();
            expect(startInput).toHaveAttribute("aria-invalid", "false");
            expect(describedByText(startInput)).toBeTruthy();
        });

        it("flags an empty field as invalid only once it is blurred, with an explanatory message", () => {
            // rc-picker reverts an emptied-then-blurred field back to its last valid value (no
            // `preserveInvalidOnBlur`), so this exercises the reachable "never entered" case instead: a fresh
            // range with nothing typed yet.
            renderPicker("GDC.time.date", { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            expect(startInput).toHaveAttribute("aria-invalid", "false");
            tabToNextField(startInput, endInput);
            expect(startInput).toHaveAttribute("aria-invalid", "true");
            expect(describedByText(startInput)).toBeTruthy();
        });

        it("describes an unparseable typed value distinctly from an emptied one", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined }, false, undefined, "dd/MM/yyyy");
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "not-a-date");
            expect(startInput).toHaveAttribute("aria-invalid", "true");
            const invalidMessage = describedByText(startInput);
            expect(invalidMessage).toBeTruthy();

            typeIntoField(startInput, "");
            fireEvent.blur(startInput);
            expect(startInput).toHaveAttribute("aria-invalid", "true");
            const emptyMessage = describedByText(startInput);
            expect(emptyMessage).toBeTruthy();
            expect(emptyMessage).not.toBe(invalidMessage);
        });

        it("flags a start date typed after the end date only on the last-edited field, and Enter commits only that field", () => {
            const { onRangeChange } = renderPicker("GDC.time.date", { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-10");
            tabToNextField(startInput, endInput);
            typeIntoField(endInput, "2026-03-01");

            // Only the last-edited field (end) carries the order error, matching the classic DateRangePicker's
            // single-field behavior - not both fields at once.
            expect(startInput).toHaveAttribute("aria-invalid", "false");
            expect(endInput).toHaveAttribute("aria-invalid", "true");
            expect(describedByText(endInput)).toBeTruthy();

            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: undefined, to: "2026-03-01" });
            expect(onRangeChange).not.toHaveBeenCalledWith({ from: "2026-03-10", to: "2026-03-01" });
        });
    });

    describe("onValidityChange", () => {
        function renderWithValidity(
            range: IPeriodRange = { from: "2026-03-01", to: "2026-05-31" },
            onValidityChange: (isValid: boolean) => void = vi.fn(),
        ) {
            const renderElement = (
                currentOnValidityChange: (isValid: boolean) => void,
                currentRange: IPeriodRange,
            ) =>
                IntlDecorator(
                    <PeriodRangePickerImpl
                        granularity="GDC.time.date"
                        range={currentRange}
                        onRangeChange={vi.fn()}
                        isMobile={false}
                        submitForm={vi.fn()}
                        onValidityChange={currentOnValidityChange}
                    />,
                );
            const { rerender, unmount } = render(renderElement(onValidityChange, range));
            return {
                unmount,
                rerenderWithValidityChange: (fn: (isValid: boolean) => void) =>
                    rerender(renderElement(fn, range)),
            };
        }

        it("starts out valid for a complete initial range", () => {
            const onValidityChange = vi.fn();
            renderWithValidity(undefined, onValidityChange);
            expect(onValidityChange).toHaveBeenLastCalledWith(true);
        });

        it("reports invalid immediately when a field is garbled, before any blur, without touching the other field's typed text", () => {
            const onValidityChange = vi.fn();
            renderWithValidity(undefined, onValidityChange);
            openPicker();
            const [startInput, endInput] = getFields();
            onValidityChange.mockClear();

            typeIntoField(startInput, "garbage");

            expect(onValidityChange).toHaveBeenLastCalledWith(false);
            expect(endInput.value).toBe("2026-05-31");
        });

        it("reports invalid immediately when a field that held a valid value is cleared, before it is blurred", () => {
            const onValidityChange = vi.fn();
            renderWithValidity(undefined, onValidityChange);
            openPicker();
            const [startInput] = getFields();
            onValidityChange.mockClear();

            typeIntoField(startInput, "");

            expect(onValidityChange).toHaveBeenLastCalledWith(false);
        });

        it("reports invalid once a never-entered (always-empty) field is blurred", () => {
            const onValidityChange = vi.fn();
            renderWithValidity({ from: undefined, to: undefined }, onValidityChange);
            // Already invalid from the very first render - isBlank isn't touched-gated, unlike the "empty"
            // error message.
            expect(onValidityChange).toHaveBeenLastCalledWith(false);

            openPicker();
            const [startInput, endInput] = getFields();
            tabToNextField(startInput, endInput);

            expect(onValidityChange).toHaveBeenLastCalledWith(false);
        });

        it("reports valid again once a garbled field is corrected", () => {
            const onValidityChange = vi.fn();
            renderWithValidity(undefined, onValidityChange);
            openPicker();
            const [startInput] = getFields();

            typeIntoField(startInput, "garbage");
            expect(onValidityChange).toHaveBeenLastCalledWith(false);

            typeIntoField(startInput, "2026-03-02");
            expect(onValidityChange).toHaveBeenLastCalledWith(true);
        });

        it("resets to valid once the picker unmounts while a field is still broken", () => {
            const onValidityChange = vi.fn();
            const { unmount } = renderWithValidity(undefined, onValidityChange);
            openPicker();
            const [startInput] = getFields();

            typeIntoField(startInput, "garbage");
            expect(onValidityChange).toHaveBeenLastCalledWith(false);

            unmount();
            expect(onValidityChange).toHaveBeenLastCalledWith(true);
        });

        it("does not treat a mis-ordered range (start after end) as invalid - out of scope", () => {
            const onValidityChange = vi.fn();
            renderWithValidity({ from: "2026-03-10", to: "2026-03-01" }, onValidityChange);
            expect(onValidityChange).toHaveBeenLastCalledWith(true);
        });

        it("keeps reporting correctly after the onValidityChange function identity changes, without looping", () => {
            const firstOnValidityChange = vi.fn();
            const { rerenderWithValidityChange } = renderWithValidity(undefined, firstOnValidityChange);
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "garbage");
            expect(firstOnValidityChange).toHaveBeenLastCalledWith(false);
            const callsBeforeRerender = firstOnValidityChange.mock.calls.length;

            const secondOnValidityChange = vi.fn();
            rerenderWithValidityChange(secondOnValidityChange);

            // The old callback is reset to `true` exactly once (this instance no longer reports through it) ...
            expect(firstOnValidityChange).toHaveBeenLastCalledWith(true);
            expect(firstOnValidityChange.mock.calls.length).toBe(callsBeforeRerender + 1);
            // ...while the new one picks up the current (still-broken) validity, called exactly once - proving
            // the identity change doesn't trigger a report loop.
            expect(secondOnValidityChange).toHaveBeenCalledTimes(1);
            expect(secondOnValidityChange).toHaveBeenLastCalledWith(false);
        });
    });

    describe("multiple instances mounted together", () => {
        function openPickerIn(scope: HTMLElement): void {
            const input = scope.querySelectorAll("input")[0];
            fireEvent.mouseDown(input);
            fireEvent.focus(input);
            fireEvent.click(input);
        }

        function fieldsIn(scope: HTMLElement): [HTMLInputElement, HTMLInputElement] {
            const inputs = Array.from(scope.querySelectorAll<HTMLInputElement>(".rc-picker input"));
            return [inputs[0], inputs[1]];
        }

        it("keeps hint and error ids distinct, with each field's aria-describedby resolving to its own instance", () => {
            const { container } = render(
                IntlDecorator(
                    <>
                        <div data-testid="day-picker">
                            <PeriodRangePickerImpl
                                granularity="GDC.time.date"
                                range={{ from: undefined, to: undefined }}
                                onRangeChange={vi.fn()}
                                isMobile={false}
                                submitForm={vi.fn()}
                            />
                        </div>
                        <div data-testid="month-picker">
                            <PeriodRangePickerImpl
                                granularity="GDC.time.month"
                                range={{ from: undefined, to: undefined }}
                                onRangeChange={vi.fn()}
                                isMobile={false}
                                submitForm={vi.fn()}
                            />
                        </div>
                    </>,
                ),
            );

            const dayContainer = container.querySelector('[data-testid="day-picker"]') as HTMLElement;
            const monthContainer = container.querySelector('[data-testid="month-picker"]') as HTMLElement;

            // Hints: each field must be described by its OWN picker's format, never the sibling's
            const dayHint = dayContainer.querySelector(".gd-period-range-picker__hint")!;
            const monthHint = monthContainer.querySelector(".gd-period-range-picker__hint")!;
            expect(dayHint.id).toBeTruthy();
            expect(monthHint.id).toBeTruthy();
            expect(dayHint.id).not.toBe(monthHint.id);
            expect(dayHint.textContent).toContain("YYYY-MM-dd");
            expect(monthHint.textContent).not.toContain("YYYY-MM-dd");

            const [dayStartInput, dayEndInput] = fieldsIn(dayContainer);
            const [monthStartInput, monthEndInput] = fieldsIn(monthContainer);
            expect(dayStartInput.getAttribute("aria-describedby")).toBe(dayHint.id);
            expect(monthStartInput.getAttribute("aria-describedby")).toBe(monthHint.id);
            expect(describedByText(dayStartInput)).toContain("YYYY-MM-dd");
            expect(describedByText(monthStartInput)).not.toContain("YYYY-MM-dd");

            // Errors: blur each empty start field to trigger the "empty" error state, then confirm the
            // rendered error ids are likewise unique and each field resolves to a node inside its OWN
            // instance's container, not the sibling's.
            openPickerIn(dayContainer);
            openPickerIn(monthContainer);
            tabToNextField(dayStartInput, dayEndInput);
            tabToNextField(monthStartInput, monthEndInput);

            const dayErrorId = dayStartInput.getAttribute("aria-describedby");
            const monthErrorId = monthStartInput.getAttribute("aria-describedby");
            expect(dayErrorId).toBeTruthy();
            expect(monthErrorId).toBeTruthy();
            expect(dayErrorId).not.toBe(monthErrorId);
            expect(dayContainer.contains(document.getElementById(dayErrorId!))).toBe(true);
            expect(monthContainer.contains(document.getElementById(monthErrorId!))).toBe(true);
        });
    });

    // Exercises the error message id lookup directly - the "accessibility" cases above
    // only assert *that* a message is shown, not the exact text nor that it differs correctly by side.
    describe("field error messages", () => {
        it("shows the empty-date message immediately after clearing a field that held a valid value, before any blur", () => {
            // Clearing a previously-filled field is itself an interaction, unlike a field that
            // was never filled, which stays blur-gated.
            renderPicker("GDC.time.date", { from: "2026-03-01", to: "2026-05-31" });
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "");
            expect(describedByText(startInput)).toBe(
                "Error: Start date is empty — enter a valid date to continue.",
            );
        });

        it("shows the empty-date message on the empty, blurred start field", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            tabToNextField(startInput, endInput);
            expect(describedByText(startInput)).toBe(
                "Error: Start date is empty — enter a valid date to continue.",
            );
        });

        it("shows the empty-date message on the empty, blurred end field", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "2026-03-02");
            tabToNextField(startInput, endInput);
            fireEvent.blur(endInput);
            expect(describedByText(endInput)).toBe(
                "Error: End date is empty — enter a valid date to continue.",
            );
        });

        it("shows the invalid-date message with the active format on an unparseable start field", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined }, false, undefined, "dd/MM/yyyy");
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "not-a-date");
            expect(describedByText(startInput)).toBe("Error: Invalid start date — use dd/MM/YYYY format.");
        });

        it("shows the invalid-date message with the active format on an unparseable end field", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined }, false, undefined, "dd/MM/yyyy");
            openPicker();
            const [, endInput] = getFields();
            typeIntoField(endInput, "not-a-date");
            expect(describedByText(endInput)).toBe("Error: Invalid end date — use dd/MM/YYYY format.");
        });

        it("keeps the invalid-date message after blurring a still-garbled start field", () => {
            renderPicker("GDC.time.date", { from: undefined, to: undefined });
            openPicker();
            const [startInput, endInput] = getFields();
            typeIntoField(startInput, "garbage");
            tabToNextField(startInput, endInput);
            expect(describedByText(startInput)).toBe("Error: Invalid start date — use YYYY-MM-dd format.");
        });

        it("shows the order message on the start field when start is edited after the end date", () => {
            renderPicker("GDC.time.date", { from: "2026-03-01", to: "2026-03-05" });
            openPicker();
            const [startInput] = getFields();
            typeIntoField(startInput, "2026-03-10");
            expect(describedByText(startInput)).toBe(
                "Error: The end period can't be before the start period.",
            );
        });

        it("shows the order message on the end field when end is edited before the start date", () => {
            renderPicker("GDC.time.date", { from: "2026-03-10", to: "2026-03-20" });
            openPicker();
            const [, endInput] = getFields();
            fireEvent.focus(endInput);
            typeIntoField(endInput, "2026-03-01");
            expect(describedByText(endInput)).toBe("Error: The end period can't be before the start period.");
        });

        it.each([
            ["GDC.time.week", "week", "W/YYYY", "13/2026"],
            ["GDC.time.month", "month", "M/YYYY", "3/2026"],
            ["GDC.time.quarter", "quarter", "Q/YYYY", "Q1/2026"],
            ["GDC.time.year", "year", "YYYY", "2026"],
        ] as const)(
            "names the %s fields by their unit in the empty and invalid messages",
            (granularity, unit, displayFormat, example) => {
                renderPicker(granularity);
                openPicker();
                const [startInput, endInput] = getFields();

                typeIntoField(startInput, "");
                typeIntoField(endInput, "");
                expect(describedByText(startInput)).toBe(
                    `Error: Start ${unit} is empty — enter a valid ${unit} to continue.`,
                );
                expect(describedByText(endInput)).toBe(
                    `Error: End ${unit} is empty — enter a valid ${unit} to continue.`,
                );

                typeIntoField(startInput, "garbage");
                typeIntoField(endInput, "garbage");
                expect(describedByText(startInput)).toBe(
                    `Error: Invalid start ${unit} — use ${displayFormat} format (e.g. ${example}).`,
                );
                expect(describedByText(endInput)).toBe(
                    `Error: Invalid end ${unit} — use ${displayFormat} format (e.g. ${example}).`,
                );
            },
        );

        it.each(granularities)(
            "shows the worked example in the invalid messages exactly when the %s hint does",
            (granularity) => {
                const workedExample = (text: string | undefined) =>
                    /\(e\.g\. (.+)\)\.?$/.exec(text ?? "")?.[1];
                renderPicker(granularity, { from: undefined, to: undefined });
                openPicker();
                const [startInput, endInput] = getFields();
                const hintExample = workedExample(hintText());

                typeIntoField(startInput, "garbage");
                typeIntoField(endInput, "garbage");
                for (const message of [describedByText(startInput), describedByText(endInput)]) {
                    expect(message).not.toContain("{");
                    expect(workedExample(message)).toBe(hintExample);
                }
            },
        );
    });

    describe("controlled parent round-trip", () => {
        it("keeps the untouched field's text when the other side is committed as undefined", () => {
            renderControlledPicker("GDC.time.date", { from: "2026-03-01", to: "2026-05-31" });
            const [startInput, endInput] = getFields();
            typeIntoField(endInput, "");
            tabToNextField(endInput, startInput);
            expect(startInput.value).toBe("2026-03-01");
            expect(endInput.value).toBe("");
        });

        it("does not discard the untouched field's value when it is later blurred unedited", () => {
            const { onRangeChange } = renderControlledPicker("GDC.time.date", {
                from: "2026-03-01",
                to: "2026-05-31",
            });
            const [startInput, endInput] = getFields();
            typeIntoField(endInput, "");
            tabToNextField(endInput, startInput);
            tabToNextField(startInput, endInput);
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-01", to: undefined });
        });

        it("keeps unparsable text in the field it was typed into, flagged as invalid", () => {
            renderControlledPicker("GDC.time.date", { from: "2026-03-01", to: "2026-05-31" });
            const [startInput, endInput] = getFields();
            typeIntoField(endInput, "garbage");
            tabToNextField(endInput, startInput);
            expect(endInput.value).toBe("garbage");
            expect(endInput.getAttribute("aria-invalid")).toBe("true");
            expect(startInput.value).toBe("2026-03-01");
        });

        it("leaves Enter fully inert in ALL_AT_ONCE - the caret stays put and blur still commits", () => {
            const { onRangeChange, submitForm } = renderControlledPicker(
                "GDC.time.date",
                { from: undefined, to: "2026-05-31" },
                true,
            );
            const [startInput, endInput] = getFields();
            startInput.focus();
            typeIntoField(startInput, "2026-03-02");
            const callsBeforeEnter = onRangeChange.mock.calls.length;
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            expect(document.activeElement).toBe(startInput);
            expect(onRangeChange).toHaveBeenCalledTimes(callsBeforeEnter);
            expect(submitForm).not.toHaveBeenCalled();
            tabToNextField(startInput, endInput);
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03-02", to: "2026-05-31" });
        });

        describe("start picked from the grid, end typed as the same period", () => {
            afterEach(() => {
                vi.useRealTimers();
            });

            it.each([
                ["GDC.time.year", "2026", "2026", "2026", "01/01/2026 – 12/31/2026"],
                ["GDC.time.month", "5/2026", "2026-05", "2026-05", "05/01/2026 – 05/31/2026"],
                ["GDC.time.quarter", "Q2/2026", "2026-2", "2026-2", "04/01/2026 – 06/30/2026"],
            ] as const)(
                "accepts the %s range and applies it on Enter",
                (granularity, period, from, to, preview) => {
                    // A picked date takes its day from the shown page, a typed one is its period's first day.
                    vi.setSystemTime(new Date(2026, 2, 25));
                    const { onRangeChange } = renderControlledPicker(granularity, {
                        from: undefined,
                        to: undefined,
                    });
                    const [startInput, endInput] = getFields();
                    act(() => startInput.focus());
                    fireEvent.click(startInput);
                    clickCell(period);
                    typeIntoField(endInput, period);

                    expect(document.body).not.toHaveTextContent("The end period can't be before");
                    expect(document.querySelector(".s-period-range-picker-preview")).toHaveTextContent(
                        `Preview: ${preview}`,
                    );
                    fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
                    expect(onRangeChange).toHaveBeenLastCalledWith({ from, to });
                },
            );
        });
    });

    describe("clearing a field and picking its period again", () => {
        const PICK_ORDERS = ["click", "hover, press"] as const;

        function getField(side: "start" | "end"): HTMLInputElement {
            const [startInput, endInput] = getFields();
            return side === "start" ? startInput : endInput;
        }

        function clearAndPick(
            side: "start" | "end",
            cellTitle: string,
            order: (typeof PICK_ORDERS)[number],
            { typedText, fromOtherField = false }: { typedText?: string; fromOtherField?: boolean } = {},
        ): void {
            const field = getField(side);
            if (fromOtherField) {
                const otherField = getField(side === "start" ? "end" : "start");
                act(() => otherField.focus());
                fireEvent.click(otherField);
            }
            act(() => field.focus());
            fireEvent.click(field);
            if (typedText !== undefined) {
                typeIntoField(field, typedText);
            }
            typeIntoField(field, "");
            if (order === "hover, press") {
                // A mouse shows the hovered cell in the field before pressing it.
                fireEvent.mouseEnter(document.querySelector(`[title="${cellTitle}"]`)!);
                pressCell(cellTitle);
            } else {
                clickCell(cellTitle);
            }
        }

        async function leavePicker(): Promise<void> {
            act(() => (document.activeElement as HTMLElement).blur());
            await waitFor(() => {
                expect(isCalendarVisuallyOpen()).toBe(false);
            });
        }

        function previewText(): string | undefined {
            return document.querySelector(".s-period-range-picker-preview")?.textContent ?? undefined;
        }

        const committedCases = (
            [
                [
                    "GDC.time.date",
                    { from: "2026-03-02", to: "2026-03-10" },
                    "2026-03-02",
                    "2026-03-10",
                    undefined,
                ],
                [
                    "GDC.time.month",
                    { from: "2026-03", to: "2026-05" },
                    "3/2026",
                    "5/2026",
                    "Preview: 03/01/2026 – 05/31/2026",
                ],
                [
                    "GDC.time.quarter",
                    { from: "2026-1", to: "2026-3" },
                    "Q1/2026",
                    "Q3/2026",
                    "Preview: 01/01/2026 – 09/30/2026",
                ],
                [
                    "GDC.time.year",
                    { from: "2026", to: "2026" },
                    "2026",
                    "2026",
                    "Preview: 01/01/2026 – 12/31/2026",
                ],
            ] as const
        ).flatMap(([granularity, range, startText, endText, preview]) =>
            (["start", "end"] as const).flatMap((side) =>
                PICK_ORDERS.map(
                    (order) =>
                        [
                            granularity,
                            side,
                            order,
                            range,
                            side === "start" ? startText : endText,
                            preview,
                        ] as const,
                ),
            ),
        );

        it.each(committedCases)(
            "%s: restores the committed %s field (%s)",
            async (granularity, side, order, range, text, preview) => {
                const { onRangeChange } = renderControlledPicker(granularity, range);
                const field = getField(side);
                clearAndPick(side, text, order);

                expect(field.value).toBe(text);
                expect(field).toHaveAttribute("aria-invalid", "false");
                expect(describedByText(field)).toBe(hintText());
                expect(previewText()).toBe(preview);
                await leavePicker();
                expect(onRangeChange).toHaveBeenLastCalledWith(range);
            },
        );

        const weekCases = (
            [
                ["start", "2026-03-01", "10/2026"],
                ["start", "2026-03-04", "10/2026"],
                ["end", "2026-03-08", "11/2026"],
                ["end", "2026-03-12", "11/2026"],
            ] as const
        ).flatMap(([side, day, text]) => PICK_ORDERS.map((order) => [side, day, order, text] as const));

        it.each(weekCases)(
            "GDC.time.week: restores the committed %s field picked by its day %s (%s)",
            async (side, day, order, text) => {
                const range = { from: "2026-10", to: "2026-11" };
                const { onRangeChange } = renderControlledPicker("GDC.time.week", range);
                const field = getField(side);
                clearAndPick(side, day, order);

                expect(field.value).toBe(text);
                expect(field).toHaveAttribute("aria-invalid", "false");
                expect(describedByText(field)).toBe(hintText());
                expect(previewText()).toBe("Preview: 03/01/2026 – 03/14/2026");
                await leavePicker();
                expect(onRangeChange).toHaveBeenLastCalledWith(range);
            },
        );

        const typedCases = (
            [
                ["start", { from: undefined, to: "2028" }, "2026"],
                ["end", { from: "2026", to: undefined }, "2028"],
            ] as const
        ).flatMap(([side, range, text]) => PICK_ORDERS.map((order) => [side, order, range, text] as const));

        it.each(typedCases)(
            "restores a typed and uncommitted %s year (%s)",
            async (side, order, range, text) => {
                const { onRangeChange } = renderControlledPicker("GDC.time.year", range);
                const field = getField(side);
                clearAndPick(side, text, order, { typedText: text });

                expect(field.value).toBe(text);
                expect(field).toHaveAttribute("aria-invalid", "false");
                expect(previewText()).toBe("Preview: 01/01/2026 – 12/31/2028");
                await leavePicker();
                expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026", to: "2028" });
            },
        );

        it.each(["start", "end"] as const)(
            "restores the committed %s year when the pick completes a range started in the other field",
            async (side) => {
                const range = { from: "2026", to: "2026" };
                const { onRangeChange } = renderControlledPicker("GDC.time.year", range);
                const field = getField(side);
                clearAndPick(side, "2026", "hover, press", { fromOtherField: true });

                expect(field.value).toBe("2026");
                expect(field).toHaveAttribute("aria-invalid", "false");
                await leavePicker();
                expect(onRangeChange).toHaveBeenLastCalledWith(range);
            },
        );
    });

    describe("a period committed while the other field is empty", () => {
        const PICK_CASES = [
            ["GDC.time.date", "2026-03-10", "2026-03-10", "2026-03-10"],
            ["GDC.time.month", "5/2026", "2026-05", "2026-05"],
            ["GDC.time.year", "2026", "2026", "2026"],
        ] as const;

        beforeEach(() => {
            vi.setSystemTime(new Date(2026, 2, 25));
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        function openField(field: HTMLInputElement): void {
            act(() => field.focus());
            fireEvent.click(field);
        }

        async function settle(): Promise<void> {
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50));
            });
        }

        const LEAVE_ACTIONS = {
            Tab: (_startInput: HTMLInputElement, endInput: HTMLInputElement) => {
                fireEvent.keyDown(endInput, { key: "Tab", code: "Tab" });
                act(() => endInput.blur());
            },
            "Shift+Tab": (startInput: HTMLInputElement, endInput: HTMLInputElement) => {
                fireEvent.keyDown(endInput, { key: "Tab", code: "Tab", shiftKey: true });
                act(() => startInput.focus());
            },
            Escape: (_startInput: HTMLInputElement, endInput: HTMLInputElement) => {
                fireEvent.keyDown(endInput, { key: "Escape", code: "Escape" });
            },
        };

        it.each(
            PICK_CASES.flatMap((pickCase) =>
                (Object.keys(LEAVE_ACTIONS) as (keyof typeof LEAVE_ACTIONS)[]).map(
                    (leave) => [pickCase[0], pickCase[1], leave, pickCase[2]] as const,
                ),
            ),
        )(
            "%s: keeps the start %s picked in the calendar after %s out of the empty end field",
            async (granularity, title, leave, from) => {
                const { onRangeChange } = renderControlledPicker(granularity, {
                    from: undefined,
                    to: undefined,
                });
                const [startInput, endInput] = getFields();
                openField(startInput);
                pressCell(title);

                expect(startInput.value).toBe(title);
                expect(endInput).toHaveAttribute("aria-invalid", "false");
                LEAVE_ACTIONS[leave](startInput, endInput);
                await settle();

                expect(startInput.value).toBe(title);
                expect(startInput).toHaveAttribute("aria-invalid", "false");
                expect(onRangeChange).toHaveBeenLastCalledWith({ from, to: undefined });
            },
        );

        it.each(PICK_CASES)(
            "%s: keeps the end %s picked in the calendar after leaving the empty start field",
            async (granularity, title, _from, to) => {
                const { onRangeChange } = renderControlledPicker(granularity, {
                    from: undefined,
                    to: undefined,
                });
                const [startInput, endInput] = getFields();
                openField(endInput);
                pressCell(title);
                act(() => (document.activeElement as HTMLElement).blur());
                await settle();

                expect(endInput.value).toBe(title);
                expect(onRangeChange).toHaveBeenLastCalledWith({ from: undefined, to });
                expect(startInput.value).toBe("");
            },
        );

        it("commits the whole range when both periods are picked in the calendar", async () => {
            const { onRangeChange } = renderControlledPicker("GDC.time.month", {
                from: undefined,
                to: undefined,
            });
            const [startInput] = getFields();
            openField(startInput);
            pressCell("3/2026");
            pressCell("5/2026");
            await settle();

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03", to: "2026-05" });
        });

        it("commits the whole range when the start is picked and the end typed", async () => {
            const { onRangeChange } = renderControlledPicker("GDC.time.month", {
                from: undefined,
                to: undefined,
            });
            const [startInput, endInput] = getFields();
            openField(startInput);
            pressCell("3/2026");
            typeIntoField(endInput, "5/2026");
            fireEvent.keyDown(endInput, { key: "Tab", code: "Tab" });
            act(() => endInput.blur());
            await settle();

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-03", to: "2026-05" });
        });

        it("keeps focus in the field when the calendar is pressed", () => {
            renderControlledPicker("GDC.time.year", { from: undefined, to: undefined });
            const [startInput] = getFields();
            openField(startInput);

            expect(fireEvent.mouseDown(document.querySelector('[title="2026"] .rc-picker-cell-inner')!)).toBe(
                false,
            );
            expect(fireEvent.mouseDown(document.querySelector(".rc-picker-header-prev-btn")!)).toBe(false);
            expect(fireEvent.mouseDown(startInput)).toBe(true);
            expect(fireEvent.mouseDown(document.querySelector(".gd-period-range-picker__hint")!)).toBe(true);
        });

        it.each([true, false])(
            "commits the start field typed and confirmed with Enter, keeping focus there (calendar open: %s)",
            async (calendarOpen) => {
                const { onRangeChange, submitForm } = renderControlledPicker("GDC.time.month", {
                    from: undefined,
                    to: undefined,
                });
                const [startInput, endInput] = getFields();
                act(() => startInput.focus());
                if (calendarOpen) {
                    fireEvent.click(startInput);
                }
                typeIntoField(startInput, "5/2026");
                fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
                await settle();

                expect(document.activeElement).toBe(startInput);
                expect(isCalendarVisuallyOpen()).toBe(calendarOpen);
                expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-05", to: undefined });
                expect(submitForm).not.toHaveBeenCalled();

                act(() => endInput.focus());
                act(() => endInput.blur());
                await settle();
                expect(startInput.value).toBe("5/2026");
                expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-05", to: undefined });
            },
        );

        it("commits the end field typed and confirmed with Enter while the start is empty", async () => {
            const { onRangeChange, submitForm } = renderControlledPicker("GDC.time.month", {
                from: undefined,
                to: undefined,
            });
            const [, endInput] = getFields();
            openField(endInput);
            typeIntoField(endInput, "5/2026");
            fireEvent.keyDown(endInput, { key: "Enter", code: "Enter" });
            await settle();

            expect(document.activeElement).toBe(endInput);
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: undefined, to: "2026-05" });
            expect(submitForm).not.toHaveBeenCalled();
        });

        it("commits nothing when Enter confirms unparsable text", async () => {
            const { onRangeChange } = renderControlledPicker("GDC.time.month", {
                from: undefined,
                to: undefined,
            });
            const [startInput] = getFields();
            openField(startInput);
            typeIntoField(startInput, "garbage");
            fireEvent.keyDown(startInput, { key: "Enter", code: "Enter" });
            await settle();

            expect(document.activeElement).toBe(startInput);
            expect(startInput).toHaveAttribute("aria-invalid", "true");
            expect(onRangeChange).not.toHaveBeenCalled();
        });
    });
});
