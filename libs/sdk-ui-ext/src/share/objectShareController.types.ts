// (C) 2026 GoodData Corporation

import type { ObjRef } from "@gooddata/sdk-model";
import type { GeneralAccessValue, IUiGranteeAsyncOptions, IUiPickedGrantee } from "@gooddata/sdk-ui-kit";

import type { IObjectAccessSummary, IObjectShareLabel } from "./types.js";

/**
 * Permission level surfaced in the share dialog. `EDIT` is intentionally
 * not represented — the underlying permission menu caps at VIEW/SHARE.
 *
 * @internal
 */
export type ObjectSharePermissionLevel = "VIEW" | "SHARE";

/**
 * Dialog row derived from a backend grant.
 *
 * @internal
 */
export interface IObjectShareGrantee {
    /** Stable id used as the dialog row's React key. `user:<ref>` / `group:<ref>`. */
    id: string;
    kind: "user" | "group";
    granteeRef: ObjRef;
    name: string;
    email?: string;
    level: ObjectSharePermissionLevel;
    /**
     * Effective permission when it is *higher* than the directly-granted `level`
     * because the grantee inherits a stronger permission (e.g. via a group).
     * Undefined when the direct grant already is the effective permission. Drives
     * the row's "effective permission" warning badge.
     */
    effectivePermission?: ObjectSharePermissionLevel;
    /**
     * Row-level in-flight state for optimistic updates: `"saving"` while a level
     * change or freshly-added grant is being committed, `"removing"` while a
     * removal is in flight. Undefined when the row reflects committed state.
     */
    pending?: "saving" | "removing";
}

/**
 * @internal
 */
export interface IObjectShareControllerState {
    subview: "main" | "addGrantee";
    status: "idle" | "loading" | "success" | "error" | "saving";
    error?: Error;
    summary: IObjectAccessSummary | undefined;

    grantees: IObjectShareGrantee[];
    generalAccess: GeneralAccessValue;

    /**
     * Labels (display forms) of the shared attribute, in source order. Empty for
     * objects without labels (e.g. facts) — the labels picker is then hidden.
     */
    labels: IObjectShareLabel[];
    /**
     * Whether per-label scope resolution has finished. While false, a grantee's
     * label scope is not yet known: consumers must not treat a missing
     * `selectedLabelIdsByGrantee` entry as "all selected" for editing, and should
     * keep the Add action disabled.
     */
    labelsResolved: boolean;
    /**
     * Per-grantee label scope: grantee id → the label ids that grantee can access.
     * The primary label is always included. Empty entry means "all labels" has not
     * yet been resolved; consumers should treat a missing entry as all-selected.
     */
    selectedLabelIdsByGrantee: Record<string, string[]>;

    /** Pending confirm — when set, the confirm dialog is visible. */
    pendingGeneralAccess?: GeneralAccessValue;
    /** Grantees staged in the add-grantee dialog before confirmation. */
    pendingGrantees: IUiPickedGrantee[];
}

/**
 * @internal
 */
export interface IObjectShareControllerActions {
    /** Reset transient dialog state (subview + pending buffers). Call on dialog close. */
    reset: () => void;

    openAddGrantee: () => void;
    closeAddGrantee: () => void;
    setPendingGrantees: (next: IUiPickedGrantee[]) => void;
    /**
     * Loader for the add-grantee picker. Wraps `getAvailableAssignees` with
     * client-side search + already-picked filtering, returning the picker's
     * `{ groups, users }` shape.
     */
    loadOptions: (search: string) => Promise<IUiGranteeAsyncOptions>;
    /** Commit all pending grantees to the backend. */
    confirmAddGrantees: () => Promise<void>;

    /** Change the permission level for a single grantee. Auto-saves. */
    changePermissionLevel: (granteeId: string, level: ObjectSharePermissionLevel) => Promise<void>;
    /** Remove a grantee. Auto-saves. */
    removeGrantee: (granteeId: string) => Promise<void>;
    /**
     * Scope a grantee's access to the given label ids (the primary label is always
     * kept). Sends a per-label VIEW/none grant for each label that changed. Auto-saves.
     */
    changeGranteeLabels: (granteeId: string, selectedLabelIds: string[]) => Promise<void>;

    /** Stage a general access change; opens the confirm dialog. */
    requestGeneralAccessChange: (next: GeneralAccessValue) => void;
    cancelGeneralAccessChange: () => void;
    /** Commit the pending general access change. Auto-saves. */
    confirmGeneralAccessChange: () => Promise<void>;
}

/**
 * @internal
 */
export interface IObjectShareController {
    state: IObjectShareControllerState;
    actions: IObjectShareControllerActions;
}
