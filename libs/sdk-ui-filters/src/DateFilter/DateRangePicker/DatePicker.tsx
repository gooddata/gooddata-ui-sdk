// (C) 2025-2026 GoodData Corporation

import {
    type KeyboardEvent,
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

import { format, isSameMonth } from "date-fns";
import {
    type DayButtonProps,
    DayPicker as DayPickerComponent,
    type DayPickerProps,
    type DayProps,
    Day as DefaultDay,
    DayButton as DefaultDayButton,
    type SelectRangeEventHandler,
} from "react-day-picker";
import { type IntlShape } from "react-intl";

import { type WeekStart } from "@gooddata/sdk-model";
import { Overlay, getFocusableElements, isEscapeKey, isTabKey } from "@gooddata/sdk-ui-kit";

import { type DateRangePosition } from "../interfaces/index.js";
import { convertLocale } from "../utils/dateFnsLocale.js";

import { type IDateRange } from "./types.js";
import { isValidDate, mergeDayPickerProps } from "./utils.js";

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

const toDayKey = (date: Date | undefined): string | undefined =>
    date && !isNaN(date.getTime()) ? format(date, "yyyy-MM-dd") : undefined;

/**
 * Key (yyyy-MM-dd) of the date chosen in the input the calendar belongs to (start or end date).
 */
const ChosenDayContext = createContext<string | undefined>(undefined);

/**
 * Day button that marks today with aria-current="date" (WAI-ARIA APG date picker pattern).
 */
function DayButtonWithCurrentDate(props: DayButtonProps) {
    return <DefaultDayButton {...props} aria-current={props.modifiers["today"] ? "date" : undefined} />;
}

/**
 * Grid cell exposing aria-selected only on the date chosen in the related input,
 * the days between start and end date are only highlighted visually.
 */
function DayWithChosenDate(props: DayProps) {
    const chosenDayKey = useContext(ChosenDayContext);
    const isChosen = !props.day.outside && toDayKey(props.day.date) === chosenDayKey;
    return <DefaultDay {...props} aria-selected={isChosen} />;
}

const DAY_PICKER_COMPONENTS: DayPickerProps["components"] = {
    Day: DayWithChosenDate,
    DayButton: DayButtonWithCurrentDate,
};

const getDayButton = (container: HTMLElement, date: Date | undefined): HTMLElement | null => {
    if (!date || isNaN(date.getTime())) {
        return null;
    }
    return container.querySelector<HTMLElement>(
        `[data-day="${format(date, "yyyy-MM-dd")}"]:not([data-outside]) button:not([disabled])`,
    );
};

/**
 * Moves focus into the calendar: to the given date, today or the day that is in the grid's tab order.
 */
const focusCalendarDay = (container: HTMLElement, date: Date | undefined) => {
    const dayButton =
        getDayButton(container, date) ??
        getDayButton(container, new Date()) ??
        container.querySelector<HTMLElement>('[role="grid"] button[tabindex="0"]');
    dayButton?.focus();
};

/**
 * Keeps Tab / Shift+Tab inside the calendar (previous month, next month and the focused day).
 */
const trapTabFocus = (container: HTMLElement, event: KeyboardEvent) => {
    const { focusableElements } = getFocusableElements(container, true);
    const activeElement = document.activeElement as HTMLElement | null;
    const grid = container.querySelector('[role="grid"]');
    // day buttons use roving tabindex, the day that currently has focus represents the grid
    const elements =
        activeElement && grid?.contains(activeElement)
            ? focusableElements.map((element) => (grid.contains(element) ? activeElement : element))
            : focusableElements;
    if (elements.length === 0) {
        return;
    }
    const currentIndex = activeElement ? elements.indexOf(activeElement) : -1;
    const nextIndex = event.shiftKey
        ? (currentIndex - 1 + elements.length) % elements.length
        : (currentIndex + 1) % elements.length;

    event.preventDefault();
    event.stopPropagation();
    elements[nextIndex]?.focus();
};

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
        id?: string;
        ariaLabel?: string;
        /**
         * When true, focus is moved to the selected date (or today) when the calendar opens.
         */
        shouldFocusOnOpen?: boolean;
        /**
         * Called when the user presses Escape inside the calendar.
         */
        onEscape?: () => void;
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
            id,
            ariaLabel,
            shouldFocusOnOpen = false,
            onEscape,
        },
        ref,
    ) => {
        const activeDate = mode === "from" ? selectedDateRange.from : selectedDateRange.to;
        const chosenDayKey = toDayKey(activeDate);
        const [currentMonthDate, setCurrentMonthDate] = useState<Date | null>(activeDate ?? null);

        const containerRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(ref, () => containerRef.current!, []);

        // date to focus once its month is rendered and the overlay is aligned,
        // overlay content is hidden (not focusable) until then
        const pendingFocusRef = useRef<{ date: Date | undefined } | null>(null);

        const focusPendingDay = useCallback(() => {
            const pendingFocus = pendingFocusRef.current;
            const container = containerRef.current;
            if (!pendingFocus || !container) {
                return;
            }
            focusCalendarDay(container, pendingFocus.date);
            if (!renderAsOverlay || container.contains(document.activeElement)) {
                pendingFocusRef.current = null;
            }
        }, [renderAsOverlay]);

        // focus only when keyboard opening is requested, use the date from that render;
        // later date edits must not move focus, so activeDate is intentionally not a dependency
        useEffect(() => {
            pendingFocusRef.current = shouldFocusOnOpen ? { date: activeDate } : null;
            if (!shouldFocusOnOpen) {
                return;
            }
            // the calendar may still show another month (e.g. it stayed open while switching
            // between start and end date), show the month of the date first, focus after it renders
            if (
                isValidDate(activeDate) &&
                !(currentMonthDate && isSameMonth(currentMonthDate, activeDate!))
            ) {
                setCurrentMonthDate(activeDate!);
                return;
            }
            focusPendingDay();
            // oxlint-disable-next-line react-hooks/exhaustive-deps
        }, [shouldFocusOnOpen]);

        useEffect(() => {
            focusPendingDay();
        }, [currentMonthDate, focusPendingDay]);

        const onOverlayAlign = useCallback(() => {
            focusPendingDay();
            pendingFocusRef.current = null;
        }, [focusPendingDay]);

        const onKeyDown = useCallback(
            (event: KeyboardEvent<HTMLDivElement>) => {
                if (isEscapeKey(event)) {
                    // only the calendar closes, the date filter dropdown stays open
                    event.preventDefault();
                    event.stopPropagation();
                    onEscape?.();
                } else if (isTabKey(event) && containerRef.current) {
                    trapTabFocus(containerRef.current, event);
                }
            },
            [onEscape],
        );

        const defaultDayPickerProps: DayPickerProps = {
            mode: "range",
            showOutsideDays: true,
            modifiers: { start: originalDateRange.from, end: originalDateRange.to },
            selected: { from: originalDateRange.from, to: originalDateRange.to },
            locale: convertLocale(intl.locale),
            components: DAY_PICKER_COMPONENTS,
            labels: {
                // today is conveyed by aria-current, the chosen date also by aria-selected of its grid cell
                labelDayButton: (date, modifiers, _options, dateLib) => {
                    const label = dateLib?.format(date, "PPPP") ?? format(date, "PPPP");
                    return !modifiers["outside"] && toDayKey(date) === chosenDayKey
                        ? intl.formatMessage(
                              { id: "filters.date.accessibility.calendar.selectedDay" },
                              { date: label },
                          )
                        : label;
                },
                labelPrevious: () =>
                    intl.formatMessage({ id: "filters.date.accessibility.calendar.previousMonth" }),
                labelNext: () => intl.formatMessage({ id: "filters.date.accessibility.calendar.nextMonth" }),
            },
        };

        const dayPickerPropsWithDefaults = mergeDayPickerProps(defaultDayPickerProps, dayPickerProps);

        const DatePicker = (
            <div
                className="gd-date-range-picker-wrapper"
                ref={containerRef}
                id={id}
                role="dialog"
                aria-label={ariaLabel}
                onKeyDown={onKeyDown}
            >
                <ChosenDayContext.Provider value={chosenDayKey}>
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
                </ChosenDayContext.Provider>
            </div>
        );

        const OverlayDatePicker = (
            <Overlay
                alignTo={alignTo}
                alignPoints={ALIGN_POINTS}
                closeOnOutsideClick
                closeOnMouseDrag
                closeOnParentScroll
                onAlign={onOverlayAlign}
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
