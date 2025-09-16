// (C) 2019-2025 GoodData Corporation

import { IInsight } from "@gooddata/sdk-model";

import { DrillingInsightDropdown } from "./DrillingInsightDropdown.js";
import { IDrillConfigItem } from "../../../../drill/types.js";

export interface IDrillMeasureItemProps {
    insight: IDrillConfigItem;
    onSelect: (targetItem: IInsight) => void;
}

export function DrillTargetInsightItem({ insight, onSelect }: IDrillMeasureItemProps) {
    return <DrillingInsightDropdown insightConfig={insight} onSelect={onSelect} />;
}
