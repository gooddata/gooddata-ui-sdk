// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsight, type ISeparators, idRef, newBucket, newMeasure } from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { type IChatConversationLocalItem } from "../../../model.js";

import { ConversationVisualisation } from "./ConversationVisualisation.js";

const rendered: { component: string; separators: ISeparators | undefined }[] = [];

function recorder(component: string) {
    return function Recorder({ config }: { config?: { separators?: ISeparators } }) {
        rendered.push({ component, separators: config?.separators });
        return null;
    };
}

vi.mock("@gooddata/sdk-ui-charts", () => ({
    BarChart: recorder("BarChart"),
    ColumnChart: recorder("ColumnChart"),
    LineChart: recorder("LineChart"),
    PieChart: recorder("PieChart"),
    ScatterPlot: recorder("ScatterPlot"),
    Headline: recorder("Headline"),
}));

vi.mock("@gooddata/sdk-ui-pivot", () => ({
    PivotTable: recorder("PivotTable"),
}));

vi.mock("@gooddata/sdk-ui-pivot/next", () => ({
    PivotTableNext: recorder("PivotTableNext"),
    useAgGridToken: (token?: string) => token,
}));

vi.mock("@gooddata/sdk-ui-dashboard", () => ({
    getKdaKeyDriverCombinations: () => [],
}));

vi.mock("@gooddata/sdk-ui-theme-provider", () => ({
    ScopedThemeProvider: ({ children }: { children?: ReactNode }) => children,
    useTheme: () => undefined,
}));

const separators: ISeparators = { thousand: ".", decimal: "," };

const message: IChatConversationLocalItem = {
    id: "1",
    localId: "1",
    responseId: "1",
    role: "assistant",
    type: "item",
    createdAt: 0,
    content: { type: "multipart", parts: [] },
};

function visualizationOf(visualizationUrl: string): IInsight {
    return {
        insight: {
            identifier: "vis-1",
            uri: "/vis-1",
            ref: idRef("vis-1"),
            title: "Total Revenue",
            visualizationUrl,
            buckets: [newBucket("measures", newMeasure("m1"))],
            filters: [],
            sorts: [],
            properties: {},
        },
    };
}

function renderVisualisation(
    visualizationUrl: string,
    props: { isTable?: boolean; enableNewPivotTable?: boolean } = {},
) {
    return render(
        <Provider store={configureStore({ reducer: () => ({}) })}>
            <IntlWrapper>
                <ConversationVisualisation
                    message={message}
                    visualization={visualizationOf(visualizationUrl)}
                    separators={separators}
                    {...props}
                />
            </IntlWrapper>
        </Provider>,
    );
}

describe("ConversationVisualisation", () => {
    beforeEach(() => {
        rendered.length = 0;
    });

    it.each([
        ["local:bar", "BarChart"],
        ["local:column", "ColumnChart"],
        ["local:line", "LineChart"],
        ["local:pie", "PieChart"],
        ["local:scatter", "ScatterPlot"],
        ["local:headline", "Headline"],
        ["local:table", "PivotTableNext"],
    ])("passes the workspace separators to %s", (visualizationUrl, component) => {
        renderVisualisation(visualizationUrl);

        expect(rendered).toEqual([{ component, separators }]);
    });

    it("passes the workspace separators to the table shown by the chart-to-table toggle", () => {
        renderVisualisation("local:bar", { isTable: true });

        expect(rendered).toEqual([{ component: "PivotTableNext", separators }]);
    });

    it("passes the workspace separators to the legacy pivot table", () => {
        renderVisualisation("local:table", { enableNewPivotTable: false });

        expect(rendered).toEqual([{ component: "PivotTable", separators }]);
    });
});
