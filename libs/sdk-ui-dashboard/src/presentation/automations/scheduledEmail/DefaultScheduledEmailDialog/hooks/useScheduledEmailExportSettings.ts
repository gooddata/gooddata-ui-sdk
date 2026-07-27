// (C) 2019-2026 GoodData Corporation

import { type Dispatch, type RefObject, type SetStateAction, useCallback, useMemo } from "react";

import { invariant } from "ts-invariant";

import {
    type DashboardAttachmentType,
    type FilterContextItem,
    type IAutomationMetadataObjectDefinition,
    type IDashboardExportParameter,
    type IExportDefinitionVisualizationObjectSettings,
    type IFilter,
    type IInsight,
    type IWidget,
    type WidgetAttachmentType,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import {
    newDashboardExportDefinitionMetadataObjectDefinition,
    newWidgetExportDefinitionMetadataObjectDefinition,
    withRebuiltExportDefinitions,
} from "../utils/exportDefinitions.js";

export interface IUseScheduledEmailExportSettingsProps {
    editedAutomation: IAutomationMetadataObjectDefinition;
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>;
    insight?: IInsight;
    widget?: IWidget;
    dashboardId?: string;
    dashboardTitle: string;
    storeFilters?: boolean;
    effectiveDashboardFilters: FilterContextItem[] | undefined;
    effectiveDashboardFiltersByTab: Record<string, FilterContextItem[]> | undefined;
    effectiveWidgetFilters: IFilter[];
    effectiveWidgetFiltersWithInsight: IFilter[];
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
    resolvedDefaultCsvDelimiter: string;
    /**
     * Holds the wire outside the automation so it survives a rebuild from zero export definitions —
     * with no definitions `setExportParametersByTab` has nowhere to store it. Owned by the parent
     * (`useEditScheduledEmail`); read here (never written) at attachment-change time.
     */
    latestParametersWireRef: RefObject<Record<string, IDashboardExportParameter[]> | undefined>;
}

export function useScheduledEmailExportSettings({
    editedAutomation,
    setEditedAutomation,
    insight,
    widget,
    dashboardId,
    dashboardTitle,
    storeFilters,
    effectiveDashboardFilters,
    effectiveDashboardFiltersByTab,
    effectiveWidgetFilters,
    effectiveWidgetFiltersWithInsight,
    defaultPdfPageSize,
    resolvedDefaultCsvDelimiter,
    latestParametersWireRef,
}: IUseScheduledEmailExportSettingsProps) {
    // Re-derived locally (not passed as a prop) so that `invariant(isWidget, ...)` below narrows
    // `widget`/`insight` via TS's aliased-condition control-flow analysis — this requires the boolean
    // to be declared from those exact variables in this same scope, same as in the parent.
    const isWidget = !!widget && !!insight;

    const selectedAttachments = useMemo(() => {
        return (
            editedAutomation.exportDefinitions
                ?.map((exportDefinition) => exportDefinition.requestPayload.format)
                .filter(Boolean) ?? []
        );
    }, [editedAutomation.exportDefinitions]);

    const onDashboardAttachmentsChange = (formats: DashboardAttachmentType[]): void => {
        setEditedAutomation((s) => {
            const currentExportDefinitions = s.exportDefinitions || [];

            const currentDashboardExportDefinitions = currentExportDefinitions.filter((exportDefinition) =>
                isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
            );

            const currentFormats = currentDashboardExportDefinitions.map(
                (exportDefinition) => exportDefinition.requestPayload.format,
            );

            const formatsToKeep = currentFormats.filter((format) =>
                formats.includes(format as DashboardAttachmentType),
            );
            const formatsToAdd = formats.filter((format) => !currentFormats.includes(format));

            const keptExportDefinitions = currentDashboardExportDefinitions.filter((exportDefinition) =>
                formatsToKeep.includes(exportDefinition.requestPayload.format),
            );

            const newExportDefinitions = formatsToAdd.map((format) =>
                newDashboardExportDefinitionMetadataObjectDefinition({
                    dashboardId: dashboardId!,
                    dashboardTitle,
                    dashboardFilters: storeFilters ? effectiveDashboardFilters : undefined,
                    filtersByTab: storeFilters ? effectiveDashboardFiltersByTab : undefined,
                    format,
                }),
            );

            const updatedExportDefinitions = [...keptExportDefinitions, ...newExportDefinitions];
            return withRebuiltExportDefinitions(s, updatedExportDefinitions, latestParametersWireRef.current);
        });
    };

    const onWidgetAttachmentsChange = (formats: WidgetAttachmentType[]): void => {
        invariant(isWidget, "Widget or insight is missing in scheduling dialog context.");
        setEditedAutomation((s) => {
            const currentExportDefinitions = s.exportDefinitions || [];

            const currentWidgetExportDefinitions = currentExportDefinitions.filter((exportDefinition) =>
                isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload),
            );

            const currentFormats = currentWidgetExportDefinitions.map(
                (exportDefinition) => exportDefinition.requestPayload.format,
            );

            const formatsToKeep = currentFormats.filter((format) =>
                formats.includes(format as WidgetAttachmentType),
            );
            const formatsToAdd = formats.filter((format) => !currentFormats.includes(format));

            const keptExportDefinitions = currentWidgetExportDefinitions.filter((exportDefinition) =>
                formatsToKeep.includes(exportDefinition.requestPayload.format),
            );

            const newExportDefinitions = formatsToAdd.map((format) =>
                newWidgetExportDefinitionMetadataObjectDefinition({
                    insight,
                    widget,
                    dashboardId: dashboardId!,
                    format,
                    widgetFilters: effectiveWidgetFilters,
                    widgetFiltersWithInsight: effectiveWidgetFiltersWithInsight,
                    dashboardFilters: effectiveDashboardFilters,
                    defaultPdfPageSize,
                }),
            );

            const updatedExportDefinitions = [...keptExportDefinitions, ...newExportDefinitions];
            return withRebuiltExportDefinitions(s, updatedExportDefinitions, latestParametersWireRef.current);
        });
    };

    const onXlsxSettingsChange = useCallback(
        (settings: IExportDefinitionVisualizationObjectSettings) => {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                    if (exportDefinition.requestPayload.format !== "XLSX") {
                        return exportDefinition;
                    }

                    const nextSettings = {
                        ...exportDefinition.requestPayload?.settings,
                        mergeHeaders: settings.mergeHeaders,
                        exportInfo: settings.exportInfo,
                    };

                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: nextSettings,
                        },
                    };
                }),
            }));
        },
        [setEditedAutomation],
    );

    const onPdfSettingsChange = useCallback(
        (settings: IExportDefinitionVisualizationObjectSettings) => {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                    if (exportDefinition.requestPayload.format !== "PDF_TABULAR") {
                        return exportDefinition;
                    }

                    const nextSettings = {
                        ...exportDefinition.requestPayload?.settings,
                        pageSize: settings.pageSize,
                        orientation: settings.orientation ?? "portrait",
                        exportInfo: settings.exportInfo,
                    };

                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: nextSettings,
                        },
                    };
                }),
            }));
        },
        [setEditedAutomation],
    );

    const onCsvSettingsChange = useCallback(
        (settings: IExportDefinitionVisualizationObjectSettings) => {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                    if (exportDefinition.requestPayload.format !== "CSV") {
                        return exportDefinition;
                    }

                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: {
                                ...exportDefinition.requestPayload.settings,
                                delimiter: settings.delimiter,
                            },
                        },
                    };
                }),
            }));
        },
        [setEditedAutomation],
    );

    const onCsvRawSettingsChange = useCallback(
        (settings: IExportDefinitionVisualizationObjectSettings) => {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                    if (exportDefinition.requestPayload.format !== "CSV_RAW") {
                        return exportDefinition;
                    }

                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: {
                                ...exportDefinition.requestPayload.settings,
                                delimiter: settings.delimiter,
                            },
                        },
                    };
                }),
            }));
        },
        [setEditedAutomation],
    );

    const onSlidesTemplateIdChange = useCallback(
        (templateId: string | undefined, format: "PPTX" | "PDF_SLIDES" | "PDF") => {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                    const matchesFormat = exportDefinition.requestPayload.format === format;
                    const matchesType = isWidget
                        ? isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)
                        : isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload);

                    if (!matchesFormat || !matchesType) {
                        return exportDefinition;
                    }

                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            templateId,
                        },
                    };
                }),
            }));
        },
        [setEditedAutomation, isWidget],
    );

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
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        onSlidesTemplateIdChange,
    };
}
