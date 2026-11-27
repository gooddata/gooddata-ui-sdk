// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import { type IInsightBodyProps } from "../../types.js";

const insightBodyProps = vi.hoisted(() => ({ current: undefined as IInsightBodyProps | undefined }));

vi.mock("@gooddata/sdk-ui", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("@gooddata/sdk-ui");
    return {
        ...actual,
        useBackendStrict: () => ({}),
        useWorkspaceStrict: () => "workspace",
    };
});

vi.mock("@gooddata/sdk-ui-ext", () => ({
    convertInsightToLayerTables: () => undefined,
    convertInsightToTableDefinition: (insight: unknown) => insight,
    getGeoTableDisplayFormRefs: () => undefined,
}));

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => ({}),
}));

vi.mock("../../../../../model/react/useWidgetExecConfig.js", () => ({
    useWidgetExecConfig: () => undefined,
}));

vi.mock("../../../../../model/react/useWidgetFilters.js", () => ({
    useWidgetFilters: () => ({ result: [], status: "success", error: undefined }),
}));

vi.mock("../../../../localization/IntlWrapper.js", () => ({
    IntlWrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../InsightBody.js", () => ({
    InsightBody: (props: IInsightBodyProps) => {
        insightBodyProps.current = props;
        return null;
    },
}));

vi.mock("../useInsightPositionStyle.js", () => ({
    useInsightPositionStyle: () => ({}),
}));

vi.mock("../useResolveDashboardInsightProperties.js", () => ({
    useResolveDashboardInsightProperties: ({ insight }: { insight: IInsight }) => insight,
}));

vi.mock("./useDrillDialogInsightDrills.js", () => ({
    useDrillDialogInsightDrills: () => ({}),
}));

vi.mock("./useDrillDialogSyncInsightProperties.js", () => ({
    useDrillDialogSyncInsightProperties: ({ insight }: { insight: IInsight }) => ({
        syncedInsight: insight,
        handlePushData: vi.fn(),
    }),
}));

vi.mock("./useExcludedDrillDefinitionFilters.js", () => ({
    useExcludedDrillDefinitionFilters: (filters: unknown) => filters,
}));

import { DrillDialogInsight } from "./DrillDialogInsight.js";

const drilledInsight = {
    insight: {
        buckets: [],
        filters: [],
        identifier: "drilled-insight",
        properties: {},
        ref: { identifier: "drilled-insight" },
        sorts: [],
        title: "Pie chart multiple measures",
        summary: "Drilled insight summary",
        uri: "/drilled-insight",
        visualizationUrl: "local:pie",
    },
} as IInsight;

const sourceWidgetInsight = {
    insight: {
        ...drilledInsight.insight,
        identifier: "source-insight",
        ref: { identifier: "source-insight" },
        title: "Combo chart insight",
        summary: "Source insight summary",
        uri: "/source-insight",
        visualizationUrl: "local:combo2",
    },
} as IInsight;

const sourceWidget = {
    insight: { identifier: "source-insight" },
    localIdentifier: "source-widget",
    ref: { identifier: "source-widget" },
    type: "insight",
    title: "Combo chart",
    description: "Source widget description",
} as unknown as IInsightWidget;

describe("DrillDialogInsight", () => {
    it("renders the drilled insight with its own title and summary, not the source widget's", () => {
        render(
            <DrillDialogInsight
                insight={drilledInsight}
                widget={sourceWidget}
                ErrorComponent={() => null}
                LoadingComponent={() => null}
            />,
        );

        const renderedWidget = insightBodyProps.current?.widget;
        expect(renderedWidget?.title).toBe("Pie chart multiple measures");
        expect(renderedWidget?.description).toBe("Drilled insight summary");
        // the widget identity is kept, so widget-scoped state (e.g. show as table) still works
        expect(renderedWidget?.ref).toEqual(sourceWidget.ref);
        // the source widget itself is not modified
        expect(sourceWidget.title).toBe("Combo chart");
    });

    it("uses the widget's own description on drill down when the widget is configured to show it", () => {
        const drillDownInsight = {
            insight: { ...sourceWidgetInsight.insight },
        } as IInsight;
        const widgetWithOwnDescription = {
            ...sourceWidget,
            configuration: { description: { source: "widget", includeMetrics: false, visible: true } },
        } as IInsightWidget;

        render(
            <DrillDialogInsight
                insight={drillDownInsight}
                widget={widgetWithOwnDescription}
                ErrorComponent={() => null}
                LoadingComponent={() => null}
            />,
        );

        const renderedWidget = insightBodyProps.current?.widget;
        expect(renderedWidget?.title).toBe("Combo chart insight");
        expect(renderedWidget?.description).toBe("Source widget description");
    });
});
