// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { ITotal, newTotal } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const measures = [
    MdExt.FranchiseFees,
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];

const attributes = [MdExt.LocationState, Md.LocationName.Default, Md.MenuCategory];

const columns = [Md.DateQuarter, Md.DateMonth.Short];
const totals: ITotal[] = [
    newTotal("sum", MdExt.FranchiseFees, MdExt.LocationState),
    newTotal("avg", MdExt.FranchiseFees, MdExt.LocationState),
    newTotal("sum", MdExt.FranchiseFeesAdRoyalty, MdExt.LocationState),
    newTotal("max", MdExt.FranchiseFees, MdExt.LocationState),
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
