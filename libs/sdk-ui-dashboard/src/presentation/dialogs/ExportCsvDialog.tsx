// (C) 2026 GoodData Corporation

import { memo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import {
    getCsvDelimiterState,
    getCsvDelimiterValidationError,
    getCsvDelimiterValue,
} from "@gooddata/sdk-model";
import { ConfirmDialogBase, CsvDelimiterPicker, Overlay } from "@gooddata/sdk-ui-kit";

import { type IExportCsvDialogData } from "../dashboardContexts/ExportCsvDialogContext.js";

const alignPoints = [{ align: "cc cc" as const }];

const messages = defineMessages({
    headline: { id: "dialogs.export.csv.headline", defaultMessage: "Export settings (.csv)" },
    cancel: { id: "cancel" },
    submit: { id: "dialogs.export.submit" },
    delimiterLabel: { id: "dialogs.export.csv.delimiter", defaultMessage: "CSV delimiter" },
});

export interface IExportCsvDialogProps {
    initialDelimiter?: string;
    onCancel: () => void;
    onSubmit: (data: IExportCsvDialogData) => void;
}

export const ExportCsvDialog = memo(function ExportCsvDialog({
    initialDelimiter,
    onCancel,
    onSubmit,
}: IExportCsvDialogProps) {
    const intl = useIntl();
    const [value, setValue] = useState(() => getCsvDelimiterState(initialDelimiter));

    const validationError =
        value.selectedPreset === "custom" ? getCsvDelimiterValidationError(value.customDelimiter) : undefined;
    const isSubmitDisabled =
        value.selectedPreset === "custom" ? !value.customDelimiter || Boolean(validationError) : false;
    const selectedDelimiter = getCsvDelimiterValue(value.selectedPreset, value.customDelimiter);

    const handleSubmit = () => {
        onSubmit({ delimiter: selectedDelimiter });
    };

    return (
        <Overlay alignPoints={alignPoints} isModal positionType="fixed">
            <ConfirmDialogBase
                className="gd-csv-export-dialog s-gd-csv-export-dialog"
                displayCloseButton
                isPositive
                isSubmitDisabled={isSubmitDisabled}
                headline={intl.formatMessage(messages.headline)}
                cancelButtonText={intl.formatMessage(messages.cancel)}
                submitButtonText={intl.formatMessage(messages.submit)}
                onCancel={onCancel}
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
        </Overlay>
    );
});
