// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import {
    getCsvDelimiterState,
    getCsvDelimiterValidationError,
    getCsvDelimiterValue,
} from "@gooddata/sdk-model";
import { ValidationContextStore, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";
import { ConfirmDialogBase, CsvDelimiterPicker, Overlay } from "@gooddata/sdk-ui-kit";

import { hideDialog } from "../actions/dialogs_actions.js";
import { exportRaw, exportResult } from "../actions/export_report_actions.js";
import { CSV } from "../constants/export_types.js";
import { exportCsvDialogSelector } from "../selectors/dialogs_selector.js";
import { VisualizationPropertiesSelectors } from "../selectors/visualization_properties_selector.js";
import { getReportTitle } from "../services/report_service.js";
import { type AppDispatch, type IAppState } from "../store/types.js";

const alignPoints = [{ align: "cc cc" as const }];

const messages = defineMessages({
    defaultTitle: { id: "export.defaultTitle" },
    headline: { id: "dialogs.export.csv.headline", defaultMessage: "Export settings (.csv)" },
    cancel: { id: "dialogs.export.cancel" },
    submit: { id: "dialogs.export.submit" },
    delimiterLabel: { id: "dialogs.export.csv.delimiter", defaultMessage: "CSV delimiter" },
    submitDisabledTooltip: { id: "dialogs.export.csv.submit.disabledTooltip" },
});

export function ExportCsvDialog() {
    const isExportCsvDialogActive = useSelector((state: IAppState) => exportCsvDialogSelector(state).isOpen);

    if (!isExportCsvDialogActive) {
        return null;
    }

    return <ExportCsvDialogContent />;
}

function ExportCsvDialogContent() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const currentReportTitle = useSelector(getReportTitle);
    const grandTotalsPosition = useSelector(VisualizationPropertiesSelectors.getGrandTotalsPosition);
    const mode = useSelector((state: IAppState) => exportCsvDialogSelector(state).mode);

    const [value, setValue] = useState(() => getCsvDelimiterState());
    const validationContextValue = useValidationContextValue(createInvalidNode());

    const validationError =
        value.selectedPreset === "custom" ? getCsvDelimiterValidationError(value.customDelimiter) : undefined;
    const isSubmitDisabled =
        value.selectedPreset === "custom" ? !value.customDelimiter || Boolean(validationError) : false;
    const selectedDelimiter = getCsvDelimiterValue(value.selectedPreset, value.customDelimiter);

    const handleHideDialog = useCallback(() => {
        dispatch(hideDialog());
    }, [dispatch]);

    const handleSubmit = () => {
        const title = currentReportTitle || intl.formatMessage(messages.defaultTitle);

        if (mode === "formatted") {
            dispatch(
                exportResult({
                    format: CSV,
                    title,
                    delimiter: selectedDelimiter,
                    ...(grandTotalsPosition ? { grandTotalsPosition } : {}),
                }),
            );
        } else {
            dispatch(exportRaw(title, { delimiter: selectedDelimiter }));
        }

        handleHideDialog();
    };

    return (
        <Overlay alignPoints={alignPoints} isModal positionType="fixed">
            <ValidationContextStore value={validationContextValue}>
                <ConfirmDialogBase
                    className="gd-csv-export-dialog s-gd-csv-export-dialog"
                    displayCloseButton
                    isPositive
                    isSubmitDisabled={isSubmitDisabled}
                    submitButtonTooltipText={
                        isSubmitDisabled ? intl.formatMessage(messages.submitDisabledTooltip) : undefined
                    }
                    headline={intl.formatMessage(messages.headline)}
                    cancelButtonText={intl.formatMessage(messages.cancel)}
                    submitButtonText={intl.formatMessage(messages.submit)}
                    onCancel={handleHideDialog}
                    onSubmit={handleSubmit}
                    autofocusOnOpen
                >
                    <div className="gd-csv-export-dialog-item">
                        <CsvDelimiterPicker
                            value={value}
                            onChange={setValue}
                            validationError={validationError}
                            label={intl.formatMessage(messages.delimiterLabel)}
                            onEnterKeyPress={isSubmitDisabled ? undefined : handleSubmit}
                        />
                    </div>
                </ConfirmDialogBase>
            </ValidationContextStore>
        </Overlay>
    );
}
