// (C) 2019-2024 GoodData Corporation
import React from "react";
import { IInsight } from "@gooddata/sdk-model";
import { IDrillConfigItem } from "../../../../drill/types.js";
import { DrillingInsightDropdown } from "./DrillingInsightDropdown.js";

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
