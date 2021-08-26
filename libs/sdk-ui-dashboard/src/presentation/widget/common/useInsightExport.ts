// (C) 2021 GoodData Corporation
import { useCallback, useState } from "react";
import invariant from "ts-invariant";
import { GoodDataSdkError, IExportFunction, IExtendedExportConfig } from "@gooddata/sdk-ui";
import { selectPermissions, selectSettings, useDashboardSelector } from "../../../model";
import { useExportHandler } from "./useExportHandler";
import { useExportDialogContext } from "../../dashboardContexts";
import { isNonExportableError } from "./errorUtils";

export const useInsightExport = (config: {
    title: string;
    error: GoodDataSdkError | undefined;
    isLoading: boolean;
    exportFunction: IExportFunction | undefined;
}) => {
    const { error, exportFunction, isLoading, title } = config;
    const [isExporting, setIsExporting] = useState(false);

    const settings = useDashboardSelector(selectSettings);
    const permissions = useDashboardSelector(selectPermissions);

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
                    title,
                }).then(() => setIsExporting(false));
            },
            includeFilterContext: Boolean(settings?.activeFiltersByDefault ?? true),
            mergeHeaders: Boolean(settings?.cellMergedByDefault ?? true),
            filterContextVisible: Boolean(settings?.enableActiveFilterContext ?? true),
        });
    }, [settings, title, exportFunction, closeDialog]);

    const isExportEnabled = Boolean(settings.enableKPIDashboardExport && permissions.canExportReport);
    const isRawExportEnabled = Boolean(isExportEnabled && permissions.canExecuteRaw);

    const isExportAllowed = !isExporting && !isNonExportableError(error) && !isLoading;

    const exportCSVEnabled = isExportAllowed && isRawExportEnabled;
    const exportXLSXEnabled = isExportAllowed && isExportEnabled;

    return {
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
    };
};
