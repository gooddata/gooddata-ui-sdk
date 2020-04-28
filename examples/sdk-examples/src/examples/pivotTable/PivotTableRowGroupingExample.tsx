// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

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
    newMeasure(franchiseFeesIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0")),
    newMeasure(franchiseFeesIdentifierOngoingRoyalty, m => m.format("#,##0")),
];
const attributes = [
    newAttribute(locationStateDisplayFormIdentifier),
    newAttribute(locationNameDisplayFormIdentifier),
    newAttribute(menuCategoryAttributeDFIdentifier),
];
const columns = [newAttribute(quarterDateIdentifier), newAttribute(monthDateIdentifier)];
const style = { height: 500 };

export const PivotTableRowGroupingExample: React.FC = () => {
    const backend = useBackend();
    return (
        <div style={style} className="s-pivot-table-row-grouping">
            <PivotTable
                backend={backend}
                workspace={projectId}
                measures={measures}
                rows={attributes}
                columns={columns}
                pageSize={20}
                groupRows
            />
        </div>
    );
};
