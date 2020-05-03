// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal } from "@gooddata/sdk-model";

import { workspace } from "../../constants/fixtures";
import { LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const totals: ITotal[] = [
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "avg",
        attributeIdentifier: "month",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "avg",
        attributeIdentifier: "month",
    },
    {
        measureIdentifier: "franchiseFeesInitialFranchiseFeeIdentifier",
        type: "avg",
        attributeIdentifier: "month",
    },
    {
        measureIdentifier: "franchiseFeesIdentifierOngoingRoyalty",
        type: "avg",
        attributeIdentifier: "month",
    },
];

const attributes = [LdmExt.monthDate];

const style = { height: 300 };

export const TableExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable
                backend={backend}
                workspace={workspace}
                measures={measures}
                rows={attributes}
                totals={totals}
            />
        </div>
    );
};
