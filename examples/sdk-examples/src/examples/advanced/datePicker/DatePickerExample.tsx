// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import DatePicker from "react-datepicker";
import moment from "moment";

import {
    totalSalesIdentifier,
    monthDateIdentifier,
    dateDatasetIdentifier,
    projectId,
} from "../../../constants/fixtures";
import { useBackend } from "../../../context/auth";
import { newMeasure, newAttribute, newAbsoluteDateFilter } from "@gooddata/sdk-model";

const dateFormat = "YYYY-MM-DD";
const measures = [newMeasure(totalSalesIdentifier, m => m.alias("$ Total Sales").format("#,##0"))];
const viewBy = newAttribute(monthDateIdentifier, a => a.alias("Month"));

export const DatePickerExample: React.FC = () => {
    const backend = useBackend();
    const [state, setState] = useState({
        from: moment("2017-01-01", dateFormat),
        to: moment("2017-12-31", dateFormat),
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
        newAbsoluteDateFilter(dateDatasetIdentifier, from.format(dateFormat), to.format(dateFormat)),
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
                <DatePicker className="gd-input-field" selected={from} onChange={onFromChange} />
            </label>
            <label className="s-date-picker-to">
                <h4>To</h4>
                <DatePicker className="gd-input-field" selected={to} onChange={onToChange} />
            </label>
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-date-picker-chart">
                {error ? (
                    <ErrorComponent message={error} />
                ) : (
                    <ColumnChart
                        backend={backend}
                        workspace={projectId}
                        viewBy={viewBy}
                        measures={measures}
                        filters={filters}
                    />
                )}
            </div>
        </div>
    );
};
