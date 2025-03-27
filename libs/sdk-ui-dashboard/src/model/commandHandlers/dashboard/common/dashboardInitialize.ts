// (C) 2022-2025 GoodData Corporation
import { IDashboard, IDashboardLayout, IDashboardLayoutItem, IInsight, IWidget } from "@gooddata/sdk-model";

import {
    DashboardContext,
    DashboardItem,
    isDashboardItemVisualization,
    isDashboardItemVisualizationContent,
} from "../../../types/commonTypes.js";
import { loadInsight } from "../../widgets/common/loadInsight.js";
import { ExtendedDashboardWidget } from "../../../types/layoutTypes.js";

const size = { xl: { gridHeight: 22, gridWidth: 12 } };

export const EmptyDashboardLayout: IDashboardLayout<IWidget> = {
    type: "IDashboardLayout",
    sections: [],
};

export async function dashboardInitialize(
    ctx: DashboardContext,
    items?: DashboardItem[],
): Promise<{
    dashboard: IDashboard<ExtendedDashboardWidget> | undefined;
    insights: IInsight[];
}> {
    if (!items) {
        return {
            dashboard: undefined,
            insights: [],
        };
    }

    const layoutItems: IDashboardLayoutItem[] = [];
    const insights: IInsight[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (isDashboardItemVisualization(item)) {
            const insight = await loadInsight(ctx, item.visualization);
            insights.push(insight);
            layoutItems.push(buildInitialItem(insight, i));
        }
        if (isDashboardItemVisualizationContent(item)) {
            const insight = item.visualizationContent;
            insights.push(insight);
            layoutItems.push(buildInitialItem(insight, i));
        }
    }

    const dashboard = buildInitialDashboard(layoutItems) as IDashboard<ExtendedDashboardWidget>;

    return {
        dashboard,
        insights,
    };
}

function buildInitialDashboard(items: IDashboardLayoutItem[]) {
    const ref = {
        type: "analyticalDashboard",
        identifier: "",
    };

    return {
        type: "IDashboard",
        layout: {
            type: "IDashboardLayout",
            sections: [
                {
                    header: {},
                    type: "IDashboardLayoutSection",
                    items,
                },
            ],
        },
        shareStatus: "private",
        created: "",
        updated: "",
        title: "",
        description: "",
        ref,
        uri: ref.identifier,
        identifier: ref.identifier,
    } as IDashboard;
}

function buildInitialItem(insight: IInsight, i: number): IDashboardLayoutItem {
    return {
        type: "IDashboardLayoutItem",
        size,
        widget: {
            type: "insight",
            title: insight.insight.title,
            description: "",
            localIdentifier: `${insight.insight.identifier}_${i}`,
            insight: insight.insight.ref,
            identifier: insight.insight.identifier,
            uri: insight.insight.uri,
            ref: insight.insight.ref,
            ignoreDashboardFilters: [],
            drills: [],
        },
    };
}
