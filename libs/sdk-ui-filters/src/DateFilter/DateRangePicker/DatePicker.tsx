// (C) 2025 GoodData Corporation

import { forwardRef, useState } from "react";
import { IntlShape } from "react-intl";
import { WeekStart } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";
import { DayPicker as DayPickerComponent, DayPickerProps, SelectRangeEventHandler } from "react-day-picker";
import { Locale } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { de } from "date-fns/locale/de";
import { es } from "date-fns/locale/es";
import { fr } from "date-fns/locale/fr";
import { ja } from "date-fns/locale/ja";
import { nl } from "date-fns/locale/nl";
import { pt } from "date-fns/locale/pt";
import { ptBR } from "date-fns/locale/pt-BR";
import { zhCN } from "date-fns/locale/zh-CN";
import { ru } from "date-fns/locale/ru";
import { it } from "date-fns/locale/it";
import { enGB } from "date-fns/locale/en-GB";
import { frCA } from "date-fns/locale/fr-CA";
import { enAU } from "date-fns/locale/en-AU";
import { fi } from "date-fns/locale/fi";
import { tr } from "date-fns/locale/tr";
import { pl } from "date-fns/locale/pl";
import { ko } from "date-fns/locale/ko";

import { mergeDayPickerProps } from "./utils.js";
import { IDateRange } from "./types.js";
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
            mode === "from" ? selectedDateRange.from : selectedDateRange.to,
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
