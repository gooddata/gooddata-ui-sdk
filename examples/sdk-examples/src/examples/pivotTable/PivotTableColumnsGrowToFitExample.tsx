// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PivotTable, IPivotTableConfig } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));

const measures = [FranchiseFees];
const attributes = [Md.EmployeeName.Default];
const columns = [Md.LocationName.Default];

const config: IPivotTableConfig = {
    columnSizing: {
        defaultWidth: "viewport",
        growToFit: true,
    },
};

export const PivotTableColumnsGrowToFitExample: React.FC = () => {
    return (
        <div
            style={{ height: 300, resize: "both", overflow: "auto" }}
            className="s-pivot-table-columns-grow-to-fit"
        >
            <PivotTable
                measures={measures}
                rows={attributes}
                columns={columns}
                config={config}
                pageSize={20}
            />
        </div>
    );
};

export default PivotTableColumnsGrowToFitExample;
