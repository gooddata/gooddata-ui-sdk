// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { HeaderPredicates, IDrillEvent } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    ITotal,
    attributeIdentifier,
    measureIdentifier,
    modifyMeasure,
    modifyAttribute,
} from "@gooddata/sdk-model";
import { Md } from "../../md";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0").localId("franchiseFeesInitialFranchiseFee"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesOngoingRoyalty"),
);
const LocationState = modifyAttribute(Md.LocationState, (a) => a.localId("locationState"));
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("locationName"));
const MenuCategory = modifyAttribute(Md.MenuCategory, (a) => a.localId("menuCategory"));
const quarterDate = modifyAttribute(Md.DateDatasets.Date.Quarter.Default, (a) => a.localId("quarterDate"));
const monthDate = modifyAttribute(Md.DateDatasets.Date.Month.Short, (a) =>
    a.alias("Month").localId("monthDate"),
);

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesInitialFranchiseFee,
    FranchiseFeesOngoingRoyalty,
];

const attributes = [LocationState, LocationName, MenuCategory];

const columns = [quarterDate, monthDate];

const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFees",
        type: "sum",
        attributeIdentifier: "locationState",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyalty",
        type: "sum",
        attributeIdentifier: "locationState",
    },
    {
        measureIdentifier: "franchiseFees",
        type: "max",
        attributeIdentifier: "locationState",
    },
    {
        measureIdentifier: "franchiseFees",
        type: "sum",
        attributeIdentifier: "menu",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyalty",
        type: "sum",
        attributeIdentifier: "menu",
    },
];

const drillableItems = [
    HeaderPredicates.identifierMatch(attributeIdentifier(MenuCategory)!),
    HeaderPredicates.identifierMatch(measureIdentifier(FranchiseFees)!),
];

const style = { height: 500 };

export const PivotTableDrillExample: React.FC = () => {
    const [drillEvent, setState] = useState<IDrillEvent>();

    const onDrill = (drillEvent: IDrillEvent) => {
        setState(drillEvent);
    };

    let renderDrillValue;
    if (drillEvent) {
        const drillColumn = drillEvent.drillContext.row![drillEvent.drillContext.columnIndex!];
        const drillValue = typeof drillColumn === "object" ? drillColumn.name : drillColumn;
        renderDrillValue = (
            <h3>
                You have Clicked <span className="s-drill-value">{drillValue}</span>
            </h3>
        );
    }

    return (
        <div>
            {renderDrillValue}
            <div style={style} className="s-pivot-table-drill">
                <PivotTable
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    pageSize={20}
                    drillableItems={drillableItems}
                    onDrill={onDrill}
                    totals={totals}
                />
            </div>
        </div>
    );
};
