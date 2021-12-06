// (C) 2020 GoodData Corporation
import React from "react";
import { LdmExt } from "../../md";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newRankingFilter } from "@gooddata/sdk-model";

const measures = [LdmExt.FranchisedSales];

const attributes = [LdmExt.LocationName];

const filters = [newRankingFilter(LdmExt.franchiseSalesLocalId, "TOP", 3)];

export const RankingFilterSimpleExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};
