// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasure, newAttribute, IFilter, newMeasureValueFilter } from "@gooddata/sdk-model";
import { franchiseFeesIdentifier, locationNameDisplayFormIdentifier } from "../../../constants/fixtures";

const franchiseFees = newMeasure(franchiseFeesIdentifier, m => m.title("Franchise Fees").format("#,##0"));

const franchiseFeesAsPercents = newMeasure(franchiseFeesIdentifier, m =>
    m.title("Franchise Fees shown in %").ratio(),
);

const measures = [franchiseFees, franchiseFeesAsPercents];

const attributes = [newAttribute(locationNameDisplayFormIdentifier)];

const greaterThanFilter = newMeasureValueFilter(franchiseFeesAsPercents, "GREATER_THAN", 700000);

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

export const MeasureValueFilterShownInPercentageExample: React.FC = () => {
    const [state, setState] = useState({
        filters: filterPresets[0].filters,
    });
    const { filters } = state;

    return (
        <div>
            <div>
                {filterPresets.map(presetItem => {
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
