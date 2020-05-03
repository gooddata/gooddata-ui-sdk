// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal, attributeLocalId, measureLocalId } from "@gooddata/sdk-model";

import { workspace } from "../../constants/fixtures";
import { LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const attributes = [LdmExt.LocationState, LdmExt.LocationName, LdmExt.MenuCategory];

const columns = [LdmExt.quaterDate, LdmExt.monthDate];

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
    HeaderPredicates.identifierMatch(attributeLocalId(LdmExt.MenuCategory)),
    HeaderPredicates.identifierMatch(measureLocalId(LdmExt.FranchiseFees)),
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
                    workspace={workspace}
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
