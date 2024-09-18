// (C) 2024 GoodData Corporation

import React, { useState } from "react";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import noop from "lodash/noop.js";
import { DashboardInsightMenuBody } from "../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/index.js";
import { selectInsightsMap, selectRenderMode, useDashboardSelector } from "../../../../model/index.js";
import { IInsightMenuSubmenu } from "../../insightMenu/index.js";
import { useEditableInsightMenu } from "../../widget/InsightWidget/useEditableInsightMenu.js";

export const VisualizationConfig: React.FC<{ widget: IInsightWidget }> = ({ widget }) => {
    const insights = useDashboardSelector(selectInsightsMap);
    const insight = insights.get(widget.insight);

    if (!insight) {
        // eslint-disable-next-line no-console
        console.debug(
            "DefaultDashboardInsightWidget rendered before the insights were ready, skipping render.",
        );
        return null;
    }

    return <VisualizationConfigContent widget={widget} insight={insight} />;
};

const VisualizationConfigContent: React.FC<{ widget: IInsightWidget; insight: IInsight }> = ({
    widget,
    insight,
}) => {
    const { menuItems } = useEditableInsightMenu({
        widget,
        insight,
        closeMenu: noop,
    });
    const renderMode = useDashboardSelector(selectRenderMode);
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return (
        <DashboardInsightMenuBody
            widget={widget}
            insight={insight}
            items={menuItems}
            submenu={submenu}
            setSubmenu={setSubmenu}
            renderMode={renderMode}
            isOpen={true}
            onClose={noop}
        />
    );
};
