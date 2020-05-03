// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const measures = [LdmExt.NrRestaurants, LdmExt.TotalSales2, LdmExt.arithmeticMeasure3];

const rows = [Ldm.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureRatioExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable backend={backend} workspace={workspace} measures={measures} rows={rows} />
        </div>
    );
};
