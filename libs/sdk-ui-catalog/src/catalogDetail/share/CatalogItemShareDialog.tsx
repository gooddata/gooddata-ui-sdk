// (C) 2026 GoodData Corporation

import { Suspense, lazy } from "react";

import { useCatalogItemShareState } from "./CatalogItemShareProvider.js";

// Code-split the dialog (and the heavy kit dialog chrome it pulls from
// @gooddata/sdk-ui-ext) into its own chunk, loaded on first open rather than with
// the catalog bundle. The always-visible inline access row stays in the main chunk.
const CatalogItemShareDialogInner = lazy(() =>
    import("./CatalogItemShareDialogInner.js").then((m) => ({ default: m.CatalogItemShareDialogInner })),
);

/**
 * Lazy boundary for the catalog item's share dialog. Mounted only while the dialog
 * is open — one mount is one dialog session, and unmounting (close or navigation)
 * discards the session's transient state. Reopening remounts the component; the
 * chunk itself stays cached by the browser after the first open.
 *
 * @internal
 */
export function CatalogItemShareDialog() {
    const { active, isOpen } = useCatalogItemShareState();

    if (!active || !isOpen) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <CatalogItemShareDialogInner />
        </Suspense>
    );
}
