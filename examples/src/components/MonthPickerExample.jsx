// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { PureComponent } from "react";
import { ColumnChart, ErrorComponent, Model } from "@gooddata/react-components";
import DatePicker from "react-datepicker";
import moment from "moment";

import "@gooddata/react-components/styles/css/main.css";
import "react-datepicker/dist/react-datepicker.css";

import {
    totalSalesIdentifier,
    monthOfYearDateIdentifier,
    dateDatasetIdentifier,
    projectId,
} from "../utils/fixtures";

const dateFormat = "YYYY-MM-DD";

// sync with backend timezone
function withGTM0(time) {
    return time.utcOffset("+00:00", true);
}

export class MonthPickerExample extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            from: withGTM0(moment("2016-01-01", dateFormat)),
            to: withGTM0(moment("2017-01-01", dateFormat)),
            error: null,
        };

        this.currentDate = withGTM0(moment().startOf("months"));

        this.onFromChange = this.onFromChange.bind(this);
        this.onToChange = this.onToChange.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    }

    onFromChange(value) {
        this.onDateChange("from", value);
    }

    onToChange(value) {
        this.onDateChange("to", value);
    }

    onDateChange(prop, value) {
        const { from, to } = this.state;
        const newState = {
            from,
            to,
            error: null,
        };
        newState[prop] = value;

        if (newState.to.isSameOrAfter(newState.from)) {
            this.setState(newState);
        } else {
            this.setState({
                error: '"From" date must come before "To" date.',
            });
        }
    }

    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info("MonthPickerExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("MonthPickerExample onLoadingChanged", ...params);
    }

    render() {
        const { from, to, error } = this.state;

        const totalSales = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales");

        const locationResort = Model.attribute(monthOfYearDateIdentifier);

        const filters = [
            {
                relativeDateFilter: {
                    dataSet: {
                        identifier: dateDatasetIdentifier,
                    },
                    granularity: "GDC.time.month",
                    from: Math.floor(from.diff(this.currentDate, "months", true)),
                    to: Math.floor(to.diff(this.currentDate, "months", true)),
                },
            },
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
                        onChange={this.onFromChange}
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
                        onChange={this.onToChange}
                        minDate={new Date("2015-01-01")}
                        maxDate={new Date("2017-12-31")}
                        dateFormat="MM/YYYY"
                    />
                </label>
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-month-picker-chart">
                    {error ? (
                        <ErrorComponent message={error} />
                    ) : (
                        <ColumnChart
                            projectId={projectId}
                            measures={[totalSales]}
                            viewBy={locationResort}
                            filters={filters}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default MonthPickerExample;
