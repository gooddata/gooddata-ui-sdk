// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { BulletChart } from "@gooddata/sdk-ui-charts";

import { LdmExt } from "../../md";

export class BulletChartExample extends Component {
    public render(): React.ReactNode {
        return (
            <div style={{ height: 300 }} className="s-bullet-chart">
                <BulletChart
                    primaryMeasure={LdmExt.FranchiseFeesAdRoyalty}
                    targetMeasure={LdmExt.FranchiseFees}
                    comparativeMeasure={LdmExt.FranchiseFeesOngoingRoyalty}
                    viewBy={LdmExt.LocationResort}
                />
            </div>
        );
    }
}

export default BulletChartExample;
