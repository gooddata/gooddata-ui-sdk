// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ComboChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0"),
);
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));

const columnMeasures = [FranchiseFeesInitialFranchiseFee];

const lineMeasures = [FranchiseFeesAdRoyalty];

const style = { height: 300 };

export const ComboChartExample: React.FC = () => {
    return (
        <div style={style} className="s-combo-chart">
            <ComboChart
                primaryMeasures={columnMeasures}
                secondaryMeasures={lineMeasures}
                viewBy={Md.LocationResort}
            />
        </div>
    );
};
