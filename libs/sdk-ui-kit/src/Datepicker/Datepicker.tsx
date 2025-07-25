// (C) 2020-2025 GoodData Corporation
import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import debounce from "lodash/debounce.js";
import noop from "lodash/noop.js";
import format from "date-fns/format/index.js";
import parse from "date-fns/parse/index.js";
import isValid from "date-fns/isValid/index.js";
import isSameDay from "date-fns/isSameDay/index.js";
import classNames from "classnames";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { WeekStart } from "@gooddata/sdk-model";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ClassNames, DayPicker, DayPickerProps } from "react-day-picker";

import { IAlignPoint } from "../typings/positioning.js";
import { getOptimalAlignment } from "../utils/overlay.js";
import { elementRegion } from "../utils/domUtilities.js";
import { DEFAULT_DATE_FORMAT } from "../constants/platform.js";

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
import fi from "date-fns/locale/fi/index.js";
import enAU from "date-fns/locale/en-AU/index.js";
import { IAccessibilityConfigBase } from "../typings/accessibility.js";
import { isEnterKey } from "../utils/events.js";
import tr from "date-fns/locale/tr/index.js";
import pl from "date-fns/locale/pl/index.js";
import ko from "date-fns/locale/ko/index.js";

const DATEPICKER_OUTSIDE_DAY_SELECTOR = "rdp-day_outside";

/**
 * @internal
 */
export interface IDatePickerOwnProps {
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
    onDateInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export type DatePickerProps = IDatePickerOwnProps & WrappedComponentProps;

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

export const WrappedDatePicker = memo(function WrappedDatePicker({
    accessibilityConfig,
    alignPoints = [{ align: "bl tl" }, { align: "br tr" }, { align: "tl bl" }, { align: "tr br" }],
    className = "",
    date = new Date(),
    dateFormat = DEFAULT_DATE_FORMAT,
    intl,
    onAlign = noop,
    onBlur = noop,
    onChange = noop,
    onDateInputKeyDown,
    onValidateInput,
    placeholder = "",
    resetOnInvalidValue = false,
    size = "",
    tabIndex = 0,
    weekStart = "Sunday" as const,
}: DatePickerProps) {
    const rootRef = useRef<HTMLElement>();
    const datePickerContainerRef = useRef<HTMLDivElement>();
    const inputRef = useRef<HTMLInputElement>();

    const datePickerId = useRef(uuid()).current;

    const [align, setAlign] = useState(alignPoints[0].align);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
    const [monthDate, setMonthDate] = useState<Date | undefined>(date);
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(formatDate(date || new Date(), dateFormat));

    const normalizeDate = useCallback((date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }, []);

    const updateDate = useCallback(
        (date: Date) => {
            return normalizeDate(date);
        },
        [normalizeDate],
    );

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

        const { align: newAlign } = optimalAlignment.alignment;

        setAlign(newAlign);
        onAlign(newAlign);
    }, [alignPoints, onAlign]);

    const debouncedAlignDatePicker = useMemo(() => debounce(alignDatePicker, 100), [alignDatePicker]);

    const resizeHandler = useCallback(() => {
        debouncedAlignDatePicker();
    }, [debouncedAlignDatePicker]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            datePickerContainerRef.current &&
            !datePickerContainerRef.current.contains(event.target as Node) &&
            inputRef.current &&
            !inputRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    }, []);

    const handleInputBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            onBlur(e.target.value);
        },
        [onBlur],
    );

    const handleInputChanged = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;

            const parsedDate = parseDate(value, dateFormat);

            onValidateInput?.(value);

            setInputValue(value);

            if (parsedDate) {
                setSelectedDate(parsedDate);
                setMonthDate(parsedDate);
                onChange(parsedDate);
            } else {
                if (resetOnInvalidValue) {
                    // Keep current selectedDate and monthDate unchanged
                    return;
                }

                setSelectedDate(undefined);
                setMonthDate(undefined);
                onChange(null);
            }
        },
        [dateFormat, onValidateInput, onChange, resetOnInvalidValue],
    );

    const handleDayChanged = useCallback(
        (newlySelectedDate: Date) => {
            if (!newlySelectedDate) {
                setIsOpen(false);
                return;
            }

            if (isSameDay(selectedDate, newlySelectedDate)) {
                setIsOpen(false);
                return;
            }

            inputRef.current.focus();

            onValidateInput?.(formatDate(newlySelectedDate, dateFormat));

            setSelectedDate(newlySelectedDate);
            setMonthDate(newlySelectedDate);
            setInputValue(formatDate(newlySelectedDate, dateFormat));
            setIsOpen(false);
            onChange(newlySelectedDate);
        },
        [selectedDate, onValidateInput, dateFormat, onChange],
    );

    const handleMonthChanged = useCallback((month: Date) => {
        inputRef.current.focus();
        setMonthDate(month);
    }, []);

    const setComponentRef = useCallback((ref: HTMLElement) => {
        rootRef.current = ref;
    }, []);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Escape" || e.key === "Tab") {
                setIsOpen(false);
            }

            if (isEnterKey(e)) {
                onDateInputKeyDown?.(e);
            }
        },
        [onDateInputKeyDown],
    );

    const handleWrapperClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const { classList } = e.target as HTMLInputElement;

        /**
         * Prevent default fixes bug BB-332 but prevents in closing other dropdowns (Bug BB-1102)
         * so we want to prevent default only when clicking on outside dates in datepicker
         */
        if (e.target && classList && classList.contains(DATEPICKER_OUTSIDE_DAY_SELECTOR)) {
            e.preventDefault();
        }
    }, []);

    useEffect(() => {
        const updatedDate = updateDate(date || new Date());
        setSelectedDate(updatedDate);
        setInputValue(formatDate(date || new Date(), dateFormat));
        window.addEventListener("resize", resizeHandler);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", resizeHandler);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [date, dateFormat, handleClickOutside, resizeHandler, updateDate]);

    useEffect(() => {
        if (date !== undefined) {
            const updatedSelectedDate = updateDate(date || new Date());
            setSelectedDate(updatedSelectedDate);
            setMonthDate(updatedSelectedDate);
            setInputValue(formatDate(updatedSelectedDate, dateFormat));
        }
    }, [date, dateFormat, updateDate]);

    useEffect(() => {
        if (isOpen) {
            alignDatePicker();
        }
    }, [isOpen, alignDatePicker]);

    const getInputClasses = useCallback(() => {
        return classNames("input-text", "small-12", size, `gd-datepicker-input-${datePickerId}`);
    }, [size, datePickerId]);

    const getComponentClasses = useCallback(() => {
        return classNames(
            "gd-datepicker",
            className,
            size,
            "gd-datepicker-input",
            isOpen ? "gd-datepicker-focused" : "",
        );
    }, [className, size, isOpen]);

    const getOverlayWrapperClasses = useCallback(() => {
        const [inputAnchorPoint, pickerAnchorPoint] = align.split(" ");

        return classNames(
            "gd-datepicker-picker",
            "gd-datepicker-OverlayWrapper",
            `gd-datepicker-OverlayWrapper-${inputAnchorPoint}-xx`,
            `gd-datepicker-OverlayWrapper-xx-${pickerAnchorPoint}`,
        );
    }, [align]);

    const classNamesProps: ClassNames = {
        root: getOverlayWrapperClasses(),
    };

    return (
        <div
            data-testid="datepicker"
            className={getComponentClasses()}
            ref={setComponentRef}
            onClick={handleWrapperClick}
        >
            <input
                role="combobox"
                autoComplete="off"
                aria-haspopup="dialog"
                aria-expanded={isOpen ? "true" : "false"}
                aria-controls={isOpen ? `datepicker-popup-${datePickerId}` : undefined}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                aria-label={
                    accessibilityConfig?.ariaLabel ||
                    intl.formatMessage({ id: "datePicker.accessibility.label" })
                }
                aria-describedby={accessibilityConfig?.ariaDescribedBy}
                onKeyDown={onKeyDown}
                tabIndex={tabIndex}
                onClick={() => setIsOpen(true)}
                ref={inputRef}
                value={inputValue}
                className={getInputClasses()}
                placeholder={placeholder}
                onChange={handleInputChanged}
                onBlur={handleInputBlur}
            />

            {isOpen ? (
                <div id={`datepicker-popup-${datePickerId}`} role="dialog" ref={datePickerContainerRef}>
                    <DayPicker
                        classNames={classNamesProps}
                        locale={convertLocale(intl.locale)}
                        showOutsideDays={true}
                        mode="single"
                        onSelect={handleDayChanged}
                        selected={selectedDate}
                        month={monthDate}
                        onMonthChange={handleMonthChanged}
                        weekStartsOn={convertWeekStart(weekStart)}
                    />
                </div>
            ) : null}
            <span className="gd-datepicker-icon gd-icon-calendar" />
        </div>
    );
});

const DatePickerWithIntl = injectIntl(WrappedDatePicker);

/**
 * @internal
 */
export const Datepicker = memo(function Datepicker(props: IDatePickerOwnProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <DatePickerWithIntl {...props} />
        </IntlWrapper>
    );
});
