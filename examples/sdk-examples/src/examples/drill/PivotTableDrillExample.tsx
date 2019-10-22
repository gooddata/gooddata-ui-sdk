// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PivotTable, HeaderPredicateFactory } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute, ITotal } from "@gooddata/sdk-model";

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const measures = [
    newMeasure(franchiseFeesIdentifier, m => m.format("#,##0").localId("franchiseFeesIdentifier")),
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m =>
        m.format("#,##0").localId("franchiseFeesAdRoyaltyIdentifier"),
    ),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m =>
        m.format("#,##0").localId("franchiseFeesInitialFranchiseFeeIdentifier"),
    ),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m =>
        m.format("#,##0").localId("franchiseFeesIdentifierOngoingRoyalty"),
    ),
];

const attributes = [
    newAttribute(locationStateDisplayFormIdentifier, a => a.localId("state")),
    newAttribute(locationNameDisplayFormIdentifier, a => a.localId("name")),
    newAttribute(menuCategoryAttributeDFIdentifier, a => a.localId("menu")),
];

const columns = [
    newAttribute(quarterDateIdentifier, a => a.localId("quarter")),
    newAttribute(monthDateIdentifier, a => a.localId("month")),
];

const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "max",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "sum",
        attributeIdentifier: "menu",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "sum",
        attributeIdentifier: "menu",
    },
];

const drillableItems = [
    HeaderPredicateFactory.identifierMatch(menuCategoryAttributeDFIdentifier),
    HeaderPredicateFactory.identifierMatch(franchiseFeesIdentifier),
];

const style = { height: 500 };

export const PivotTableDrillExample: React.FC = () => {
    const backend = useBackend();
    const [{ drillEvent }, setState] = useState({
        drillEvent: null,
    });

    const onDrill = _drillEvent => {
        setState({
            drillEvent: _drillEvent,
        });
    };

    let renderDrillValue;
    if (drillEvent) {
        const drillColumn = drillEvent.drillContext.row[drillEvent.drillContext.columnIndex];
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
                    backend={backend}
                    workspace={projectId}
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
