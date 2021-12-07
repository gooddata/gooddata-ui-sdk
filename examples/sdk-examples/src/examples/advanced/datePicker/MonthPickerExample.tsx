// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";
import DatePicker from "react-datepicker";
import moment from "moment";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { Md } from "../../../md";
import { IDatePickerState } from "./DatePickerExample";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));

const dateFormat = "yyyy-MM-DD";

// sync with backend timezone
const withGTM0 = (time: moment.Moment) => time.utcOffset("+00:00", true);

const currentDate = withGTM0(moment().startOf("months"));

const measures = [TotalSales];

const style = { height: 300 };

export const MonthPickerExample: React.FC = () => {
    const [state, setState] = useState<IDatePickerState>({
        from: withGTM0(moment("2016-01-01", dateFormat)),
        to: withGTM0(moment("2017-01-01", dateFormat)),
        error: undefined,
    });

    const onDateChange = (prop: any, value: Date) => {
        setState((oldState) => {
            const { from, to } = oldState;
            const newState: any = {
                from,
                to,
                error: null,
            };
            newState[prop] = moment(value);

            return newState.to.isSameOrAfter(newState.from)
                ? newState
                : {
                      ...oldState,
                      error: '"From" date must come before "To" date.',
                  };
        });
    };

    const onFromChange = (value: Date) => {
        onDateChange("from", value);
    };

    const onToChange = (value: Date) => {
        onDateChange("to", value);
    };

    const { from, to, error } = state;

    const filters = [
        newRelativeDateFilter(
            Md.DateDatasets.Date.ref,
            "GDC.time.month",
            Math.floor(from.diff(currentDate, "months", true)),
            Math.floor(to.diff(currentDate, "months", true)),
        ),
    ];

    return (
        <div className="s-month-picker">
            <style jsx>{`
                label {
                    display: inline-block;
                    vertical-align: top;
                    margin-right: 20px;
                }
                h4 {
                    margin-bottom: 0;
                }
                label :global(.gd-input-field) {
                    min-width: 212px;
                }
            `}</style>
            <label className="s-month-picker-from">
                <h4>From</h4>
                <DatePicker
                    className="gd-input-field"
                    selected={from.toDate()}
                    onChange={onFromChange}
                    minDate={new Date("2015-01-01")}
                    maxDate={new Date("2017-12-31")}
                    dateFormat="MM/yyyy"
                />
            </label>
            <label className="s-month-picker-to">
                <h4>To</h4>
                <DatePicker
                    className="gd-input-field"
                    selected={to.toDate()}
                    onChange={onToChange}
                    minDate={new Date("2015-01-01")}
                    maxDate={new Date("2017-12-31")}
                    dateFormat="MM/yyyy"
                />
            </label>
            <hr className="separator" />
            <div style={style} className="s-month-picker-chart">
                {error ? (
                    <ErrorComponent message={error} />
                ) : (
                    <ColumnChart measures={measures} viewBy={Md.DateMonthYear.Short} filters={filters} />
                )}
            </div>
        </div>
    );
};
