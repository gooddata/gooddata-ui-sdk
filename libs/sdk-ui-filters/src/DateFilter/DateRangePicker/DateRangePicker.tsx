// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DayPickerProps } from "react-day-picker";
import MomentLocaleUtils from "react-day-picker/moment";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { translationUtils } from "@gooddata/util";
import { mergeDayPickerProps, areRangeBoundsCrossed } from "./utils";
import { DateRangePickerError } from "./DateRangePickerError";
import { IExtendedDateFilterErrors } from "../interfaces";
import { DateTimePicker } from "./DateTimePicker";

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
    isTimeEnabled: boolean;
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
            isTimeEnabled,
        } = this.props;

        const defaultDayPickerProps: Partial<DayPickerProps> = {
            showOutsideDays: true,
            modifiers: { start: from, end: to },
            selectedDays: [from, { from, to }],
            locale: translationUtils.sanitizeLocaleForMoment(intl.locale),
            localeUtils: MomentLocaleUtils,
        };

        const dayPickerPropsWithDefaults = mergeDayPickerProps(defaultDayPickerProps, dayPickerProps);

        const FromField = (
            <DateTimePicker
                placeholderDate={intl.formatMessage({ id: "filters.from" })}
                onChange={this.handleFromChange}
                value={from}
                dateFormat={dateFormat}
                isMobile={isMobile}
                locale={translationUtils.sanitizeLocaleForMoment(intl.locale)}
                dayPickerPropsWithDefaults={dayPickerPropsWithDefaults}
                handleDayClick={this.handleFromDayClick}
                ref={this.fromInputRef}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-from", "gd-date-range-picker-from")}
                error={typeof errorFrom !== "undefined"}
            />
        );

        const ToField = (
            <DateTimePicker
                placeholderDate={intl.formatMessage({ id: "filters.to" })}
                onChange={this.handleToChange}
                value={to}
                dateFormat={dateFormat}
                isMobile={isMobile}
                locale={translationUtils.sanitizeLocaleForMoment(intl.locale)}
                dayPickerPropsWithDefaults={dayPickerPropsWithDefaults}
                handleDayClick={this.handleToDayClick}
                ref={this.toInputRef}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-to", "gd-date-range-picker-to")}
                defaultTime="23:59"
                error={typeof errorTo !== "undefined"}
            />
        );

        return (
            <>
                {isTimeEnabled ? (
                    <div className="gd-date-range-picker datetime s-date-range-picker">
                        <label>{intl.formatMessage({ id: "filters.from" })}</label>
                        {FromField}
                        <label>{intl.formatMessage({ id: "filters.to" })}</label>
                        {ToField}
                    </div>
                ) : (
                    <div className="gd-date-range-picker gd-flex-row s-date-range-picker">
                        {FromField}
                        <span className="gd-date-range-picker-dash">&ndash;</span>
                        {ToField}
                    </div>
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

    private blurField = (inputRef: any) => {
        if (inputRef.current) {
            inputRef.current.getInput().blur();
        }
    };

    private updateRange = (from: Date, to: Date) => {
        this.props.onRangeChange({ from, to });
    };

    private handleFromDayClick = () => {
        this.blurField(this.fromInputRef);
    };

    private handleToDayClick = () => {
        this.blurField(this.toInputRef);
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
