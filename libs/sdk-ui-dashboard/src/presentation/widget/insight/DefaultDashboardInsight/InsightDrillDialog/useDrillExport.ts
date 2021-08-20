// (C) 2021 GoodData Corporation
import { useCallback, useMemo, useState } from "react";
import invariant from "ts-invariant";
import { IExportDialogData } from "@gooddata/sdk-ui-kit";
import {
    GoodDataSdkError,
    IExportFunction,
    IExtendedExportConfig,
    isBadRequest,
    isDataTooLargeToCompute,
    isNoDataSdkError,
    isProtectedReport,
    isUnknownSdkError,
} from "@gooddata/sdk-ui";
import { isEmptyAfm } from "@gooddata/sdk-ui-ext/dist/internal";
import { selectPermissions, selectSettings, useDashboardSelector } from "../../../../../model";

const nonExportableErrorGuards: Array<(item: unknown) => boolean> = [
    isUnknownSdkError,
    isBadRequest,
    isNoDataSdkError,
    isProtectedReport,
    isDataTooLargeToCompute,
    isEmptyAfm,
];

const isExportable = (error: GoodDataSdkError | undefined) => {
    if (!error) {
        return true;
    }

    return !nonExportableErrorGuards.some((guard) => guard(error));
};

export const useDrillExport = (
    title: string,
    error: GoodDataSdkError | undefined,
    isLoading: boolean,
    onExport: (exportFunction: IExportFunction, exportConfig: IExtendedExportConfig) => void,
) => {
    const [exportFunction, setExportFunction] = useState<IExportFunction | undefined>();
    const [isExportDialogVisible, setIsExportDialogVisible] = useState(false);

    const settings = useDashboardSelector(selectSettings);
    const permissions = useDashboardSelector(selectPermissions);

    const isExportEnabled = settings.enableKPIDashboardExport && permissions.canExportReport;
    const isRawExportEnabled = isExportEnabled && permissions.canExecuteRaw;

    const onExportDialogSubmit = useCallback(
        (data: IExportDialogData) => {
            const { mergeHeaders, includeFilterContext } = data;

            const exportConfig: IExtendedExportConfig = {
                format: "xlsx",
                includeFilterContext,
                mergeHeaders,
                title,
            };

            setIsExportDialogVisible(false);
            // if this bombs there is an issue with the logic enabling the buttons
            invariant(exportFunction);
            onExport(exportFunction, exportConfig);
        },
        [exportFunction, title],
    );

    const onExportReady = useCallback((exportFunction: IExportFunction) => {
        setExportFunction(() => exportFunction);
    }, []);

    const onExportCSV = useCallback(() => {
        const exportConfig: IExtendedExportConfig = {
            format: "csv",
            title,
        };
        // if this bombs there is an issue with the logic enabling the buttons
        invariant(exportFunction);
        onExport(exportFunction, exportConfig);
    }, [exportFunction, title]);

    const onExportXLSX = useCallback(() => {
        setIsExportDialogVisible(true);
    }, []);

    const onExportDialogCancel = useCallback(() => {
        setIsExportDialogVisible(false);
    }, []);

    const exportCSVEnabled = useMemo(
        () => Boolean(isExportable(error) && !isLoading && isRawExportEnabled),
        [error, isLoading, isRawExportEnabled],
    );

    const exportXLSXEnabled = useMemo(
        () => Boolean(isExportable(error) && !isLoading && isExportEnabled),
        [error, isLoading, isExportEnabled],
    );

    return {
        exportFunction,
        onExportReady,
        isExportDialogVisible,
        onExportDialogSubmit,
        onExportDialogCancel,
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
    };
};
