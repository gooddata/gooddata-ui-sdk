// (C) 2020-2026 GoodData Corporation

import {
    type ChangeEvent,
    type FocusEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import classNames from "classnames";
import { type Locale, format, isSameDay, isValid, parse } from "date-fns";
import {
    de,
    enAU,
    enGB,
    enUS,
    es,
    fi,
    fr,
    frCA,
    id,
    it,
    ja,
    ko,
    nl,
    pl,
    pt,
    ptBR,
    ru,
    sl,
    th,
    tr,
    uk,
    vi,
    zhCN,
} from "date-fns/locale";
import { debounce } from "lodash-es";
import { type ClassNames, type DayEventHandler, DayPicker, type DayPickerProps } from "react-day-picker";
import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { type WeekStart } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { DEFAULT_DATE_FORMAT } from "../constants/platform.js";
import { type IAccessibilityConfigBase } from "../typings/accessibility.js";
import { type IAlignPoint } from "../typings/positioning.js";
import { elementRegion } from "../utils/domUtilities.js";
import { isEnterKey } from "../utils/events.js";
import { getOptimalAlignment } from "../utils/overlay.js";

const DATEPICKER_OUTSIDE_DAY_SELECTOR = "rdp-outside";

/**
 * @internal
 */
export interface IDatePickerProps {
    accessibilityConfig?: IAccessibilityConfigBase;
    date?: Date; // date value used to initialize date picker
    className?: string; // optional css applied to outer div
    placeholder?: string;
    onChange?: (selectedData: Date) => void; // called when selected date changes
    onBlur?: (selectedDate: string) => void;
    onValidateInput?: (value: string) => void;
    resetOnInvalidValue?: boolean; // reset on invalid input
    size?: string; // optional css class, applied to outer div and input
    tabIndex?: number;
    alignPoints?: IAlignPoint[];
    onAlign?: (align: string) => void;
    locale?: string;
    dateFormat?: string;
    weekStart?: WeekStart;
    onDateInputKeyDown?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
}

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
    "zh-HK": zhCN,
    "en-AU": enAU,
    "fi-FI": fi,
    "tr-TR": tr,
    "pl-PL": pl,
    "ko-KR": ko,
    "sl-SI": sl,
    "id-ID": id,
    "th-TH": th,
    "uk-UA": uk,
    "vi-VN": vi,
};

function formatDate(date: Date, dateFormat: string): string {
    return format(date, dateFormat);
}

function convertLocale(locale: string): Locale {
    return convertedLocales[locale];
}

export function parseDate(str: string, dateFormat: string): Date | undefined {
    try {
        const parsedDate: Date = parse(str, dateFormat, new Date());
        // parse only dates with 4-digit years. this mimics moment.js behavior - it parses only dates above 1900
        // this is to make sure that the picker input is not overwritten in the middle of writing the year with year "0002" when writing 2020.
        //
        // it's also necessary to parse only when the input string fully matches with the desired format
        // to make sure that the picker input is not overwritten in the middle of writing.
        // e.g, let's consider a case where dateFormat is "dd/MM/yyyy" and the DayPickerInput has already been filled with a valid string "13/09/2020",
        // then an user wants to change only the month "13/09/2020" -> "13/11/2020" by removing "09" and typing "11".
        // in such case the parsing should wait until the user completes typing "11" (otherwise if parsing is done right after the first "1" is typed,
        // the cursor automatically moves to the end of the string in the middle of writing, causing a bad experience for the user).
        if (
            isValid(parsedDate) &&
            parsedDate.getFullYear() >= 1000 &&
            str === formatDate(parsedDate, dateFormat)
        ) {
            return parsedDate;
        }
        return undefined;
    } catch {
        return undefined;
    }
}

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

function normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const DEFAULT_ALIGN_POINTS: IAlignPoint[] = [
    { align: "bl tl" },
    { align: "br tr" },
    { align: "tl bl" },
    { align: "tr br" },
];

// evaluated once per module load, mirroring the original static defaultProps
const DEFAULT_DATE = new Date();

function WrappedDatePickerCore({
    accessibilityConfig,
    date: dateProp,
    className = "",
    placeholder = "",
    onChange,
    onBlur,
    onValidateInput,
    resetOnInvalidValue = false,
    size = "",
    tabIndex = 0,
    alignPoints: alignPointsProp,
    onAlign,
    dateFormat: dateFormatProp,
    weekStart: weekStartProp,
    onDateInputKeyDown,
}: IDatePickerProps) {
    const intl = useIntl();

    // these props are nullable at runtime (untyped callers do pass null explicitly), so plain default
    // values are not enough - the class component guarded every usage with `||`, `??` or optional calls
    const date = dateProp || DEFAULT_DATE;
    const alignPoints = alignPointsProp ?? DEFAULT_ALIGN_POINTS;
    const dateFormat = dateFormatProp ?? DEFAULT_DATE_FORMAT;
    const weekStart = weekStartProp ?? "Sunday";

    const rootRef = useRef<HTMLDivElement>(null);
    const datePickerContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const datePickerId = useMemo(() => uuid(), []);

    const [align, setAlign] = useState<string>(alignPoints[0]?.align ?? "bl tl");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => normalizeDate(date));
    const [monthDate, setMonthDate] = useState<Date | undefined>(date);
    const [inputValue, setInputValue] = useState<string>(() => formatDate(date, dateFormat));
    const [isOpen, setIsOpen] = useState(false);

    // resync the derived state whenever the date coming from the props changes
    const [prevDateTime, setPrevDateTime] = useState(date.getTime());
    if (date.getTime() !== prevDateTime) {
        const newlySelectedDate = normalizeDate(date);

        setPrevDateTime(date.getTime());
        setSelectedDate(newlySelectedDate);
        setMonthDate(newlySelectedDate);
        setInputValue(formatDate(newlySelectedDate, dateFormat));
    }

    const alignDatePicker = useCallback(() => {
        const container = datePickerContainerRef.current?.parentElement;

        if (!alignPoints || !container || !rootRef.current) {
            return;
        }

        const optimalAlignment = getOptimalAlignment({
            targetRegion: elementRegion(rootRef.current),
            selfRegion: elementRegion(container),
            alignPoints,
        });

        const { align: optimalAlign } = optimalAlignment.alignment;

        setAlign(optimalAlign);
        onAlign?.(optimalAlign);
    }, [alignPoints, onAlign]);

    // keeps the debounced resize handler and the "just opened" effect stable while still
    // calling the up-to-date alignment logic, the same way the class instance method did
    const alignDatePickerRef = useRef(alignDatePicker);
    // must run before the "just opened" layout effect below, hence useLayoutEffect
    useLayoutEffect(() => {
        alignDatePickerRef.current = alignDatePicker;
    }, [alignDatePicker]);

    const resizeHandler = useMemo(() => debounce(() => alignDatePickerRef.current(), 100), []);

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);

        return () => {
            resizeHandler.cancel();
            window.removeEventListener("resize", resizeHandler);
        };
    }, [resizeHandler]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                datePickerContainerRef.current &&
                !datePickerContainerRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useLayoutEffect(() => {
        if (isOpen) {
            alignDatePickerRef.current();
        }
    }, [isOpen]);

    const handleInputBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            onBlur?.(e.target.value);
        },
        [onBlur],
    );

    const handleInputChanged = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;

            const parsedDate = parseDate(value, dateFormat);

            onValidateInput?.(value);

            setInputValue(value);

            if (parsedDate) {
                setSelectedDate(parsedDate);
                setMonthDate(parsedDate);
                onChange?.(parsedDate);
                return;
            }

            if (resetOnInvalidValue) {
                setMonthDate(selectedDate);
                return;
            }

            setSelectedDate(undefined);
            setMonthDate(undefined);
            // Signal invalid state by passing null
            onChange?.(null as unknown as Date);
        },
        [dateFormat, onChange, onValidateInput, resetOnInvalidValue, selectedDate],
    );

    const handleDayChanged = useCallback(
        (newlySelectedDate: Date) => {
            if (!newlySelectedDate) {
                setIsOpen(false);
                return;
            }

            if (selectedDate && isSameDay(selectedDate, newlySelectedDate)) {
                setIsOpen(false);
                return;
            }

            inputRef.current?.focus();

            onValidateInput?.(formatDate(newlySelectedDate, dateFormat));

            setSelectedDate(newlySelectedDate);
            setMonthDate(newlySelectedDate);
            setInputValue(formatDate(newlySelectedDate, dateFormat));
            setIsOpen(false);

            onChange?.(newlySelectedDate);
        },
        [dateFormat, onChange, onValidateInput, selectedDate],
    );

    const handleMonthChanged = useCallback((month: Date) => {
        inputRef.current?.focus();
        setMonthDate(month);
    }, []);

    const handleCustomDayClick = useCallback<DayEventHandler<ReactMouseEvent>>(
        (day, _modifiers) => {
            // Handle all day clicks, including outside days
            handleDayChanged(day);
        },
        [handleDayChanged],
    );

    const handleKeyDown = useCallback(
        (e: ReactKeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Escape" || e.key === "Tab") {
                setIsOpen(false);
            }

            if (isEnterKey(e)) {
                onDateInputKeyDown?.(e);
            }
        },
        [onDateInputKeyDown],
    );

    const handleWrapperClick = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        const { classList } = e.target as HTMLInputElement;

        /**
         * Prevent default fixes bug BB-332 but prevents in closing other dropdowns (Bug BB-1102)
         * so we want to prevent default only when clicking on outside dates in datepicker
         */
        if (e.target && classList?.contains(DATEPICKER_OUTSIDE_DAY_SELECTOR)) {
            e.preventDefault();
        }
    }, []);

    const handleInputClick = useCallback(() => {
        setIsOpen(true);
    }, []);

    const dayPickerClassNames = useMemo<Partial<ClassNames>>(() => {
        const [inputAnchorPoint, pickerAnchorPoint] = align.split(" ");

        return {
            root: classNames(
                "gd-datepicker-picker",
                "gd-datepicker-OverlayWrapper",
                `gd-datepicker-OverlayWrapper-${inputAnchorPoint}-xx`,
                `gd-datepicker-OverlayWrapper-xx-${pickerAnchorPoint}`,
            ),
        };
    }, [align]);

    const componentClasses = classNames(
        "gd-datepicker",
        className,
        size,
        "gd-datepicker-input",
        isOpen ? "gd-datepicker-focused" : "",
    );

    const inputClasses = classNames("input-text", "small-12", size, `gd-datepicker-input-${datePickerId}`);

    return (
        <div data-testid="datepicker" className={componentClasses} ref={rootRef} onClick={handleWrapperClick}>
            <input
                autoComplete="off"
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                aria-label={
                    accessibilityConfig?.ariaLabel ||
                    intl.formatMessage({ id: "datePicker.accessibility.label" })
                }
                aria-describedby={accessibilityConfig?.ariaDescribedBy}
                onKeyDown={handleKeyDown}
                tabIndex={tabIndex}
                onClick={handleInputClick}
                ref={inputRef}
                value={inputValue}
                className={inputClasses}
                placeholder={placeholder}
                onChange={handleInputChanged}
                onBlur={handleInputBlur}
            />

            {isOpen ? (
                <div id={`datepicker-popup-${datePickerId}`} role="dialog" ref={datePickerContainerRef}>
                    <DayPicker
                        classNames={dayPickerClassNames}
                        locale={convertLocale(intl.locale)}
                        showOutsideDays
                        mode="single"
                        selected={selectedDate}
                        month={monthDate}
                        onMonthChange={handleMonthChanged}
                        weekStartsOn={convertWeekStart(weekStart)}
                        onDayClick={handleCustomDayClick}
                    />
                </div>
            ) : null}
            <span className="gd-datepicker-icon gd-icon-calendar" />
        </div>
    );
}

export const WrappedDatePicker = memo(WrappedDatePickerCore);
WrappedDatePicker.displayName = "WrappedDatePicker";

/**
 * @internal
 */
export const Datepicker = memo(function Datepicker(props: IDatePickerProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <WrappedDatePicker {...props} />
        </IntlWrapper>
    );
});
