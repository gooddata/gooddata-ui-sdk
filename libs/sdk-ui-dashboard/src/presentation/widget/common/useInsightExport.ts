// (C) 2021-2025 GoodData Corporation
import { useCallback, useState } from "react";

import { useIntl } from "react-intl";
import { invariant } from "ts-invariant";
import { v4 as uuid } from "uuid";

import { IInsight, IInsightWidget, ObjRef } from "@gooddata/sdk-model";
import { IExtendedExportConfig } from "@gooddata/sdk-ui";
import { getInsightVisualizationMeta } from "@gooddata/sdk-ui-ext";

import { useExportHandler } from "./useExportHandler.js";
import { useImageExportHandler } from "./useImageExportHandler.js";
import { useRawExportHandler } from "./useRawExportHandler.js";
import { useSlidesExportHandler } from "./useSlidesExportHandler.js";
import {
    DashboardInsightWidgetExportResolved,
    ExportImageInsightWidget,
    ExportInsightWidget,
    ExportRawInsightWidget,
    ExportSlidesInsightWidget,
    dispatchAndWaitFor,
    exportImageInsightWidget,
    exportInsightWidget,
    exportRawInsightWidget,
    exportSlidesInsightWidget,
    selectEnableDashboardTabularExport,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    selectIsExportableToCSV,
    selectIsExportableToPngImage,
    selectIsExportableToXLSX,
    selectSettings,
    selectSlideShowExportVisible,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { useExportDialogContext } from "../../dashboardContexts/index.js";
import { useExportDashboardToExcel } from "../../topBar/menuButton/useExportDashboardToExcel.js";

export const useInsightExport = (config: {
    title: string;
    widgetRef: ObjRef;
    insight?: IInsight;
    widget?: IInsightWidget;
    useNewTabularExport?: boolean;
}) => {
    const { title, widgetRef, insight, widget, useNewTabularExport } = config;
    const [isExporting, setIsExporting] = useState(false);
    const intl = useIntl();

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

    const exportImageFunction = useCallback(
        (title: string) =>
            dispatchAndWaitFor<ExportImageInsightWidget, DashboardInsightWidgetExportResolved>(
                dispatch,
                exportImageInsightWidget(widgetRef!, title, uuid()),
            ).then((result) => result.payload.result),
        [widgetRef],
    );
    const settings = useDashboardSelector(selectSettings);
    const isInsightExportable = insight
        ? getInsightVisualizationMeta(insight, settings).supportsExport
        : false;
    const isExportableToCsv = useDashboardSelector(selectIsExecutionResultExportableToCsvByRef(widgetRef));
    const isExportableToXlsx = useDashboardSelector(selectIsExecutionResultExportableToXlsxByRef(widgetRef));
    const dashboardTabularExportEnabled = useDashboardSelector(selectEnableDashboardTabularExport);

    const exportHandler = useExportHandler();
    const exportRawHandler = useRawExportHandler();
    const exportSlidesHandler = useSlidesExportHandler();
    const exportImageHandler = useImageExportHandler();
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

    const onExportPngImage = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportImageFunction);
        exportImageHandler(exportImageFunction, title).then(() => setIsExporting(false));
    }, [exportImageFunction, title]);

    const { exportDashboardToExcel } = useExportDashboardToExcel(() => setIsExporting(false));
    const onExportXLSX = useCallback(() => {
        if (dashboardTabularExportEnabled && useNewTabularExport) {
            openDialog({
                onSubmit: ({ includeFilterContext, mergeHeaders }) => {
                    setIsExporting(true);
                    closeDialog();
                    exportDashboardToExcel(
                        mergeHeaders ?? true,
                        includeFilterContext ?? true,
                        [widget!.identifier],
                        title,
                    );
                },
                headline: intl.formatMessage({ id: "options.menu.export.dialog.widget.EXCEL" }),
                mergeHeaders: Boolean(settings?.cellMergedByDefault ?? true),
                mergeHeadersTitle: null,
                includeFilterContext: Boolean(settings?.activeFiltersByDefault ?? true),
                filterContextVisible: true,
                filterContextTitle: null,
                filterContextText: intl.formatMessage({ id: "options.menu.export.dialog.includeExportInfo" }),
            });
        } else {
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
        }
    }, [
        dashboardTabularExportEnabled,
        openDialog,
        intl,
        settings?.cellMergedByDefault,
        settings?.activeFiltersByDefault,
        settings?.enableActiveFilterContext,
        closeDialog,
        exportDashboardToExcel,
        widget,
        exportFunction,
        title,
    ]);

    const exportCSVEnabled = !isExporting && isInsightExportable && isExportableToCsv;
    const exportXLSXEnabled =
        !isExporting &&
        isInsightExportable &&
        isExportableToXlsx &&
        (useNewTabularExport && dashboardTabularExportEnabled ? !!widget?.localIdentifier : true);
    const exportCSVRawEnabled = !isExporting;

    const isExportVisible = useDashboardSelector(selectSlideShowExportVisible);

    const canExportCSV = useDashboardSelector(selectIsExportableToCSV);
    const canExportXLSX = useDashboardSelector(selectIsExportableToXLSX);
    const canExportCSVAndXLSX = isInsightExportable && canExportCSV && canExportXLSX;

    const isExportRawVisible = settings.enableRawExports === true && canExportCSVAndXLSX;

    const isExportPngImageVisible = useDashboardSelector(selectIsExportableToPngImage);

    const exportPdfPresentationDisabled = !!widget && !widget.localIdentifier;
    const exportPowerPointPresentationDisabled = !!widget && !widget.localIdentifier;
    const exportPngImageDisabled = !!widget && !widget.localIdentifier;

    const xlsxDisabledReason =
        dashboardTabularExportEnabled && !widget?.localIdentifier ? ("oldWidget" as const) : undefined;

    return {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExporting,
        isExportRawVisible,
        isExportVisible,
        isExportPngImageVisible,
        onExportCSV,
        onExportXLSX,
        onExportRawCSV,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
        xlsxDisabledReason,
    };
};
