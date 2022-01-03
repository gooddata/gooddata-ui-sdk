// (C) 2020-2022 GoodData Corporation
import React from "react";
import * as Md from "../../md/full";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { measureLocalId, modifyMeasure, newRankingFilter } from "@gooddata/sdk-model";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measures = [FranchisedSales];

const attributes = [Md.LocationName.Default];

const filters = [newRankingFilter(measureLocalId(FranchisedSales), "TOP", 3)];

export const RankingFilterSimpleExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};
