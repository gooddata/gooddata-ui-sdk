// (C) 2026 GoodData Corporation

import type { AccessGranularPermission, ObjRef } from "@gooddata/sdk-model";
import type {
    GeneralAccessValue,
    IUiGranteeAsyncOption,
    IUiGranteeAsyncOptions,
    IUiPickedGrantee,
} from "@gooddata/sdk-ui-kit";

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
    subview: "main" | "addGrantee" | "transferOwnership";
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

    /**
     * The user picked as the new owner in the transfer-ownership subview, or
     * undefined before one is chosen. Only users can own an object, so this is
     * never a group.
     */
    transferTarget: IUiGranteeAsyncOption | undefined;
    /**
     * Whether "Also remove my access" is checked in the transfer dialog. When
     * true the current user's grant is removed after the transfer; otherwise it
     * is downgraded to VIEW.
     */
    transferAlsoRemoveSelf: boolean;
    /**
     * Whether `transferTarget` already owns the object (already holds EDIT). When
     * true there is nothing to transfer — consumers show the "already an owner"
     * variant offering to remove the current user's own access instead.
     */
    transferTargetIsOwner: boolean;
    /** Whether the transfer write (or self-removal) is in flight. */
    transferSaving: boolean;
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
     * Loader for the grantee pickers. Wraps `getAvailableAssignees` with
     * client-side search + already-picked filtering, returning the picker's
     * `{ groups, users }` shape. By default excludes already-granted grantees
     * (add-grantee picker); pass `includeGranted` to keep them (transfer-ownership
     * picker, which may promote an existing viewer to owner).
     */
    loadOptions: (search: string, includeGranted?: boolean) => Promise<IUiGranteeAsyncOptions>;
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

    /** Open the transfer-ownership subview with an empty picker. */
    openTransferOwnership: () => void;
    /** Close the transfer-ownership subview and clear its buffers; returns to main. */
    closeTransferOwnership: () => void;
    /**
     * Pick (or replace) the candidate new owner. Recomputes whether that user
     * already owns the object (`transferTargetIsOwner`).
     */
    setTransferTarget: (owner: IUiGranteeAsyncOption) => void;
    /** Toggle "Also remove my access" in the transfer dialog. */
    setTransferAlsoRemoveSelf: (next: boolean) => void;
    /**
     * Commit the ownership transfer: grant the picked user EDIT and downgrade the
     * current user to VIEW (or remove them if "Also remove my access" is set), in
     * one write. When the picked user already owns the object this transfers
     * nothing and only applies the self-access choice. Auto-saves.
     */
    confirmTransferOwnership: () => Promise<void>;
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
}
