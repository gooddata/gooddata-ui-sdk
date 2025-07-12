// (C) 2021-2025 GoodData Corporation
import { useIntl } from "react-intl";
import { ExportDialog } from "@gooddata/sdk-ui-kit";
import { useExportDialogContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export function ExportDialogProvider() {
    const { closeDialog, dialogConfig, isOpen } = useExportDialogContext();
    const intl = useIntl();

    return isOpen ? (
        <ExportDialog
            headline={intl.formatMessage({ id: "dialogs.export.headline" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "dialogs.export.submit" })}
            filterContextText={intl.formatMessage({ id: "dialogs.export.includeFilters" })}
            filterContextTitle={intl.formatMessage({ id: "dialogs.export.filters" })}
            mergeHeadersText={intl.formatMessage({ id: "dialogs.export.mergeHeaders" })}
            mergeHeadersTitle={intl.formatMessage({ id: "dialogs.export.cells" })}
            onCancel={closeDialog}
            {...dialogConfig}
        />
    ) : null;
}
