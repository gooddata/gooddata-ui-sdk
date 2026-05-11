// (C) 2019-2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";

import { type IDrillConfigItem } from "../../../../drill/types.js";

import { DrillingInsightDropdown } from "./DrillingInsightDropdown.js";

export interface IDrillMeasureItemProps {
    insight: IDrillConfigItem;
    onSelect: (targetItem: IInsight) => void;
}

export function DrillTargetInsightItem({ insight, onSelect }: IDrillMeasureItemProps) {
    return <DrillingInsightDropdown insightConfig={insight} onSelect={onSelect} />;
}
