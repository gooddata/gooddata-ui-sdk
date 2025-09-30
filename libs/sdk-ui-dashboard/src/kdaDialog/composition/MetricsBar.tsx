// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { MetricBar } from "../components/bars/MetricBar.js";
import { KdaBar } from "../components/KdaBar.js";
import { useKdaState } from "../providers/KdaState.js";

export function MetricsBar() {
    const intl = useIntl();
    const { state } = useKdaState();

    return (
        <KdaBar
            title={intl.formatMessage({ id: "kdaDialog.dialog.bars.metric.title" })}
            content={<>{state.metric ? <MetricBar metric={state.metric} /> : null}</>}
        />
    );
}
