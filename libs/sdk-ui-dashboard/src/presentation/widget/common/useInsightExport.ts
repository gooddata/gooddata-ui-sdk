// (C) 2021-2025 GoodData Corporation
import { useCallback, useState } from "react";
import { invariant } from "ts-invariant";
import { IExtendedExportConfig } from "@gooddata/sdk-ui";
import { IInsight, IInsightWidget, ObjRef } from "@gooddata/sdk-model";
import { getInsightVisualizationMeta } from "@gooddata/sdk-ui-ext";
import { v4 as uuid } from "uuid";

import {
    selectSettings,
    useDashboardSelector,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    useDashboardDispatch,
    dispatchAndWaitFor,
    exportInsightWidget,
    ExportInsightWidget,
    DashboardInsightWidgetExportResolved,
    ExportRawInsightWidget,
    exportRawInsightWidget,
    ExportSlidesInsightWidget,
    exportSlidesInsightWidget,
    selectSlideShowExportVisible,
} from "../../../model/index.js";
import { useExportHandler } from "./useExportHandler.js";
import { useExportDialogContext } from "../../dashboardContexts/index.js";
import { useRawExportHandler } from "./useRawExportHandler.js";
import { useSlidesExportHandler } from "./useSlidesExportHandler.js";

export const useInsightExport = (config: {
    title: string;
    widgetRef: ObjRef;
    insight?: IInsight;
    widget?: IInsightWidget;
}) => {
    const { title, widgetRef, insight, widget } = config;
    const [isExporting, setIsExporting] = useState(false);

    const dispatch = useDashboardDispatch();
    const exportFunction = useCallback(
        (configToUse: IExtendedExportConfig) =>
            dispatchAndWaitFor<ExportInsightWidget, DashboardInsightWidgetExportResolved>(
                dispatch,
                exportInsightWidget(
                    widgetRef,
                    {
                        ...configToUse,
                        format: configToUse.format === "xlsx" ? "xlsx" : "csv",
                    },
                    uuid(),
                ),
            ).then((result) => result.payload.result),
        [widgetRef],
    );

    const exportRawFunction = useCallback(
        (title: string) =>
            dispatchAndWaitFor<ExportRawInsightWidget, DashboardInsightWidgetExportResolved>(
                dispatch,
                exportRawInsightWidget(widgetRef, widget!, insight!, title, uuid()),
            ).then((result) => result.payload.result),
        [widgetRef, widget, insight],
    );

    const exportSlidesFunction = useCallback(
        (title: string, exportType: "pdf" | "pptx") =>
            dispatchAndWaitFor<ExportSlidesInsightWidget, DashboardInsightWidgetExportResolved>(
                dispatch,
                exportSlidesInsightWidget(widgetRef!, title, exportType, uuid()),
            ).then((result) => result.payload.result),
        [widgetRef],
    );

    const settings = useDashboardSelector(selectSettings);
    const isInsightExportable = insight
        ? getInsightVisualizationMeta(insight, settings).supportsExport
        : false;
    const isExportableToCsv = useDashboardSelector(selectIsExecutionResultExportableToCsvByRef(widgetRef));
    const isExportableToXlsx = useDashboardSelector(selectIsExecutionResultExportableToXlsxByRef(widgetRef));

    const exportHandler = useExportHandler();
    const exportRawHandler = useRawExportHandler();
    const exportSlidesHandler = useSlidesExportHandler();
    const { openDialog, closeDialog } = useExportDialogContext();

    const onExportCSV = useCallback(() => {
        setIsExporting(true);
        const exportConfig: IExtendedExportConfig = {
            format: "csv",
            title,
        };
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportFunction);
        exportHandler(exportFunction, exportConfig).then(() => setIsExporting(false));
    }, [exportFunction, setIsExporting, title]);

    const onExportRawCSV = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportRawFunction);
        exportRawHandler(exportRawFunction, title).then(() => setIsExporting(false));
    }, [exportRawFunction, title]);

    const onExportPowerPointPresentation = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportSlidesFunction);
        exportSlidesHandler(exportSlidesFunction, title, "pptx").then(() => setIsExporting(false));
    }, [exportSlidesFunction, title]);

    const onExportPdfPresentation = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportSlidesFunction);
        exportSlidesHandler(exportSlidesFunction, title, "pdf").then(() => setIsExporting(false));
    }, [exportSlidesFunction, title]);

    const onExportXLSX = useCallback(() => {
        openDialog({
            onSubmit: ({ includeFilterContext, mergeHeaders }) => {
                setIsExporting(true);
                // if this bombs there is an issue with the logic enabling the buttons
                invariant(exportFunction);
                closeDialog();
                exportHandler(exportFunction, {
                    format: "xlsx",
                    mergeHeaders,
                    includeFilterContext,
                    showFilters: includeFilterContext,
                    title,
                }).then(() => setIsExporting(false));
            },
            includeFilterContext: Boolean(settings?.activeFiltersByDefault ?? true),
            mergeHeaders: Boolean(settings?.cellMergedByDefault ?? true),
            filterContextVisible: Boolean(settings?.enableActiveFilterContext ?? true),
        });
    }, [settings, title, exportFunction, closeDialog]);

    const exportCSVEnabled = !isExporting && isInsightExportable && isExportableToCsv;
    const exportXLSXEnabled = !isExporting && isInsightExportable && isExportableToXlsx;
    const exportCSVRawEnabled = !isExporting;

    const isExportVisible = useDashboardSelector(selectSlideShowExportVisible);
    const canExportCSVAndXLSX = isInsightExportable && isExportableToCsv && isExportableToXlsx;
    const isExportRawVisible = settings.enableRawExports === true && canExportCSVAndXLSX;

    const exportPdfPresentationDisabled = !!widget && !widget.localIdentifier;
    const exportPowerPointPresentationDisabled = !!widget && !widget.localIdentifier;

    return {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExporting,
        isExportRawVisible,
        isExportVisible,
        onExportCSV,
        onExportXLSX,
        onExportRawCSV,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
    };
};
