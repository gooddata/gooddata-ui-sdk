// (C) 2007-2026 GoodData Corporation

import { memo, useCallback } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IExtendedExportConfig } from "@gooddata/sdk-ui";
import { ExportDialog as ExportDialogComponent, type IExportDialogData } from "@gooddata/sdk-ui-kit";

import { hideDialog } from "../actions/dialogs_actions.js";
import { exportResult } from "../actions/export_report_actions.js";
import { XLSX } from "../constants/export_types.js";
import { isActiveFiltersByDefault, isCellMergedByDefault } from "../selectors/feature_flag_selector.js";
import { VisualizationPropertiesSelectors } from "../selectors/visualization_properties_selector.js";
import { getReportTitle } from "../services/report_service.js";
import { getShowExportDialog } from "../store/dialogs/dialogs_selectors.js";
import { type AppDispatch } from "../store/types.js";

export const ExportDialog = memo(function ExportDialog() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const activeFiltersByDefault = useSelector(isActiveFiltersByDefault);
    const cellMergedByDefault = useSelector(isCellMergedByDefault);
    const currentReportTitle = useSelector(getReportTitle);
    const isExportDialogActive = useSelector(getShowExportDialog);
    const grandTotalsPosition = useSelector(VisualizationPropertiesSelectors.getGrandTotalsPosition);

    const onHideDialog = useCallback(() => {
        dispatch(hideDialog());
    }, [dispatch]);

    const exportToXLSX = useCallback(
        (data: IExportDialogData) => {
            const { mergeHeaders, includeFilterContext } = data;
            const title = currentReportTitle || intl.formatMessage({ id: "export.defaultTitle" });

            const exportConfig: IExtendedExportConfig = {
                format: XLSX,
                includeFilterContext,
                showFilters: includeFilterContext, // TODO why do we have both showFilters and includeFilterContext?
                mergeHeaders,
                title,
                ...(grandTotalsPosition ? { grandTotalsPosition } : {}),
            };

            dispatch(exportResult(exportConfig));
            onHideDialog();
        },
        [currentReportTitle, dispatch, intl, onHideDialog, grandTotalsPosition],
    );

    const renderExportDialog = useCallback(() => {
        return (
            <ExportDialogComponent
                key="ExportDialog"
                headline={intl.formatMessage({ id: "dialogs.export.headline" })}
                cancelButtonText={intl.formatMessage({ id: "dialogs.export.cancel" })}
                submitButtonText={intl.formatMessage({ id: "dialogs.export.submit" })}
                filterContextText={intl.formatMessage({
                    id: "dialogs.export.includeFilters",
                })}
                filterContextTitle={intl.formatMessage({
                    id: "dialogs.export.filters",
                })}
                filterContextVisible={false}
                includeFilterContext={activeFiltersByDefault}
                mergeHeaders={cellMergedByDefault}
                mergeHeadersText={intl.formatMessage({ id: "dialogs.export.mergeHeaders" })}
                mergeHeadersTitle={intl.formatMessage({ id: "dialogs.export.cells" })}
                onCancel={onHideDialog}
                onSubmit={exportToXLSX}
            />
        );
    }, [intl, activeFiltersByDefault, cellMergedByDefault, onHideDialog, exportToXLSX]);

    if (isExportDialogActive) {
        return renderExportDialog();
    }
    return null;
});
