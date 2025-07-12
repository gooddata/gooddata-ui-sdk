// (C) 2019-2025 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";
import { IDrillConfigItem } from "../../../../drill/types.js";
import { DrillingInsightDropdown } from "./DrillingInsightDropdown.js";

export interface IDrillMeasureItemProps {
    insight: IDrillConfigItem;
    onSelect: (targetItem: IInsight) => void;
}

export function DrillTargetInsightItem(props: IDrillMeasureItemProps) {
    const { insight, onSelect } = props;
    return <DrillingInsightDropdown insightConfig={insight} onSelect={onSelect} />;
}
