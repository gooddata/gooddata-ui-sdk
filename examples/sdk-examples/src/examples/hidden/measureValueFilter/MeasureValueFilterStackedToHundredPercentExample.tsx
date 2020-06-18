// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { newMeasureValueFilter } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../../ldm";

const measures = [LdmExt.FranchiseFees, LdmExt.FranchisedSales];

const attributes = [Ldm.LocationName.Default];

const greaterThanFilter = newMeasureValueFilter(LdmExt.FranchiseFees, "GREATER_THAN", 700000);

const filterPresets = [
    {
        key: "noFilter",
        label: "All franchise fees",
        filters: [],
    },
    {
        key: "greaterThanFilter",
        label: "Franchise fees greater than 700,000 (shown in %)",
        filters: [greaterThanFilter],
    },
];

const style = { height: 300 };

export const MeasureValueFilterStackedToHundredPercentExample: React.FC = () => {
    const [state, setState] = useState({
        filters: filterPresets[0].filters,
    });
    const { filters } = state;

    return (
        <div>
            <div>
                {filterPresets.map((presetItem) => {
                    const { key, label, filters: _filters } = presetItem;
                    const isActive = filters === _filters;
                    return (
                        <button
                            key={key}
                            className={`gd-button gd-button-secondary ${isActive ? "is-active" : ""}`}
                            onClick={() =>
                                setState({
                                    filters: _filters,
                                })
                            }
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
            <hr className="separator" />
            <div style={style} className="s-stacked-bar">
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
