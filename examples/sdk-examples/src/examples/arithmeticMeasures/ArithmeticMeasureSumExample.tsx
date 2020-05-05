// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { Ldm, LdmExt } from "../../ldm";

const measures = [
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesOngoingRoyalty,
    LdmExt.arithmeticMeasure4,
    LdmExt.arithmeticMeasure5,
];

const rows = [Ldm.LocationState];

const style = { height: 200 };

export const ArithmeticMeasureSumExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
