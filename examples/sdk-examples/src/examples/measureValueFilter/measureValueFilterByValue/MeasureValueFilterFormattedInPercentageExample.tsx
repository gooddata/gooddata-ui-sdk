// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasureValueFilter, IMeasureValueFilter, modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const FranchisedSalesAsPercent = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0%").title("Franchise Sales"),
);

const measures = [FranchisedSalesAsPercent];

const attributes = [Md.LocationName.Default];

const greaterThanFilter = newMeasureValueFilter(FranchisedSalesAsPercent, "GREATER_THAN", 7000000);

const PresetButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = (props) => {
    const { label, isActive, onClick } = props;

    return (
        <button
            className={`gd-button gd-button-secondary ${isActive ? "is-active" : ""} s-filter-button`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};

export const MeasureValueFilterExample: React.FC = () => {
    const [filters, setFilters] = useState<IMeasureValueFilter[]>([]);

    return (
        <div>
            <div>
                <PresetButton
                    label="All franchise sales"
                    onClick={() => setFilters([])}
                    isActive={filters.length === 0}
                />
                <PresetButton
                    label="Franchise sales greater than 700,000,000%"
                    onClick={() => setFilters([greaterThanFilter])}
                    isActive={filters.length > 0}
                />
            </div>
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </div>
    );
};

export default MeasureValueFilterExample;
