// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { BulletChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";

import * as Md from "../../md/full";

const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));
const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) => m.format("#,##0"));

export class BulletChartExample extends Component {
    public render() {
        return (
            <div style={{ height: 300 }} className="s-bullet-chart">
                <BulletChart
                    primaryMeasure={FranchiseFeesAdRoyalty}
                    targetMeasure={FranchiseFees}
                    comparativeMeasure={FranchiseFeesOngoingRoyalty}
                    viewBy={Md.LocationResort}
                />
            </div>
        );
    }
}

export default BulletChartExample;
