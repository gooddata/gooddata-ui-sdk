// (C) 2023 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";
import {
    transposeConfigWithRowLeft,
    transposeConfigWithColumnLeft,
    transposeConfigWithColumnTop,
    transposeConfigWithRow,
    transposeConfigWithLeft,
    IPivotTableTransposeCoreProps,
} from "../Visualizations/PivotTable/PivotTableTransposeScenario";
import { Insights } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
const style = { height: 300 };

const InsightViewTransposeCore: React.FC<IPivotTableTransposeCoreProps> = (props) => {
    const { config } = props;
    const insight = idRef(Insights.TableWithMC);

    return (
        <div style={style} className="s-insight-view-transpose">
            <InsightView insight={insight} config={config} />
        </div>
    );
};

export const InsightTranspose_MetricRow_ColHeaderLeft = () => {
    return <InsightViewTransposeCore config={transposeConfigWithRowLeft} />;
};

export const InsightTranspose_MetricColumn_ColHeaderLeft = () => {
    return <InsightViewTransposeCore config={transposeConfigWithColumnLeft} />;
};

export const InsightTranspose_MetricColumn_ColHeaderTop = () => {
    return <InsightViewTransposeCore config={transposeConfigWithColumnTop} />;
};

export const InsightTranspose_MetricRow = () => {
    return <InsightViewTransposeCore config={transposeConfigWithRow} />;
};

export const InsightTranspose_ColHeaderLeft = () => {
    return <InsightViewTransposeCore config={transposeConfigWithLeft} />;
};
