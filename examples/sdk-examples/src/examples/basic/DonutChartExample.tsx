// (C) 2007-2019 GoodData Corporation
import React from "react";
import { DonutChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const measures = [
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const style = { height: 300 };

export const DonutChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-donut-chart">
            <DonutChart backend={backend} workspace={workspace} measures={measures} />
        </div>
    );
};
