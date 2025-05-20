// (C) 2007-2025 GoodData Corporation
import React, { useState, useRef, useEffect, useCallback } from "react";
import { DayPickerRangeProps, DateRange, SelectRangeEventHandler } from "react-day-picker";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { WeekStart } from "@gooddata/sdk-model";

import {
    IExtendedDateFilterErrors,
    IDateFilterOptionChangedDetails,
    DateRangePosition,
    DateParseError,
} from "../interfaces/index.js";

import { StartDateInputField } from "./StartDateInputField.js";
import { EndDateInputField } from "./EndDateInputField.js";
import { DateRangeHint } from "./DateRangeHint.js";
import { DayPicker } from "./DatePicker.js";
import { IDateRange, DATE_INPUT_HINT_ID, TIME_INPUT_HINT_ID } from "./types.js";

export interface IDateRangePickerProps {
    range: IDateRange;
    onRangeChange: (newRange: IDateRange, changeDetails?: IDateFilterOptionChangedDetails) => void;
    errors?: IExtendedDateFilterErrors["absoluteForm"];
    dateFormat?: string;
    dayPickerProps?: DayPickerRangeProps;
    isMobile: boolean;
    isTimeEnabled: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
}

type DateRangePickerProps = IDateRangePickerProps & WrappedComponentProps;

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

const setTimeForDate = (date: Date, time: Date): Date => {
    const result = new Date(date);
    result.setHours(time.getHours());
    result.setMinutes(time.getMinutes());
    return result;
};

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
    const [selectedInput, setSelectedInput] = useState<DateRangePosition | null>(null);

    const dateRangePickerInputFrom = useRef<HTMLInputElement>(null);
    const dateRangePickerInputTo = useRef<HTMLInputElement>(null);
    const dateRangePickerContainer = useRef<HTMLDivElement>(null);

    // Update internal state of inputs to match the current range. This is necessary so the inputs are
    // synchronized when the range was changed from the other set of inputs, i.e., "from" calendar set
    // both "from" and "to". If both inputs were empty, one of them would remain empty even when the calendar
    // set both of them and Date filter knows about both dates from the range.
    useEffect(() => {
        setInputFromValue(range.from);
        setInputToValue(range.to);
    }, [range]);

    const handleRangeSelect: SelectRangeEventHandler = useCallback(
        (_range: DateRange | undefined, selectedDate: Date) => {
            let calculatedFrom: Date;
            let calculatedTo: Date;

            if (selectedInput === "from") {
                calculatedFrom =
                    inputFromValue === undefined
                        ? selectedDate
                        : setTimeForDate(selectedDate, inputFromValue);
                calculatedTo = inputToValue;
            } else {
                calculatedFrom = inputFromValue;
                calculatedTo =
                    inputToValue === undefined ? selectedDate : setTimeForDate(selectedDate, inputToValue);
            }
            setInputFromValue(calculatedFrom);
            setInputToValue(calculatedTo);
            setSelectedRange({ from: calculatedFrom, to: calculatedTo });
            setIsOpen(false);

            onRangeChange({ from: calculatedFrom, to: calculatedTo }, { rangePosition: selectedInput });
        },
        [inputFromValue, inputToValue, onRangeChange, selectedInput],
    );

    const handleFromChange = useCallback(
        (date: Date, parseError?: DateParseError) => {
            if (date) {
                setInputFromValue(date);
            }
            setSelectedRange((prevRange) => ({ from: date, to: prevRange.to }));
            onRangeChange({ from: date, to: selectedRange.to }, { rangePosition: "from", parseError });
        },
        [onRangeChange, selectedRange.to],
    );

    const handleToChange = useCallback(
        (date: Date, parseError?: DateParseError) => {
            if (date) {
                setInputToValue(date);
            }
            setSelectedRange((prevRange) => ({ from: prevRange.from, to: date }));
            onRangeChange({ from: selectedRange.from, to: date }, { rangePosition: "to", parseError });
        },
        [onRangeChange, selectedRange.from],
    );

    const handleFromDayClick = useCallback(() => {
        setSelectedInput("from");
        setIsOpen(true);
    }, []);

    const handleToDayClick = useCallback(() => {
        setSelectedInput("to");
        setIsOpen(true);
    }, []);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape" || e.key === "Tab") {
            setIsOpen(false);
        }
    }, []);

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

    const onFromInputMarkedValid = useCallback(
        (newStartDate: Date, previousEndDate: Date) => {
            onRangeChange({ from: newStartDate, to: previousEndDate }, { rangePosition: "from" });
        },
        [onRangeChange],
    );

    const onToInputMarkedValid = useCallback(
        (previousStartDate: Date, newEndDate: Date) => {
            onRangeChange({ from: previousStartDate, to: newEndDate }, { rangePosition: "to" });
        },
        [onRangeChange],
    );

    const StartDateField = (
        <StartDateInputField
            ref={dateRangePickerInputFrom}
            value={inputFromValue}
            onKeyDown={onKeyDown}
            onChange={handleFromChange}
            onInputMarkedValid={(date) => onFromInputMarkedValid(date, selectedRange.to)}
            onInputClick={handleFromDayClick}
            errors={errors?.from}
            dateFormat={dateFormat}
            isMobile={isMobile}
            isTimeEnabled={isTimeEnabled}
            intl={intl}
        />
    );

    const EndDateField = (
        <EndDateInputField
            ref={dateRangePickerInputTo}
            value={inputToValue}
            onKeyDown={onKeyDown}
            onChange={handleToChange}
            onInputMarkedValid={(date) => onToInputMarkedValid(selectedRange.from, date)}
            onInputClick={handleToDayClick}
            errors={errors?.to}
            dateFormat={dateFormat}
            isMobile={isMobile}
            isTimeEnabled={isTimeEnabled}
            intl={intl}
        />
    );

    const isFromInputDatePickerOpen = selectedInput === "from" && isOpen;
    const isToInputDatePickerOpen = selectedInput === "to" && isOpen;

    const DatePicker = (
        <DayPicker
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
                    {StartDateField}
                    {isFromInputDatePickerOpen ? DatePicker : null}
                    {EndDateField}
                    {isToInputDatePickerOpen ? DatePicker : null}
                </div>
            ) : (
                <>
                    <div className="gd-date-range-picker gd-date-range-row s-date-range-picker">
                        {StartDateField}
                        {EndDateField}
                    </div>
                    {isOpen ? DatePicker : null}
                </>
            )}
            {isMobile ? null : (
                <DateRangeHint
                    dateFormat={dateFormat}
                    isTimeEnabled={isTimeEnabled}
                    dateHintId={DATE_INPUT_HINT_ID}
                    timeHintId={TIME_INPUT_HINT_ID}
                    intl={intl}
                />
            )}
        </>
    );
};

export const DateRangePicker = injectIntl(DateRangePickerComponent);
