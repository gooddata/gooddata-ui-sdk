// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newArithmeticMeasure } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const sum = newArithmeticMeasure(
    [MdExt.FranchiseFeesOngoingRoyalty, MdExt.FranchiseFeesAdRoyalty],
    "sum",
    (m) => m.format("#,##0").title("$ Ongoing / Ad Royalty Sum"),
);

const difference = newArithmeticMeasure(
    [MdExt.FranchiseFeesOngoingRoyalty, MdExt.FranchiseFeesAdRoyalty],
    "difference",
    (m) => m.format("#,##0").title("$ Ongoing / Ad Royalty Difference"),
);

const measures = [MdExt.FranchiseFeesAdRoyalty, MdExt.FranchiseFeesOngoingRoyalty, sum, difference];

const rows = [Md.LocationState];

const style = { height: 200 };

export const ArithmeticMeasureSumExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
