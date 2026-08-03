// (C) 2026 GoodData Corporation

import { ObjectShareDialog } from "@gooddata/sdk-ui-ext";

import { useCatalogItemShareActions, useCatalogItemShareState } from "./CatalogItemShareProvider.js";

/**
 * The connected share dialog, split into its own module so it (and the heavy kit
 * dialog chrome it pulls from `@gooddata/sdk-ui-ext`) is code-split out of the main
 * catalog chunk and loaded only when the dialog is first opened. Mounted per dialog
 * session (see {@link CatalogItemShareDialog}); it reports summary changes back to
 * the provider so the inline access row stays in sync without a refetch.
 *
 * @internal
 */
export function CatalogItemShareDialogInner() {
    const { target, objectTitle, labels } = useCatalogItemShareState();
    const { close, onSummaryChange } = useCatalogItemShareActions();

    return (
        <ObjectShareDialog
            target={target}
            objectTitle={objectTitle}
            isOpen
            onClose={close}
            labels={labels.labels}
            labelsError={labels.error}
            labelsLoading={labels.loading}
            onSummaryChange={onSummaryChange}
        />
    );
}
