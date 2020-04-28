// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import {
    newMeasure,
    newAttribute,
    newArithmeticMeasure,
    IFilter,
    newMeasureValueFilter,
} from "@gooddata/sdk-model";
import {
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    locationNameDisplayFormIdentifier,
} from "../../../constants/fixtures";

const franchiseFees = newMeasure(franchiseFeesIdentifier, m =>
    m
        .localId("franchiseFees")
        .title("Franchise Fees")
        .format("#,##0"),
);

const franchiseSales = newMeasure(franchisedSalesIdentifier, m =>
    m
        .localId("franchiseSales")
        .title("Franchise Sales")
        .format("#,##0"),
);

const franchiseFeesFormattedAsPercentage = newArithmeticMeasure(
    [franchiseSales, franchiseFees],
    "change",
    m =>
        m
            .localId("franchiseFeesFormattedAsPercentage")
            .title("Change formatted as %")
            .format("#,##0%"),
);

const measures = [franchiseFees, franchiseSales, franchiseFeesFormattedAsPercentage];

const attributes = [newAttribute(locationNameDisplayFormIdentifier)];

const greaterThanFilter: IFilter = newMeasureValueFilter(
    franchiseFeesFormattedAsPercentage,
    "GREATER_THAN",
    10,
);

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
