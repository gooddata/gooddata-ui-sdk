// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ComboChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const columnMeasures = [LdmExt.FranchiseFeesInitialFranchiseFee];

const lineMeasures = [LdmExt.FranchiseFeesAdRoyalty];

const style = { height: 300 };

export const ComboChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-combo-chart">
            <ComboChart
                backend={backend}
                workspace={workspace}
                primaryMeasures={columnMeasures}
                secondaryMeasures={lineMeasures}
                viewBy={Ldm.LocationResort}
            />
        </div>
    );
};
