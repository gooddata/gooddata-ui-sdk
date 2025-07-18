// (C) 2020-2025 GoodData Corporation
import { useCallback, useState } from "react";
import { GoodDataSdkError, ILoadingState } from "@gooddata/sdk-ui";

import { useRichTextExportData, useVisualizationExportData } from "../../export/index.js";

import { IDashboardRichTextProps } from "./types.js";
import { ViewModeDashboardRichText } from "./ViewModeDashboardRichText.js";

export function ExportModeDashboardRichText(props: IDashboardRichTextProps) {
    const { onLoadingChanged, onError, exportData } = props;

    const [isVisualizationInitializing, setIsVisualizationInitializing] = useState(true);
    const [error, setError] = useState<GoodDataSdkError | undefined>(undefined);

    const exportDataText = useVisualizationExportData(exportData, isVisualizationInitializing, !!error);
    const exportRichText = useRichTextExportData();

    const onLoadingChangedHandler = useCallback(
        (loading: ILoadingState) => {
            setIsVisualizationInitializing(loading.isLoading);
            onLoadingChanged?.(loading);
        },
        [onLoadingChanged],
    );
    const onErrorHandler = useCallback(
        (error: GoodDataSdkError) => {
            setIsVisualizationInitializing(false);
            setError(error);
            onError?.(error);
        },
        [onError],
    );

    return (
        <div {...exportDataText} className="gd-rich-text-widget-export-container">
            <ViewModeDashboardRichText
                {...props}
                richTextExportData={exportRichText}
                onLoadingChanged={onLoadingChangedHandler}
                onError={onErrorHandler}
            />
        </div>
    );
}
