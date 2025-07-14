// (C) 2025 GoodData Corporation

import { CSSProperties, useMemo } from "react";
import { IInsight, insightVisualizationType } from "@gooddata/sdk-model";

import { useDashboardSelector, selectSettings } from "../../../../model/index.js";
import { DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH } from "../../../constants/index.js";

export const useInsightPositionStyle = (insight: IInsight, clientWidth?: number) => {
    const { enableKDWidgetCustomHeight, enableFlexibleDashboardLayout } =
        useDashboardSelector(selectSettings);

    const isPositionRelative =
        insight &&
        insightVisualizationType(insight) === "headline" &&
        (clientWidth === undefined || clientWidth < DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH) &&
        !enableKDWidgetCustomHeight &&
        // The relative positioning causes flickering of headline text when flexible layout is enabled.
        // Everything works correctly when absolute position is used in this case.
        !enableFlexibleDashboardLayout;

    const insightPositionStyle: CSSProperties = useMemo(() => {
        return {
            width: "100%",
            height: "100%",
            // Headline violates the layout contract.
            // It should fit parent height and adapt to it as other visualizations.
            // Now, it works differently for the Headline - parent container adapts to Headline size.
            position: isPositionRelative ? "relative" : "absolute",
        };
    }, [isPositionRelative]);

    return insightPositionStyle;
};
