// (C) 2007-2026 GoodData Corporation

import { PyramidChart } from "@gooddata/sdk-ui-charts";
import { Amount, StageName } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

const style = { height: 300 };

export function PyramidChartScenario() {
    return (
        <div style={style} className="s-pyramid-chart">
            <PyramidChart measures={[Amount]} viewBy={StageName.Default} />
        </div>
    );
}
