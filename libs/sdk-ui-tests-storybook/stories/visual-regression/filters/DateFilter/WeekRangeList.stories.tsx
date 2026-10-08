// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { type WeekStart } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { type IPeriodRange } from "@gooddata/sdk-ui-filters";
import { WeekRangeList } from "@gooddata/sdk-ui-filters/internal";

import {
    type INeobackstopScenarioConfig,
    type IStoryParameters,
    State,
} from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import "@gooddata/sdk-ui-filters/styles/css/dateFilter.css";

// As wide as the list in the date filter dropdown.
const wrapperStyle = { width: 242, padding: "1em 1em" };

const initialRangeByWeekStart: Record<WeekStart, IPeriodRange> = {
    Sunday: { from: "2026-12-27", to: "2027-01-16" },
    Monday: { from: "2026-12-28", to: "2027-01-17" },
};

function WeekRangeListExample({
    weekStart,
    customRangeHint,
    dateFormat,
}: {
    weekStart: WeekStart;
    customRangeHint?: ReactNode;
    dateFormat?: string;
}) {
    const [range, setRange] = useState<IPeriodRange>(initialRangeByWeekStart[weekStart]);
    return (
        <IntlWrapper locale="en-US">
            <div style={wrapperStyle} className="screenshot-target">
                <WeekRangeList
                    range={range}
                    onRangeChange={setRange}
                    weekStart={weekStart}
                    isMobile={false}
                    submitForm={() => {}}
                    customRangeHint={customRangeHint}
                    dateFormat={dateFormat}
                />
            </div>
        </IntlWrapper>
    );
}

const defaultScreenshot: INeobackstopScenarioConfig = {
    readySelector: { selector: ".screenshot-target", state: State.Attached },
};

// The error shows once the jump field loses focus, which the click on the preview causes. The screenshotter
// waits for postInteractionWait before it clicks, so a fixed delay waits for the error instead.
const screenshotsWithError: IStoryParameters["screenshots"] = {
    default: defaultScreenshot,
    error: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        keyPressSelector: { selector: ".s-week-range-list-search input", keyPress: "x" },
        clickSelector: ".s-week-range-list-preview",
        delay: { postOperation: 300 },
    },
};

export default {
    title: "10 Filters/DateFilter/WeekRangeList",
};

export function SundayStart() {
    return <WeekRangeListExample weekStart="Sunday" />;
}
SundayStart.parameters = {
    kind: "sunday start",
    screenshots: screenshotsWithError,
} satisfies IStoryParameters;

export function MondayStart() {
    return <WeekRangeListExample weekStart="Monday" />;
}
MondayStart.parameters = { kind: "monday start", screenshot: defaultScreenshot } satisfies IStoryParameters;

export function WithCustomFormat() {
    return <WeekRangeListExample weekStart="Sunday" dateFormat="dd/MM/yyyy" />;
}
WithCustomFormat.parameters = {
    kind: "with custom format",
    screenshot: defaultScreenshot,
} satisfies IStoryParameters;

export function WithCustomHint() {
    return (
        <WeekRangeListExample
            weekStart="Sunday"
            customRangeHint={<span className="s-custom-range-hint">Custom hint content</span>}
        />
    );
}
WithCustomHint.parameters = {
    kind: "with custom hint",
    screenshot: defaultScreenshot,
} satisfies IStoryParameters;

export const SundayStartThemed = () => wrapWithTheme(<WeekRangeListExample weekStart="Sunday" />);
SundayStartThemed.parameters = {
    kind: "sunday start themed",
    screenshots: screenshotsWithError,
} satisfies IStoryParameters;

export const MondayStartThemed = () => wrapWithTheme(<WeekRangeListExample weekStart="Monday" />);
MondayStartThemed.parameters = {
    kind: "monday start themed",
    screenshot: defaultScreenshot,
} satisfies IStoryParameters;
