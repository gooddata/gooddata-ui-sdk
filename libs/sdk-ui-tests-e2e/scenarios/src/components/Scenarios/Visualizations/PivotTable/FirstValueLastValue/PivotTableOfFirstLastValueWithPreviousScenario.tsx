// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

const measures = [ReferenceMd.FirstValueOfAmountWithPrevious, ReferenceMd.LastValueOfAmountWithPrevious];
const filters = [
    newPositiveAttributeFilter("attr.f_owner.salesrep", [
        "Alejandro Vabiano",
        "Adam Bradley",
        "Alexsandr Fyodr",
    ]),
];

const style = { height: 300 };

export const PivotTableOfFirstLastValueWithPreviousScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable measures={measures} rows={[ReferenceMd.SalesRep.Default]} filters={filters} />
        </div>
    );
};
