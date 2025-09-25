// (C) 2025 GoodData Corporation

import cx from "classnames";

import { UiChip, UiTooltip } from "@gooddata/sdk-ui-kit";

import { KdaMetric } from "../../internalTypes.js";

interface IMetricBarProps {
    metric: KdaMetric;
}

export function MetricBar(props: IMetricBarProps) {
    const { title } = props.metric;

    return (
        <div className={cx("gd-kda-dialog-bar__metric")}>
            <UiTooltip
                arrowPlacement="top-start"
                content={title}
                optimalPlacement
                triggerBy={["hover", "focus"]}
                anchor={<UiChip label={title ?? ""} iconBefore="metric" isExpandable={false} />}
            />
        </div>
    );
}
