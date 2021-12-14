// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesOngoingRoyalty"),
);
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);

const sum = newArithmeticMeasure([FranchiseFeesOngoingRoyalty, FranchiseFeesAdRoyalty], "sum", (m) =>
    m.format("#,##0").title("$ Ongoing / Ad Royalty Sum"),
);

const difference = newArithmeticMeasure(
    [FranchiseFeesOngoingRoyalty, FranchiseFeesAdRoyalty],
    "difference",
    (m) => m.format("#,##0").title("$ Ongoing / Ad Royalty Difference"),
);

const measures = [FranchiseFeesAdRoyalty, FranchiseFeesOngoingRoyalty, sum, difference];

const rows = [Md.LocationState];

const style = { height: 200 };

export const ArithmeticMeasureSumExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
