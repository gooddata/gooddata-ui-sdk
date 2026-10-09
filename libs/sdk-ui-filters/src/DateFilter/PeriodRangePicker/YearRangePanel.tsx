// (C) 2026 GoodData Corporation

import {
    type FocusEvent,
    type RefObject,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

import { type SharedPanelProps } from "@rc-component/picker/interface";
import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { type PeriodRangeSide } from "./periodRangePickerAccessibility.js";

const YEARS_PER_PAGE = 15;
const YEAR_COLUMNS = 5;

const messages = defineMessages({
    previousYears: { id: "filters.staticPeriod.previousYears" },
    nextYears: { id: "filters.staticPeriod.nextYears" },
});

/**
 * The year of the page the year grid shows, set only where the year range picker controls that page.
 */
export const YearPageAnchorContext = createContext<number | undefined>(undefined);

/**
 * Returns the first year of the fixed 15-year page that contains `year`. Pages are laid out so that
 * the current year sits in the middle of its page.
 */
export function getYearPageStart(year: number, currentYear: number): number {
    const anchorYear = currentYear - Math.floor(YEARS_PER_PAGE / 2);
    return anchorYear + YEARS_PER_PAGE * Math.floor((year - anchorYear) / YEARS_PER_PAGE);
}

/**
 * Chooses the page the year grid shows, in place of rc-picker, which places the end field as if two
 * decades were shown side by side and can open it on a page without the end year.
 *
 * @remarks
 * The grid opens on the page of the field it was opened from, falling back to the other field and then
 * today. It keeps its page when focus moves to the other field, and follows a typed year and the arrows.
 */
export function useYearPageAnchor(liveValueRef: RefObject<[Date | null, Date | null]>) {
    const [anchor, setAnchor] = useState(() => new Date());
    const focusedSideRef = useRef<PeriodRangeSide>("start");

    const onFocus = useCallback((_event: FocusEvent<HTMLElement>, info: { range?: PeriodRangeSide }) => {
        if (info.range) {
            focusedSideRef.current = info.range;
        }
    }, []);

    const onOpen = useCallback(() => {
        const [start, end] = liveValueRef.current;
        const [focused, other] = focusedSideRef.current === "start" ? [start, end] : [end, start];
        setAnchor(focused ?? other ?? new Date());
    }, [liveValueRef]);

    const onCalendarChange = useCallback(
        (dates: [Date | null, Date | null], info: { range?: PeriodRangeSide }) => {
            const date = dates[info.range === "end" ? 1 : 0];
            if (date) {
                setAnchor(date);
            }
        },
        [],
    );

    // Only the arrows move the page here. rc-picker's own repositioning on open and on focus changes is ignored.
    const onPickerValueChange = useCallback(
        (dates: [Date, Date], info: { source: "reset" | "panel"; range?: PeriodRangeSide }) => {
            if (info.source === "panel") {
                setAnchor(dates[info.range === "end" ? 1 : 0]);
            }
        },
        [],
    );

    const pickerValue = useMemo((): [Date, Date] => [anchor, anchor], [anchor]);

    return {
        pickerValue,
        anchorYear: anchor.getFullYear(),
        onFocus,
        onOpen,
        onCalendarChange,
        onPickerValueChange,
    };
}

/**
 * The year panel of the period range picker: one grid of 15 years paged by 15, in place of rc-picker's
 * decade grid. Renders the same markup and cell classes as rc-picker's own panels, so the shared picker
 * styles apply unchanged.
 */
export function YearRangePanel({
    prefixCls,
    locale,
    generateConfig,
    pickerValue,
    onPickerValueChange,
    onSelect,
    values,
    hoverRangeValue,
    hoverValue,
    onHover,
    prevIcon = "‹",
    nextIcon = "›",
}: SharedPanelProps<Date>) {
    const intl = useIntl();
    const anchorYear = useContext(YearPageAnchorContext);
    const cellPrefixCls = `${prefixCls}-cell`;

    // The range picker also renders a second panel ten years on, which is never shown. It stays empty so
    // that only the shown grid's cells are in the document.
    if (anchorYear !== undefined && generateConfig.getYear(pickerValue) !== anchorYear) {
        return null;
    }

    const pageStartYear = getYearPageStart(
        generateConfig.getYear(pickerValue),
        generateConfig.getYear(generateConfig.getNow()),
    );
    const pageStart = generateConfig.setYear(pickerValue, pageStartYear);
    const pageEnd = generateConfig.addYear(pageStart, YEARS_PER_PAGE - 1);

    const formatYear = (date: Date, format: string | undefined) =>
        format
            ? generateConfig.locale.format(locale.locale, date, format)
            : String(generateConfig.getYear(date));

    const isSameYear = (date: Date, other: Date | null | undefined) =>
        !!other && generateConfig.getYear(date) === generateConfig.getYear(other);

    const renderCell = (date: Date) => {
        const year = generateConfig.getYear(date);
        const [hoverStart, hoverEnd] = hoverRangeValue ?? [];
        const isRangeStart = isSameYear(date, hoverStart);
        const isRangeEnd = isSameYear(date, hoverEnd);
        const isInRange =
            !!hoverStart &&
            !!hoverEnd &&
            generateConfig.getYear(hoverStart) < year &&
            year < generateConfig.getYear(hoverEnd);

        return (
            <td
                key={year}
                title={formatYear(date, locale.fieldYearFormat)}
                className={cx(cellPrefixCls, `${cellPrefixCls}-in-view`, {
                    [`${cellPrefixCls}-hover`]: hoverValue?.some((hovered) => isSameYear(date, hovered)),
                    [`${cellPrefixCls}-in-range`]: isInRange,
                    [`${cellPrefixCls}-range-start`]: isRangeStart,
                    [`${cellPrefixCls}-range-end`]: isRangeEnd,
                    [`${prefixCls}-cell-selected`]:
                        !hoverRangeValue && values?.some((value) => isSameYear(date, value)),
                })}
                onClick={() => onSelect(date)}
                onMouseEnter={() => onHover?.(date)}
                onMouseLeave={() => onHover?.(null)}
            >
                <div className={`${cellPrefixCls}-inner`}>{formatYear(date, locale.cellYearFormat)}</div>
            </td>
        );
    };

    const rows = Array.from({ length: YEARS_PER_PAGE / YEAR_COLUMNS }, (_, row) => (
        <tr key={row}>
            {Array.from({ length: YEAR_COLUMNS }, (_, column) =>
                renderCell(generateConfig.addYear(pageStart, row * YEAR_COLUMNS + column)),
            )}
        </tr>
    ));

    return (
        <div className={`${prefixCls}-year-panel`}>
            <div className={`${prefixCls}-header`}>
                <button
                    type="button"
                    aria-label={intl.formatMessage(messages.previousYears, { count: YEARS_PER_PAGE })}
                    onClick={() => onPickerValueChange(generateConfig.addYear(pickerValue, -YEARS_PER_PAGE))}
                    tabIndex={-1}
                    className={`${prefixCls}-header-prev-btn`}
                >
                    {prevIcon}
                </button>
                {/* Plain text rather than a way up to decades, which do not line up with the 15-year pages. */}
                <div className={`${prefixCls}-header-view`}>
                    {`${formatYear(pageStart, locale.yearFormat)} – ${formatYear(pageEnd, locale.yearFormat)}`}
                </div>
                <button
                    type="button"
                    aria-label={intl.formatMessage(messages.nextYears, { count: YEARS_PER_PAGE })}
                    onClick={() => onPickerValueChange(generateConfig.addYear(pickerValue, YEARS_PER_PAGE))}
                    tabIndex={-1}
                    className={`${prefixCls}-header-next-btn`}
                >
                    {nextIcon}
                </button>
            </div>
            <div className={`${prefixCls}-body`}>
                <table className={`${prefixCls}-content`}>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        </div>
    );
}
