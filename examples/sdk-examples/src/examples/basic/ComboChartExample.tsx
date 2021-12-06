// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ComboChart } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../md";

const columnMeasures = [LdmExt.FranchiseFeesInitialFranchiseFee];

const lineMeasures = [LdmExt.FranchiseFeesAdRoyalty];

const style = { height: 300 };

export const ComboChartExample: React.FC = () => {
    return (
        <div style={style} className="s-combo-chart">
            <ComboChart
                primaryMeasures={columnMeasures}
                secondaryMeasures={lineMeasures}
                viewBy={Ldm.LocationResort}
            />
        </div>
    );
};
