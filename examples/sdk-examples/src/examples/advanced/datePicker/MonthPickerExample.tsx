// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newRelativeDateFilter } from "@gooddata/sdk-model";
import DatePicker from "react-datepicker";
import moment from "moment";

import { workspace } from "../../../constants/fixtures";
import { Ldm, LdmExt } from "../../../ldm";
import { useBackend } from "../../../context/auth";

const dateFormat = "YYYY-MM-DD";

// sync with backend timezone
const withGTM0 = time => time.utcOffset("+00:00", true);

const currentDate = withGTM0(moment().startOf("months"));

const measures = [LdmExt.TotalSales1];

const style = { height: 300 };

export const MonthPickerExample: React.FC = () => {
    const backend = useBackend();
    const [state, setState] = useState({
        from: withGTM0(moment("2016-01-01", dateFormat)),
        to: withGTM0(moment("2017-01-01", dateFormat)),
        error: null,
    });

    const onDateChange = (prop, value) =>
        setState(oldState => {
            const { from, to } = oldState;
            const newState = {
                from,
                to,
                error: null,
            };
            newState[prop] = value;

            return newState.to.isSameOrAfter(newState.from)
                ? newState
                : {
                      ...oldState,
                      error: '"From" date must come before "To" date.',
                  };
        });

    const onFromChange = value => {
        onDateChange("from", value);
    };

    const onToChange = value => {
        onDateChange("to", value);
    };

    const { from, to, error } = state;

    const filters = [
        newRelativeDateFilter(
            LdmExt.dateDatasetIdentifier,
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
                    selected={from}
                    onChange={onFromChange}
                    minDate={new Date("2015-01-01")}
                    maxDate={new Date("2017-12-31")}
                    dateFormat="MM/YYYY"
                />
            </label>
            <label className="s-month-picker-to">
                <h4>To</h4>
                <DatePicker
                    className="gd-input-field"
                    selected={to}
                    onChange={onToChange}
                    minDate={new Date("2015-01-01")}
                    maxDate={new Date("2017-12-31")}
                    dateFormat="MM/YYYY"
                />
            </label>
            <hr className="separator" />
            <div style={style} className="s-month-picker-chart">
                {error ? (
                    <ErrorComponent message={error} />
                ) : (
                    <ColumnChart
                        backend={backend}
                        workspace={workspace}
                        measures={measures}
                        viewBy={Ldm.DateMonthYear.Short}
                        filters={filters}
                    />
                )}
            </div>
        </div>
    );
};
