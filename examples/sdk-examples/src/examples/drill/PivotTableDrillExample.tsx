// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { HeaderPredicates, IDrillEvent } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal, attributeIdentifier, measureIdentifier } from "@gooddata/sdk-model";
import { MdExt } from "../../md";

const measures = [
    MdExt.FranchiseFees,
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];

const attributes = [MdExt.LocationState, MdExt.LocationName, MdExt.MenuCategory];

const columns = [MdExt.quarterDate, MdExt.monthDate];

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
    HeaderPredicates.identifierMatch(attributeIdentifier(MdExt.MenuCategory)!),
    HeaderPredicates.identifierMatch(measureIdentifier(MdExt.FranchiseFees)!),
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
