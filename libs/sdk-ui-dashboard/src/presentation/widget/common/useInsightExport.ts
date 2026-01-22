// (C) 2021-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";
import { invariant } from "ts-invariant";
import { v4 as uuid } from "uuid";

import {
    type IInsight,
    type IInsightWidget,
    type ObjRef,
    areObjRefsEqual,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { type IExtendedExportConfig, VisualizationTypes } from "@gooddata/sdk-ui";
import { getInsightVisualizationMeta } from "@gooddata/sdk-ui-ext";

import { useExportHandler } from "./useExportHandler.js";
import { useImageExportHandler } from "./useImageExportHandler.js";
import { useRawExportHandler } from "./useRawExportHandler.js";
import { useSlidesExportHandler } from "./useSlidesExportHandler.js";
import {
    type IExportImageInsightWidget,
    type IExportInsightWidget,
    type IExportRawInsightWidget,
    type IExportSlidesInsightWidget,
    exportImageInsightWidget,
    exportInsightWidget,
    exportRawInsightWidget,
    exportSlidesInsightWidget,
} from "../../../model/commands/insight.js";
import { type IDashboardInsightWidgetExportResolved } from "../../../model/events/insight.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { dispatchAndWaitFor } from "../../../model/store/_infra/dispatchAndWaitFor.js";
import {
    selectEnableDashboardTabularExport,
    selectSettings,
} from "../../../model/store/config/configSelectors.js";
import {
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToPdfByRef,
    selectIsExecutionResultExportableToXlsxByRef,
} from "../../../model/store/executionResults/executionResultsSelectors.js";
import { selectShowWidgetAsTable } from "../../../model/store/showWidgetAsTable/showWidgetAsTableSelectors.js";
import { selectSlideShowExportVisible } from "../../../model/store/topBar/topBarSelectors.js";
import {
    selectIsExportableToCSV,
    selectIsExportableToPdfTabular,
    selectIsExportableToPngImage,
    selectIsExportableToXLSX,
} from "../../../model/store/widgetExports/widgetExportsSelectors.js";
import { useExportTabularPdfDialogContext } from "../../dashboardContexts/ExportTabularPdfDialogContext.js";
import { useExportXlsxDialogContext } from "../../dashboardContexts/ExportXlsxDialogContext.js";
import { getDefaultPdfPageSize } from "../../scheduledEmail/utils/pdfPageSize.js";
import { useExportToTabular } from "../../topBar/menuButton/useExportToTabular.js";

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
            dispatchAndWaitFor<IExportInsightWidget, IDashboardInsightWidgetExportResolved>(
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [widgetRef],
    );

    const exportRawFunction = useCallback(
        (title: string) =>
            dispatchAndWaitFor<IExportRawInsightWidget, IDashboardInsightWidgetExportResolved>(
                dispatch,
                exportRawInsightWidget(widgetRef, widget!, insight!, title, uuid()),
            ).then((result) => result.payload.result),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [widgetRef, widget, insight],
    );

    const exportSlidesFunction = useCallback(
        (title: string, exportType: "pdf" | "pptx") =>
            dispatchAndWaitFor<IExportSlidesInsightWidget, IDashboardInsightWidgetExportResolved>(
                dispatch,
                exportSlidesInsightWidget(widgetRef, title, exportType, uuid()),
            ).then((result) => result.payload.result),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [widgetRef],
    );

    const exportImageFunction = useCallback(
        (title: string) =>
            dispatchAndWaitFor<IExportImageInsightWidget, IDashboardInsightWidgetExportResolved>(
                dispatch,
                exportImageInsightWidget(widgetRef, title, uuid()),
            ).then((result) => result.payload.result),
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        void exportHandler(exportFunction, { format: "csv", title }).finally(() => setIsExporting(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportFunction, setIsExporting, title]);

    const onExportRawCSV = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportRawFunction);
        void exportRawHandler(exportRawFunction, title).finally(() => setIsExporting(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportRawFunction, title]);

    const onExportPowerPointPresentation = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportSlidesFunction);
        void exportSlidesHandler(exportSlidesFunction, title, "pptx").finally(() => setIsExporting(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportSlidesFunction, title]);

    const onExportPdfPresentation = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportSlidesFunction);
        void exportSlidesHandler(exportSlidesFunction, title, "pdf").finally(() => setIsExporting(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportSlidesFunction, title]);

    const onExportPngImage = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportImageFunction);
        void exportImageHandler(exportImageFunction, title).finally(() => setIsExporting(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportImageFunction, title]);

    const { exportToTabular } = useExportToTabular(() => setIsExporting(false));
    const onExportPdfTabular = useCallback(() => {
        const defaultPageSize = getDefaultPdfPageSize(formatLocale);
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
                    void exportHandler(exportFunction, {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    void exportHandler(exportFunction, {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dashboardTabularExportEnabled,
        openXlsxDialog,
        intl,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        settings?.["cellMergedByDefault"],
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
