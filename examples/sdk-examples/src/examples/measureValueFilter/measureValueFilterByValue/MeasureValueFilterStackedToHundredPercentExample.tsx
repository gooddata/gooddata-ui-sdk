// (C) 2007-2021 GoodData Corporation
import React, { Component } from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    newMeasureValueFilter,
    IMeasureValueFilter,
    modifyMeasure,
    modifyAttribute,
} from "@gooddata/sdk-model";
import * as Md from "../../../md/full";
import { IMeasureValueFilterState } from "./MeasureValueFilterExample";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales").localId("totalSales"),
);
const numberOfChecks = modifyMeasure(Md.NrChecks, (m) =>
    m.localId("numOfChecks").format("#,##0").alias("# Checks").title("Number of Checks"),
);
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("LocationName"));

const measures = [TotalSales, numberOfChecks];

const attributes = [LocationName];

const greaterThanFilter = newMeasureValueFilter(TotalSales, "GREATER_THAN", 7000000);

export class MeasureValueFilterExample extends Component<unknown, IMeasureValueFilterState> {
    state: IMeasureValueFilterState = {
        filters: [],
    };

    public renderPresetButton(
        label: string,
        appliedFilters: IMeasureValueFilter[],
        isActive: boolean,
    ): React.ReactNode {
        return (
            <button
                className={`gd-button gd-button-secondary ${isActive ? "is-active" : ""} s-filter-button`}
                onClick={() =>
                    this.setState({
                        filters: appliedFilters,
                    })
                }
            >
                {label}
            </button>
        );
    }

    public render(): React.ReactNode {
        const { filters } = this.state;
        return (
            <div>
                <div>
                    {this.renderPresetButton("All total sales", [], filters.length === 0)}
                    {this.renderPresetButton(
                        "Total sales greater than 7,000,000 (stacked to 100%)",
                        [greaterThanFilter],
                        filters.length > 0,
                    )}
                </div>
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-stacked-bar">
                    <BarChart
                        measures={measures}
                        viewBy={attributes}
                        config={{
                            stackMeasuresToPercent: true,
                            dataLabels: {
                                visible: true,
                            },
                        }}
                        filters={filters}
                    />
                </div>
            </div>
        );
    }
}

export default MeasureValueFilterExample;
