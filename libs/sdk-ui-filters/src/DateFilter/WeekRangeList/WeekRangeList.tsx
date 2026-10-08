// (C) 2026 GoodData Corporation

import {
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { format } from "date-fns";
import { defineMessages, useIntl } from "react-intl";

import { type DateString, type WeekStart } from "@gooddata/sdk-model";
import { useAutoupdateRef, useDebouncedState } from "@gooddata/sdk-ui";
import { Input, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { DEFAULT_DATE_FORMAT, platformDateFnsFormat } from "../constants/Platform.js";
import { InputErrorMessage } from "../DateRangePicker/InputErrorMessage.js";
import { ListHeading } from "../ListHeading/ListHeading.js";
import { toDisplayDateFormat } from "../PeriodRangePicker/displayDateFormat.js";
import { PreviewAnnouncer } from "../PeriodRangePicker/PreviewAnnouncer.js";
import { type IPeriodRange } from "../PeriodRangePicker/types.js";
import { formatAbsoluteDateRange } from "../utils/FormattingUtils.js";

import {
    FIRST_LISTED_DAY,
    type IWeek,
    type IWeekRow,
    type IWeekSelection,
    LAST_LISTED_DAY,
    createOpeningWeekWindow,
    extendWeekWindow,
    formatMonthHeading,
    formatWeekAccessibleName,
    formatWeekLabel,
    getOpeningDay,
    getWeek,
    getWeekRows,
    jumpWeekWindow,
    periodRangeToWeekSelection,
    readJumpText,
    selectWeek,
    trimWeekWindow,
    weekSelectionToPeriodRange,
} from "./weeks.js";

const JUMP_DELAY = 300;
const PAGE_WEEKS = 4;
const PLACEHOLDER_EXAMPLE_DATE = new Date(2026, 11, 29);

// The two clicks that close a range follow each other quickly, so only the range they leave is announced.
const PREVIEW_ANNOUNCEMENT_DELAY = 1000;

const messages = defineMessages({
    searchPlaceholder: { id: "filters.staticPeriod.weekList.searchPlaceholder" },
    searchLabel: { id: "filters.staticPeriod.weekList.searchLabel" },
    listLabel: { id: "filters.staticPeriod.weekList.listLabel" },
    invalidDate: { id: "filters.staticPeriod.weekList.errors.invalidDate" },
    dateOutOfRange: { id: "filters.staticPeriod.weekList.errors.dateOutOfRange" },
    rangePreview: { id: "filters.staticPeriod.rangePreview" },
});

/**
 * @internal
 */
export interface IWeekRangeListProps {
    /** The selected weeks. Every range reported by `onRangeChange` has to come back here. */
    range: IPeriodRange;
    onRangeChange: (range: IPeriodRange) => void;
    /** Defaults to "Sunday". */
    weekStart?: WeekStart;
    /** Date format (date-fns tokens) of the jump field and the range preview. */
    dateFormat?: string;
    isMobile: boolean;
    customRangeHint?: ReactNode;
    /** Reports whether a week range is selected. Pass a stable callback. */
    onValidityChange?: (isValid: boolean) => void;
    withoutApply?: boolean;
    submitForm?: () => void;
}

interface IListedWeek extends IWeekRow {
    label: string;
    accessibleName: string;
}

interface IListedHeading {
    type: "heading";
    key: string;
    label: string;
}

const getToday = () => format(new Date(), platformDateFnsFormat);

const isInRange = (week: IWeek, range: IWeekSelection | undefined) =>
    range !== undefined && week.start >= range.from && week.end <= range.to;

// Keeps the focus in the jump field when the list is clicked.
const preventFocusChange = (event: MouseEvent) => event.preventDefault();

// Plain values rather than the row, so that the rows an extension keeps do not render again.
interface IWeekOptionProps {
    id: string;
    start: DateString;
    end: DateString;
    label: string;
    accessibleName: string;
    isActive: boolean;
    isSelected: boolean;
    isInShownRange: boolean;
    isShownRangeEdge: boolean;
    onSelect: (week: IWeek) => void;
    onHover: (day: DateString) => void;
}

const WeekOption = memo(function WeekOption({
    id,
    start,
    end,
    label,
    accessibleName,
    isActive,
    isSelected,
    isInShownRange,
    isShownRangeEdge,
    onSelect,
    onHover,
}: IWeekOptionProps) {
    return (
        <div
            id={id}
            role="option"
            aria-selected={isSelected}
            aria-label={accessibleName}
            className={cx("gd-week-range-list__week", "s-week-range-list-week", {
                "gd-week-range-list__week--active": isActive,
                "gd-week-range-list__week--in-range": isInShownRange,
                "gd-week-range-list__week--edge": isShownRangeEdge,
            })}
            onMouseMove={isActive ? undefined : () => onHover(start)}
            onClick={() => onSelect({ start, end })}
        >
            {label}
        </div>
    );
});

const MonthHeading = memo(function MonthHeading({ label }: { label: string }) {
    return (
        <ListHeading className="gd-week-range-list__heading s-week-range-list-heading">{label}</ListHeading>
    );
});

/**
 * A list of weeks grouped by month, with a two-click range selection and a field that jumps to a typed date.
 *
 * @internal
 */
export function WeekRangeList({
    range,
    onRangeChange,
    weekStart = "Sunday",
    dateFormat = DEFAULT_DATE_FORMAT,
    isMobile,
    customRangeHint,
    onValidityChange,
    withoutApply = false,
    submitForm,
}: IWeekRangeListProps) {
    const intl = useIntl();
    const listboxId = useIdPrefixed("gd-week-range-list");
    const errorId = useIdPrefixed("gd-week-range-list-error");
    const listRef = useRef<HTMLDivElement | null>(null);
    const getOptionId = useCallback((key: string) => `${listboxId}-${key}`, [listboxId]);

    const [weekWindow, setWeekWindow] = useState(() => createOpeningWeekWindow(range, getToday()));
    const [anchor, setAnchor] = useState<IWeek | undefined>(undefined);
    // Days rather than week starts, so that they still name a listed week after the week start changes.
    const [activeDay, setActiveDay] = useState<DateString | undefined>(undefined);
    // A new object on every request, so that centring the same week again scrolls too.
    const [centreRequest, setCentreRequest] = useState(() => ({ day: getOpeningDay(range, getToday()) }));

    const [text, setText, debouncedText] = useDebouncedState("", JUMP_DELAY);
    // The error waits until the field is left or Enter is pressed, so that it does not flash while typing.
    const [isJumpErrorShown, setIsJumpErrorShown] = useState(false);
    const jumpedTextRef = useRef("");

    const closedSelection = periodRangeToWeekSelection(range, weekStart);
    // The anchor holds only while the range is still the week its click reported.
    const selection: IWeekSelection | undefined =
        closedSelection && closedSelection.from === anchor?.start && closedSelection.to === anchor.end
            ? { ...closedSelection, anchor }
            : closedSelection;

    const rows = useMemo(
        () =>
            getWeekRows(weekWindow, weekStart).map((row): IListedWeek | IListedHeading =>
                row.type === "week"
                    ? {
                          ...row,
                          label: formatWeekLabel(row, intl.locale),
                          accessibleName: formatWeekAccessibleName(row, intl.locale),
                      }
                    : { type: "heading", key: row.key, label: formatMonthHeading(row.month, intl.locale) },
            ),
        [weekWindow, weekStart, intl.locale],
    );
    const weeks = useMemo(() => rows.filter((row): row is IListedWeek => row.type === "week"), [rows]);
    const weekIndexes = useMemo(() => new Map(weeks.map((week, index) => [week.key, index])), [weeks]);

    const activeKey = activeDay === undefined ? undefined : getWeek(activeDay, weekStart).start;
    const activeIndex = activeKey === undefined ? undefined : weekIndexes.get(activeKey);
    const activeWeek = activeIndex === undefined ? undefined : weeks[activeIndex];
    const centreKey = getWeek(centreRequest.day, weekStart).start;

    const selectionRef = useAutoupdateRef(selection);
    const onRangeChangeRef = useAutoupdateRef(onRangeChange);
    const handleSelect = useCallback(
        (week: IWeek) => {
            const next = selectWeek(selectionRef.current, week);
            setAnchor(next.anchor);
            onRangeChangeRef.current(weekSelectionToPeriodRange(next));
        },
        [selectionRef, onRangeChangeRef],
    );

    const isRangeSelected = selection !== undefined;
    useEffect(() => {
        onValidityChange?.(isRangeSelected);
    }, [isRangeSelected, onValidityChange]);

    // Whatever the caller gates on validity must not stay blocked once the list is gone.
    useEffect(() => {
        return () => onValidityChange?.(true);
    }, [onValidityChange]);

    useLayoutEffect(() => {
        const list = listRef.current;
        const option = list?.ownerDocument.getElementById(getOptionId(centreKey));
        if (list && option) {
            list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
        }
    }, [centreRequest, centreKey, getOptionId]);

    // Set while an extension is waiting for its render, so that one scroll position extends only once. It
    // holds the row at the extended edge and its offset before the extension.
    const pendingExtensionRef = useRef<{ edgeRow: HTMLElement; offsetTop: number } | undefined>(undefined);

    // Rows added at the start or dropped from it move the visible ones, so the scroll position follows the
    // row at the extended edge before the browser paints.
    useLayoutEffect(() => {
        const extension = pendingExtensionRef.current;
        const list = listRef.current;
        pendingExtensionRef.current = undefined;
        if (extension && list) {
            list.scrollTop += extension.edgeRow.offsetTop - extension.offsetTop;
        }
    }, [weekWindow]);

    const handleScroll = useCallback(() => {
        const list = listRef.current;
        if (!list || pendingExtensionRef.current) {
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = list;
        const isNearStart = scrollTop < clientHeight;
        const isNearEnd = scrollHeight - scrollTop - clientHeight < clientHeight;
        const side = isNearStart ? "start" : isNearEnd ? "end" : undefined;
        const extended = side ? extendWeekWindow(weekWindow, side) : weekWindow;
        if (!side || extended === weekWindow) {
            return;
        }

        const edgeWeek = side === "start" ? weeks[0] : weeks[weeks.length - 1];
        const edgeRow = list.ownerDocument.getElementById(getOptionId(edgeWeek.key));
        if (edgeRow) {
            pendingExtensionRef.current = { edgeRow, offsetTop: edgeRow.offsetTop };
            // The other side gives up a year past ten years, so that scrolling does not keep adding rows.
            setWeekWindow(trimWeekWindow(extended, side === "start" ? "end" : "start"));
        }
    }, [weekWindow, weeks, getOptionId]);

    const jump = useCallback(
        (value: string): IWeek | undefined => {
            jumpedTextRef.current = value;
            const target = readJumpText(value, dateFormat);
            if (!target || !("day" in target)) {
                return undefined;
            }

            pendingExtensionRef.current = undefined;
            setWeekWindow((current) => jumpWeekWindow(current, target.day, weekStart, isRangeSelected));
            setActiveDay(target.day);
            setCentreRequest({ day: target.day });

            return getWeek(target.day, weekStart);
        },
        [dateFormat, weekStart, isRangeSelected],
    );

    useEffect(() => {
        if (debouncedText !== jumpedTextRef.current) {
            jump(debouncedText);
        }
    }, [debouncedText, jump]);

    const moveActiveWeek = (delta: number) => {
        const index =
            activeIndex === undefined
                ? (weekIndexes.get(centreKey) ?? 0)
                : Math.min(Math.max(activeIndex + delta, 0), weeks.length - 1);
        const week = weeks[index];
        setActiveDay(week.start);
        listRef.current?.ownerDocument.getElementById(getOptionId(week.key))?.scrollIntoView({
            block: "nearest",
        });
    };

    const jumpText = readJumpText(text, dateFormat);

    const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowDown":
                moveActiveWeek(1);
                break;
            case "ArrowUp":
                moveActiveWeek(-1);
                break;
            case "PageDown":
                moveActiveWeek(PAGE_WEEKS);
                break;
            case "PageUp":
                moveActiveWeek(-PAGE_WEEKS);
                break;
            case "Enter": {
                // A typed date that cannot be read selects nothing.
                if (jumpText && "error" in jumpText) {
                    setIsJumpErrorShown(true);
                    break;
                }

                const canApply = !withoutApply && selection !== undefined && !selection.anchor;
                // A date typed just before Enter has not jumped yet.
                const week = (text === jumpedTextRef.current ? undefined : jump(text)) ?? activeWeek;
                if (!week) {
                    // With no week to select, Enter applies a closed range if the field is empty, and is
                    // left to the parent otherwise.
                    if (jumpText !== undefined || !canApply) {
                        return;
                    }
                    submitForm?.();
                    break;
                }

                // Enter on a week of a closed range applies the range, unless there is nothing to apply it
                // with or the week was typed, which asks for that week.
                const isTypedWeek =
                    jumpText !== undefined && getWeek(jumpText.day, weekStart).start === week.start;
                if (canApply && !isTypedWeek && isInRange(week, selection)) {
                    submitForm?.();
                } else {
                    handleSelect(week);
                }
                break;
            }
            case "ArrowLeft":
            case "ArrowRight":
            case "Home":
            case "End":
                // Moves the caret, not the date filter's focus.
                event.stopPropagation();
                return;
            default:
                return;
        }
        event.preventDefault();
        event.stopPropagation();
    };

    const handleTextChange = (value: string | number) => {
        setText(String(value));
        setIsJumpErrorShown(false);
    };

    const jumpError = isJumpErrorShown && jumpText && "error" in jumpText ? jumpText.error : undefined;
    const errorMessage =
        jumpError === "format"
            ? intl.formatMessage(messages.invalidDate, { format: toDisplayDateFormat(dateFormat) })
            : jumpError === "range"
              ? intl.formatMessage(messages.dateOutOfRange, {
                    firstYear: FIRST_LISTED_DAY.slice(0, 4),
                    lastYear: LAST_LISTED_DAY.slice(0, 4),
                })
              : undefined;

    // Only listed weeks are previewed, so that the preview never shows a range the caller cannot submit.
    const previewRange = selection
        ? formatAbsoluteDateRange(selection.from, selection.to, dateFormat)
        : undefined;
    const [, setPreviewAnnouncement, previewAnnouncement] = useDebouncedState<string | null>(
        null,
        PREVIEW_ANNOUNCEMENT_DELAY,
    );
    useEffect(() => {
        setPreviewAnnouncement(
            previewRange === undefined
                ? null
                : intl.formatMessage(messages.rangePreview, { range: previewRange }),
        );
    }, [previewRange, intl, setPreviewAnnouncement]);

    // While a range is open, the list shows the range a click on the active week would close; of its edges,
    // only the selected one stands out.
    const shownRange = selection?.anchor && activeWeek ? selectWeek(selection, activeWeek) : selection;
    const isPreview = shownRange !== selection;

    return (
        <div
            className={cx("gd-week-range-list", "s-week-range-list", {
                "gd-week-range-list--mobile": isMobile,
            })}
        >
            <Input
                className="gd-week-range-list__search s-week-range-list-search"
                isSearch
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setIsJumpErrorShown(true)}
                placeholder={intl.formatMessage(messages.searchPlaceholder, {
                    example: format(PLACEHOLDER_EXAMPLE_DATE, dateFormat),
                })}
                hasError={errorMessage !== undefined}
                accessibilityConfig={{
                    role: "combobox",
                    ariaLabel: intl.formatMessage(messages.searchLabel),
                    ariaExpanded: true,
                    ariaControls: listboxId,
                    ariaActiveDescendant: activeWeek ? getOptionId(activeWeek.key) : undefined,
                    ariaInvalid: errorMessage !== undefined,
                    ariaDescribedBy: errorMessage === undefined ? undefined : errorId,
                }}
            />
            <div
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-multiselectable="true"
                aria-label={intl.formatMessage(messages.listLabel)}
                className="gd-week-range-list__rows gd-visible-scrollbar s-week-range-list-rows"
                onMouseDown={preventFocusChange}
                onScroll={handleScroll}
            >
                {rows.map((row) =>
                    row.type === "heading" ? (
                        <MonthHeading key={row.key} label={row.label} />
                    ) : (
                        <WeekOption
                            key={row.key}
                            id={getOptionId(row.key)}
                            start={row.start}
                            end={row.end}
                            label={row.label}
                            accessibleName={row.accessibleName}
                            isActive={row.key === activeKey}
                            isSelected={isInRange(row, selection)}
                            isInShownRange={isInRange(row, shownRange)}
                            isShownRangeEdge={
                                (row.start === shownRange?.from || row.end === shownRange?.to) &&
                                (!isPreview || isInRange(row, selection))
                            }
                            onSelect={handleSelect}
                            onHover={setActiveDay}
                        />
                    ),
                )}
            </div>
            <InputErrorMessage descriptionId={errorId} errorText={errorMessage} />
            {customRangeHint ? <div className="gd-week-range-list__hint">{customRangeHint}</div> : null}
            <div className="gd-week-range-list__preview s-week-range-list-preview">
                {intl.formatMessage(messages.rangePreview, { range: previewRange ?? "–" })}
            </div>
            <PreviewAnnouncer message={previewAnnouncement} />
        </div>
    );
}
