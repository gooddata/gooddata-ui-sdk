// (C) 2026 GoodData Corporation

import { ObjectShareDialog } from "@gooddata/sdk-ui-ext";

import { useCatalogItemShareActions, useCatalogItemShareState } from "./CatalogItemShareProvider.js";

/**
 * The connected share dialog, split into its own module so it (and the heavy kit
 * dialog chrome it pulls from `@gooddata/sdk-ui-ext`) is code-split out of the main
 * catalog chunk and loaded only when the dialog is first opened. Reads the shared
 * controller from context so it and the inline access row use one access-list fetch.
 *
 * @internal
 */
export function CatalogItemShareDialogInner() {
    const { controller, target, objectTitle, isOpen, labelsLoading } = useCatalogItemShareState();
    const { close } = useCatalogItemShareActions();

    if (!controller) {
        return null;
    }

    return (
        <ObjectShareDialog
            target={target}
            objectTitle={objectTitle}
            isOpen={isOpen}
            onClose={close}
            labelsLoading={labelsLoading}
            controller={controller}
        />
    );
}
