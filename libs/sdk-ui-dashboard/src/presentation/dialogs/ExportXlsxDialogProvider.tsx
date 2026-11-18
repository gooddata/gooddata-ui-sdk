// (C) 2021-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { ExportDialog, UiReturnFocusOnUnmount } from "@gooddata/sdk-ui-kit";

import { useExportXlsxDialogContext } from "../dashboardContexts/ExportXlsxDialogContext.js";

/**
 * @internal
 */
export function ExportXlsxDialogProvider() {
    const { closeDialog, dialogConfig, isOpen, returnFocusTo } = useExportXlsxDialogContext();
    const intl = useIntl();

    return isOpen ? (
        <UiReturnFocusOnUnmount returnFocusTo={returnFocusTo}>
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
        </UiReturnFocusOnUnmount>
    ) : null;
}
