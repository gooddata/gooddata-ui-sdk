// (C) 2026 GoodData Corporation

import type { AccessGranularPermission, ObjRef } from "@gooddata/sdk-model";
import type { GeneralAccessValue, IUiGranteeAsyncOptions, IUiPickedGrantee } from "@gooddata/sdk-ui-kit";

import type { IObjectAccessSummary, IObjectShareLabel } from "./types.js";

/**
 * Permission level surfaced in the share dialog — the model's granular access
 * permission (VIEW / EDIT / SHARE). `EDIT` is display-only: the dialog reflects
 * an EDIT grant as a read-only "Can edit" row but cannot assign or change it
 * (granting EDIT is not part of the share UI), so only VIEW and SHARE are
 * selectable in the permission menu.
 *
 * @internal
 */
export type ObjectSharePermissionLevel = AccessGranularPermission;

/**
 * Known identity facts of a grantee: real name/email only, never an id fallback.
 * Undefined fields are unknown and may be backfilled.
 *
 * @internal
 */
export interface IGranteeIdentityFacts {
    /** Real full name (users) / group name, when known. */
    name?: string;
    /** Real email, when known (users only). */
    email?: string;
}

/**
 * Signed-in user's identity: real facts plus the stable `id` (profile login)
 * used as the display fallback, mirroring grantee rows.
 *
 * @internal
 */
export interface ISelfIdentity extends IGranteeIdentityFacts {
    id: string;
}

/**
 * Dialog row derived from a backend grant. `name`/`email` are real facts only;
 * display fallbacks are `granteeDisplayPair`'s concern.
 *
 * @internal
 */
export interface IObjectShareGrantee extends IGranteeIdentityFacts {
    /** Stable id used as the dialog row's React key. `user:<ref>` / `group:<ref>`. */
    id: string;
    kind: "user" | "group";
    granteeRef: ObjRef;
    /**
     * Whether this row is the signed-in user's own grant. Derived from the
     * profile, so it holds for rows of any origin (fetched or optimistic).
     */
    isSelf?: boolean;
    level: ObjectSharePermissionLevel;
    /**
     * Effective permission when it is *higher* than the directly-granted `level`
     * because the grantee inherits a stronger permission (e.g. via a group).
     * Undefined when the direct grant already is the effective permission. Drives
     * the row's "effective permission" warning badge.
     */
    effectivePermission?: ObjectSharePermissionLevel;
    /**
     * Whether the grantee inherits SHARE (e.g. via a group), regardless of the
     * current direct `level`. Retained from the fetch so `effectivePermission` can
     * be recomputed locally when the direct level changes (no refetch).
     */
    inheritsShare?: boolean;
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
    /**
     * Whether object-level permissions are unavailable to the current user — the
     * manage-gated access-list endpoint returned 404, the backend's signal that
     * the caller cannot manage this object's sharing. Distinct from a transient
     * load error (5xx / network), which may still resolve: consumers use this to
     * hide the share UI entirely rather than to retry.
     */
    accessUnavailable: boolean;
    summary: IObjectAccessSummary | undefined;

    /**
     * Stable serialized key of the current target's ref, or undefined when none.
     * Consumers key target-scoped transient UI (e.g. a staged confirmation) on it,
     * so nothing staged for one object can be applied to another.
     */
    targetKey: string | undefined;
    /**
     * Signed-in user's identity, once the profile resolves. Feeds their
     * synthesized row when they can manage the object without holding any
     * grant (administrator access) and the grantee list is empty.
     */
    selfIdentity: ISelfIdentity | undefined;
    /**
     * Whether the profile request resolved successfully. Until then — or after a
     * silently-swallowed failure — `isSelf` on the rows is only its unresolved
     * default, so a sole grantee row cannot be told apart from the caller's own
     * grant and must not be offered destructive controls.
     */
    selfIdentityResolved: boolean;
    /**
     * Whether the manage-gated access list was LOADED with zero explicit grants —
     * the caller reached it without holding a grant of their own. A load-time
     * fact (never recomputed from the live list): removing your own sole grant
     * empties the list but does not make this true.
     */
    seededWithoutGrants: boolean;
    grantees: IObjectShareGrantee[];
    generalAccess: GeneralAccessValue;
    /**
     * Permission level of the all-workspace-members rule when general access is
     * WORKSPACE. Drives the workspace row's permission dropdown. Meaningless (and
     * not shown) while general access is RESTRICTED. Capped at VIEW/SHARE — EDIT is
     * never offered for the workspace rule.
     */
    workspaceLevel: "VIEW" | "SHARE";
    /**
     * Whether workspace-wide access is (at least partly) inherited from a parent
     * workspace. Inherited rule access grants every user of this workspace access
     * too, yet cannot be revoked from here — consumers disable the Restricted
     * option and explain why. `generalAccess` and `workspaceLevel` are effective
     * values that already account for it.
     */
    workspaceAccessInherited: boolean;
    /**
     * Whether the workspace-rule level dropdown must be read-only: this workspace
     * holds no rule of its own to re-grade (access is inherited-only), or an
     * inherited SHARE pins the effective level regardless of the direct grant.
     */
    workspaceLevelLocked: boolean;
    /**
     * Whether a workspace-level re-grade is in flight. Consumers disable the
     * workspace permission dropdown while true so rapid toggles can't issue
     * overlapping writes that settle out of order.
     */
    workspaceLevelSaving: boolean;

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
     * `{ groups, users }` shape. Excludes already-granted grantees.
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
    /**
     * Change the all-workspace-members rule's permission level (VIEW/SHARE).
     * Only meaningful while general access is WORKSPACE. Auto-saves, no confirm —
     * unlike the high-impact RESTRICTED↔WORKSPACE toggle, this only re-grades an
     * already-granted rule.
     */
    changeWorkspaceLevel: (level: "VIEW" | "SHARE") => Promise<void>;
}

/**
 * @internal
 */
export interface IObjectShareController {
    state: IObjectShareControllerState;
    actions: IObjectShareControllerActions;
}

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
    /** Whether the share dialog is open; a summary-only consumer leaves it false. */
    isOpen?: boolean;
}
