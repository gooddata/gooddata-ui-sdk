// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { Ldm, LdmExt } from "../../ldm";

const measures = [LdmExt.NrRestaurants, LdmExt.TotalSales2, LdmExt.arithmeticMeasure3];

const rows = [Ldm.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureRatioExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
