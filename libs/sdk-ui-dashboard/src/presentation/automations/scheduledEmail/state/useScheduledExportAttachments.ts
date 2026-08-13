// (C) 2019-2026 GoodData Corporation

import { useMemo } from "react";

import {
    DEFAULT_CSV_DELIMITER,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { getDefaultPdfPageSize } from "../utils/pdfPageSize.js";

import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";

/**
 * Reads what the scheduled-export dialog's attachment section displays: the selected formats, which
 * export kinds are present, the per-format settings with their fallbacks, and the slides template
 * chosen per format.
 *
 * Derived per consumer rather than published on a context: every value is a pure function of the
 * draft and of workspace settings, and no consumer observes their identity. The handlers that
 * *change* attachments are on {@link useScheduledExportActions}, because they capture the stored
 * export-parameter wire, which must exist once per dialog.
 *
 * @internal
 */
export function useScheduledExportAttachments() {
    const { settings } = useAutomationsContext();
    const { widget, insight } = useScheduledEmailDialogContext();
    const { editedAutomation } = useScheduledExportDraft();

    const resolvedDefaultCsvDelimiter = settings?.exportCsvCustomDelimiter ?? DEFAULT_CSV_DELIMITER;
    const defaultPdfPageSize = getDefaultPdfPageSize(settings?.formatLocale);
    const isWidget = !!widget && !!insight;

    const selectedAttachments = useMemo(() => {
        return (
            editedAutomation.exportDefinitions
                ?.map((exportDefinition) => exportDefinition.requestPayload.format)
                .filter(Boolean) ?? []
        );
    }, [editedAutomation.exportDefinitions]);

    const isDashboardExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) =>
            isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
        ) ?? true;

    const isCsvExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "CSV";
            }

            return false;
        }) ?? false;

    const isXlsxExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "XLSX";
            }

            return false;
        }) ?? false;

    const xlsxExportSettings = editedAutomation.exportDefinitions?.find(
        (exportDefinition) => exportDefinition.requestPayload.format === "XLSX",
    )?.requestPayload.settings;

    const xlsxSettings = {
        mergeHeaders: xlsxExportSettings?.mergeHeaders ?? true,
        exportInfo: xlsxExportSettings?.exportInfo ?? true,
    };

    const pdfVisualizationSettings = editedAutomation.exportDefinitions?.find(
        (exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) &&
            exportDefinition.requestPayload.format === "PDF_TABULAR",
    )?.requestPayload.settings;
    const pdfTabularSettings =
        pdfVisualizationSettings && "pageSize" in pdfVisualizationSettings
            ? pdfVisualizationSettings
            : undefined;
    const pdfSettings = {
        pageSize: pdfTabularSettings?.pageSize ?? defaultPdfPageSize ?? "A4",
        orientation: pdfTabularSettings?.orientation ?? "portrait",
        exportInfo: pdfTabularSettings?.exportInfo ?? true,
    };

    const csvExportDefinition = editedAutomation.exportDefinitions?.find(
        (exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) &&
            exportDefinition.requestPayload.format === "CSV",
    );
    const csvExportSettings =
        csvExportDefinition &&
        isExportDefinitionVisualizationObjectRequestPayload(csvExportDefinition.requestPayload)
            ? csvExportDefinition.requestPayload.settings
            : undefined;
    const csvSettings = {
        delimiter: csvExportSettings?.delimiter ?? resolvedDefaultCsvDelimiter,
    };

    const csvRawExportDefinition = editedAutomation.exportDefinitions?.find(
        (exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) &&
            exportDefinition.requestPayload.format === "CSV_RAW",
    );
    const csvRawExportSettings =
        csvRawExportDefinition &&
        isExportDefinitionVisualizationObjectRequestPayload(csvRawExportDefinition.requestPayload)
            ? csvRawExportDefinition.requestPayload.settings
            : undefined;
    const csvRawSettings = {
        delimiter: csvRawExportSettings?.delimiter ?? resolvedDefaultCsvDelimiter,
    };

    // Extract templateId per slides format, scoped to the current dialog mode
    const getTemplateIdForFormat = (format: "PPTX" | "PDF_SLIDES" | "PDF") => {
        const def = editedAutomation.exportDefinitions?.find(
            (ed) =>
                ed.requestPayload.format === format &&
                (isWidget
                    ? isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload)
                    : isExportDefinitionDashboardRequestPayload(ed.requestPayload)),
        );
        return def?.requestPayload.templateId;
    };
    const slidesTemplateIds = {
        PPTX: getTemplateIdForFormat("PPTX"),
        PDF_SLIDES: getTemplateIdForFormat("PDF_SLIDES"),
        PDF: getTemplateIdForFormat("PDF"),
    };

    return {
        selectedAttachments,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        xlsxSettings,
        pdfSettings,
        csvSettings,
        csvRawSettings,
        slidesTemplateIds,
    };
}
