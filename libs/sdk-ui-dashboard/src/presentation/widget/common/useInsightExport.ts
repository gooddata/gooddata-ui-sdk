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
import {
    useExportTabularPdfDialogContext,
    useExportXlsxDialogContext,
} from "../../dashboardContexts/index.js";
import { useExportToTabular } from "../../topBar/menuButton/useExportToTabular.js";

function getDefaultPageSize(formatLocale?: string) {
    const normalizedLocale = formatLocale?.replace("_", "-");
    const region = normalizedLocale?.split("-")[1]?.toUpperCase();

    return region === "US" || region === "CA" ? "LETTER" : "A4";
}

export const useInsightExport = (config: {
    title: string;
    widgetRef: ObjRef;
    insight?: IInsight;
    widget?: IInsightWidget;
    enableNewTabularExport?: boolean;
}) => {
    const { title, widgetRef, insight, widget, enableNewTabularExport = true } = config;
    const [isExporting, setIsExporting] = useState(false);
    const intl = useIntl();
    const { formatLocale } = useDashboardSelector(selectSettings);

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
    const { openDialog: openXlsxDialog, closeDialog: closeXlsxDialog } = useExportXlsxDialogContext();
    const { openDialog: openPdfDialog, closeDialog: closePdfDialog } = useExportTabularPdfDialogContext();

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

    const { exportToTabular } = useExportToTabular(() => setIsExporting(false));
    const onExportPdfTabular = useCallback(() => {
        const defaultPageSize = getDefaultPageSize(formatLocale);
        if (enableNewTabularExport) {
            openPdfDialog({
                onSubmit: ({ pageSize, pageOrientation, showInfoPage }) => {
                    setIsExporting(true);
                    closePdfDialog();
                    exportToTabular(false, false, [widget!.identifier], title, "PDF", {
                        pageSize,
                        pageOrientation,
                        showInfoPage,
                    });
                },
                pageSize: defaultPageSize,
                pageOrientation: "PORTRAIT",
                showInfoPage: true,
            });
        } else {
            openPdfDialog({
                onSubmit: ({ pageSize, pageOrientation }) => {
                    setIsExporting(true);
                    closePdfDialog();
                    // if this bombs there is an issue with the logic enabling the buttons
                    invariant(exportFunction);
                    exportHandler(exportFunction, {
                        format: "pdf",
                        title,
                        pdfConfiguration: { pageSize, pageOrientation },
                    }).finally(() => setIsExporting(false));
                },
                pageSize: defaultPageSize,
                pageOrientation: "PORTRAIT",
                isShowInfoPageVisible: false,
            });
        }
    }, [
        setIsExporting,
        title,
        openPdfDialog,
        closePdfDialog,
        widget,
        exportToTabular,
        formatLocale,
        exportFunction,
    ]);

    const onExportXLSX = useCallback(() => {
        if (dashboardTabularExportEnabled && enableNewTabularExport) {
            openXlsxDialog({
                onSubmit: ({
                    includeFilterContext,
                    mergeHeaders,
                }: {
                    includeFilterContext?: boolean;
                    mergeHeaders?: boolean;
                }) => {
                    setIsExporting(true);
                    closeXlsxDialog();
                    exportToTabular(
                        mergeHeaders ?? true,
                        includeFilterContext ?? true,
                        [widget!.identifier],
                        title,
                        "XLSX",
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
            openXlsxDialog({
                onSubmit: ({
                    includeFilterContext,
                    mergeHeaders,
                }: {
                    includeFilterContext?: boolean;
                    mergeHeaders?: boolean;
                }) => {
                    setIsExporting(true);
                    // if this bombs there is an issue with the logic enabling the buttons
                    invariant(exportFunction);
                    closeXlsxDialog();
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
                filterContextVisible: false,
            });
        }
    }, [
        dashboardTabularExportEnabled,
        openXlsxDialog,
        intl,
        settings?.["cellMergedByDefault"],
        settings?.["activeFiltersByDefault"],
        closeXlsxDialog,
        exportToTabular,
        widget,
        exportFunction,
        title,
    ]);

    const exportCSVEnabled = !isExporting && isInsightExportable && isExportableToCsv;
    const exportXLSXEnabled =
        !isExporting &&
        isInsightExportable &&
        isExportableToXlsx &&
        (enableNewTabularExport && dashboardTabularExportEnabled ? !!widget?.localIdentifier : true);
    const exportCSVRawEnabled = !isExporting;
    const exportPdfTabularEnabled =
        !isExporting &&
        isInsightExportable &&
        isExportableToPdfTabular &&
        (enableNewTabularExport && dashboardTabularExportEnabled ? !!widget?.localIdentifier : true);

    const isExportVisible = useDashboardSelector(selectSlideShowExportVisible);

    const canExportCSV = useDashboardSelector(selectIsExportableToCSV);
    const canExportXLSX = useDashboardSelector(selectIsExportableToXLSX);
    const canExportCSVAndXLSX = isInsightExportable && canExportCSV && canExportXLSX;

    const isExportRawVisible = settings.enableRawExports === true && canExportCSVAndXLSX;

    const isExportPngImageVisible = useDashboardSelector(selectIsExportableToPngImage);

    const widgetsAsTable = useDashboardSelector(selectShowWidgetAsTable);
    const isWidgetShownAsTable = widgetsAsTable.some(
        (ref) => widgetRef && ref && areObjRefsEqual(ref, widgetRef),
    );

    const isAccessibilityModeEnabled = settings.enableAccessibilityMode === true;

    const isExportPdfTabularVisible =
        useDashboardSelector(selectIsExportableToPdfTabular) &&
        !!insight &&
        (insightVisualizationType(insight) === VisualizationTypes.TABLE || isWidgetShownAsTable) &&
        !isAccessibilityModeEnabled;

    const exportPdfPresentationDisabled = !!widget && !widget.localIdentifier;
    const exportPowerPointPresentationDisabled = !!widget && !widget.localIdentifier;
    const exportPngImageDisabled = !!widget && !widget.localIdentifier;
    const exportPdfTabularDisabled =
        !isExportableToPdfTabular || isExporting || (!!widget && !widget.localIdentifier);

    const disabledReason =
        dashboardTabularExportEnabled && !widget?.localIdentifier ? ("oldWidget" as const) : undefined;

    return {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        exportPdfTabularEnabled,
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
        disabledReason,
    };
};
