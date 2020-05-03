// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PieChart } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const measures = [
    LdmExt.FranchiseFeesAdRoyalty,
    LdmExt.FranchiseFeesInitialFranchiseFee,
    LdmExt.FranchiseFeesOngoingRoyalty,
];

const style = { height: 300 };

export const PieChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-pie-chart">
            <PieChart backend={backend} workspace={workspace} measures={measures} />
        </div>
    );
};
