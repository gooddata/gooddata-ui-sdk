// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { type WeekStart } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import {
    type IPeriodRange,
    PeriodRangePicker,
    type PeriodRangePickerGranularity,
} from "@gooddata/sdk-ui-filters";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import "@gooddata/sdk-ui-filters/styles/css/dateFilter.css";

const wrapperStyle = { width: 400, padding: "1em 1em" };

const initialRangeByGranularity: Record<PeriodRangePickerGranularity, IPeriodRange> = {
    "GDC.time.date": { from: "2026-03-02", to: "2026-03-10" },
    "GDC.time.week_us": { from: "2026-03-01", to: "2026-03-07" },
    "GDC.time.month": { from: "2026-03-01", to: "2026-05-31" },
    "GDC.time.quarter": { from: "2026-01-01", to: "2026-06-30" },
    "GDC.time.year": { from: "2025-01-01", to: "2026-12-31" },
};

function PeriodRangePickerExample({
    granularity,
    weekStart,
    customRangeHint,
    dateFormat,
}: {
    granularity: PeriodRangePickerGranularity;
    weekStart?: WeekStart;
    customRangeHint?: ReactNode;
    dateFormat?: string;
}) {
    const [range, setRange] = useState<IPeriodRange>(initialRangeByGranularity[granularity]);
    return (
        <IntlWrapper locale="en-US">
            <div style={wrapperStyle} className="screenshot-target">
                {/* The active bar's width transitions/settles asynchronously, so a capture of it
                    can flake between runs. Hide it since it's not the subject under test. */}
                <style>{".screenshot-target .rc-picker-active-bar { display: none; }"}</style>
                <PeriodRangePicker
                    granularity={granularity}
                    range={range}
                    onRangeChange={setRange}
                    isMobile={false}
                    submitForm={() => {}}
                    weekStart={weekStart}
                    customRangeHint={customRangeHint}
                    dateFormat={dateFormat}
                />
            </div>
        </IntlWrapper>
    );
}

const openedScreenshot: IStoryParameters["screenshots"] = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    opened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-period-range-picker input",
        delay: { postOperation: 200 },
    },
};

// Same as openedScreenshot, plus an "opened-to" capture: clicking the "to" field must reliably (re)open the
// shared calendar too, not just the "from" field the plain `opened` capture above already exercises. Applied
// only to Day/DayThemed below to keep the visual-regression suite's runtime/baseline-review cost down.
const openedScreenshotWithEndField: IStoryParameters["screenshots"] = {
    ...openedScreenshot,
    "opened-to": {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: '.s-period-range-picker input[date-range="end"]',
        delay: { postOperation: 200 },
    },
};

// rc-picker's field isn't a masked input here (no `format={{ type: "mask" }}` is passed), so a stray
// character just lands in the text and fails the strict parse - flagging the field invalid right away,
// with no blur needed. keyPressSelector only focuses the field, and the calendar opens on click alone,
// so the dropdown stays closed and the error row below the fields stays unobstructed.
const errorScreenshot: IStoryParameters["screenshots"] = {
    error: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        keyPressSelector: {
            selector: '.s-period-range-picker input[date-range="start"]',
            keyPress: "x",
        },
        postInteractionWait: { selector: ".s-absolute-range-error" },
        delay: { postOperation: 300 },
    },
};

export default {
    title: "10 Filters/DateFilter/PeriodRangePicker",
};

export function Day() {
    return <PeriodRangePickerExample granularity="GDC.time.date" />;
}
Day.parameters = {
    kind: "day",
    screenshots: { ...openedScreenshotWithEndField, ...errorScreenshot },
} satisfies IStoryParameters;

export function DayWithCustomHint() {
    return (
        <PeriodRangePickerExample
            granularity="GDC.time.date"
            customRangeHint={<span className="s-custom-range-hint">Custom hint content</span>}
        />
    );
}
DayWithCustomHint.parameters = {
    kind: "day with custom hint",
    screenshots: openedScreenshot,
} satisfies IStoryParameters;

export function Week() {
    return <PeriodRangePickerExample granularity="GDC.time.week_us" />;
}
Week.parameters = { kind: "week", screenshots: openedScreenshot } satisfies IStoryParameters;

export function WeekMondayStart() {
    return <PeriodRangePickerExample granularity="GDC.time.week_us" weekStart="Monday" />;
}
WeekMondayStart.parameters = {
    kind: "week monday start",
    screenshots: openedScreenshot,
} satisfies IStoryParameters;

export function Month() {
    return <PeriodRangePickerExample granularity="GDC.time.month" />;
}
Month.parameters = { kind: "month", screenshots: openedScreenshot } satisfies IStoryParameters;

export function Quarter() {
    return <PeriodRangePickerExample granularity="GDC.time.quarter" />;
}
Quarter.parameters = { kind: "quarter", screenshots: openedScreenshot } satisfies IStoryParameters;

export function Year() {
    return <PeriodRangePickerExample granularity="GDC.time.year" />;
}
Year.parameters = { kind: "year", screenshots: openedScreenshot } satisfies IStoryParameters;

export const DayThemed = () => wrapWithTheme(<PeriodRangePickerExample granularity="GDC.time.date" />);
DayThemed.parameters = {
    kind: "day themed",
    screenshots: { ...openedScreenshotWithEndField, ...errorScreenshot },
} satisfies IStoryParameters;

export const WeekThemed = () => wrapWithTheme(<PeriodRangePickerExample granularity="GDC.time.week_us" />);
WeekThemed.parameters = { kind: "week themed", screenshots: openedScreenshot } satisfies IStoryParameters;

export const WeekMondayStartThemed = () =>
    wrapWithTheme(<PeriodRangePickerExample granularity="GDC.time.week_us" weekStart="Monday" />);
WeekMondayStartThemed.parameters = {
    kind: "week monday start themed",
    screenshots: openedScreenshot,
} satisfies IStoryParameters;

export const MonthThemed = () => wrapWithTheme(<PeriodRangePickerExample granularity="GDC.time.month" />);
MonthThemed.parameters = { kind: "month themed", screenshots: openedScreenshot } satisfies IStoryParameters;

export const QuarterThemed = () => wrapWithTheme(<PeriodRangePickerExample granularity="GDC.time.quarter" />);
QuarterThemed.parameters = {
    kind: "quarter themed",
    screenshots: openedScreenshot,
} satisfies IStoryParameters;

export const YearThemed = () => wrapWithTheme(<PeriodRangePickerExample granularity="GDC.time.year" />);
YearThemed.parameters = { kind: "year themed", screenshots: openedScreenshot } satisfies IStoryParameters;

export function DayWithCustomFormat() {
    return <PeriodRangePickerExample granularity="GDC.time.date" dateFormat="dd/MM/yyyy" />;
}
DayWithCustomFormat.parameters = {
    kind: "day with custom format",
    screenshots: openedScreenshot,
} satisfies IStoryParameters;
