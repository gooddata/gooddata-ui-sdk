// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { BulletChart } from "@gooddata/sdk-ui-charts";

import { MdExt } from "../../md";

export class BulletChartExample extends Component {
    public render(): React.ReactNode {
        return (
            <div style={{ height: 300 }} className="s-bullet-chart">
                <BulletChart
                    primaryMeasure={MdExt.FranchiseFeesAdRoyalty}
                    targetMeasure={MdExt.FranchiseFees}
                    comparativeMeasure={MdExt.FranchiseFeesOngoingRoyalty}
                    viewBy={MdExt.LocationResort}
                />
            </div>
        );
    }
}

export default BulletChartExample;
