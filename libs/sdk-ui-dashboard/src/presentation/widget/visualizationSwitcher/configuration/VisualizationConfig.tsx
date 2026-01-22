// (C) 2024-2026 GoodData Corporation

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import { useVisualizationSwitcherEditableInsightMenu } from "./useVisualizationSwitcherEditableInsightMenu.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectInsightsMap } from "../../../../model/store/insights/insightsSelectors.js";
import { selectRenderMode } from "../../../../model/store/renderMode/renderModeSelectors.js";
import { DashboardInsightMenuBody } from "../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/index.js";

interface IVisualizationConfigProps {
    widget: IInsightWidget;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
}

export function VisualizationConfig({ widget, onVisualizationDeleted }: IVisualizationConfigProps) {
    const insights = useDashboardSelector(selectInsightsMap);
    const insight = insights.get(widget.insight);

    if (!insight) {
        // eslint-disable-next-line no-console
        console.debug(
            "DefaultVisualizationSwitcherToolbar rendered before the insights were ready, skipping render.",
        );
        return null;
    }

    return (
        <VisualizationConfigContent
            widget={widget}
            insight={insight}
            onVisualizationDeleted={onVisualizationDeleted}
        />
    );
}

interface IVisualizationConfigContentProps {
    widget: IInsightWidget;
    insight: IInsight;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
}

function VisualizationConfigContent({
    widget,
    insight,
    onVisualizationDeleted,
}: IVisualizationConfigContentProps) {
    const { menuItems } = useVisualizationSwitcherEditableInsightMenu(
        widget,
        insight,
        onVisualizationDeleted,
    );

    const renderMode = useDashboardSelector(selectRenderMode);

    return (
        <DashboardInsightMenuBody
            key={widget.identifier}
            widget={widget}
            insight={insight}
            items={menuItems}
            renderMode={renderMode}
            isOpen
            onClose={() => {}}
        />
    );
}
