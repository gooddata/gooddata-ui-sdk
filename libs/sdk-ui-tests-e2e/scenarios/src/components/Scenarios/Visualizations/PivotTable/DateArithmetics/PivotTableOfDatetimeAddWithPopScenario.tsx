// (C) 2023 GoodData Corporation
import React from "react";
import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";

const measures = [
    ReferenceMd.NoTimeTransformation,
    ReferenceMd.TimeTransformation,
    ReferenceMd.FilterTimeTransformationDatetimeAdd,
    ReferenceMd.TimeTransformationCombined,
];
const filters = [newAbsoluteDateFilter("dt_oppcreated_timestamp", "2010-01-01", "2010-03-31")];

const style = { height: 300 };

export const PivotTableOfDatetimeAddWithPopScenario: React.FC = () => {
    return (
        <div style={style} className="s-pivot-table">
            <PivotTable
                measures={measures}
                rows={[ReferenceMd.DateDatasets.Created.CreatedMonthYear.Default]}
                filters={filters}
            />
        </div>
    );
};
