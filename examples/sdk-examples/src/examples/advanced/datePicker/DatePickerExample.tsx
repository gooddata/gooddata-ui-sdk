// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import DatePicker from "react-datepicker";
import moment from "moment";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { Md } from "../../../md";
import { modifyAttribute, modifyMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));
const monthDate = modifyAttribute(Md.DateDatasets.Date.Month.Short, (a) =>
    a.alias("Month").localId("monthDate"),
);

const dateFormat = "YYYY-MM-DD";
const measures = [TotalSales];

export interface IDatePickerState {
    from: moment.Moment;
    to: moment.Moment;
    error: string | undefined;
}

export const DatePickerExample: React.FC = () => {
    const [state, setState] = useState<IDatePickerState>({
        from: moment("2017-01-01"),
        to: moment("2017-12-31"),
        error: undefined,
    });

    const onDateChange = (prop: any, value: Date) => {
        setState((oldState) => {
            const { from, to } = oldState;
            const newState: any = {
                from,
                to,
                error: undefined,
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
        newAbsoluteDateFilter(Md.DateDatasets.Date.ref, from.format(dateFormat), to.format(dateFormat)),
    ];

    return (
        <div className="s-date-picker">
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
            <label className="s-date-picker-from">
                <h4>From</h4>
                <DatePicker className="gd-input-field" selected={from.toDate()} onChange={onFromChange} />
            </label>
            <label className="s-date-picker-to">
                <h4>To</h4>
                <DatePicker className="gd-input-field" selected={to.toDate()} onChange={onToChange} />
            </label>
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-date-picker-chart">
                {error ? (
                    <ErrorComponent message={error} />
                ) : (
                    <ColumnChart viewBy={monthDate} measures={measures} filters={filters} />
                )}
            </div>
        </div>
    );
};
