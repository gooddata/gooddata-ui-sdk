// (C) 2007-2020 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeAreaSort } from "@gooddata/sdk-model";

import { MdExt, Md } from "../../md";

export const PivotTableSortingAggregationExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-pivot-table-sorting">
            <PivotTable
                measures={[MdExt.FranchiseFees]}
                rows={[MdExt.LocationState]}
                columns={[Md.DateQuarter]}
                pageSize={20}
                sortBy={[newAttributeAreaSort(MdExt.LocationState, "desc")]}
            />
        </div>
    );
};

export default PivotTableSortingAggregationExample;
