// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasureValueFilter, IMeasureValueFilter, modifySimpleMeasure } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const FranchisedSales = modifySimpleMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").defaultLocalId(),
);
const FranchisedSalesWithRatio = modifySimpleMeasure(FranchisedSales, (m) =>
    m.format("#,##0.00%").title("Franchise Sales shown in %").ratio().defaultLocalId(),
);

const measures = [FranchisedSales, FranchisedSalesWithRatio];

const attributes = [Md.LocationName.Default];

const greaterThanFilter = newMeasureValueFilter(FranchisedSalesWithRatio, "GREATER_THAN", 7000000);

export const MeasureValueFilterExample: React.FC = () => {
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
                    "Franchise sales greater than 7,000,000 (shown in %)",
                    [greaterThanFilter],
                    filters.length > 0,
                )}
            </div>
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </div>
    );
};

export default MeasureValueFilterExample;
