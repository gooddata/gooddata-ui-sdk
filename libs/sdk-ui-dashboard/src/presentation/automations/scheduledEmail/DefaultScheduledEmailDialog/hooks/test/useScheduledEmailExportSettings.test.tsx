// (C) 2026 GoodData Corporation

import { type RefObject } from "react";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type DashboardAttachmentType,
    type IAutomationMetadataObjectDefinition,
    type IDashboardExportParameter,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionMetadataObjectDefinition,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IExportDefinitionVisualizationObjectSettings,
    type IInsight,
    type IWidget,
    type WidgetAttachmentType,
    idRef,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("../../utils/exportDefinitions.js", () => ({
    withRebuiltExportDefinitions: vi.fn(),
    newDashboardExportDefinitionMetadataObjectDefinition: vi.fn(),
    newWidgetExportDefinitionMetadataObjectDefinition: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import * as exportDefinitionsUtilsModule from "../../utils/exportDefinitions.js";
import {
    type IUseScheduledEmailExportSettingsProps,
    useScheduledEmailExportSettings,
} from "../useScheduledEmailExportSettings.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const withRebuiltExportDefinitionsSpy = vi.mocked(exportDefinitionsUtilsModule.withRebuiltExportDefinitions);
const newDashboardExportDefinitionMetadataObjectDefinitionSpy = vi.mocked(
    exportDefinitionsUtilsModule.newDashboardExportDefinitionMetadataObjectDefinition,
);
const newWidgetExportDefinitionMetadataObjectDefinitionSpy = vi.mocked(
    exportDefinitionsUtilsModule.newWidgetExportDefinitionMetadataObjectDefinition,
);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

type ExportDefinition = NonNullable<IAutomationMetadataObjectDefinition["exportDefinitions"]>[number];

const widget: IWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ignoreDashboardFilters: [],
    drills: [],
    title: "Widget",
    description: "",
    ref: idRef("w1"),
    uri: "/w1",
    identifier: "w1",
    localIdentifier: "w1",
};

const insight: IInsight = {
    insight: {
        identifier: "insight-1",
        uri: "/insight-1",
        ref: idRef("insight-1", "insight"),
        title: "Insight",
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

const makeDashboardExportDefinition = (
    format: DashboardAttachmentType,
    requestPayloadOverrides: Partial<IExportDefinitionDashboardRequestPayload> = {},
): ExportDefinition => ({
    type: "exportDefinition",
    title: "Dashboard export",
    requestPayload: {
        type: "dashboard",
        fileName: "Dashboard",
        format,
        content: { dashboard: "dashboard-1" },
        ...requestPayloadOverrides,
    },
});

const makeWidgetExportDefinition = (
    format: WidgetAttachmentType,
    requestPayloadOverrides: Partial<IExportDefinitionVisualizationObjectRequestPayload> = {},
): ExportDefinition => ({
    type: "exportDefinition",
    title: "Widget export",
    requestPayload: {
        type: "visualizationObject",
        fileName: "Widget",
        format,
        content: { visualizationObject: "insight-1", widget: "w1", dashboard: "dashboard-1" },
        ...requestPayloadOverrides,
    },
});

const makeAutomation = (
    overrides: Partial<IAutomationMetadataObjectDefinition> = {},
): IAutomationMetadataObjectDefinition => ({
    type: "automation",
    title: "Test Scheduled Email",
    notificationChannel: "channel-1",
    recipients: [],
    exportDefinitions: [],
    ...overrides,
});

const makeWireRef = (
    current: Record<string, IDashboardExportParameter[]> | undefined = undefined,
): RefObject<Record<string, IDashboardExportParameter[]> | undefined> => ({ current });

const BASE_PROPS: IUseScheduledEmailExportSettingsProps = {
    editedAutomation: makeAutomation(),
    setEditedAutomation: vi.fn(),
    insight: undefined,
    widget: undefined,
    dashboardId: "dashboard-1",
    dashboardTitle: "Dashboard",
    storeFilters: true,
    effectiveDashboardFilters: undefined,
    effectiveDashboardFiltersByTab: undefined,
    effectiveWidgetFilters: [],
    effectiveWidgetFiltersWithInsight: [],
    defaultPdfPageSize: undefined,
    resolvedDefaultCsvDelimiter: ",",
    latestParametersWireRef: makeWireRef(),
};

// A generated export definition returned by the mocked factories, tagged with the requested format so
// assertions can tell which "add" it corresponds to.
const generatedDashboardExportDefinition = (
    format: DashboardAttachmentType,
): IExportDefinitionMetadataObjectDefinition => ({
    type: "exportDefinition",
    title: "generated-dashboard",
    requestPayload: {
        type: "dashboard",
        fileName: "generated-dashboard",
        format,
        content: { dashboard: "dashboard-1" },
    },
});

const generatedWidgetExportDefinition = (
    format: WidgetAttachmentType,
): IExportDefinitionMetadataObjectDefinition => ({
    type: "exportDefinition",
    title: "generated-widget",
    requestPayload: {
        type: "visualizationObject",
        fileName: "generated-widget",
        format,
        content: { visualizationObject: "insight-1", widget: "w1", dashboard: "dashboard-1" },
    },
});

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    newDashboardExportDefinitionMetadataObjectDefinitionSpy.mockImplementation(({ format }) =>
        generatedDashboardExportDefinition(format),
    );
    newWidgetExportDefinitionMetadataObjectDefinitionSpy.mockImplementation(({ format }) =>
        generatedWidgetExportDefinition(format),
    );
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderExportSettingsHook(overrides: Partial<IUseScheduledEmailExportSettingsProps> = {}) {
    const setEditedAutomation = vi.fn();
    const props: IUseScheduledEmailExportSettingsProps = {
        ...BASE_PROPS,
        setEditedAutomation,
        ...overrides,
    };
    const { result } = renderHook(() => useScheduledEmailExportSettings(props));
    return { result, setEditedAutomation, props };
}

// ---------------------------------------------------------------------------
// Case 1: derivations read the right thing from exportDefinitions
// ---------------------------------------------------------------------------

describe("useScheduledEmailExportSettings — derivations", () => {
    it("selectedAttachments lists the formats of every export definition", () => {
        const { result } = renderExportSettingsHook({
            editedAutomation: makeAutomation({
                exportDefinitions: [makeDashboardExportDefinition("PDF"), makeWidgetExportDefinition("XLSX")],
            }),
        });

        expect(result.current.selectedAttachments).toEqual(["PDF", "XLSX"]);
    });

    it("isXlsxExportSelected/isCsvExportSelected true only when the matching widget format is present", () => {
        const { result } = renderExportSettingsHook({
            editedAutomation: makeAutomation({
                exportDefinitions: [makeWidgetExportDefinition("XLSX")],
            }),
        });

        expect(result.current.isXlsxExportSelected).toBe(true);
        expect(result.current.isCsvExportSelected).toBe(false);
    });

    it("isDashboardExportSelected defaults to true when exportDefinitions is undefined", () => {
        const { result } = renderExportSettingsHook({
            editedAutomation: makeAutomation({ exportDefinitions: undefined }),
        });

        expect(result.current.isDashboardExportSelected).toBe(true);
    });

    it("xlsxSettings falls back to defaults when no XLSX definition is present", () => {
        const { result } = renderExportSettingsHook({
            editedAutomation: makeAutomation({ exportDefinitions: [] }),
        });

        expect(result.current.xlsxSettings).toEqual({ mergeHeaders: true, exportInfo: true });
    });

    it("xlsxSettings reads settings off the present XLSX definition", () => {
        const { result } = renderExportSettingsHook({
            editedAutomation: makeAutomation({
                exportDefinitions: [
                    makeWidgetExportDefinition("XLSX", {
                        settings: { mergeHeaders: false, exportInfo: false },
                    }),
                ],
            }),
        });

        expect(result.current.xlsxSettings).toEqual({ mergeHeaders: false, exportInfo: false });
    });

    it("csvSettings falls back to resolvedDefaultCsvDelimiter when absent", () => {
        const { result } = renderExportSettingsHook({
            resolvedDefaultCsvDelimiter: ";",
            editedAutomation: makeAutomation({ exportDefinitions: [] }),
        });

        expect(result.current.csvSettings).toEqual({ delimiter: ";" });
    });

    it("slidesTemplateIds reads per-format templateId, scoped to dashboard mode when no widget", () => {
        const { result } = renderExportSettingsHook({
            editedAutomation: makeAutomation({
                exportDefinitions: [
                    makeDashboardExportDefinition("PPTX", { templateId: "tpl-pptx" }),
                    // Same format on a visualizationObject payload must NOT match in dashboard mode.
                    makeWidgetExportDefinition("PDF", { templateId: "tpl-pdf-widget" }),
                ],
            }),
        });

        expect(result.current.slidesTemplateIds).toEqual({
            PPTX: "tpl-pptx",
            PDF_SLIDES: undefined,
            PDF: undefined,
        });
    });
});

// ---------------------------------------------------------------------------
// Case 2: attachment setters call withRebuiltExportDefinitions with correct rebuilt defs
// ---------------------------------------------------------------------------

describe("useScheduledEmailExportSettings — onDashboardAttachmentsChange", () => {
    it("keeps definitions for formats still selected and adds new ones via the factory", () => {
        const wireRef = makeWireRef({ tab1: [{ id: "topN", value: "5", title: "Top N" }] });
        const sentinel = makeAutomation({ title: "rebuilt" });
        withRebuiltExportDefinitionsSpy.mockReturnValue(sentinel);

        const existingXlsx = makeDashboardExportDefinition("XLSX");
        const existingPdf = makeDashboardExportDefinition("PDF");

        const { result, setEditedAutomation } = renderExportSettingsHook({
            latestParametersWireRef: wireRef,
            storeFilters: true,
            effectiveDashboardFilters: [],
            effectiveDashboardFiltersByTab: { tab1: [] },
        });

        result.current.onDashboardAttachmentsChange(["XLSX", "PPTX"]);

        expect(setEditedAutomation).toHaveBeenCalledTimes(1);
        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;

        const stateBefore = makeAutomation({ exportDefinitions: [existingXlsx, existingPdf] });
        const returned = updater(stateBefore);

        expect(newDashboardExportDefinitionMetadataObjectDefinitionSpy).toHaveBeenCalledWith({
            dashboardId: "dashboard-1",
            dashboardTitle: "Dashboard",
            dashboardFilters: [],
            filtersByTab: { tab1: [] },
            format: "PPTX",
        });
        expect(withRebuiltExportDefinitionsSpy).toHaveBeenCalledWith(
            stateBefore,
            [existingXlsx, generatedDashboardExportDefinition("PPTX")],
            wireRef.current,
        );
        expect(returned).toBe(sentinel);
    });

    it("passes undefined filters to the factory when storeFilters is false", () => {
        withRebuiltExportDefinitionsSpy.mockReturnValue(makeAutomation());

        const { result, setEditedAutomation } = renderExportSettingsHook({
            storeFilters: false,
            effectiveDashboardFilters: [],
            effectiveDashboardFiltersByTab: { tab1: [] },
        });

        result.current.onDashboardAttachmentsChange(["PDF"]);
        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;
        updater(makeAutomation({ exportDefinitions: [] }));

        expect(newDashboardExportDefinitionMetadataObjectDefinitionSpy).toHaveBeenCalledWith(
            expect.objectContaining({ dashboardFilters: undefined, filtersByTab: undefined }),
        );
    });
});

describe("useScheduledEmailExportSettings — onWidgetAttachmentsChange", () => {
    it("keeps definitions for formats still selected and adds new ones via the widget factory", () => {
        const wireRef = makeWireRef(undefined);
        const sentinel = makeAutomation({ title: "rebuilt-widget" });
        withRebuiltExportDefinitionsSpy.mockReturnValue(sentinel);

        const existingCsv = makeWidgetExportDefinition("CSV");
        const existingXlsx = makeWidgetExportDefinition("XLSX");

        const { result, setEditedAutomation } = renderExportSettingsHook({
            widget,
            insight,
            latestParametersWireRef: wireRef,
            effectiveWidgetFilters: [],
            effectiveWidgetFiltersWithInsight: [],
            effectiveDashboardFilters: [],
            defaultPdfPageSize: "A3",
        });

        result.current.onWidgetAttachmentsChange(["CSV", "PNG"]);

        expect(setEditedAutomation).toHaveBeenCalledTimes(1);
        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;

        const stateBefore = makeAutomation({ exportDefinitions: [existingCsv, existingXlsx] });
        const returned = updater(stateBefore);

        expect(newWidgetExportDefinitionMetadataObjectDefinitionSpy).toHaveBeenCalledWith({
            insight,
            widget,
            dashboardId: "dashboard-1",
            format: "PNG",
            widgetFilters: [],
            widgetFiltersWithInsight: [],
            dashboardFilters: [],
            defaultPdfPageSize: "A3",
        });
        expect(withRebuiltExportDefinitionsSpy).toHaveBeenCalledWith(
            stateBefore,
            [existingCsv, generatedWidgetExportDefinition("PNG")],
            wireRef.current,
        );
        expect(returned).toBe(sentinel);
    });

    it("throws (invariant) when widget or insight is missing", () => {
        const { result } = renderExportSettingsHook({ widget: undefined, insight: undefined });

        expect(() => result.current.onWidgetAttachmentsChange(["PNG"])).toThrow();
    });
});

// ---------------------------------------------------------------------------
// Case 3: each per-format settings setter patches only its own format
// ---------------------------------------------------------------------------

describe("useScheduledEmailExportSettings — per-format settings setters", () => {
    const xlsxDef = makeWidgetExportDefinition("XLSX", { settings: { mergeHeaders: false } });
    const pdfDef = makeWidgetExportDefinition("PDF_TABULAR", { settings: { pageSize: "A3" } });
    const csvDef = makeWidgetExportDefinition("CSV", { settings: { delimiter: ";" } });
    const csvRawDef = makeWidgetExportDefinition("CSV_RAW", { settings: { delimiter: ";" } });

    function applySetter(
        setterName:
            | "onXlsxSettingsChange"
            | "onPdfSettingsChange"
            | "onCsvSettingsChange"
            | "onCsvRawSettingsChange",
        settings: IExportDefinitionVisualizationObjectSettings,
        stateBefore: IAutomationMetadataObjectDefinition,
    ): IAutomationMetadataObjectDefinition {
        const { result, setEditedAutomation } = renderExportSettingsHook();
        result.current[setterName](settings);
        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;
        return updater(stateBefore);
    }

    it("onXlsxSettingsChange patches only the XLSX definition", () => {
        const stateBefore = makeAutomation({ exportDefinitions: [xlsxDef, pdfDef, csvDef] });
        const returned = applySetter(
            "onXlsxSettingsChange",
            { mergeHeaders: true, exportInfo: true },
            stateBefore,
        );

        expect(returned.exportDefinitions?.[0].requestPayload.settings).toEqual({
            mergeHeaders: true,
            exportInfo: true,
        });
        expect(returned.exportDefinitions?.[1]).toBe(pdfDef);
        expect(returned.exportDefinitions?.[2]).toBe(csvDef);
    });

    it("onPdfSettingsChange patches only the PDF_TABULAR definition", () => {
        const stateBefore = makeAutomation({ exportDefinitions: [xlsxDef, pdfDef, csvDef] });
        const returned = applySetter(
            "onPdfSettingsChange",
            { pageSize: "LETTER", orientation: "landscape", exportInfo: false },
            stateBefore,
        );

        expect(returned.exportDefinitions?.[1].requestPayload.settings).toEqual({
            pageSize: "LETTER",
            orientation: "landscape",
            exportInfo: false,
        });
        expect(returned.exportDefinitions?.[0]).toBe(xlsxDef);
        expect(returned.exportDefinitions?.[2]).toBe(csvDef);
    });

    it("onCsvSettingsChange patches only the CSV definition", () => {
        const stateBefore = makeAutomation({ exportDefinitions: [xlsxDef, csvDef, csvRawDef] });
        const returned = applySetter("onCsvSettingsChange", { delimiter: "|" }, stateBefore);

        expect(returned.exportDefinitions?.[1].requestPayload.settings).toEqual({ delimiter: "|" });
        expect(returned.exportDefinitions?.[0]).toBe(xlsxDef);
        expect(returned.exportDefinitions?.[2]).toBe(csvRawDef);
    });

    it("onCsvRawSettingsChange patches only the CSV_RAW definition", () => {
        const stateBefore = makeAutomation({ exportDefinitions: [csvDef, csvRawDef] });
        const returned = applySetter("onCsvRawSettingsChange", { delimiter: "|" }, stateBefore);

        expect(returned.exportDefinitions?.[1].requestPayload.settings).toEqual({ delimiter: "|" });
        expect(returned.exportDefinitions?.[0]).toBe(csvDef);
    });
});

// ---------------------------------------------------------------------------
// Case 4: onSlidesTemplateIdChange sets the template id for the right format
// ---------------------------------------------------------------------------

describe("useScheduledEmailExportSettings — onSlidesTemplateIdChange", () => {
    it("sets templateId on the matching widget-mode definition only", () => {
        const pptxDef = makeWidgetExportDefinition("PPTX");
        const otherDef = makeWidgetExportDefinition("PDF_TABULAR");
        const dashboardModePptx = makeDashboardExportDefinition("PPTX");

        const { result, setEditedAutomation } = renderExportSettingsHook({ widget, insight });
        result.current.onSlidesTemplateIdChange("tpl-1", "PPTX");

        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;
        const returned = updater(
            makeAutomation({ exportDefinitions: [pptxDef, otherDef, dashboardModePptx] }),
        );

        expect(returned.exportDefinitions?.[0].requestPayload.templateId).toBe("tpl-1");
        expect(returned.exportDefinitions?.[1]).toBe(otherDef);
        // Dashboard-shaped payload is not matched in widget mode, even with the same format.
        expect(returned.exportDefinitions?.[2]).toBe(dashboardModePptx);
    });

    it("sets templateId on the matching dashboard-mode definition only", () => {
        const dashboardPptx = makeDashboardExportDefinition("PPTX");
        const widgetModePptx = makeWidgetExportDefinition("PPTX");

        const { result, setEditedAutomation } = renderExportSettingsHook({
            widget: undefined,
            insight: undefined,
        });
        result.current.onSlidesTemplateIdChange("tpl-2", "PPTX");

        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;
        const returned = updater(makeAutomation({ exportDefinitions: [dashboardPptx, widgetModePptx] }));

        expect(returned.exportDefinitions?.[0].requestPayload.templateId).toBe("tpl-2");
        expect(returned.exportDefinitions?.[1]).toBe(widgetModePptx);
    });
});

// ---------------------------------------------------------------------------
// Case 5: undefined/empty exportDefinitions guards — no throw
// ---------------------------------------------------------------------------

describe("useScheduledEmailExportSettings — undefined/empty exportDefinitions guards", () => {
    it("selectedAttachments is [] when exportDefinitions is undefined", () => {
        const { result } = renderExportSettingsHook({
            editedAutomation: makeAutomation({ exportDefinitions: undefined }),
        });

        expect(result.current.selectedAttachments).toEqual([]);
    });

    it("settings setters do not throw when exportDefinitions is undefined", () => {
        const { result, setEditedAutomation } = renderExportSettingsHook();

        expect(() => result.current.onXlsxSettingsChange({ mergeHeaders: true })).not.toThrow();
        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;
        expect(() => updater(makeAutomation({ exportDefinitions: undefined }))).not.toThrow();
    });

    it("onDashboardAttachmentsChange does not throw when s.exportDefinitions is undefined", () => {
        withRebuiltExportDefinitionsSpy.mockReturnValue(makeAutomation());
        const { result, setEditedAutomation } = renderExportSettingsHook();

        result.current.onDashboardAttachmentsChange(["PDF"]);
        const updater = setEditedAutomation.mock.calls[0][0] as (
            s: IAutomationMetadataObjectDefinition,
        ) => IAutomationMetadataObjectDefinition;

        expect(() => updater(makeAutomation({ exportDefinitions: undefined }))).not.toThrow();
    });
});
