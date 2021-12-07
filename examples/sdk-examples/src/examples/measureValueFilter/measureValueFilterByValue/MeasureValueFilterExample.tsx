// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    newMeasureValueFilter,
    IMeasureValueFilter,
    modifyMeasure,
    modifyAttribute,
} from "@gooddata/sdk-model";
import { Md } from "../../../md";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId("franchiseSales"),
);
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("locationName"));

const measures = [FranchisedSales];

const attributes = [LocationName];
const greaterThanFilter = newMeasureValueFilter(FranchisedSales, "GREATER_THAN", 7000000);

const betweenFilter = newMeasureValueFilter(FranchisedSales, "BETWEEN", 5000000, 8000000);

export interface IMeasureValueFilterState {
    filters: IMeasureValueFilter[];
}

export class FilterByValueExample extends Component<unknown, IMeasureValueFilterState> {
    state: IMeasureValueFilterState = {
        filters: [],
    };

    public renderPresetButton(
        label: string,
        appliedFilters: IMeasureValueFilter[],
        isActive: boolean,
    ): JSX.Element {
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
                    {this.renderPresetButton("All franchise sales", [], filters.length === 0)}
                    {this.renderPresetButton(
                        "Franchise sales greater than 7,000,000",
                        [greaterThanFilter],
                        filters[0] === greaterThanFilter,
                    )}
                    {this.renderPresetButton(
                        "Franchise sales between 5,000,000 and 8,000,000",
                        [betweenFilter],
                        filters[0] === betweenFilter,
                    )}
                </div>
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-pivot-table">
                    <PivotTable measures={measures} rows={attributes} filters={filters} />
                </div>
            </div>
        );
    }
}

export default FilterByValueExample;
