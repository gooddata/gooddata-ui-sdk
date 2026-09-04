// (C) 2025-2026 GoodData Corporation

import { forwardRef, useState } from "react";

import {
    DayPicker as DayPickerComponent,
    type DayPickerProps,
    type SelectRangeEventHandler,
} from "react-day-picker";
import { type IntlShape } from "react-intl";

import { type WeekStart } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { type DateRangePosition } from "../interfaces/index.js";
import { convertLocale } from "../utils/dateFnsLocale.js";

import { type IDateRange } from "./types.js";
import { mergeDayPickerProps } from "./utils.js";

const ALIGN_POINTS = [{ align: "bl tl", offset: { x: 0, y: 1 } }];

function convertWeekStart(weekStart: WeekStart): DayPickerProps["weekStartsOn"] {
    switch (weekStart) {
        case "Sunday":
            return 0;
        case "Monday":
            return 1;
        default:
            throw new Error(`Unknown week start ${weekStart}`);
    }
}

export const DayPicker = forwardRef<
    HTMLDivElement,
    {
        mode: DateRangePosition | undefined;
        originalDateRange: IDateRange;
        selectedDateRange: IDateRange;
        alignTo: string;
        calendarClassNames: string;
        onDateRangeSelect: SelectRangeEventHandler;
        dayPickerProps?: DayPickerProps;
        weekStart?: WeekStart;
        renderAsOverlay?: boolean;
        intl: IntlShape;
    }
>(
    (
        {
            mode,
            originalDateRange,
            selectedDateRange,
            onDateRangeSelect,
            dayPickerProps,
            alignTo,
            weekStart,
            renderAsOverlay,
            calendarClassNames,
            intl,
        },
        ref,
    ) => {
        const [currentMonthDate, setCurrentMonthDate] = useState<Date | null>(
            (mode === "from" ? selectedDateRange.from : selectedDateRange.to) ?? null,
        );

        const defaultDayPickerProps: DayPickerProps = {
            mode: "range",
            showOutsideDays: true,
            modifiers: { start: originalDateRange.from, end: originalDateRange.to },
            selected: { from: originalDateRange.from, to: originalDateRange.to },
            locale: convertLocale(intl.locale),
        };

        const dayPickerPropsWithDefaults = mergeDayPickerProps(defaultDayPickerProps, dayPickerProps);

        const DatePicker = (
            <div className="gd-date-range-picker-wrapper" ref={ref}>
                <DayPickerComponent
                    {...dayPickerPropsWithDefaults}
                    mode="range"
                    month={currentMonthDate ?? undefined}
                    onSelect={onDateRangeSelect}
                    selected={selectedDateRange}
                    classNames={{
                        root: calendarClassNames,
                    }}
                    onMonthChange={setCurrentMonthDate}
                    weekStartsOn={convertWeekStart(weekStart ?? "Sunday")}
                />
            </div>
        );

        const OverlayDatePicker = (
            <Overlay
                alignTo={alignTo}
                alignPoints={ALIGN_POINTS}
                closeOnOutsideClick
                closeOnMouseDrag
                closeOnParentScroll
            >
                {DatePicker}
            </Overlay>
        );
        if (renderAsOverlay) {
            return OverlayDatePicker;
        }
        return DatePicker;
    },
);

DayPicker.displayName = "DayPicker";
