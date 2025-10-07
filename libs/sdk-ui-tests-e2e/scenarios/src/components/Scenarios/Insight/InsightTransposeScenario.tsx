// (C) 2023-2025 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Insights } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import {
    IPivotTableTransposeCoreProps,
    transposeConfigWithColumnLeft,
    transposeConfigWithColumnTop,
    transposeConfigWithLeft,
    transposeConfigWithRow,
    transposeConfigWithRowLeft,
} from "../Visualizations/PivotTable/PivotTableTransposeScenario";
const style = { height: 300 };

function InsightViewTransposeCore({ config }: IPivotTableTransposeCoreProps) {
    const insight = idRef(Insights.TableWithMC);

    return (
        <div style={style} className="s-insight-view-transpose">
            <InsightView insight={insight} config={config} />
        </div>
    );
}

export function InsightTranspose_MetricRow_ColHeaderLeft() {
    return <InsightViewTransposeCore config={transposeConfigWithRowLeft} />;
}

export function InsightTranspose_MetricColumn_ColHeaderLeft() {
    return <InsightViewTransposeCore config={transposeConfigWithColumnLeft} />;
}

export function InsightTranspose_MetricColumn_ColHeaderTop() {
    return <InsightViewTransposeCore config={transposeConfigWithColumnTop} />;
}

export function InsightTranspose_MetricRow() {
    return <InsightViewTransposeCore config={transposeConfigWithRow} />;
}

export function InsightTranspose_ColHeaderLeft() {
    return <InsightViewTransposeCore config={transposeConfigWithLeft} />;
}
