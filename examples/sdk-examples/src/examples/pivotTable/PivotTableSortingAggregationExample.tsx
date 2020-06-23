// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeAreaSort } from "@gooddata/sdk-model";

import { LdmExt, Ldm } from "../../ldm";

export class PivotTableSortingAggregationExample extends Component {
    public render() {
        return (
            <div style={{ height: 300 }} className="s-pivot-table-sorting">
                <PivotTable
                    measures={[LdmExt.FranchiseFees]}
                    rows={[LdmExt.LocationState]}
                    columns={[Ldm.DateQuarter]}
                    pageSize={20}
                    sortBy={[newAttributeAreaSort(LdmExt.LocationState, "desc")]}
                />
            </div>
        );
    }
}

export default PivotTableSortingAggregationExample;
