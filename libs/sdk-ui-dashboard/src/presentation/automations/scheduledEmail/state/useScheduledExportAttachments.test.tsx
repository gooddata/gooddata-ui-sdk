// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObjectDefinition, type ISettings } from "@gooddata/sdk-model";

import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../contexts/ScheduledEmailDialogContext.js";

import {
    AUTOMATIONS_CONTEXT,
    DRAFT_FIXTURE,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_INSIGHT,
    SENTINEL_WIDGET,
    makeAutomation,
    makeDashboardExportDefinition,
    makeWidgetExportDefinition,
} from "./fixtures.js";
import { ScheduledExportDraftContextProvider } from "./ScheduledExportDraftContext.js";
import { useScheduledExportAttachments } from "./useScheduledExportAttachments.js";

beforeEach(() => {
    vi.clearAllMocks();
});

function renderAttachments(
    editedAutomation: IAutomationMetadataObjectDefinition,
    contexts: {
        settings?: ISettings;
        widget?: IScheduledEmailDialogContextValue["widget"];
        insight?: IScheduledEmailDialogContextValue["insight"];
    } = {},
) {
    const automationsContext: IAutomationsContextValue = {
        ...AUTOMATIONS_CONTEXT,
        settings: contexts.settings,
    };
    const dialogContext: IScheduledEmailDialogContextValue = {
        ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
        widget: contexts.widget,
        insight: contexts.insight,
    };

    function wrapper({ children }: PropsWithChildren) {
        return (
            <AutomationsContextProvider value={automationsContext}>
                <ScheduledEmailDialogContextProvider value={dialogContext}>
                    <ScheduledExportDraftContextProvider value={{ ...DRAFT_FIXTURE, editedAutomation }}>
                        {children}
                    </ScheduledExportDraftContextProvider>
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        );
    }

    return renderHook(() => useScheduledExportAttachments(), { wrapper });
}

describe("useScheduledExportAttachments", () => {
    it("selectedAttachments lists the formats of every export definition", () => {
        const { result } = renderAttachments(
            makeAutomation({
                exportDefinitions: [makeDashboardExportDefinition("PDF"), makeWidgetExportDefinition("XLSX")],
            }),
        );

        expect(result.current.selectedAttachments).toEqual(["PDF", "XLSX"]);
    });

    it("selectedAttachments is [] when exportDefinitions is undefined", () => {
        const { result } = renderAttachments(makeAutomation({ exportDefinitions: undefined }));

        expect(result.current.selectedAttachments).toEqual([]);
    });

    it("isXlsxExportSelected/isCsvExportSelected true only when the matching widget format is present", () => {
        const { result } = renderAttachments(
            makeAutomation({ exportDefinitions: [makeWidgetExportDefinition("XLSX")] }),
        );

        expect(result.current.isXlsxExportSelected).toBe(true);
        expect(result.current.isCsvExportSelected).toBe(false);
    });

    it("isDashboardExportSelected defaults to true when exportDefinitions is undefined", () => {
        const { result } = renderAttachments(makeAutomation({ exportDefinitions: undefined }));

        expect(result.current.isDashboardExportSelected).toBe(true);
    });

    it("xlsxSettings falls back to defaults when no XLSX definition is present", () => {
        const { result } = renderAttachments(makeAutomation({ exportDefinitions: [] }));

        expect(result.current.xlsxSettings).toEqual({ mergeHeaders: true, exportInfo: true });
    });

    it("xlsxSettings reads settings off the present XLSX definition", () => {
        const { result } = renderAttachments(
            makeAutomation({
                exportDefinitions: [
                    makeWidgetExportDefinition("XLSX", {
                        settings: { mergeHeaders: false, exportInfo: false },
                    }),
                ],
            }),
        );

        expect(result.current.xlsxSettings).toEqual({ mergeHeaders: false, exportInfo: false });
    });

    it("csvSettings falls back to the workspace custom delimiter when absent", () => {
        const { result } = renderAttachments(makeAutomation({ exportDefinitions: [] }), {
            settings: { exportCsvCustomDelimiter: ";" },
        });

        expect(result.current.csvSettings).toEqual({ delimiter: ";" });
    });

    it("slidesTemplateIds reads per-format templateId, scoped to dashboard mode when no widget", () => {
        const { result } = renderAttachments(
            makeAutomation({
                exportDefinitions: [
                    makeDashboardExportDefinition("PPTX", { templateId: "tpl-pptx" }),
                    // Same format on a visualizationObject payload must NOT match in dashboard mode.
                    makeWidgetExportDefinition("PDF", { templateId: "tpl-pdf-widget" }),
                ],
            }),
        );

        expect(result.current.slidesTemplateIds).toEqual({
            PPTX: "tpl-pptx",
            PDF_SLIDES: undefined,
            PDF: undefined,
        });
    });

    it("scopes slidesTemplateIds to widget-mode definitions when the dialog has a widget", () => {
        const { result } = renderAttachments(
            makeAutomation({
                exportDefinitions: [
                    makeDashboardExportDefinition("PPTX", { templateId: "tpl-pptx-dashboard" }),
                    makeWidgetExportDefinition("PDF", { templateId: "tpl-pdf-widget" }),
                ],
            }),
            { widget: SENTINEL_WIDGET, insight: SENTINEL_INSIGHT },
        );

        expect(result.current.slidesTemplateIds).toEqual({
            PPTX: undefined,
            PDF_SLIDES: undefined,
            PDF: "tpl-pdf-widget",
        });
    });

    it("derives the default PDF page size from the workspace format locale", () => {
        const { result } = renderAttachments(makeAutomation({ exportDefinitions: [] }), {
            settings: { formatLocale: "en-US" },
        });

        expect(result.current.pdfSettings.pageSize).toBe("LETTER");
    });
});
