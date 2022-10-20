// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasureValueFilter, IMeasureValueFilter, modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measures = [FranchisedSales];

const attributes = [Md.LocationName.Default];
const greaterThanFilter = newMeasureValueFilter(FranchisedSales, "GREATER_THAN", 7000000);

const betweenFilter = newMeasureValueFilter(FranchisedSales, "BETWEEN", 5000000, 8000000);

export interface IMeasureValueFilterState {
    filters: IMeasureValueFilter[];
}

export const FilterByValueExample: React.FC = () => {
    const [filters, setFilters] = useState<IMeasureValueFilter[]>([]);

    const renderPresetButton = (
        label: string,
        appliedFilters: IMeasureValueFilter[],
        isActive: boolean,
    ): JSX.Element => {
        return (
            <button
                className={`gd-button gd-button-secondary ${isActive ? "is-active" : ""} s-filter-button`}
                onClick={() => setFilters(appliedFilters)}
            >
                {label}
            </button>
        );
    };

    return (
        <div>
            <div>
                {renderPresetButton("All franchise sales", [], filters.length === 0)}
                {renderPresetButton(
                    "Franchise sales greater than 7,000,000",
                    [greaterThanFilter],
                    filters[0] === greaterThanFilter,
                )}
                {renderPresetButton(
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
};

export default FilterByValueExample;
