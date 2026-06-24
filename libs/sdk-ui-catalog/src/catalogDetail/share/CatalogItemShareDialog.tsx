// (C) 2026 GoodData Corporation

import { Suspense, lazy, useState } from "react";

import { useCatalogItemShareState } from "./CatalogItemShareProvider.js";

// Code-split the dialog (and the heavy kit dialog chrome it pulls from
// @gooddata/sdk-ui-ext) into its own chunk, loaded on first open rather than with
// the catalog bundle. The always-visible inline access row stays in the main chunk.
const CatalogItemShareDialogInner = lazy(() =>
    import("./CatalogItemShareDialogInner.js").then((m) => ({ default: m.CatalogItemShareDialogInner })),
);

/**
 * Lazy boundary for the catalog item's share dialog. Renders nothing until the
 * dialog is first opened; from then on it stays mounted (so close/reopen is
 * instant) and the dialog's own `isOpen` drives visibility. No-ops when sharing
 * is unavailable.
 *
 * @internal
 */
export function CatalogItemShareDialog() {
    const { active, isOpen } = useCatalogItemShareState();
    // Latch: once opened, keep the lazy dialog mounted so reopening doesn't reload
    // the chunk or lose the dialog's transient state.
    const [everOpened, setEverOpened] = useState(false);
    if (isOpen && !everOpened) {
        setEverOpened(true);
    }

    if (!active || !everOpened) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <CatalogItemShareDialogInner />
        </Suspense>
    );
}
