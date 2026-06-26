// (C) 2026 GoodData Corporation

import { type ReactNode, useEffect, useRef } from "react";

import { type MessageDescriptor, defineMessages } from "react-intl";

import { objRefToString } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsInExportMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { type ParameterReconciliation } from "../../../model/store/tabs/parameters/parametersHelpers.js";
import { selectParameterReconciliations } from "../../../model/store/tabs/parameters/parametersSelectors.js";

const messages: Record<ParameterReconciliation, MessageDescriptor> = defineMessages({
    reset: { id: "parameter.toast.reset" },
    removed: { id: "parameter.toast.removed" },
    incompatible: { id: "parameter.toast.incompatible" },
});

// Longer than the 2500ms toast default: this warning is actionable and needs reading time.
const TOAST_DURATION_MS = 8000;

/**
 * Pushes one warning toast per parameter that no longer reconciles against the workspace catalog
 * (out of range, removed, or type-incompatible), the message chosen by reconciliation kind.
 *
 * Each ref is toasted at most once per session: {@link selectParameterReconciliations} returns a
 * fresh array whenever the set changes (catalog loads, a value is fixed), so a ref-key guard — not
 * the effect's array identity — is what prevents re-toasting the survivors on every recompute.
 *
 * @internal
 */
export function useParameterToastMessages(): void {
    const reconciliations = useDashboardSelector(selectParameterReconciliations);
    const isExportMode = useDashboardSelector(selectIsInExportMode);
    const { addWarning } = useToastMessage();
    const notifiedRefs = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (isExportMode) {
            return;
        }
        for (const entry of reconciliations) {
            const refKey = objRefToString(entry.ref);
            if (notifiedRefs.current.has(refKey)) {
                continue;
            }
            notifiedRefs.current.add(refKey);
            addWarning(messages[entry.kind], {
                values: { name: entry.name, b: bold },
                duration: TOAST_DURATION_MS,
            });
        }
    }, [reconciliations, addWarning, isExportMode]);
}

function bold(chunks: ReactNode) {
    return <strong>{chunks}</strong>;
}
