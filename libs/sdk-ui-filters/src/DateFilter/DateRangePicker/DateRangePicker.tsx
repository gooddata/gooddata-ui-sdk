// (C) 2007-2025 GoodData Corporation
import React, { useCallback, useEffect, useRef, useState } from "react";

import { DateRange, DayPickerRangeProps, SelectRangeEventHandler } from "react-day-picker";
import { useIntl } from "react-intl";

import { WeekStart } from "@gooddata/sdk-model";

import { DayPicker } from "./DatePicker.js";
import { DateRangeHint } from "./DateRangeHint.js";
import { EndDateInputField } from "./EndDateInputField.js";
import { StartDateInputField } from "./StartDateInputField.js";
import { DATE_INPUT_HINT_ID, IDateRange, IDateTimePickerErrors, ITime, TIME_INPUT_HINT_ID } from "./types.js";
import { getTimeFromDate, isValidDate, setTimeToDate } from "./utils.js";
import { DateRangePosition } from "../interfaces/index.js";

const isClickOutsideOfCalendar = (
    event: MouseEvent,
    container: HTMLElement,
    startDateInput: HTMLElement,
    endDateInput: HTMLElement,
): boolean => {
    return (
        container &&
        !container.contains(event.target as Node) &&
        startDateInput &&
        !startDateInput.contains(event.target as Node) &&
        endDateInput &&
        !endDateInput.contains(event.target as Node)
    );
};

const useCalendarPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInput, setSelectedInput] = useState<DateRangePosition | undefined>();

    const startDateInputRef = useRef<HTMLInputElement>(null);
    const endDateInputRef = useRef<HTMLInputElement>(null);
    const calendarPopupRef = useRef<HTMLDivElement>(null);

    const onStartDateClick = useCallback(() => {
        setSelectedInput("from");
        setIsOpen(true);
    }, []);

    const onEndDateClick = useCallback(() => {
        setSelectedInput("to");
        setIsOpen(true);
    }, []);

    const onDateInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (isOpen && (e.key === "Escape" || e.key === "Tab")) {
                setIsOpen(false);
                e.stopPropagation(); // prevent closing of the dropdown when just the calendar should close
            }
        },
        [isOpen],
    );

    const closeCalendarPopup = useCallback(() => setIsOpen(false), []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            isClickOutsideOfCalendar(
                event,
                calendarPopupRef.current,
                startDateInputRef.current,
                endDateInputRef.current,
            )
        ) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    return {
        selectedInput,
        isCalendarPopupOpen: isOpen,
        onDateInputKeyDown,
        onStartDateClick,
        onEndDateClick,
        calendarPopupRef,
        startDateInputRef,
        endDateInputRef,
        closeCalendarPopup,
    };
};

const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
        !!d1 &&
        !!d2 &&
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

const setStartAfterEndDateError = (
    fieldDateOrderErrorSetter: (errors: IDateTimePickerErrors | undefined) => void,
    otherDateOrderFieldSetter: (errors: IDateTimePickerErrors | undefined) => void,
    start: Date | undefined,
    end: Date | undefined,
) => {
    const isValidStartDate = isValidDate(start);
    const isValidEndDate = isValidDate(end);
    const isStartBeforeEnd = start <= end;
    if (!isValidStartDate || !isValidEndDate || isStartBeforeEnd) {
        fieldDateOrderErrorSetter(undefined);
        otherDateOrderFieldSetter(undefined);
        return isValidStartDate && isValidEndDate; // form is valid, both dates defined, in correct order
    }

    const isCausedByTime = isSameDay(start, end);
    fieldDateOrderErrorSetter({
        isDateOrderError: !isCausedByTime,
        isTimeOrderError: isCausedByTime,
    });
    otherDateOrderFieldSetter(undefined);
    return false; // form is invalid at this point
};

interface INewRangeState {
    startDate?: Date;
    startTime?: ITime;
    endDate?: Date;
    endTime?: ITime;
}

// if property was set on the object, even if it was set to undefined, we want return the value,
// otherwise we want to return default value from function parameter
function getValueOrDefault<K extends keyof INewRangeState, T>(
    state: INewRangeState,
    valueKey: K,
    defaultValue: T,
): T | INewRangeState[K] {
    return Object.prototype.hasOwnProperty.call(state, valueKey) ? state[valueKey] : defaultValue;
}

const useRangeState = (
    range: IDateRange,
    onRangeChange: (range: IDateRange) => void,
    closeCalendarPopup: () => void,
    selectedInput: DateRangePosition | undefined,
    submitForm: () => void,
) => {
    const [startDate, setStartDate] = useState<Date | undefined>(range.from);
    const [startTime, setStartTime] = useState<ITime>(getTimeFromDate(range.from));

    const [endDate, setEndDate] = useState<Date | undefined>(range.to);
    const [endTime, setEndTime] = useState<ITime>(getTimeFromDate(range.to));

    const [startDateTimeErrors, setStartDateTimeErrors] = useState<IDateTimePickerErrors | undefined>();
    const [endDateTimeErrors, setEndDateTimeErrors] = useState<IDateTimePickerErrors | undefined>();

    const validateStartDate = useCallback(
        (startDate: Date, endDate: Date) =>
            setStartAfterEndDateError(setStartDateTimeErrors, setEndDateTimeErrors, startDate, endDate),
        [],
    );

    const validateEndDate = useCallback(
        (startDate: Date, endDate: Date) =>
            setStartAfterEndDateError(setEndDateTimeErrors, setStartDateTimeErrors, startDate, endDate),
        [],
    );

    const updateRangeState = useCallback(
        (
            newState: INewRangeState,
            dateValidator: (startDate: Date, endDate: Date) => boolean,
            shouldSubmitForm?: boolean,
        ) => {
            const adjustedStartDate = setTimeToDate(
                getValueOrDefault(newState, "startDate", startDate),
                getValueOrDefault(newState, "startTime", startTime),
            );
            const adjustedEndDate = setTimeToDate(
                getValueOrDefault(newState, "endDate", endDate),
                getValueOrDefault(newState, "endTime", endTime),
            );
            onRangeChange({ from: adjustedStartDate, to: adjustedEndDate });
            const isFormValid = dateValidator(adjustedStartDate, adjustedEndDate);

            // submit form when user pressed Enter and form is valid
            if (isFormValid && !!shouldSubmitForm) {
                // deffer submit to the next render loop, newest values are not propagated to state yet
                setTimeout(submitForm, 0);
            }
        },
        [onRangeChange, startDate, startTime, endDate, endTime, submitForm],
    );

    const onStartDateChange = useCallback(
        (date: Date, shouldSubmitForm?: boolean) => {
            setStartDate(date);
            updateRangeState({ startDate: date }, validateStartDate, shouldSubmitForm);
        },
        [updateRangeState, validateStartDate],
    );

    const onEndDateChange = useCallback(
        (date: Date, shouldSubmitForm?: boolean) => {
            setEndDate(date);
            updateRangeState({ endDate: date }, validateEndDate, shouldSubmitForm);
        },
        [updateRangeState, validateEndDate],
    );

    const onStartTimeChange = useCallback(
        (time: ITime, shouldSubmitForm?: boolean) => {
            setStartTime(time);
            updateRangeState({ startTime: time }, validateStartDate, shouldSubmitForm);
        },
        [updateRangeState, validateStartDate],
    );

    const onEndTimeChange = useCallback(
        (time: ITime, shouldSubmitForm?: boolean) => {
            setEndTime(time);
            updateRangeState({ endTime: time }, validateEndDate, shouldSubmitForm);
        },
        [updateRangeState, validateEndDate],
    );

    const onCalendarDateSelect: SelectRangeEventHandler = useCallback(
        (_range: DateRange | undefined, selectedDate: Date) => {
            if (selectedInput === "from") {
                onStartDateChange(selectedDate);
            } else {
                onEndDateChange(selectedDate);
            }
            closeCalendarPopup();
        },
        [selectedInput, closeCalendarPopup, onStartDateChange, onEndDateChange],
    );

    return {
        startDate,
        startTime,
        endDate,
        endTime,
        startDateTimeErrors,
        endDateTimeErrors,
        onCalendarDateSelect,
        onStartDateChange,
        onStartTimeChange,
        onEndDateChange,
        onEndTimeChange,
    };
};

export interface IDateRangePickerProps {
    range: IDateRange;
    onRangeChange: (newRange: IDateRange) => void;
    dateFormat?: string;
    dayPickerProps?: DayPickerRangeProps;
    isMobile: boolean;
    isTimeEnabled: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
    withoutApply?: boolean;
    submitForm: () => void;
}

export function DateRangePicker({
    range,
    onRangeChange,
    dateFormat,
    dayPickerProps,
    isMobile,
    isTimeEnabled,
    weekStart = "Sunday",
    shouldOverlayDatePicker = false,
    withoutApply = false,
    submitForm,
}: IDateRangePickerProps) {
    const intl = useIntl();

    const {
        selectedInput,
        isCalendarPopupOpen,
        onDateInputKeyDown,
        onStartDateClick,
        onEndDateClick,
        calendarPopupRef,
        startDateInputRef,
        endDateInputRef,
        closeCalendarPopup,
    } = useCalendarPopup();

    const {
        startDate,
        startTime,
        endDate,
        endTime,
        startDateTimeErrors,
        endDateTimeErrors,
        onCalendarDateSelect,
        onStartDateChange,
        onStartTimeChange,
        onEndDateChange,
        onEndTimeChange,
    } = useRangeState(range, onRangeChange, closeCalendarPopup, selectedInput, submitForm);

    const StartDateField = (
        <StartDateInputField
            ref={startDateInputRef}
            date={startDate}
            time={startTime}
            onDateChange={onStartDateChange}
            onTimeChange={onStartTimeChange}
            onInputClick={onStartDateClick}
            onDateInputKeyDown={onDateInputKeyDown}
            dateFormat={dateFormat}
            isMobile={isMobile}
            isTimeEnabled={isTimeEnabled}
            errors={startDateTimeErrors}
            intl={intl}
            withoutApply={withoutApply}
        />
    );

    const EndDateField = (
        <EndDateInputField
            ref={endDateInputRef}
            date={endDate}
            time={endTime}
            onDateChange={onEndDateChange}
            onTimeChange={onEndTimeChange}
            onInputClick={onEndDateClick}
            onDateInputKeyDown={onDateInputKeyDown}
            dateFormat={dateFormat}
            isMobile={isMobile}
            isTimeEnabled={isTimeEnabled}
            errors={endDateTimeErrors}
            intl={intl}
        />
    );

    const datePickerRange = { from: startDate, to: endDate };
    const DatePicker = (
        <DayPicker
            ref={calendarPopupRef}
            mode={selectedInput}
            originalDateRange={datePickerRange}
            selectedDateRange={datePickerRange}
            onDateRangeSelect={onCalendarDateSelect}
            alignTo={`.gd-date-range-picker-${isTimeEnabled ? selectedInput : "from"}`}
            calendarClassNames={`gd-date-range-picker-picker s-date-range-calendar-${selectedInput}`}
            dayPickerProps={dayPickerProps}
            weekStart={weekStart}
            renderAsOverlay={shouldOverlayDatePicker}
            intl={intl}
        />
    );

    const HintPanel = isMobile ? null : (
        <DateRangeHint
            dateFormat={dateFormat}
            isTimeEnabled={isTimeEnabled}
            dateHintId={DATE_INPUT_HINT_ID}
            timeHintId={TIME_INPUT_HINT_ID}
            intl={intl}
        />
    );

    if (isTimeEnabled) {
        const isFromInputDatePickerOpen = selectedInput === "from" && isCalendarPopupOpen;
        const isToInputDatePickerOpen = selectedInput === "to" && isCalendarPopupOpen;
        return (
            <>
                <div className="gd-date-range-picker datetime s-date-range-picker">
                    {StartDateField}
                    {isFromInputDatePickerOpen ? DatePicker : null}
                    {EndDateField}
                    {isToInputDatePickerOpen ? DatePicker : null}
                </div>
                {HintPanel}
            </>
        );
    }

    return (
        <>
            <div className="gd-date-range-picker gd-date-range-row s-date-range-picker">
                {StartDateField}
                {EndDateField}
            </div>
            {isCalendarPopupOpen ? DatePicker : null}
            {HintPanel}
        </>
    );
}
