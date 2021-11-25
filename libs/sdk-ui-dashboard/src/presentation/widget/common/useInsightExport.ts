// (C) 2021 GoodData Corporation
import { useCallback, useState } from "react";
import invariant from "ts-invariant";
import { IExtendedExportConfig, VisualizationTypes } from "@gooddata/sdk-ui";
import { IInsightDefinition, insightVisualizationUrl, ObjRef } from "@gooddata/sdk-model";
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
} from "../../../model";
import { useExportHandler } from "./useExportHandler";
import { useExportDialogContext } from "../../dashboardContexts";

function canInsightBeExported(insight: IInsightDefinition) {
    const insightVisUrl = insightVisualizationUrl(insight);

    // currently Headline and its derivatives have the export disabled globally
    const exportDisabledVisualizations = [VisualizationTypes.HEADLINE, VisualizationTypes.XIRR];
    return !exportDisabledVisualizations.some((disabled) => insightVisUrl.includes(disabled));
}

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
            ).then((result) => result.payload.resultUri),
        [widgetRef],
    );

    const isInsightExportable = canInsightBeExported(insight);
    const isExportableToCsv = useDashboardSelector(selectIsExecutionResultExportableToCsvByRef(widgetRef));
    const isExportableToXlsx = useDashboardSelector(selectIsExecutionResultExportableToXlsxByRef(widgetRef));

    const settings = useDashboardSelector(selectSettings);

    const exportHandler = useExportHandler();
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

    return {
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
    };
};
