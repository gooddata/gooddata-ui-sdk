// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal, newTotal } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const measures = [
    LdmExt.FranchiseFees,
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const attributes = [LdmExt.LocationState, Ldm.LocationName.Default, Ldm.MenuCategory];

const columns = [Ldm.DateQuarter, Ldm.DateMonth.Short];
const totals: ITotal[] = [
    newTotal("sum", LdmExt.FranchiseFees, LdmExt.LocationState),
    newTotal("avg", LdmExt.FranchiseFees, LdmExt.LocationState),
    newTotal("sum", LdmExt.FranchiseFeesAdRoyalty, LdmExt.LocationState),
    newTotal("max", LdmExt.FranchiseFees, LdmExt.LocationState),
];

const style = { height: 600 };
const config = {
    menu: {
        aggregations: true,
    },
};

export const PivotTableTotalsExample: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table-totals">
            <PivotTable
                config={config}
                measures={measures}
                rows={attributes}
                columns={columns}
                pageSize={20}
                totals={totals}
            />
        </div>
    );
};
