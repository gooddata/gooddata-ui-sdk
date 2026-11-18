// (C) 2021-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { ExportTabularPdfDialog, UiReturnFocusOnUnmount } from "@gooddata/sdk-ui-kit";

import { useExportTabularPdfDialogContext } from "../dashboardContexts/ExportTabularPdfDialogContext.js";

/**
 * @internal
 */
export function ExportTabularPdfDialogProvider() {
    const { closeDialog, config, isOpen, returnFocusTo } = useExportTabularPdfDialogContext();
    const intl = useIntl();

    return isOpen ? (
        <UiReturnFocusOnUnmount returnFocusTo={returnFocusTo}>
            <ExportTabularPdfDialog
                {...config}
                cancelButtonText={intl.formatMessage({ id: "cancel" })}
                submitButtonText={intl.formatMessage({ id: "dialogs.export.submit" })}
                onCancel={closeDialog}
            />
        </UiReturnFocusOnUnmount>
    ) : null;
}
