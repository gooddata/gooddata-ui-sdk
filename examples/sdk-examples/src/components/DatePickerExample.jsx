// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from "react";
import { AfmComponents, ErrorComponent } from "@gooddata/react-components";
import DatePicker from "react-datepicker";
import moment from "moment";

import "@gooddata/react-components/styles/css/main.css";
import "react-datepicker/dist/react-datepicker.css";

import {
    totalSalesIdentifier,
    monthDateIdentifier,
    dateDatasetIdentifier,
    projectId,
} from "../utils/fixtures";

const { ColumnChart } = AfmComponents;

const dateFormat = "YYYY-MM-DD";

export class DatePickerExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            from: moment("2017-01-01", dateFormat),
            to: moment("2017-12-31", dateFormat),
            error: null,
        };

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
        console.info("DatePickerExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("DatePickerExample onLoadingChanged", ...params);
    }

    render() {
        const { from, to, error } = this.state;

        const afm = {
            measures: [
                {
                    localIdentifier: "totalSales",
                    definition: {
                        measure: {
                            item: {
                                identifier: totalSalesIdentifier,
                            },
                        },
                    },
                    alias: "$ Total Sales",
                    format: "#,##0",
                },
            ],
            attributes: [
                {
                    displayForm: {
                        identifier: monthDateIdentifier,
                    },
                    localIdentifier: "month",
                },
            ],
            filters: [
                {
                    absoluteDateFilter: {
                        dataSet: {
                            identifier: dateDatasetIdentifier,
                        },
                        from: from.format(dateFormat),
                        to: to.format(dateFormat),
                    },
                },
            ],
        };

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
                    <DatePicker className="gd-input-field" selected={from} onChange={this.onFromChange} />
                </label>
                <label className="s-date-picker-to">
                    <h4>To</h4>
                    <DatePicker className="gd-input-field" selected={to} onChange={this.onToChange} />
                </label>
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-date-picker-chart">
                    {error ? (
                        <ErrorComponent message={error} />
                    ) : (
                        <ColumnChart
                            projectId={projectId}
                            afm={afm}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default DatePickerExample;
