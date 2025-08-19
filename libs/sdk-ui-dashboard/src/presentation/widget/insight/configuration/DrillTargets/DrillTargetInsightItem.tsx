// (C) 2019-2025 GoodData Corporation
import React from "react";

import { IInsight } from "@gooddata/sdk-model";

import { DrillingInsightDropdown } from "./DrillingInsightDropdown.js";
import { IDrillConfigItem } from "../../../../drill/types.js";

export interface IDrillMeasureItemProps {
    insight: IDrillConfigItem;
    onSelect: (targetItem: IInsight) => void;
}

export const DrillTargetInsightItem: React.FunctionComponent<IDrillMeasureItemProps> = ({
    insight,
    onSelect,
}) => {
    return <DrillingInsightDropdown insightConfig={insight} onSelect={onSelect} />;
};
