// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyAttribute, modifyMeasure, newAttributeAreaSort } from "@gooddata/sdk-model";

import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const LocationState = modifyAttribute(Md.LocationState, (a) => a.localId("locationState"));

export const PivotTableSortingAggregationExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-pivot-table-sorting">
            <PivotTable
                measures={[FranchiseFees]}
                rows={[LocationState]}
                columns={[Md.DateQuarter]}
                pageSize={20}
                sortBy={[newAttributeAreaSort(LocationState, "desc")]}
            />
        </div>
    );
};

export default PivotTableSortingAggregationExample;
