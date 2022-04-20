// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DayPickerProps } from "react-day-picker";
import MomentLocaleUtils from "react-day-picker/moment";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { translationUtils } from "@gooddata/util";
import { convertDateToPlatformDateString, convertPlatformDateStringToDate } from "../utils/DateConversions";
import { DateRangePickerInputField } from "./DateRangePickerInputField";
import { mergeDayPickerProps, areRangeBoundsCrossed } from "./utils";
import { DateRangePickerError } from "./DateRangePickerError";
import { IExtendedDateFilterErrors } from "../interfaces";
import { DateRangePickerInputFieldBody } from "./DateRangePickerInputFieldBody";

export interface IDateRange {
    from: Date;
    to: Date;
}

interface IDateRangePickerProps {
    range: IDateRange;
    onRangeChange: (newRange: IDateRange) => void;
    errors?: IExtendedDateFilterErrors["absoluteForm"];
    dateFormat?: string;
    dayPickerProps?: DayPickerProps;
    isMobile: boolean;
}

class DateRangePickerComponent extends React.Component<IDateRangePickerProps & WrappedComponentProps> {
    private fromInputRef = React.createRef<DayPickerInput>();
    private toInputRef = React.createRef<DayPickerInput>();

    public render(): React.ReactNode {
        const {
            dateFormat,
            range: { from, to },
            dayPickerProps,
            intl,
            isMobile,
            errors: { from: errorFrom, to: errorTo } = { from: undefined, to: undefined },
        } = this.props;

        const defaultDayPickerProps: Partial<DayPickerProps> = {
            showOutsideDays: true,
            modifiers: { start: from, end: to },
            selectedDays: [from, { from, to }],
            locale: translationUtils.sanitizeLocaleForMoment(intl.locale),
            localeUtils: MomentLocaleUtils,
        };

        const dayPickerPropsWithDefaults = mergeDayPickerProps(defaultDayPickerProps, dayPickerProps);

        const FromField = isMobile ? (
            <DateRangePickerInputFieldBody
                type="date"
                className={cx(
                    "s-date-range-picker-from",
                    "gd-date-range-picker-input",
                    "gd-date-range-picker-input-native",
                    errorFrom && "gd-date-range-picker-input-error",
                )}
                placeholder={intl.formatMessage({ id: "filters.from" })}
                onChange={(event) =>
                    this.handleFromChange(convertPlatformDateStringToDate(event.target.value))
                }
                value={convertDateToPlatformDateString(from)}
            />
        ) : (
            <DateRangePickerInputField
                className={cx("s-date-range-picker-from", errorFrom && "gd-date-range-picker-input-error")}
                classNameCalendar="s-date-range-calendar-from"
                ref={this.fromInputRef}
                onDayChange={this.handleFromChange}
                value={from || ""}
                format={dateFormat}
                placeholder={intl.formatMessage({ id: "filters.from" })}
                dayPickerProps={{
                    ...dayPickerPropsWithDefaults,
                    onDayClick: this.handleFromDayClick,
                }}
                // showOverlay={true} // Always shows the calendar, useful for CSS debugging
            />
        );

        const ToField = isMobile ? (
            <DateRangePickerInputFieldBody
                type="date"
                className={cx(
                    "s-date-range-picker-to",
                    "gd-date-range-picker-input",
                    "gd-date-range-picker-input-native",
                    errorTo && "gd-date-range-picker-input-error",
                )}
                placeholder={intl.formatMessage({ id: "filters.to" })}
                onChange={(event) => this.handleToChange(convertPlatformDateStringToDate(event.target.value))}
                value={convertDateToPlatformDateString(to)}
            />
        ) : (
            <DateRangePickerInputField
                className={cx("s-date-range-picker-to", errorTo && "gd-date-range-picker-input-error")}
                classNameCalendar="s-date-range-calendar-to"
                ref={this.toInputRef}
                onDayChange={this.handleToChange}
                value={to || ""}
                format={dateFormat}
                placeholder={intl.formatMessage({ id: "filters.to" })}
                dayPickerProps={{
                    ...dayPickerPropsWithDefaults,
                    onDayClick: this.handleToDayClick,
                }}
            />
        );

        return (
            <>
                <div className="gd-date-range-picker s-date-range-picker">
                    {FromField}
                    <span className="gd-date-range-picker-dash">&mdash;</span>
                    {ToField}
                </div>
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

    private focusField = (inputRef: any) => {
        if (inputRef.current) {
            // Focus needs to happen on the next tick otherwise the day picker is not updated
            setTimeout(() => {
                inputRef.current.getInput().focus();
            }, 0);
        }
    };

    private blurField = (inputRef: any) => {
        if (inputRef.current) {
            inputRef.current.getInput().blur();
        }
    };

    private updateRange = (from: Date, to: Date) => {
        this.props.onRangeChange({ from, to });
    };

    private handleFromDayClick = () => {
        this.focusField(this.toInputRef);
    };

    private handleToDayClick = (to: Date) => {
        const rangeBoundsCrossed = areRangeBoundsCrossed(this.props.range.from, to);
        if (to && !rangeBoundsCrossed) {
            this.blurField(this.toInputRef);
        } else if (rangeBoundsCrossed) {
            this.focusField(this.fromInputRef);
        }
    };

    private getSanitizedInputValue = (inputRef: React.RefObject<DayPickerInput>, date: Date) => {
        const inputValue = inputRef.current?.getInput().value;
        return !date && !inputValue ? null : date;
    };

    private handleFromChange = (from: Date) => {
        const useFrom = from && this.props.range.to && areRangeBoundsCrossed(from, this.props.range.to);
        const to = useFrom ? from : this.props.range.to;
        const sanitizedFrom = this.getSanitizedInputValue(this.fromInputRef, from);

        this.updateRange(sanitizedFrom, to);
    };

    private handleToChange = (to: Date) => {
        const useTo = to && this.props.range.from && areRangeBoundsCrossed(this.props.range.from, to);
        const from = useTo ? to : this.props.range.from;
        const sanitizedTo = this.getSanitizedInputValue(this.toInputRef, to);

        this.updateRange(from, sanitizedTo);
    };
}
export const DateRangePicker = injectIntl(DateRangePickerComponent);
