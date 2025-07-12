// (C) 2007-2025 GoodData Corporation
import { useMemo } from "react";
import { ObjRef, IInsight, isInsight, insightVisualizationType } from "@gooddata/sdk-model";

import { IDrillConfigItem, isDrillToInsightConfig } from "../../../../drill/types.js";
import { selectInsightsMap, useDashboardSelector } from "../../../../../model/index.js";
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
