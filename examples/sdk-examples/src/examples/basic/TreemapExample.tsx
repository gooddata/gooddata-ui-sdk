// (C) 2007-2021 GoodData Corporation
import React from "react";
import { Treemap } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const numberOfChecks = modifyMeasure(Md.NrChecks, (m) =>
    m.localId("numOfChecks").format("#,##0").alias("# Checks").title("Number of Checks"),
);

const style = { height: 300 };

export const TreemapExample: React.FC = () => {
    return (
        <div style={style} className="s-tree-map">
            <Treemap measures={[numberOfChecks]} viewBy={Md.LocationState} segmentBy={Md.LocationCity} />
        </div>
    );
};
