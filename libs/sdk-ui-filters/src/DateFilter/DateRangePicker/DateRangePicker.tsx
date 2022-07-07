// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    DayPicker,
    DayPickerRangeProps,
    DateRange,
    SelectRangeEventHandler,
    ClassNames,
} from "react-day-picker";
import { enUS, de, es, fr, ja, nl, pt, ptBR, zhCN, ru } from "date-fns/locale";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { mergeDayPickerProps } from "./utils";
import { DateRangePickerError } from "./DateRangePickerError";
import { IExtendedDateFilterErrors } from "../interfaces";
import { DateTimePickerWithInt } from "./DateTimePicker";

import { DAY_END_TIME } from "../constants/Platform";

const convertedLocales = {
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

interface IDateRangePickerProps {
    range: IDateRange;
    onRangeChange: (newRange: IDateRange) => void;
    errors?: IExtendedDateFilterErrors["absoluteForm"];
    dateFormat?: string;
    dayPickerProps?: DayPickerRangeProps;
    isMobile: boolean;
    isTimeEnabled: boolean;
}

type DateRangePickerProps = IDateRangePickerProps & WrappedComponentProps;

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
                />
            </div>
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

        const isFromInputDatePickerOpen = this.state.selectedInput === "from" && this.state.isOpen;
        const isToInputDatePickerOpen = this.state.selectedInput === "to" && this.state.isOpen;
        return (
            <>
                {isTimeEnabled ? (
                    <div className="gd-date-range-picker datetime s-date-range-picker">
                        <label>{intl.formatMessage({ id: "filters.from" })}</label>
                        {FromField}
                        {isFromInputDatePickerOpen && DatePicker}
                        <label>{intl.formatMessage({ id: "filters.to" })}</label>
                        {ToField}
                        {isToInputDatePickerOpen && DatePicker}
                    </div>
                ) : (
                    <>
                        <div className="gd-date-range-picker gd-flex-row s-date-range-picker">
                            {FromField}
                            <span className="gd-date-range-picker-dash">&ndash;</span>
                            {ToField}
                        </div>
                        {this.state.isOpen && DatePicker}
                    </>
                )}
                {(errorFrom || errorTo) && (
                    <DateRangePickerError
                        dateFormat={dateFormat}
                        errorId={
                            // This means that when both inputs are invalid, error is shown only for "from"
                            errorFrom || errorTo
                        }
                    />
                )}
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

    private handleRangeSelect: SelectRangeEventHandler = (range: DateRange | undefined) => {
        const { selectedInput } = this.state;

        if (!range) {
            this.setState({ isOpen: false });
            return;
        }

        const { from, to } = range;

        let calculatedFrom: Date;
        let calculatedTo: Date;
        if (selectedInput === "from") {
            if (this.props.range.from.getTime() === from.getTime()) {
                calculatedFrom = to;
            } else {
                calculatedFrom = from;
            }
            this.setState(
                {
                    inputFromValue: calculatedFrom,
                    selectedRange: { from: calculatedFrom, to: this.props.range.to },
                },
                () => {
                    this.updateRange(calculatedFrom, this.props.range.to);
                },
            );
        } else {
            if (this.props.range.to.getTime() === to.getTime()) {
                calculatedTo = from;
            } else {
                calculatedTo = to;
            }
            this.setState(
                {
                    inputToValue: calculatedTo,
                    selectedRange: { from: this.props.range.from, to: calculatedTo },
                },
                () => {
                    this.updateRange(this.props.range.from, calculatedTo);
                },
            );
        }

        this.setState({ isOpen: false });
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
