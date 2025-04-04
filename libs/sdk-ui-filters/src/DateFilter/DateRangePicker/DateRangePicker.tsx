// (C) 2007-2025 GoodData Corporation
import React, { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import cx from "classnames";
import {
    DayPicker,
    DayPickerRangeProps,
    DateRange,
    SelectRangeEventHandler,
    DayPickerProps,
} from "react-day-picker";
import { injectIntl, WrappedComponentProps, IntlShape } from "react-intl";
import { WeekStart } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { DAY_END_TIME } from "../constants/Platform.js";
import { getLocalizedDateFormat } from "../utils/FormattingUtils.js";

import { mergeDayPickerProps } from "./utils.js";
import { DateRangePickerError } from "./DateRangePickerError.js";
import { IExtendedDateFilterErrors } from "../interfaces/index.js";
import { DateTimePickerWithInt } from "./DateTimePicker.js";

import enUS from "date-fns/locale/en-US/index.js";
import de from "date-fns/locale/de/index.js";
import es from "date-fns/locale/es/index.js";
import fr from "date-fns/locale/fr/index.js";
import ja from "date-fns/locale/ja/index.js";
import nl from "date-fns/locale/nl/index.js";
import pt from "date-fns/locale/pt/index.js";
import ptBR from "date-fns/locale/pt-BR/index.js";
import zhCN from "date-fns/locale/zh-CN/index.js";
import ru from "date-fns/locale/ru/index.js";
import it from "date-fns/locale/it/index.js";
import enGB from "date-fns/locale/en-GB/index.js";
import frCA from "date-fns/locale/fr-CA/index.js";
import enAU from "date-fns/locale/en-AU/index.js";
import fi from "date-fns/locale/fi/index.js";

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
};

const ALIGN_POINTS = [{ align: "bl tl", offset: { x: 0, y: 1 } }];
const DATE_INPUT_HINT_ID = "date-range-picker-date-input-hint";
const TIME_INPUT_HINT_ID = "date-range-picker-time-input-hint";

const convertLocale = (locale: string): Locale => convertedLocales[locale];

export interface IDateRange {
    from: Date;
    to: Date;
}

export interface IDateRangePickerProps {
    range: IDateRange;
    onRangeChange: (newRange: IDateRange) => void;
    errors?: IExtendedDateFilterErrors["absoluteForm"];
    dateFormat?: string;
    dayPickerProps?: DayPickerRangeProps;
    isMobile: boolean;
    isTimeEnabled: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
}

type DateRangePickerProps = IDateRangePickerProps & WrappedComponentProps;

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

const isClickOutsideOfCalendar = (
    event: MouseEvent,
    container: HTMLElement,
    inputFrom: HTMLElement,
    inputTo: HTMLElement,
): boolean => {
    return (
        container &&
        !container.contains(event.target as Node) &&
        inputFrom &&
        !inputFrom.contains(event.target as Node) &&
        inputTo &&
        !inputTo.contains(event.target as Node)
    );
};

const DayPickerComponent = forwardRef<
    HTMLDivElement,
    {
        mode: "from" | "to";
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
                <DayPicker
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

DayPickerComponent.displayName = "DayPickerComponent";

const DateRangeHint: React.FC<{
    dateFormat: string;
    isTimeEnabled: boolean;
    intl: IntlShape;
}> = ({ dateFormat, isTimeEnabled, intl }) => (
    <div className="gd-date-range__hint">
        <div id={DATE_INPUT_HINT_ID}>
            {intl.formatMessage(
                { id: "filters.staticPeriod.dateFormatHint" },
                { format: dateFormat || getLocalizedDateFormat(intl.locale) },
            )}
        </div>
        {isTimeEnabled ? (
            <div id={TIME_INPUT_HINT_ID}>
                {intl.formatMessage({ id: "filters.staticPeriod.timeFormatHint" })}
            </div>
        ) : null}
    </div>
);

interface IInputFieldProps {
    value: Date;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onChange: (date: Date) => void;
    onInputClick: () => void;
    errors?: IExtendedDateFilterErrors["absoluteForm"];
    dateFormat: string;
    isMobile: boolean;
    isTimeEnabled: boolean;
    intl: IntlShape;
}

const FromInputField = forwardRef<HTMLInputElement, IInputFieldProps>(
    (
        { value, onKeyDown, onChange, onInputClick, errors, dateFormat, isMobile, isTimeEnabled, intl },
        ref,
    ) => {
        return (
            <DateTimePickerWithInt
                onKeyDown={onKeyDown}
                ref={ref}
                dateInputLabel={intl.formatMessage({ id: "filters.staticPeriod.dateFrom" })}
                timeInputLabel={intl.formatMessage({ id: "filters.staticPeriod.timeFrom" })}
                placeholderDate={intl.formatMessage({ id: "filters.from" })}
                accessibilityConfig={{
                    dateAriaLabel: intl.formatMessage({ id: "filters.date.accessibility.label.from" }),
                    timeAriaLabel: intl.formatMessage({ id: "filters.time.accessibility.label.from" }),
                    dateInputHintId: DATE_INPUT_HINT_ID,
                    timeInputHintId: TIME_INPUT_HINT_ID,
                }}
                onChange={onChange}
                value={value}
                dateFormat={dateFormat}
                isMobile={isMobile}
                handleDayClick={onInputClick}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-from", "gd-date-range-picker-from")}
                errors={
                    errors?.from
                        ? {
                              dateError: intl.formatMessage(
                                  { id: errors.from },
                                  { format: dateFormat || getLocalizedDateFormat(intl.locale) },
                              ),
                          }
                        : undefined
                }
            />
        );
    },
);
FromInputField.displayName = "FromInputField";

const ToInputField = forwardRef<HTMLInputElement, IInputFieldProps>(
    (
        { value, onKeyDown, onChange, onInputClick, errors, dateFormat, isMobile, isTimeEnabled, intl },
        ref,
    ) => {
        return (
            <DateTimePickerWithInt
                onKeyDown={onKeyDown}
                ref={ref}
                dateInputLabel={intl.formatMessage({ id: "filters.staticPeriod.dateTo" })}
                timeInputLabel={intl.formatMessage({ id: "filters.staticPeriod.timeTo" })}
                placeholderDate={intl.formatMessage({ id: "filters.to" })}
                accessibilityConfig={{
                    dateAriaLabel: intl.formatMessage({ id: "filters.date.accessibility.label.to" }),
                    timeAriaLabel: intl.formatMessage({ id: "filters.time.accessibility.label.to" }),
                    dateInputHintId: DATE_INPUT_HINT_ID,
                    timeInputHintId: TIME_INPUT_HINT_ID,
                }}
                onChange={onChange}
                value={value}
                dateFormat={dateFormat}
                isMobile={isMobile}
                handleDayClick={onInputClick}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-to", "gd-date-range-picker-to")}
                defaultTime={DAY_END_TIME}
                errors={
                    errors?.to
                        ? {
                              dateError: intl.formatMessage(
                                  { id: errors.to },
                                  { format: dateFormat || getLocalizedDateFormat(intl.locale) },
                              ),
                          }
                        : undefined
                }
            />
        );
    },
);
ToInputField.displayName = "ToInputField";

const DateRangePickerComponent: React.FC<DateRangePickerProps> = ({
    range,
    onRangeChange,
    errors,
    dateFormat,
    dayPickerProps,
    intl,
    isMobile,
    isTimeEnabled,
    weekStart = "Sunday",
    shouldOverlayDatePicker = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputFromValue, setInputFromValue] = useState(range.from);
    const [inputToValue, setInputToValue] = useState(range.to);
    const [selectedRange, setSelectedRange] = useState({ from: range.from, to: range.to });
    const [selectedInput, setSelectedInput] = useState<"from" | "to" | null>(null);

    const dateRangePickerInputFrom = useRef<HTMLInputElement>(null);
    const dateRangePickerInputTo = useRef<HTMLInputElement>(null);
    const dateRangePickerContainer = useRef<HTMLDivElement>(null);

    const handleRangeSelect: SelectRangeEventHandler = (
        _range: DateRange | undefined,
        selectedDate: Date,
    ) => {
        let calculatedFrom: Date;
        let calculatedTo: Date;

        if (selectedInput === "from") {
            calculatedFrom = setTimeForDate(selectedDate, inputFromValue);
            calculatedTo = inputToValue;
        } else {
            calculatedFrom = inputFromValue;
            calculatedTo = setTimeForDate(selectedDate, inputToValue);
        }

        setInputFromValue(calculatedFrom);
        setInputToValue(calculatedTo);
        setSelectedRange({ from: calculatedFrom, to: calculatedTo });
        setIsOpen(false);

        onRangeChange({ from: calculatedFrom, to: calculatedTo });
    };

    const handleFromChange = (date: Date) => {
        if (date) {
            setInputFromValue(date);
        }
        setSelectedRange((prevRange) => ({ from: date, to: prevRange.to }));
        onRangeChange({ from: date, to: selectedRange.to });
    };

    const handleToChange = (date: Date) => {
        if (date) {
            setInputToValue(date);
        }
        setSelectedRange((prevRange) => ({ from: prevRange.from, to: date }));
        onRangeChange({ from: selectedRange.from, to: date });
    };

    const handleFromDayClick = () => {
        setSelectedInput("from");
        setIsOpen(true);
    };

    const handleToDayClick = () => {
        setSelectedInput("to");
        setIsOpen(true);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape" || e.key === "Tab") {
            setIsOpen(false);
        }
    };

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            isClickOutsideOfCalendar(
                event,
                dateRangePickerContainer.current,
                dateRangePickerInputFrom.current,
                dateRangePickerInputTo.current,
            )
        ) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    const setTimeForDate = (date: Date, time: Date): Date => {
        const result = new Date(date);
        result.setHours(time.getHours());
        result.setMinutes(time.getMinutes());
        return result;
    };

    const FromField = (
        <FromInputField
            ref={dateRangePickerInputFrom}
            value={inputFromValue}
            onKeyDown={onKeyDown}
            onChange={handleFromChange}
            onInputClick={handleFromDayClick}
            errors={errors}
            dateFormat={dateFormat}
            isMobile={isMobile}
            isTimeEnabled={isTimeEnabled}
            intl={intl}
        />
    );

    const ToField = (
        <ToInputField
            ref={dateRangePickerInputTo}
            value={inputToValue}
            onKeyDown={onKeyDown}
            onChange={handleToChange}
            onInputClick={handleToDayClick}
            errors={errors}
            dateFormat={dateFormat}
            isMobile={isMobile}
            isTimeEnabled={isTimeEnabled}
            intl={intl}
        />
    );

    const isFromInputDatePickerOpen = selectedInput === "from" && isOpen;
    const isToInputDatePickerOpen = selectedInput === "to" && isOpen;

    const DatePicker = (
        <DayPickerComponent
            ref={dateRangePickerContainer}
            mode={selectedInput}
            originalDateRange={selectedRange}
            selectedDateRange={selectedRange}
            onDateRangeSelect={handleRangeSelect}
            alignTo={`.gd-date-range-picker-${isTimeEnabled ? selectedInput : "from"}`}
            calendarClassNames={`gd-date-range-picker-picker s-date-range-calendar-${selectedInput}`}
            dayPickerProps={dayPickerProps}
            weekStart={weekStart}
            renderAsOverlay={shouldOverlayDatePicker}
            intl={intl}
        />
    );

    return (
        <>
            {isTimeEnabled ? (
                <div className="gd-date-range-picker datetime s-date-range-picker">
                    {FromField}
                    {isFromInputDatePickerOpen ? DatePicker : null}
                    {ToField}
                    {isToInputDatePickerOpen ? DatePicker : null}
                </div>
            ) : (
                <>
                    <div className="gd-date-range-picker gd-date-range-row s-date-range-picker">
                        {FromField}
                        {ToField}
                    </div>
                    {isOpen ? DatePicker : null}
                </>
            )}
            {isMobile ? (
                errors?.from || errors?.to ? (
                    <DateRangePickerError dateFormat={dateFormat} errorId={errors?.from || errors?.to} />
                ) : null
            ) : (
                <DateRangeHint dateFormat={dateFormat} isTimeEnabled={isTimeEnabled} intl={intl} />
            )}
        </>
    );
};

export const DateRangePicker = injectIntl(DateRangePickerComponent);
