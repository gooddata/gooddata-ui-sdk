// (C) 2021 GoodData Corporation
import { useCallback } from "react";
import invariant from "ts-invariant";
import { GoodDataSdkError, IExportFunction, IExtendedExportConfig } from "@gooddata/sdk-ui";
import { selectPermissions, selectSettings, useDashboardSelector } from "../../../model";
import { useExportHandler } from "./useExportHandler";
import { useExportDialogContext } from "../../dashboardContexts";
import { isExportableError } from "./errorUtils";

export const useInsightExport = (config: {
    title: string;
    error: GoodDataSdkError | undefined;
    isLoading: boolean;
    exportFunction: IExportFunction | undefined;
}) => {
    const { error, exportFunction, isLoading, title } = config;

    const settings = useDashboardSelector(selectSettings);
    const permissions = useDashboardSelector(selectPermissions);

    const exportHandler = useExportHandler();
    const { openDialog, closeDialog } = useExportDialogContext();

    const isExportEnabled = settings.enableKPIDashboardExport && permissions.canExportReport;
    const isRawExportEnabled = isExportEnabled && permissions.canExecuteRaw;

    const onExportCSV = useCallback(() => {
        const exportConfig: IExtendedExportConfig = {
            format: "csv",
            title,
        };
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportFunction);
        exportHandler(exportFunction, exportConfig);
    }, [exportFunction, title]);

    const onExportXLSX = useCallback(() => {
        openDialog({
            onSubmit: ({ includeFilterContext, mergeHeaders }) => {
                // if this bombs there is an issue with the logic enabling the buttons
                invariant(exportFunction);
                closeDialog();
                exportHandler(exportFunction, {
                    format: "xlsx",
                    mergeHeaders,
                    showFilters: includeFilterContext,
                    title,
                });
            },
            includeFilterContext: Boolean(settings?.activeFiltersByDefault ?? true),
            mergeHeaders: Boolean(settings?.cellMergedByDefault ?? true),
            filterContextVisible: Boolean(settings?.enableActiveFilterContext ?? true),
        });
    }, [settings, title, exportFunction, closeDialog]);

    const exportCSVEnabled = Boolean(
        (!error || isExportableError(error)) && !isLoading && isRawExportEnabled,
    );
    const exportXLSXEnabled = Boolean((!error || isExportableError(error)) && !isLoading && isExportEnabled);

    return {
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
    };
};
