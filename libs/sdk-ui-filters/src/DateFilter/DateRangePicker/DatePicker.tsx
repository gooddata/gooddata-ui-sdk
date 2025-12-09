// (C) 2025 GoodData Corporation

import { forwardRef, useState } from "react";

import { Locale } from "date-fns";
import {
    de,
    enAU,
    enGB,
    enUS,
    es,
    fi,
    fr,
    frCA,
    it,
    ja,
    ko,
    nl,
    pl,
    pt,
    ptBR,
    ru,
    sl,
    tr,
    zhCN,
} from "date-fns/locale";
import { DayPicker as DayPickerComponent, DayPickerProps, SelectRangeEventHandler } from "react-day-picker";
import { IntlShape } from "react-intl";

import { WeekStart } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { IDateRange } from "./types.js";
import { mergeDayPickerProps } from "./utils.js";
import { DateRangePosition } from "../interfaces/index.js";

const convertedLocales: Record<string, Locale> = {
    "en-US": enUS,
    "de-DE": de,
    "es-ES": es,
    "fr-FR": fr,
    "ja-JP": ja,
    "nl-NL": nl,
    "pt-BR": ptBR,
    "pt-PT": pt,
    "zh-Hans": zhCN,
    "ru-RU": ru,
    "it-IT": it,
    "es-419": es,
    "en-GB": enGB,
    "fr-CA": frCA,
    "zh-Hant": zhCN,
    "en-AU": enAU,
    "fi-FI": fi,
    "zh-HK": zhCN,
    "tr-TR": tr,
    "pl-PL": pl,
    "ko-KR": ko,
    "sl-SI": sl,
};

const ALIGN_POINTS = [{ align: "bl tl", offset: { x: 0, y: 1 } }];

const convertLocale = (locale: string): Locale => convertedLocales[locale];

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
