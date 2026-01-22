// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { type IInsight, type ObjRef, insightVisualizationType, isInsight } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectInsightsMap } from "../../../../../model/store/insights/insightsSelectors.js";
import { type IDrillConfigItem, isDrillToInsightConfig } from "../../../../drill/types.js";
import { InsightDropdown } from "../../../../widget/common/InsightDropdown.js";

export interface IDrillingInsightDropdownProps {
    insightConfig: IDrillConfigItem;
    onSelect: (targetItem: IInsight) => void;
}

export function DrillingInsightDropdown({ insightConfig, onSelect }: IDrillingInsightDropdownProps) {
    const { insight, insightType, insightRef } = useDrillToInsightData(insightConfig);

    return (
        <InsightDropdown
            insight={insight}
            insightRef={insightRef}
            insightType={insightType}
            onSelect={onSelect}
        />
    );
}

function useDrillToInsightData(insightConfig: IDrillConfigItem): {
    insight?: IInsight;
    insightType?: string;
    insightRef?: ObjRef;
} {
    const insights = useDashboardSelector(selectInsightsMap);

    return useMemo(() => {
        if (isDrillToInsightConfig(insightConfig) && insightConfig.insightRef) {
            const insight = insights.get(insightConfig.insightRef);

            if (isInsight(insight)) {
                const insightType = insightVisualizationType(insight);
                return {
                    insight,
                    insightRef: insightConfig.insightRef,
                    insightType: insightType,
                };
            }
        }
        return {};
    }, [insightConfig, insights]);
}
