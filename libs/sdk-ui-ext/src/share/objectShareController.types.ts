// (C) 2026 GoodData Corporation

import type { AccessGranularPermission, ObjRef } from "@gooddata/sdk-model";
import type { GoodDataSdkError } from "@gooddata/sdk-ui";
import type { GeneralAccessValue, IUiGranteeAsyncOptions, IUiPickedGrantee } from "@gooddata/sdk-ui-kit";

import type { IObjectAccessSummary, IObjectShareLabel } from "./types.js";

/**
 * Permission level surfaced in the share dialog — the model's granular access
 * permission (VIEW / SHARE / EDIT), assignable from the permission menu.
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
     * Strongest permission the grantee inherits (e.g. via a group), regardless of
     * the current direct `level`. Retained from the fetch so `effectivePermission`
     * can be recomputed locally when the direct level changes (no refetch).
     */
    inheritedLevel?: ObjectSharePermissionLevel;
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
    error?: GoodDataSdkError;
    summary: IObjectAccessSummary | undefined;
    grantees: IObjectShareGrantee[];
    /**
     * Id of the grantee row whose permission menu manages the signed-in user's
     * OWN access — set only when the sole explicit grant is the caller's own
     * (the "restrict own access" design). Consumers gate lowering behind a
     * confirm and disable the levels above the row's own.
     */
    selfManagedGranteeId: string | undefined;
    /**
     * Levels the self-managed row's permission menu must disable — those above the
     * caller's own current level (you can't raise yourself). Set exactly when
     * `selfManagedGranteeId` is; every other row is unconstrained here (the backend
     * is the authority on what may be granted).
     */
    selfManagedDisabledLevels: ObjectSharePermissionLevel[] | undefined;
    /**
     * Levels the workspace-rule permission menu must disable — those below an
     * inherited workspace grant, which can't be lowered from this workspace.
     * Undefined when no level is inherited.
     */
    workspaceDisabledLevels: ObjectSharePermissionLevel[] | undefined;
    /**
     * Whether grantee-row controls must stay disabled because a sole USER row
     * cannot be told apart from the caller's own grant yet (profile pending or
     * silently failed) — mutating it then would bypass the self-restriction
     * confirm. Group rows and multi-row lists never set this.
     */
    granteeControlsLocked: boolean;
    /**
     * Display pair for the synthesized administrator self row, or undefined when
     * no such row applies. Set while the DISPLAYED list is empty for a caller whose
     * list loaded without a grant of their own and no workspace-wide share-capable
     * rule explains the access — they can only have passed the backend's gate
     * through administrator/manager rights. Adding a grantee hides the row;
     * removing the last one brings it back. (Derived from the immutable seed:
     * removing your own grant empties the list but never synthesizes this row.)
     */
    adminSelfRow: { name: string; email?: string } | undefined;
    generalAccess: GeneralAccessValue;
    /**
     * Permission level of the all-workspace-members rule when general access is
     * WORKSPACE. Drives the workspace row's permission dropdown. Meaningless (and
     * not shown) while general access is RESTRICTED.
     */
    workspaceLevel: ObjectSharePermissionLevel;
    /**
     * Strongest workspace-wide level inherited from parent workspaces, or
     * undefined when none. Inherited access grants every user of this workspace
     * access too, yet cannot be revoked or lowered from here — consumers disable
     * the Restricted option and the workspace-rule levels below this.
     * `generalAccess` and `workspaceLevel` already account for it.
     */
    workspaceInheritedLevel: ObjectSharePermissionLevel | undefined;
    /**
     * Whether the workspace-rule level dropdown must be read-only: this workspace
     * holds no rule of its own to re-grade (access is inherited-only), or an
     * inherited EDIT pins the effective level regardless of the direct grant.
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
     * True until the session's FIRST label-scope resolution settles. Unlike
     * {@link labelsResolved} it never turns back on (a mid-session re-probe only
     * re-disables controls), and a resolution that settles with failures counts
     * too — so loading placeholders keyed on it can't stick forever or flash
     * back mid-session.
     */
    labelsInitializing: boolean;
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
     * Change the all-workspace-members rule's permission level. Only meaningful
     * while general access is WORKSPACE. Auto-saves, no confirm — unlike the
     * high-impact RESTRICTED↔WORKSPACE toggle, this only re-grades an
     * already-granted rule.
     */
    changeWorkspaceLevel: (level: ObjectSharePermissionLevel) => Promise<void>;
}

/**
 * @internal
 */
export interface IObjectShareController {
    state: IObjectShareControllerState;
    actions: IObjectShareControllerActions;
}

/**
 * Options for {@link useObjectShareController}.
 *
 * @internal
 */
export interface IUseObjectShareOptions {
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
     * Whether the object's labels are still loading. Same gating as `labelsError`:
     * the labels aren't passed yet, so an empty list must not read as label-free.
     */
    labelsLoading?: boolean;
}
