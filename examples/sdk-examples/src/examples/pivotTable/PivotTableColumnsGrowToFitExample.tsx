// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { LdmExt } from "../../ldm";

const measures = [LdmExt.FranchiseFees];

const attributes = [LdmExt.LocationState];

const columns = [LdmExt.quaterDate];

const config = {
    columnSizing: {
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
