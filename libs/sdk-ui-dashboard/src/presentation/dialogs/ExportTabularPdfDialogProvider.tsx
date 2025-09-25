// (C) 2021-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { ExportTabularPdfDialog } from "@gooddata/sdk-ui-kit";

import { useExportTabularPdfDialogContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export function ExportTabularPdfDialogProvider() {
    const { closeDialog, config, isOpen } = useExportTabularPdfDialogContext();
    const intl = useIntl();

    return isOpen ? (
        <ExportTabularPdfDialog
            {...config}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "dialogs.export.submit" })}
            onCancel={closeDialog}
        />
    ) : null;
}
