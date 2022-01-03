// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure, newAttributeAreaSort } from "@gooddata/sdk-model";

import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));

export const PivotTableSortingAggregationExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-pivot-table-sorting">
            <PivotTable
                measures={[FranchiseFees]}
                rows={[Md.LocationState]}
                columns={[Md.DateQuarter]}
                pageSize={20}
                sortBy={[newAttributeAreaSort(Md.LocationState, "desc")]}
            />
        </div>
    );
};

export default PivotTableSortingAggregationExample;
