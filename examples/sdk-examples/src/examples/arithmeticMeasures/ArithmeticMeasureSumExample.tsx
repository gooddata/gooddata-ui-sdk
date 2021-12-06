// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newArithmeticMeasure } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const sum = newArithmeticMeasure(
    [LdmExt.FranchiseFeesOngoingRoyalty, LdmExt.FranchiseFeesAdRoyalty],
    "sum",
    (m) => m.format("#,##0").title("$ Ongoing / Ad Royalty Sum"),
);

const difference = newArithmeticMeasure(
    [LdmExt.FranchiseFeesOngoingRoyalty, LdmExt.FranchiseFeesAdRoyalty],
    "difference",
    (m) => m.format("#,##0").title("$ Ongoing / Ad Royalty Difference"),
);

const measures = [LdmExt.FranchiseFeesAdRoyalty, LdmExt.FranchiseFeesOngoingRoyalty, sum, difference];

const rows = [Ldm.LocationState];

const style = { height: 200 };

export const ArithmeticMeasureSumExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
