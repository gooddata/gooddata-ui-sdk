// (C) 2020-2021 GoodData Corporation
import React from "react";
import * as Md from "../../md/full";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { measureLocalId, modifyAttribute, modifyMeasure, newRankingFilter } from "@gooddata/sdk-model";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId("franchiseSales"),
);
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("locationName"));

const measures = [FranchisedSales];

const attributes = [LocationName];

const filters = [newRankingFilter(measureLocalId(FranchisedSales), "TOP", 3)];

export const RankingFilterSimpleExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-pivot-table">
            <PivotTable measures={measures} rows={attributes} filters={filters} />
        </div>
    );
};
