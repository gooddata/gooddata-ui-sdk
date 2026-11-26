// (C) 2007-2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { type DateRange, type DayPickerProps, type SelectRangeEventHandler } from "react-day-picker";
import { useIntl } from "react-intl";

import { type WeekStart } from "@gooddata/sdk-model";
import { useId } from "@gooddata/sdk-ui-kit";

import { type DateRangePosition } from "../interfaces/index.js";

import { DayPicker } from "./DatePicker.js";
import { DateRangeHint } from "./DateRangeHint.js";
import { EndDateInputField } from "./EndDateInputField.js";
import { StartDateInputField } from "./StartDateInputField.js";
import {
    DATE_INPUT_HINT_ID,
    type IDateRange,
    type IDateTimePickerErrors,
    type ITime,
    TIME_INPUT_HINT_ID,
} from "./types.js";
import { getTimeFromDate, isValidDate, setTimeToDate } from "./utils.js";

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

/**
 * The calendar button belongs to the field of the open calendar, so pressing it must not close
 * (and remount) the calendar. Buttons of the other field still close it.
 */
const isClickOnOwnCalendarButton = (event: MouseEvent, selectedInput: HTMLElement | null): boolean => {
    const button =
        event.target instanceof Element ? event.target.closest(".s-date-range-picker-calendar-button") : null;
    return !!button && !!selectedInput && !!button.parentElement?.contains(selectedInput);
};

const useCalendarPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInput, setSelectedInput] = useState<DateRangePosition | undefined>();
    const [shouldFocusCalendar, setShouldFocusCalendar] = useState(false);

    const startDateInputRef = useRef<HTMLInputElement>(null);
    const endDateInputRef = useRef<HTMLInputElement>(null);
    const calendarPopupRef = useRef<HTMLDivElement>(null);

    const openCalendar = useCallback((input: DateRangePosition, moveFocus: boolean) => {
        setSelectedInput(input);
        setShouldFocusCalendar(moveFocus);
        setIsOpen(true);
    }, []);

    const onStartDateClick = useCallback(() => openCalendar("from", false), [openCalendar]);
    const onEndDateClick = useCallback(() => openCalendar("to", false), [openCalendar]);
    const onStartDateCalendarOpen = useCallback(
        (moveFocus: boolean) => openCalendar("from", moveFocus),
        [openCalendar],
    );
    const onEndDateCalendarOpen = useCallback(
        (moveFocus: boolean) => openCalendar("to", moveFocus),
        [openCalendar],
    );

    const onDateInputKeyDown = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            if (isOpen && (e.key === "Escape" || e.key === "Tab")) {
                setIsOpen(false);
                e.stopPropagation(); // only the calendar closes, the form stays open
            }
        },
        [isOpen],
    );

    // when the calendar has focus, return it to the related date input so that it never lands on <body>
    const closeCalendarPopup = useCallback(() => {
        const calendarHasFocus = !!calendarPopupRef.current?.contains(document.activeElement);
        setIsOpen(false);
        if (calendarHasFocus) {
            const inputRef = selectedInput === "to" ? endDateInputRef : startDateInputRef;
            inputRef.current?.focus();
        }
    }, [selectedInput]);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            const selectedInputRef = selectedInput === "to" ? endDateInputRef : startDateInputRef;
            if (
                isClickOutsideOfCalendar(
                    event,
                    calendarPopupRef.current!,
                    startDateInputRef.current!,
                    endDateInputRef.current!,
                ) &&
                !isClickOnOwnCalendarButton(event, selectedInputRef.current)
            ) {
                setIsOpen(false);
            }
        },
        [selectedInput],
    );

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
        onStartDateCalendarOpen,
        onEndDateCalendarOpen,
        shouldFocusCalendar,
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
    const isStartBeforeEnd = start! <= end!;
    if (!isValidStartDate || !isValidEndDate || isStartBeforeEnd) {
        fieldDateOrderErrorSetter(undefined);
        otherDateOrderFieldSetter(undefined);
        return isValidStartDate && isValidEndDate; // form is valid, both dates defined, in correct order
    }

    const isCausedByTime = start && end ? isSameDay(start, end) : false;
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

// A missing bound starts at the edge of the day, otherwise a date entered into it is dropped for missing time.
const DAY_START: ITime = { hours: 0, minutes: 0, seconds: 0 };
const getDayEnd = (isSecondsEnabled: boolean): ITime => ({
    hours: 23,
    minutes: 59,
    seconds: isSecondsEnabled ? 59 : 0,
});

const useRangeState = (
    range: IDateRange,
    onRangeChange: (range: IDateRange) => void,
    closeCalendarPopup: () => void,
    selectedInput: DateRangePosition | undefined,
    submitForm: () => void,
    isSecondsEnabled: boolean,
) => {
    const [startDate, setStartDate] = useState<Date | undefined>(range.from);
    const [startTime, setStartTime] = useState<ITime | undefined>(
        () => getTimeFromDate(range.from) ?? DAY_START,
    );

    const [endDate, setEndDate] = useState<Date | undefined>(range.to);
    const [endTime, setEndTime] = useState<ITime | undefined>(
        () => getTimeFromDate(range.to) ?? getDayEnd(isSecondsEnabled),
    );

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
            const isFormValid = dateValidator(adjustedStartDate!, adjustedEndDate!);

            // submit form when user pressed Enter and form is valid
            if (isFormValid && !!shouldSubmitForm) {
                // deffer submit to the next render loop, newest values are not propagated to state yet
                setTimeout(submitForm, 0);
            }
        },
        [onRangeChange, startDate, startTime, endDate, endTime, submitForm],
    );

    const onStartDateChange = useCallback(
        (date: Date | undefined, shouldSubmitForm?: boolean) => {
            setStartDate(date);
            updateRangeState({ startDate: date }, validateStartDate, shouldSubmitForm);
        },
        [updateRangeState, validateStartDate],
    );

    const onEndDateChange = useCallback(
        (date: Date | undefined, shouldSubmitForm?: boolean) => {
            setEndDate(date);
            updateRangeState({ endDate: date }, validateEndDate, shouldSubmitForm);
        },
        [updateRangeState, validateEndDate],
    );

    const onStartTimeChange = useCallback(
        (time: ITime | undefined, shouldSubmitForm?: boolean) => {
            setStartTime(time);
            updateRangeState({ startTime: time }, validateStartDate, shouldSubmitForm);
        },
        [updateRangeState, validateStartDate],
    );

    const onEndTimeChange = useCallback(
        (time: ITime | undefined, shouldSubmitForm?: boolean) => {
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
    dayPickerProps?: DayPickerProps;
    isMobile: boolean;
    isTimeEnabled: boolean;
    isSecondsEnabled?: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
    withoutApply?: boolean;
    submitForm: () => void;
    customRangeHint?: ReactNode;
}

export function DateRangePicker({
    range,
    onRangeChange,
    dateFormat,
    dayPickerProps,
    isMobile,
    isTimeEnabled,
    isSecondsEnabled = false,
    weekStart = "Sunday",
    shouldOverlayDatePicker = false,
    withoutApply = false,
    submitForm,
    customRangeHint,
}: IDateRangePickerProps) {
    const intl = useIntl();

    const {
        selectedInput,
        isCalendarPopupOpen,
        onDateInputKeyDown,
        onStartDateClick,
        onEndDateClick,
        onStartDateCalendarOpen,
        onEndDateCalendarOpen,
        shouldFocusCalendar,
        calendarPopupRef,
        startDateInputRef,
        endDateInputRef,
        closeCalendarPopup,
    } = useCalendarPopup();

    const calendarId = useId();

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
    } = useRangeState(range, onRangeChange, closeCalendarPopup, selectedInput, submitForm, isSecondsEnabled);

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
            isSecondsEnabled={isSecondsEnabled}
            errors={startDateTimeErrors}
            intl={intl}
            withoutApply={withoutApply}
            onCalendarOpen={onStartDateCalendarOpen}
            isCalendarOpen={isCalendarPopupOpen && selectedInput === "from"}
            calendarId={calendarId}
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
            isSecondsEnabled={isSecondsEnabled}
            errors={endDateTimeErrors}
            intl={intl}
            onCalendarOpen={onEndDateCalendarOpen}
            isCalendarOpen={isCalendarPopupOpen && selectedInput === "to"}
            calendarId={calendarId}
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
            id={calendarId}
            ariaLabel={intl.formatMessage({
                id:
                    selectedInput === "to"
                        ? "filters.date.accessibility.calendar.to"
                        : "filters.date.accessibility.calendar.from",
            })}
            shouldFocusOnOpen={shouldFocusCalendar}
            onEscape={closeCalendarPopup}
        />
    );

    const HintPanel = isMobile ? null : (
        <DateRangeHint
            dateFormat={dateFormat!}
            isTimeEnabled={isTimeEnabled}
            isSecondsEnabled={isSecondsEnabled}
            dateHintId={DATE_INPUT_HINT_ID}
            timeHintId={TIME_INPUT_HINT_ID}
            customRangeHint={customRangeHint}
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
