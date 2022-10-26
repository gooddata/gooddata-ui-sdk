// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { newMeasureValueFilter, IMeasureValueFilter, modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);
const numberOfChecks = modifyMeasure(Md.NrChecks, (m) =>
    m.format("#,##0").alias("# Checks").title("Number of Checks"),
);

const measures = [TotalSales, numberOfChecks];

const attributes = [Md.LocationName.Default];

const greaterThanFilter = newMeasureValueFilter(TotalSales, "GREATER_THAN", 7000000);

export const MeasureValueFilterExample: React.FC = () => {
    const [filters, setFilters] = useState<IMeasureValueFilter[]>([]);

    const renderPresetButton = (
        label: string,
        appliedFilters: IMeasureValueFilter[],
        isActive: boolean,
    ): React.ReactNode => {
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
                {renderPresetButton("All total sales", [], filters.length === 0)}
                {renderPresetButton(
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
};

export default MeasureValueFilterExample;
