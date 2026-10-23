// (C) 2026 GoodData Corporation

import { useCallback, useRef } from "react";

import { defineMessages } from "react-intl";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";
import { type IObjectShareDraft, useApplyObjectPermissions } from "@gooddata/sdk-ui-ext";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

// `defineMessages` rather than an inline `{ id }`: the locale checker only reads the former.
const messages = defineMessages({
    shareFailed: { id: "metricComponent.editMetric.shareFailed" },
});

/** Posts a drafted access for a metric that now exists, reporting a refusal. Never rejects. */
export function useWriteMetricAccess(): (
    saved: IMeasureMetadataObject,
    draft: IObjectShareDraft,
) => Promise<void> {
    const applyPermissions = useApplyObjectPermissions();
    const { addError } = useToastMessage();

    return useCallback(
        async (saved: IMeasureMetadataObject, draft: IObjectShareDraft) => {
            // The metric's own ref, never one rebuilt from `id` — the form splits its prefix out.
            const ok = await applyPermissions({ kind: "measure", ref: saved.ref }, draft);
            if (!ok) {
                addError(messages.shareFailed);
            }
        },
        [applyPermissions, addError],
    );
}

/**
 * The editor's own save path. The draft is read when the write happens, not when this hook
 * ran — a save can fire from a handler built before the user's last change.
 */
export function useApplyMetricAccess(
    draftAccess: IObjectShareDraft | undefined,
    onApplied: () => void,
): (saved: IMeasureMetadataObject) => Promise<void> {
    const writeAccess = useWriteMetricAccess();

    const latest = useRef(draftAccess);
    latest.current = draftAccess;

    return useCallback(
        async (saved: IMeasureMetadataObject) => {
            const draft = latest.current;
            if (!draft) {
                return;
            }
            // Dropped whatever the outcome, so the next save cannot send it again.
            onApplied();
            await writeAccess(saved, draft);
        },
        [writeAccess, onApplied],
    );
}
