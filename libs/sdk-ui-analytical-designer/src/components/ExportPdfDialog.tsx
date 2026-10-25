// (C) 2025-2026 GoodData Corporation

import { memo, useCallback } from "react";

import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import { type IExtendedExportConfig } from "@gooddata/sdk-ui";
import { ExportTabularPdfDialog, type IExportTabularPdfDialogData } from "@gooddata/sdk-ui-kit";

import { hideDialog } from "../actions/dialogs_actions.js";
import { exportResult } from "../actions/export_report_actions.js";
import { PDF } from "../constants/export_types.js";
import { getFormatLocale } from "../selectors/bootstrap_selector.js";
import { exportPdfDialogSelector } from "../selectors/dialogs_selector.js";
import { VisualizationPropertiesSelectors } from "../selectors/visualization_properties_selector.js";
import { getReportTitle } from "../services/report_service.js";
import { useAppSelector } from "../store/hooks.js";
import { type AppDispatch } from "../store/types.js";

function getDefaultPageSize(formatLocale?: string) {
    const normalizedLocale = formatLocale?.replace("_", "-");
    const region = normalizedLocale?.split("-")[1]?.toUpperCase();

    return region === "US" || region === "CA" ? "LETTER" : "A4";
}

export const ExportPdfDialog = memo(function ExportPdfDialog() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const currentReportTitle = useAppSelector(getReportTitle);
    const isExportPdfDialogActive = useAppSelector((state) => exportPdfDialogSelector(state).isOpen);
    const formatLocale = useAppSelector(getFormatLocale);
    const grandTotalsPosition = useAppSelector(VisualizationPropertiesSelectors.getGrandTotalsPosition);

    const closeDialog = useCallback(() => {
        dispatch(hideDialog());
    }, [dispatch]);

    const exportToPDF = useCallback(
        (data: IExportTabularPdfDialogData) => {
            const { pageSize, pageOrientation } = data;
            const title = currentReportTitle || intl.formatMessage({ id: "export.defaultTitle" });

            const exportConfig: IExtendedExportConfig = {
                format: PDF,
                title,
                pdfConfiguration: {
                    pageSize,
                    pageOrientation,
                },
                ...(grandTotalsPosition ? { grandTotalsPosition } : {}),
            };

            dispatch(exportResult(exportConfig));
            dispatch(hideDialog());
        },
        [currentReportTitle, dispatch, intl, grandTotalsPosition],
    );

    const defaultPageSize = getDefaultPageSize(formatLocale);

    const renderExportPdfDialog = useCallback(() => {
        return (
            <ExportTabularPdfDialog
                key="ExportPdfDialog"
                showInfoPage={false}
                isShowInfoPageVisible={false}
                cancelButtonText={intl.formatMessage({ id: "cancel" })}
                submitButtonText={intl.formatMessage({ id: "dialogs.export.submit" })}
                pageSize={defaultPageSize}
                pageOrientation="PORTRAIT"
                onCancel={closeDialog}
                onSubmit={exportToPDF}
            />
        );
    }, [intl, closeDialog, exportToPDF, defaultPageSize]);

    if (isExportPdfDialogActive) {
        return renderExportPdfDialog();
    }
    return null;
});
