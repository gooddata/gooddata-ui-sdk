// (C) 2021-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";
import { invariant } from "ts-invariant";
import { v4 as uuid } from "uuid";

import {
    IInsight,
    IInsightWidget,
    ObjRef,
    areObjRefsEqual,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { IExtendedExportConfig, VisualizationTypes } from "@gooddata/sdk-ui";
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
    selectIsExecutionResultExportableToPdfByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    selectIsExportableToCSV,
    selectIsExportableToPdfTabular,
    selectIsExportableToPngImage,
    selectIsExportableToXLSX,
    selectSettings,
    selectShowWidgetAsTable,
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
                        format:
                            configToUse.format === "xlsx"
                                ? "xlsx"
                                : configToUse.format === "pdf"
                                  ? "pdf"
                                  : "csv",
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
    const isExportableToPdfTabular = useDashboardSelector(
        selectIsExecutionResultExportableToPdfByRef(widgetRef),
    );
    const dashboardTabularExportEnabled = useDashboardSelector(selectEnableDashboardTabularExport);

    const exportHandler = useExportHandler();
    const exportRawHandler = useRawExportHandler();
    const exportSlidesHandler = useSlidesExportHandler();
    const exportImageHandler = useImageExportHandler();
    const { openDialog, closeDialog } = useExportDialogContext();

    const onExportCSV = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportFunction);
        exportHandler(exportFunction, { format: "csv", title }).finally(() => setIsExporting(false));
    }, [exportFunction, setIsExporting, title]);

    const onExportRawCSV = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportRawFunction);
        exportRawHandler(exportRawFunction, title).finally(() => setIsExporting(false));
    }, [exportRawFunction, title]);

    const onExportPowerPointPresentation = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportSlidesFunction);
        exportSlidesHandler(exportSlidesFunction, title, "pptx").finally(() => setIsExporting(false));
    }, [exportSlidesFunction, title]);

    const onExportPdfPresentation = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportSlidesFunction);
        exportSlidesHandler(exportSlidesFunction, title, "pdf").finally(() => setIsExporting(false));
    }, [exportSlidesFunction, title]);

    const onExportPngImage = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportImageFunction);
        exportImageHandler(exportImageFunction, title).finally(() => setIsExporting(false));
    }, [exportImageFunction, title]);

    const onExportPdfTabular = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportFunction);
        exportHandler(exportFunction, { format: "pdf", title }).finally(() => setIsExporting(false));
    }, [exportFunction, setIsExporting, title]);

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
                mergeHeaders: Boolean(settings?.["cellMergedByDefault"] ?? true),
                mergeHeadersTitle: null,
                includeFilterContext: Boolean(settings?.["activeFiltersByDefault"] ?? true),
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
                    }).finally(() => setIsExporting(false));
                },
                includeFilterContext: Boolean(settings?.["activeFiltersByDefault"] ?? true),
                mergeHeaders: Boolean(settings?.["cellMergedByDefault"] ?? true),
                filterContextVisible: Boolean(settings?.["enableActiveFilterContext"] ?? true),
            });
        }
    }, [
        dashboardTabularExportEnabled,
        openDialog,
        intl,
        settings?.["cellMergedByDefault"],
        settings?.["activeFiltersByDefault"],
        settings?.["enableActiveFilterContext"],
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

    const isExportRawVisible = settings["enableRawExports"] === true && canExportCSVAndXLSX;

    const isExportPngImageVisible = useDashboardSelector(selectIsExportableToPngImage);

    const widgetsAsTable = useDashboardSelector(selectShowWidgetAsTable);
    const isWidgetShownAsTable = widgetsAsTable.some(
        (ref) => widgetRef && ref && areObjRefsEqual(ref, widgetRef),
    );

    const isExportPdfTabularVisible =
        useDashboardSelector(selectIsExportableToPdfTabular) &&
        !!insight &&
        (insightVisualizationType(insight) === VisualizationTypes.TABLE || isWidgetShownAsTable);

    const exportPdfPresentationDisabled = !!widget && !widget.localIdentifier;
    const exportPowerPointPresentationDisabled = !!widget && !widget.localIdentifier;
    const exportPngImageDisabled = !!widget && !widget.localIdentifier;
    const exportPdfTabularDisabled = !isExportableToPdfTabular || isExporting;

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
        isExportPdfTabularVisible,
        onExportCSV,
        onExportXLSX,
        onExportRawCSV,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        onExportPdfTabular,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
        exportPdfTabularDisabled,
        xlsxDisabledReason,
    };
};
