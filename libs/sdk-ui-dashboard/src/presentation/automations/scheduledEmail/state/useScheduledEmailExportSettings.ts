// (C) 2019-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useRef } from "react";

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
    getAutomationExportParametersByTab,
    setExportParametersByTab,
} from "../../../../_staging/automation/index.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { useExportTimezones } from "../DefaultScheduledEmailDialog/hooks/useExportTimezones.js";

import {
    newDashboardExportDefinitionMetadataObjectDefinition,
    newWidgetExportDefinitionMetadataObjectDefinition,
    withRebuiltExportDefinitions,
} from "./exportDefinitions.js";
import { type IScheduledEmailExportSettings } from "./types.js";

export interface IUseScheduledEmailExportSettingsProps {
    editedAutomation: IAutomationMetadataObjectDefinition;
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>;
    insight?: IInsight;
    widget?: IWidget;
    storeFilters?: boolean;
    effectiveDashboardFilters: FilterContextItem[] | undefined;
    effectiveDashboardFiltersByTab: Record<string, FilterContextItem[]> | undefined;
    effectiveWidgetFilters: IFilter[];
    effectiveWidgetFiltersWithInsight: IFilter[];
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
    /**
     * Live value of the "Schedule time zone" section. When active, it replaces the store-derived
     * defaults for export definitions created by attachment changes.
     */
    scheduleTimezone?: { active: boolean; timezoneId: string | undefined };
}

/**
 * Owns the scheduled export's attachment write path: the per-tab export-parameter wire, which is
 * held outside the automation so it survives an export-definition rebuild, and every handler that
 * rebuilds or patches export definitions and therefore captures that wire.
 *
 * The wire must exist once per dialog, so this hook is called once, by the state provider, and its
 * handlers are published on the actions context. What the attachment section *displays* is a pure
 * function of the draft and is derived per consumer in {@link useScheduledExportAttachments}.
 *
 * @internal
 */
export function useScheduledEmailExportSettings({
    editedAutomation,
    setEditedAutomation,
    insight,
    widget,
    storeFilters,
    effectiveDashboardFilters,
    effectiveDashboardFiltersByTab,
    effectiveWidgetFilters,
    effectiveWidgetFiltersWithInsight,
    defaultPdfPageSize,
    scheduleTimezone,
}: IUseScheduledEmailExportSettingsProps): IScheduledEmailExportSettings {
    const { dashboardId, dashboardTitle } = useScheduledEmailDialogContext();

    const { exportTimezoneId: defaultExportTimezoneId } = useExportTimezones(!!widget && !!insight);

    // The live "Time zone" section value wins over the store-derived default for definitions
    // created while the dialog is open.
    const exportTimezoneId = scheduleTimezone?.active ? scheduleTimezone.timezoneId : defaultExportTimezoneId;

    // Holds the wire outside the automation so it survives a rebuild from zero export definitions —
    // with no definitions `setExportParametersByTab` has nowhere to store it.
    // Seeded from the stored wire.
    const latestParametersWireRef = useRef<Record<string, IDashboardExportParameter[]> | undefined>(
        getAutomationExportParametersByTab(editedAutomation),
    );

    // The user-edit path into `content.parametersByTab`: re-encoded wire in, every export definition
    // patched. Handed to `useAutomationExportParameters`, which owns when to call it. Definition
    // rebuilds preserve the wire separately via `withRebuiltExportDefinitions`.
    const setParametersWire = useCallback(
        (wire: Record<string, IDashboardExportParameter[]> | undefined) => {
            latestParametersWireRef.current = wire;
            setEditedAutomation((automation) => setExportParametersByTab(automation, wire));
        },
        [setEditedAutomation],
    );

    // Re-derived locally (not passed as a prop) so that `invariant(isWidget, ...)` below narrows
    // `widget`/`insight` via TS's aliased-condition control-flow analysis — this requires the boolean
    // to be declared from those exact variables in this same scope, same as in the parent.
    const isWidget = !!widget && !!insight;

    const onDashboardAttachmentsChange = useCallback(
        (formats: DashboardAttachmentType[]): void => {
            setEditedAutomation((s) => {
                const currentExportDefinitions = s.exportDefinitions || [];

                const currentDashboardExportDefinitions = currentExportDefinitions.filter(
                    (exportDefinition) =>
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
                        timezoneId: exportTimezoneId,
                    }),
                );

                const updatedExportDefinitions = [...keptExportDefinitions, ...newExportDefinitions];
                return withRebuiltExportDefinitions(
                    s,
                    updatedExportDefinitions,
                    latestParametersWireRef.current,
                );
            });
        },
        [
            setEditedAutomation,
            dashboardId,
            dashboardTitle,
            storeFilters,
            effectiveDashboardFilters,
            effectiveDashboardFiltersByTab,
            exportTimezoneId,
        ],
    );

    const onWidgetAttachmentsChange = useCallback(
        (formats: WidgetAttachmentType[]): void => {
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
                        timezoneId: exportTimezoneId,
                    }),
                );

                const updatedExportDefinitions = [...keptExportDefinitions, ...newExportDefinitions];
                return withRebuiltExportDefinitions(
                    s,
                    updatedExportDefinitions,
                    latestParametersWireRef.current,
                );
            });
        },
        [
            setEditedAutomation,
            isWidget,
            insight,
            widget,
            dashboardId,
            effectiveWidgetFilters,
            effectiveWidgetFiltersWithInsight,
            effectiveDashboardFilters,
            defaultPdfPageSize,
            exportTimezoneId,
        ],
    );

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

                    const { delimiter: _delimiter, ...restSettings } =
                        exportDefinition.requestPayload.settings ?? {};
                    const nextSettings =
                        settings.delimiter === undefined
                            ? restSettings
                            : { ...restSettings, delimiter: settings.delimiter };

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

    const onCsvRawSettingsChange = useCallback(
        (settings: IExportDefinitionVisualizationObjectSettings) => {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                    if (exportDefinition.requestPayload.format !== "CSV_RAW") {
                        return exportDefinition;
                    }

                    const { delimiter: _delimiter, ...restSettings } =
                        exportDefinition.requestPayload.settings ?? {};
                    const nextSettings =
                        settings.delimiter === undefined
                            ? restSettings
                            : { ...restSettings, delimiter: settings.delimiter };

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

    return {
        setParametersWire,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        onSlidesTemplateIdChange,
    };
}
