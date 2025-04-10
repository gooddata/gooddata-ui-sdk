// (C) 2007-2025 GoodData Corporation
import React, { useState, useRef, useEffect, useCallback } from "react";
import { DayPickerRangeProps, DateRange, SelectRangeEventHandler } from "react-day-picker";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { WeekStart } from "@gooddata/sdk-model";

import { IExtendedDateFilterErrors } from "../interfaces/index.js";

import { DateRangePickerError } from "./DateRangePickerError.js";
import { StartDateInputField } from "./StartDateInputField.js";
import { EndDateInputField } from "./EndDateInputField.js";
import { DateRangeHint } from "./DateRangeHint.js";
import { DayPicker } from "./DatePicker.js";
import { useErrorValidation } from "./errorValidation.js";
import { ChangeSource, DateParseError } from "./types.js";

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

const DateRangePickerComponent: React.FC<DateRangePickerProps> = ({
    range,
    onRangeChange,
    // errors, // TODO what to do with this? Use onError instead to propagate local errors up?
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
    const {
        errors,
        validateFromField,
        validateToField,
        clearError,
        onFromInputMarkedValid,
        onToInputMarkedValid,
    } = useErrorValidation();

    const dateRangePickerInputFrom = useRef<HTMLInputElement>(null);
    const dateRangePickerInputTo = useRef<HTMLInputElement>(null);
    const dateRangePickerContainer = useRef<HTMLDivElement>(null);

    const handleRangeSelect: SelectRangeEventHandler = (
        _range: DateRange | undefined,
        selectedDate: Date,
    ) => {
        let calculatedFrom: Date;
        let calculatedTo: Date;

        // clear dateError as this function always sets a valid date (later it will be validated for before/after)
        clearError(selectedInput, "dateError");

        if (selectedInput === "from") {
            calculatedFrom = setTimeForDate(selectedDate, inputFromValue);
            calculatedTo = inputToValue;
            validateFromField(calculatedFrom, calculatedTo, "date");
        } else {
            calculatedFrom = inputFromValue;
            calculatedTo = setTimeForDate(selectedDate, inputToValue);
            validateToField(calculatedFrom, calculatedTo, "date");
        }
        setInputFromValue(calculatedFrom);
        setInputToValue(calculatedTo);
        setSelectedRange({ from: calculatedFrom, to: calculatedTo });
        setIsOpen(false);

        onRangeChange({ from: calculatedFrom, to: calculatedTo });
    };

    const handleFromChange = (date: Date, source: ChangeSource, parseError?: DateParseError) => {
        if (date) {
            setInputFromValue(date);
        }
        setSelectedRange((prevRange) => ({ from: date, to: prevRange.to }));
        onRangeChange({ from: date, to: selectedRange.to });

        validateFromField(date, selectedRange.to, source, parseError);
    };

    const handleToChange = (date: Date, source: ChangeSource, parseError?: DateParseError) => {
        if (date) {
            setInputToValue(date);
        }
        setSelectedRange((prevRange) => ({ from: prevRange.from, to: date }));
        onRangeChange({ from: selectedRange.from, to: date });

        validateToField(selectedRange.from, date, source, parseError);
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

    const StartDateField = (
        <StartDateInputField
            ref={dateRangePickerInputFrom}
            value={inputFromValue}
            onKeyDown={onKeyDown}
            onChange={handleFromChange}
            onInputMarkedValid={(date, source) => onFromInputMarkedValid(date, selectedRange.to, source)}
            onInputClick={handleFromDayClick}
            errors={errors.from}
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
            onInputMarkedValid={(date, source) => onToInputMarkedValid(selectedRange.from, date, source)}
            onInputClick={handleToDayClick}
            errors={errors.to}
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

    const mobileErrorId =
        errors?.from.dateError || errors?.from.timeError || errors?.to.dateError || errors?.to.timeError;

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
            {isMobile ? (
                mobileErrorId ? (
                    <DateRangePickerError dateFormat={dateFormat} errorId={mobileErrorId} />
                ) : null
            ) : (
                <DateRangeHint dateFormat={dateFormat} isTimeEnabled={isTimeEnabled} intl={intl} />
            )}
        </>
    );
};

export const DateRangePicker = injectIntl(DateRangePickerComponent);
