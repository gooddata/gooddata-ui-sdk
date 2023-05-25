// (C) 2007-2023 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    DayPicker,
    DayPickerRangeProps,
    DateRange,
    SelectRangeEventHandler,
    ClassNames,
    DayPickerProps,
} from "react-day-picker";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { WeekStart } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { mergeDayPickerProps } from "./utils.js";
import { DateRangePickerError } from "./DateRangePickerError.js";
import { IExtendedDateFilterErrors } from "../interfaces/index.js";
import { DateTimePickerWithInt } from "./DateTimePicker.js";

import { DAY_END_TIME } from "../constants/Platform.js";

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
};

const ALIGN_POINTS = [{ align: "bl tl", offset: { x: 0, y: 1 } }];

function convertLocale(locale: string): Locale {
    return convertedLocales[locale];
}
export interface IDateRange {
    from: Date;
    to: Date;
}

interface IDateRangePickerState {
    isOpen: boolean;
    inputFromValue: Date;
    inputToValue: Date;
    selectedRange: DateRange;
    monthDate: Date;
    selectedInput: string;
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

class DateRangePickerComponent extends React.Component<DateRangePickerProps, IDateRangePickerState> {
    private dateRangePickerInputFrom = React.createRef<HTMLInputElement>();
    private dateRangePickerInputTo = React.createRef<HTMLInputElement>();
    private dateRangePickerContainer = React.createRef<HTMLDivElement>();

    constructor(props: DateRangePickerProps) {
        super(props);

        this.state = {
            isOpen: false,
            inputFromValue: this.props.range.from,
            inputToValue: this.props.range.to,
            selectedRange: { from: this.props.range.from, to: this.props.range.to },
            monthDate: null,
            selectedInput: null,
        };

        this.handleMonthChanged = this.handleMonthChanged.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleMonthChanged = this.handleMonthChanged.bind(this);
        this.handleRangeSelect = this.handleRangeSelect.bind(this);
        this.handleFromDayClick = this.handleFromDayClick.bind(this);
        this.handleToDayClick = this.handleToDayClick.bind(this);
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    public componentDidMount(): void {
        document.addEventListener("mousedown", this.handleClickOutside);
    }

    public componentWillUnmount(): void {
        document.removeEventListener("mousedown", this.handleClickOutside);
    }

    public render() {
        const {
            dateFormat,
            range: { from, to },
            dayPickerProps,
            intl,
            isMobile,
            errors: { from: errorFrom, to: errorTo } = { from: undefined, to: undefined },
            isTimeEnabled,
            weekStart = "Sunday",
            shouldOverlayDatePicker = false,
        } = this.props;

        const defaultDayPickerProps: DayPickerRangeProps = {
            mode: "range",
            showOutsideDays: true,
            modifiers: { start: from, end: to },
            selected: { from, to },
            locale: convertLocale(intl.locale),
        };

        const dayPickerPropsWithDefaults = mergeDayPickerProps(defaultDayPickerProps, dayPickerProps);

        const classNameProps: ClassNames = {
            root: `gd-date-range-picker-picker s-date-range-calendar-${this.state.selectedInput}`,
        };

        const DatePicker = (
            <div className="gd-date-range-picker-wrapper" ref={this.dateRangePickerContainer}>
                <DayPicker
                    {...dayPickerPropsWithDefaults}
                    onSelect={this.handleRangeSelect}
                    selected={this.state.selectedRange}
                    month={this.state.monthDate}
                    classNames={classNameProps}
                    onMonthChange={this.handleMonthChanged}
                    weekStartsOn={convertWeekStart(weekStart)}
                />
            </div>
        );

        const OverlayDatePicker = (
            <Overlay
                alignTo={`.gd-date-range-picker-${isTimeEnabled ? this.state.selectedInput : "from"}`}
                alignPoints={ALIGN_POINTS}
                closeOnOutsideClick={true}
                closeOnMouseDrag={true}
                closeOnParentScroll={true}
            >
                {DatePicker}
            </Overlay>
        );

        const FromField = (
            <DateTimePickerWithInt
                onKeyDown={this.onKeyDown}
                ref={this.dateRangePickerInputFrom}
                placeholderDate={intl.formatMessage({ id: "filters.from" })}
                onChange={this.handleFromChange}
                value={this.state.inputFromValue}
                dateFormat={dateFormat}
                isMobile={isMobile}
                handleDayClick={this.handleFromDayClick}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-from", "gd-date-range-picker-from")}
                error={typeof errorFrom !== "undefined"}
            />
        );

        const ToField = (
            <DateTimePickerWithInt
                onKeyDown={this.onKeyDown}
                ref={this.dateRangePickerInputTo}
                placeholderDate={intl.formatMessage({ id: "filters.to" })}
                onChange={this.handleToChange}
                value={this.state.inputToValue}
                dateFormat={dateFormat}
                isMobile={isMobile}
                handleDayClick={this.handleToDayClick}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-to", "gd-date-range-picker-to")}
                defaultTime={DAY_END_TIME}
                error={typeof errorTo !== "undefined"}
            />
        );

        const DatePickerComponent = shouldOverlayDatePicker ? OverlayDatePicker : DatePicker;

        const isFromInputDatePickerOpen = this.state.selectedInput === "from" && this.state.isOpen;
        const isToInputDatePickerOpen = this.state.selectedInput === "to" && this.state.isOpen;
        return (
            <>
                {isTimeEnabled ? (
                    <div className="gd-date-range-picker datetime s-date-range-picker">
                        <label>{intl.formatMessage({ id: "filters.from" })}</label>
                        {FromField}
                        {isFromInputDatePickerOpen ? DatePickerComponent : null}
                        <label>{intl.formatMessage({ id: "filters.to" })}</label>
                        {ToField}
                        {isToInputDatePickerOpen ? DatePickerComponent : null}
                    </div>
                ) : (
                    <>
                        <div className="gd-date-range-picker gd-flex-row s-date-range-picker">
                            {FromField}
                            <span className="gd-date-range-picker-dash">&ndash;</span>
                            {ToField}
                        </div>
                        {this.state.isOpen ? DatePickerComponent : null}
                    </>
                )}
                {errorFrom || errorTo ? (
                    <DateRangePickerError
                        dateFormat={dateFormat}
                        errorId={
                            // This means that when both inputs are invalid, error is shown only for "from"
                            errorFrom || errorTo
                        }
                    />
                ) : null}
            </>
        );
    }

    private onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape" || e.key === "Tab") {
            this.setState({ isOpen: false });
        }
    }

    private handleMonthChanged(month: Date) {
        this.setState({ monthDate: month });
    }

    // get new date object composed from the date of the first argument
    // and the time of the date provided as the second argument
    private setTimeForDate(date: Date, time: Date): Date {
        const result = new Date(date);
        result.setHours(time.getHours());
        result.setMinutes(time.getMinutes());
        return result;
    }

    private handleRangeSelect: SelectRangeEventHandler = (
        _range: DateRange | undefined,
        selectedDate: Date,
    ) => {
        let calculatedFrom: Date;
        let calculatedTo: Date;

        // it is better to use selectedDate property as _range is not working correctly in corner cases
        if (this.state.selectedInput == "from") {
            calculatedFrom = this.setTimeForDate(selectedDate, this.state.inputFromValue);
            calculatedTo = this.state.inputToValue;
        } else {
            calculatedFrom = this.state.inputFromValue;
            calculatedTo = this.setTimeForDate(selectedDate, this.state.inputToValue);
        }

        this.setState(
            {
                inputFromValue: calculatedFrom,
                inputToValue: calculatedTo,
                selectedRange: { from: calculatedFrom, to: calculatedTo },
                isOpen: false,
            },
            () => {
                this.updateRange(calculatedFrom, calculatedTo);
            },
        );
    };

    private handleClickOutside(event: MouseEvent) {
        if (
            this.dateRangePickerContainer.current &&
            !this.dateRangePickerContainer.current.contains(event.target as Node) &&
            this.dateRangePickerInputFrom &&
            !this.dateRangePickerInputFrom.current.contains(event.target as Node) &&
            this.dateRangePickerInputTo &&
            !this.dateRangePickerInputTo.current.contains(event.target as Node)
        ) {
            this.setState({ isOpen: false });
        }
    }

    private updateRange = (from: Date, to: Date) => {
        this.props.onRangeChange({ from, to });
    };

    private handleFromDayClick = () => {
        this.setState({
            selectedInput: "from",
            isOpen: true,
            monthDate: this.props.range.from,
        });
    };

    private handleToDayClick = () => {
        this.setState({
            selectedInput: "to",
            isOpen: true,
            monthDate: this.props.range.to,
        });
    };

    private handleFromChange = (date: Date) => {
        if (date) {
            this.setState({ inputFromValue: date });
        }

        this.setState(
            {
                selectedRange: { from: date, to: this.state.selectedRange.to },
                monthDate: date,
            },
            () => {
                this.updateRange(date, this.state.selectedRange.to);
            },
        );
    };

    private handleToChange = (date: Date) => {
        if (date) {
            this.setState({ inputToValue: date });
        }

        this.setState(
            {
                selectedRange: { from: this.state.selectedRange.from, to: date },
                monthDate: date,
            },
            () => {
                this.updateRange(this.state.selectedRange.from, date);
            },
        );
    };
}
export const DateRangePicker = injectIntl(DateRangePickerComponent);
