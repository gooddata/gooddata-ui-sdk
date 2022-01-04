// (C) 2007-2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { HeaderPredicates, IDrillEvent, IDrillEventCallback } from "@gooddata/sdk-ui";
import {
    attributeIdentifier,
    measureIdentifier,
    modifyMeasure,
    modifyAttribute,
    newTotal,
} from "@gooddata/sdk-model";
import isNil from "lodash/isNil";

import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) => m.format("#,##0"));
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0"),
);

const monthDate = modifyAttribute(Md.DateDatasets.Date.Month.Short, (a) => a.alias("Month"));

const measures = [
    FranchiseFees,
    FranchiseFeesAdRoyalty,
    FranchiseFeesOngoingRoyalty,
    FranchiseFeesInitialFranchiseFee,
];

const attributes = [Md.LocationState, Md.LocationName.Default, Md.MenuCategory];

const columns = [Md.DateDatasets.Date.Quarter.Default, monthDate];

const totals = [
    newTotal("sum", FranchiseFees, Md.LocationState),
    newTotal("sum", FranchiseFeesAdRoyalty, Md.LocationState),
    newTotal("max", FranchiseFees, Md.LocationState),
    newTotal("sum", FranchiseFees, Md.MenuCategory),
    newTotal("sum", FranchiseFeesAdRoyalty, Md.MenuCategory),
];

const drillableItems = [
    HeaderPredicates.identifierMatch(attributeIdentifier(Md.MenuCategory)!),
    HeaderPredicates.identifierMatch(measureIdentifier(Md.$FranchiseFees)!),
];

const DrillEventDisplay: React.FC<{ drillEvent: IDrillEvent | undefined }> = ({ drillEvent }) => {
    if (!drillEvent) {
        return null;
    }

    const drillColumn =
        drillEvent.drillContext.row && drillEvent.drillContext.columnIndex
            ? drillEvent.drillContext.row[drillEvent.drillContext.columnIndex]
            : undefined;

    const drillValue = !isNil(drillColumn) ? drillColumn.name : drillColumn;

    return (
        <h3>
            You have Clicked <span className="s-drill-value">{drillValue}</span>
        </h3>
    );
};

const style: React.CSSProperties = { height: 600 };

export const PivotTableDrillExample: React.FC = () => {
    const [drillEvent, setDrillEvent] = useState<IDrillEvent>();

    const onDrill = useCallback<IDrillEventCallback>((drillEvent) => {
        // eslint-disable-next-line no-console
        console.log(
            "onFiredDrillEvent",
            drillEvent,
            JSON.stringify(drillEvent.drillContext.intersection, null, 2),
        );
        setDrillEvent(drillEvent);
        return true;
    }, []);

    return (
        <div>
            <DrillEventDisplay drillEvent={drillEvent} />
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

export default PivotTableDrillExample;
