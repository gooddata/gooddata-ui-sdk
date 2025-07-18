// (C) 2023-2025 GoodData Corporation
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

function InsightViewTransposeCore(props: IPivotTableTransposeCoreProps) {
    const { config } = props;
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
