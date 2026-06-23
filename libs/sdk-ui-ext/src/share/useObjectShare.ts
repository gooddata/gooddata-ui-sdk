// (C) 2026 GoodData Corporation

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";

import type { IObjectShareController } from "./objectShareController.types.js";
import type { IObjectShareLabel } from "./types.js";
import { useObjectShareController } from "./useObjectShareController.js";

/**
 * Options for {@link useObjectShare}.
 *
 * @internal
 */
export interface IUseObjectShareOptions {
    /**
     * Fires after each successful access mutation (add grantee, change level,
     * remove, general access toggle). Use it to keep UI outside the dialog in
     * sync with edits made inside it (e.g. refresh an inline access row).
     */
    onSaved?: () => void;
    /**
     * Labels (display forms) of the shared attribute, enabling the per-grantee
     * label-scope picker. Omit for objects without labels (e.g. facts).
     */
    labels?: IObjectShareLabel[];
    /**
     * Whether loading the object's labels failed. While true the controller stays
     * label-unresolved so every access-changing control is disabled: with the
     * label set unknown, reconciling access would diff against an empty set and
     * silently orphan any real per-label grants. Distinct from an object that
     * genuinely has no labels (omit `labels`), where editing is safe.
     */
    labelsError?: boolean;
    /**
     * Whether the object's labels are still loading. While true the controller stays
     * label-unresolved (same gating as `labelsError`): the labels aren't passed yet,
     * so an empty list must not be mistaken for a label-free object — otherwise row
     * controls would reconcile against an empty set and orphan real per-label grants.
     */
    labelsLoading?: boolean;
}

/**
 * Connected controller hook backing {@link ObjectShareDialog}. Most consumers
 * do not need this — render `ObjectShareDialog` with plain props and it owns
 * its controller. Use this hook directly only to share a single access-list
 * fetch between the dialog and an inline summary row: call it once, read
 * `state.summary` for the row, and pass the controller into the dialog.
 *
 * The hook eagerly fetches the access list on mount so `state.summary` is
 * usable while the dialog is closed.
 *
 * @internal
 */
export function useObjectShare(
    target: IObjectPermissionsObject | undefined,
    options?: IUseObjectShareOptions,
): IObjectShareController {
    return useObjectShareController(
        target,
        options?.onSaved,
        options?.labels,
        options?.labelsError,
        options?.labelsLoading,
    );
}
