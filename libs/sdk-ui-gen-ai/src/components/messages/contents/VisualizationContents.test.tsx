// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type GenAIVisualizationType, type ISeparators } from "@gooddata/sdk-model";
import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { type VisualizationContents, makeVisualizationContents } from "../../../model.js";
import { chatWindowSliceName } from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName } from "../../../store/messages/messagesSlice.js";

import { VisualizationContentsComponent } from "./VisualizationContents.js";

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

function contentsOf(visualizationType: GenAIVisualizationType): VisualizationContents {
    return makeVisualizationContents("", [
        {
            id: "vis-1",
            title: "Total Revenue",
            visualizationType,
            metrics: [{ id: "m1", type: "metric", title: "Total Revenue" }],
            dimensionality: [],
            filters: [],
        },
    ]);
}

function storeWith(settings: Partial<IUserWorkspaceSettings>) {
    const state = {
        [chatWindowSliceName]: { settings },
        [messagesSliceName]: {},
    };

    return configureStore({ reducer: () => state });
}

function renderContents(
    visualizationType: GenAIVisualizationType,
    settings: Partial<IUserWorkspaceSettings> = { separators },
) {
    return render(
        <Provider store={storeWith(settings)}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <VisualizationContentsComponent
                        content={contentsOf(visualizationType)}
                        messageId="msg-1"
                    />
                </IntlWrapper>
            </WorkspaceProvider>
        </Provider>,
    );
}

describe("VisualizationContentsComponent", () => {
    beforeEach(() => {
        rendered.length = 0;
    });

    it.each<[GenAIVisualizationType, string]>([
        ["BAR", "BarChart"],
        ["COLUMN", "ColumnChart"],
        ["LINE", "LineChart"],
        ["PIE", "PieChart"],
        ["SCATTER", "ScatterPlot"],
        ["HEADLINE", "Headline"],
        ["TABLE", "PivotTableNext"],
    ])("passes the workspace separators to %s", (visualizationType, component) => {
        renderContents(visualizationType);

        expect(rendered).toEqual([{ component, separators }]);
    });

    it("passes the workspace separators to the legacy pivot table", () => {
        renderContents("TABLE", { separators, enableNewPivotTable: false });

        expect(rendered).toEqual([{ component: "PivotTable", separators }]);
    });
});
