// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import { IFilter, newMeasureValueFilter } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../../ldm";

const measures = [LdmExt.FranchiseFees, LdmExt.FranchisedSales, LdmExt.arithmeticMeasure6];

const attributes = [Ldm.LocationName.Default];

const greaterThanFilter: IFilter = newMeasureValueFilter(LdmExt.arithmeticMeasure6, "GREATER_THAN", 10);

const filterPresets = [
    {
        key: "noFilter",
        label: "All franchise fees",
        filters: [],
    },
    {
        key: "greaterThanFilter",
        label: "Franchise fees greater than 1000%",
        filters: [greaterThanFilter],
    },
];

const style = { height: 300 };

export const MeasureValueFilterFormattedInPercentageExample: React.FC = () => {
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
            <div style={style} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </div>
    );
};
