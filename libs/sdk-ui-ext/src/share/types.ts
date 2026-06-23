// (C) 2026 GoodData Corporation

import type { ObjRef } from "@gooddata/sdk-model";
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

/**
 * A label (attribute display form) of the shared attribute. The share dialog
 * scopes a grantee's access to a subset of these via per-label permission grants.
 *
 * @internal
 */
export interface IObjectShareLabel {
    /** Backend ref of the label, used as the `kind: "label"` permission target. */
    ref: ObjRef;
    /** Stable id (serialized ref) — the picker's item id and selection key. */
    id: string;
    /** Display title shown in the labels picker. */
    title: string;
    /**
     * The primary (key) label. It is always accessible and cannot be unchecked —
     * rendered locked in the picker. Sharing an attribute always includes it.
     */
    isPrimary: boolean;
    /**
     * The default display label — the one shown by default in visualizations.
     * At most one label is the default. Distinct from the primary (key) label.
     */
    isDefault: boolean;
}

/**
 * Aggregated, read-only access state for an object — what the inline access row
 * in a host UI needs to render the current sharing state without opening the
 * full share dialog.
 *
 * - `generalAccess` — `RESTRICTED` if only named grantees can access the object;
 *   `WORKSPACE` if the workspace-wide rule grant is present with non-empty permissions.
 * - `workspaceLevel` — the rule grant's permission level; `VIEW` by default,
 *   `SHARE` when the rule explicitly permits `SHARE`. EDIT is intentionally not
 *   surfaced (the UI caps at VIEW/SHARE).
 * - `granteeCount` — number of named grantees (users + groups). Excludes the
 *   workspace-wide rule grant itself.
 *
 * @internal
 */
export interface IObjectAccessSummary {
    generalAccess: GeneralAccessValue;
    workspaceLevel: "VIEW" | "SHARE";
    granteeCount: number;
}
