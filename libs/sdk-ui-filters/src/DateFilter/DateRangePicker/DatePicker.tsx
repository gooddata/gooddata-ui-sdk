// (C) 2025 GoodData Corporation

import React, { forwardRef, useState } from "react";

import de from "date-fns/locale/de/index.js";
import enAU from "date-fns/locale/en-AU/index.js";
import enGB from "date-fns/locale/en-GB/index.js";
import enUS from "date-fns/locale/en-US/index.js";
import es from "date-fns/locale/es/index.js";
import fi from "date-fns/locale/fi/index.js";
import fr from "date-fns/locale/fr/index.js";
import frCA from "date-fns/locale/fr-CA/index.js";
import it from "date-fns/locale/it/index.js";
import ja from "date-fns/locale/ja/index.js";
import ko from "date-fns/locale/ko/index.js";
import nl from "date-fns/locale/nl/index.js";
import pl from "date-fns/locale/pl/index.js";
import pt from "date-fns/locale/pt/index.js";
import ptBR from "date-fns/locale/pt-BR/index.js";
import ru from "date-fns/locale/ru/index.js";
import tr from "date-fns/locale/tr/index.js";
import zhCN from "date-fns/locale/zh-CN/index.js";
import {
    DayPicker as DayPickerComponent,
    DayPickerProps,
    DayPickerRangeProps,
    SelectRangeEventHandler,
} from "react-day-picker";
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
        mode: DateRangePosition;
        originalDateRange: IDateRange;
        selectedDateRange: IDateRange;
        alignTo: string;
        calendarClassNames: string;
        onDateRangeSelect: SelectRangeEventHandler;
        dayPickerProps?: DayPickerRangeProps;
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
            mode === "from" ? selectedDateRange.from : selectedDateRange.to,
        );

        const defaultDayPickerProps: DayPickerRangeProps = {
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
                    month={currentMonthDate}
                    onSelect={onDateRangeSelect}
                    selected={selectedDateRange}
                    classNames={{
                        root: calendarClassNames,
                    }}
                    onMonthChange={setCurrentMonthDate}
                    weekStartsOn={convertWeekStart(weekStart)}
                />
            </div>
        );

        const OverlayDatePicker = (
            <Overlay
                alignTo={alignTo}
                alignPoints={ALIGN_POINTS}
                closeOnOutsideClick={true}
                closeOnMouseDrag={true}
                closeOnParentScroll={true}
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
