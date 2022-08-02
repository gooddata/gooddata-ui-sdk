// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IInsight } from "@gooddata/sdk-model";
import { IDrillToInsightConfig } from "../../../../drill/types";
import { InsightDropdown } from "./InsightDropdown";

export interface IDrillMeasureItemProps {
    insight: IDrillToInsightConfig;
    onSelect: (targetItem: IInsight) => void;
}

export const DrillTargetInsightItem: React.FunctionComponent<IDrillMeasureItemProps> = ({
    insight,
    onSelect,
}) => {
    return <InsightDropdown insightConfig={insight} onSelect={onSelect} />;
};
