// (C) 2007-2021 GoodData Corporation
import React, { Component } from "react";
import { BulletChart } from "@gooddata/sdk-ui-charts";
import { modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";

import * as Md from "../../md/full";

const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);
const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesOngoingRoyalty"),
);
const LocationResort = modifyAttribute(Md.LocationResort, (a) => a.localId("locationResort"));
export class BulletChartExample extends Component {
    public render(): React.ReactNode {
        return (
            <div style={{ height: 300 }} className="s-bullet-chart">
                <BulletChart
                    primaryMeasure={FranchiseFeesAdRoyalty}
                    targetMeasure={FranchiseFees}
                    comparativeMeasure={FranchiseFeesOngoingRoyalty}
                    viewBy={LocationResort}
                />
            </div>
        );
    }
}

export default BulletChartExample;
