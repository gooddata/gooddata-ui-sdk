// (C) 2021-2025 GoodData Corporation
import { useCallback, useState } from "react";
import { invariant } from "ts-invariant";
import { IExtendedExportConfig } from "@gooddata/sdk-ui";
import { IInsightDefinition, ObjRef } from "@gooddata/sdk-model";
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
    exportRawInsightWidget,
    ExportRawInsightWidget,
} from "../../../model/index.js";
import { useExportHandler } from "./useExportHandler.js";
import { useExportDialogContext } from "../../dashboardContexts/index.js";
import { useRawExportHandler } from "./useRawExportHandler.js";

export const useInsightExport = (config: {
    title: string;
    widgetRef: ObjRef;
    insight: IInsightDefinition;
}) => {
    const { title, widgetRef, insight } = config;
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
        () =>
            dispatchAndWaitFor<ExportRawInsightWidget, DashboardInsightWidgetExportResolved>(
                dispatch,
                exportRawInsightWidget(widgetRef, insight, uuid()),
            ).then((result) => result.payload.result),
        [],
    );

    const isInsightExportable = getInsightVisualizationMeta(insight).supportsExport;
    const isExportableToCsv = useDashboardSelector(selectIsExecutionResultExportableToCsvByRef(widgetRef));
    const isExportableToXlsx = useDashboardSelector(selectIsExecutionResultExportableToXlsxByRef(widgetRef));

    const settings = useDashboardSelector(selectSettings);

    const exportHandler = useExportHandler();
    const exportRawHandler = useRawExportHandler();
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
    }, [exportFunction, title]);

    const onExportRawCSV = useCallback(() => {
        setIsExporting(true);
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportRawFunction);
        exportRawHandler(exportRawFunction, title).then(() => setIsExporting(false));
    }, [exportRawFunction, title]);

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

    const isExportRawInNewUiVisible = settings.enableRawExportsInNewUI === true;

    return {
        exportCSVEnabled,
        exportXLSXEnabled,
        isExportRawInNewUiVisible,
        onExportCSV,
        onExportRawCSV,
        onExportXLSX,
    };
};
