// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";
import { FLOATING_ELEMENT_DATA_ATTR } from "@gooddata/sdk-ui-kit";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("@gooddata/sdk-ui-kit");
    return {
        ...actual,
        useMediaQuery: () => false,
    };
});

vi.mock("../../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => undefined,
}));

vi.mock("../../../../../../model/react/useWidgetExecutionsHandler.js", () => ({
    useWidgetExecutionsHandler: () => ({
        onError: vi.fn(),
        onLoadingChanged: vi.fn(),
        onPushData: vi.fn(),
    }),
}));

vi.mock("../../../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        ErrorComponent: () => null,
        LoadingComponent: () => null,
    }),
}));

vi.mock("../../../../common/useInsightExport.js", () => ({
    useInsightExport: () => ({
        exportCSVEnabled: false,
        exportCSVRawEnabled: false,
        exportPdfTabularEnabled: false,
        exportXLSXEnabled: false,
        isExporting: false,
        isExportPdfTabularVisible: false,
        isExportRawVisible: false,
        onExportCSV: vi.fn(),
        onExportPdfTabular: vi.fn(),
        onExportRawCSV: vi.fn(),
        onExportXLSX: vi.fn(),
    }),
}));

vi.mock("../../../../showAsTableButton/useShowAsTable.js", () => ({
    useShowAsTable: () => ({ isWidgetAsTable: false }),
}));

vi.mock("../../../../widget/InsightWidget/useInsightWarning.js", () => ({
    useInsightWarning: () => ({ executionResult: undefined, limitBreaks: [] }),
}));

vi.mock("../DrillDialog.js", () => ({
    DrillDialog: () => <div data-testid="drill-dialog" />,
}));

import { InsightDrillDialog } from "../InsightDrillDialog.js";

const insight = {
    insight: {
        buckets: [],
        filters: [],
        identifier: "test-insight",
        properties: {},
        ref: { identifier: "test-insight" },
        sorts: [],
        title: "Test insight",
        uri: "/test-insight",
        visualizationUrl: "local:table",
    },
} as IInsight;

const widget = {
    insight: { identifier: "test-insight" },
    localIdentifier: "test-widget",
    ref: { identifier: "test-widget" },
    type: "insight",
} as IInsightWidget;

async function renderDrillDialog(onClose = vi.fn()) {
    render(
        <InsightDrillDialog
            enableDrillDescription={false}
            locale="en-US"
            breadcrumbs={[]}
            widget={widget}
            insight={insight}
            drillStep={{} as never}
            onClose={onClose}
            onBackButtonClick={vi.fn()}
        />,
    );

    await waitFor(() => {
        expect(screen.getByTestId("drill-dialog").closest(".overlay-wrapper")).toBeVisible();
    });

    return onClose;
}

describe("InsightDrillDialog", () => {
    it("stays open when clicking inside a kit floating element", async () => {
        const onClose = await renderDrillDialog();
        const floatingElement = document.createElement("div");
        const delimiterOption = document.createElement("button");
        floatingElement.setAttribute(FLOATING_ELEMENT_DATA_ATTR, "true");
        floatingElement.appendChild(delimiterOption);
        document.body.appendChild(floatingElement);

        fireEvent.mouseDown(delimiterOption);
        fireEvent.click(delimiterOption);

        expect(onClose).not.toHaveBeenCalled();
        floatingElement.remove();
    });

    it("still closes when clicking outside the drill dialog", async () => {
        const onClose = await renderDrillDialog();
        const outsideButton = document.createElement("button");
        document.body.appendChild(outsideButton);

        fireEvent.mouseDown(outsideButton);
        fireEvent.click(outsideButton);

        expect(onClose).toHaveBeenCalledTimes(1);
        outsideButton.remove();
    });
});
