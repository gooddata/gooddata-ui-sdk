// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IExecutionResult, type IExportResult } from "@gooddata/sdk-backend-spi";
import { type IConditionalFormatting, type ISettings, insightSetProperties } from "@gooddata/sdk-model";

import { TestCorrelation } from "../../../tests/Dashboard.test.helpers.js";
import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetInsight,
    SimpleSortedTableWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { setExecutionResultData } from "../../commands/executionResults.js";
import {
    changeInsightWidgetVisProperties,
    exportInlineInsightWidget,
    exportInsightWidget,
} from "../../commands/insight.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";

vi.hoisted(() => {
    vi.resetModules();
});

const { createExportFunctionMock, exporterMock } = vi.hoisted(() => ({
    createExportFunctionMock: vi.fn(),
    exporterMock: vi.fn(),
}));

vi.mock("@gooddata/sdk-ui", async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return { ...actual, createExportFunction: createExportFunctionMock };
});

describe("exportInsightWidgetHandler", () => {
    let Tester: DashboardTester;

    async function setupTester(globalSettings: Partial<ISettings>) {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            { backendConfig: { globalSettings } },
        );

        Tester.dispatch(
            setExecutionResultData(
                SimpleSortedTableWidgetRef,
                {} as unknown as IExecutionResult,
                undefined,
                undefined,
            ),
        );
    }

    beforeEach(async () => {
        vi.clearAllMocks();
        exporterMock.mockResolvedValue({ uri: "/exportedFile" } as IExportResult);
        createExportFunctionMock.mockReturnValue(exporterMock);

        await setupTester({
            enableKPIDashboardExport: true,
            enableConditionalFormatting: true,
            enableNewPivotTable: true,
        });
    });

    it("includes the insight's effective conditional formatting in the export config", async () => {
        const conditionalFormatting: IConditionalFormatting = { enabled: true, rules: [] };
        const pivotTableInsight = {
            ...SimpleSortedTableWidgetInsight,
            insight: { ...SimpleSortedTableWidgetInsight.insight, visualizationUrl: "local:table" },
        };
        const insight = insightSetProperties(pivotTableInsight, {
            controls: { conditionalFormatting },
        });

        await Tester.dispatchAndWaitFor(
            exportInlineInsightWidget(
                SimpleSortedTableWidgetRef,
                { format: "pdf" },
                insight,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
        );

        expect(exporterMock).toHaveBeenCalledWith(expect.objectContaining({ conditionalFormatting }));
    });

    it("omits conditional formatting from the export config when the feature is disabled", async () => {
        const conditionalFormatting: IConditionalFormatting = { enabled: true, rules: [] };
        const insight = insightSetProperties(SimpleSortedTableWidgetInsight, {
            controls: { conditionalFormatting },
        });

        await setupTester({
            enableKPIDashboardExport: true,
            enableConditionalFormatting: false,
            enableNewPivotTable: true,
        });

        await Tester.dispatchAndWaitFor(
            exportInlineInsightWidget(
                SimpleSortedTableWidgetRef,
                { format: "pdf" },
                insight,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
        );

        expect(exporterMock).toHaveBeenCalledWith(
            expect.not.objectContaining({ conditionalFormatting: expect.anything() }),
        );
    });

    it("uses the widget-level conditional formatting override, not the underlying insight's own, for a non-inline export", async () => {
        const widgetLevelConditionalFormatting: IConditionalFormatting = {
            enabled: true,
            rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
        };

        await Tester.dispatchAndWaitFor(
            changeInsightWidgetVisProperties(SimpleSortedTableWidgetRef, {
                controls: { conditionalFormatting: widgetLevelConditionalFormatting },
            }),
            "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
        );

        await Tester.dispatchAndWaitFor(
            exportInsightWidget(SimpleSortedTableWidgetRef, { format: "pdf" }, TestCorrelation),
            "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
        );

        expect(exporterMock).toHaveBeenCalledWith(
            expect.objectContaining({ conditionalFormatting: widgetLevelConditionalFormatting }),
        );
    });

    it("uses the widget-level conditional formatting override, not the payload insight's own, for an inline export", async () => {
        const widgetLevelConditionalFormatting: IConditionalFormatting = {
            enabled: true,
            rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
        };
        const payloadConditionalFormatting: IConditionalFormatting = { enabled: true, rules: [] };
        const pivotTableInsight = {
            ...SimpleSortedTableWidgetInsight,
            insight: { ...SimpleSortedTableWidgetInsight.insight, visualizationUrl: "local:table" },
        };
        const insight = insightSetProperties(pivotTableInsight, {
            controls: { conditionalFormatting: payloadConditionalFormatting },
        });

        await Tester.dispatchAndWaitFor(
            changeInsightWidgetVisProperties(SimpleSortedTableWidgetRef, {
                controls: { conditionalFormatting: widgetLevelConditionalFormatting },
            }),
            "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
        );

        await Tester.dispatchAndWaitFor(
            exportInlineInsightWidget(
                SimpleSortedTableWidgetRef,
                { format: "pdf" },
                insight,
                TestCorrelation,
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED",
        );

        expect(exporterMock).toHaveBeenCalledWith(
            expect.objectContaining({ conditionalFormatting: widgetLevelConditionalFormatting }),
        );
    });
});
