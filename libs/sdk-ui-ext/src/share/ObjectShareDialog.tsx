// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import {
    UiAddGranteeDialog,
    UiConfirmDialog,
    UiGranteeRowControls,
    UiObjectShareDialog,
    UiTag,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import { objectShareMessages } from "./messages.js";
import { granteeDisplayPair, userDisplayPair } from "./objectShareController.helpers.js";
import type { IObjectShareController, ObjectSharePermissionLevel } from "./objectShareController.types.js";
import type { IObjectShareLabel } from "./types.js";
import { useObjectShareController } from "./useObjectShareController.js";

// The workspace row has no labels menu (see workspaceControls below), so its
// required onLabelsChange never fires; a stable no-op satisfies the prop type
// without churning the controls' identity each render.
const noop = () => {};

/**
 * Props for {@link ObjectShareDialog}.
 *
 * @internal
 */
export interface IObjectShareDialogProps {
    /** The object whose access is being managed. */
    target: IObjectPermissionsObject | undefined;
    /** Object title rendered in the dialog header ('Share "\{title\}"'). */
    objectTitle: string;
    /** Whether the dialog is shown. Owned by the consumer. */
    isOpen: boolean;
    /** Called when the dialog requests to close (backdrop, close button, after share). */
    onClose: () => void;
    /** Fires after each successful access mutation — e.g. to refresh an inline access row. */
    onSaved?: () => void;
    /**
     * Labels (display forms) of the shared attribute, enabling the per-grantee
     * label-scope picker. Omit for objects without labels (e.g. facts). Ignored
     * when `controller` is supplied (pass `labels` to {@link useObjectShare} instead).
     */
    labels?: IObjectShareLabel[];
    /**
     * Whether the object's labels are still loading. While true the Add action is
     * disabled, so a grantee can't be added before its labels are known (a new
     * grantee defaults to all labels, which can't be written until they resolve).
     * Omit for objects without labels (e.g. facts).
     */
    labelsLoading?: boolean;
    /**
     * Whether loading the object's labels failed. While true every access-changing
     * control (Add, row controls, general access) is disabled: the label set is
     * unknown, so any access change would diff against an empty scope and silently
     * orphan real per-label grants. Omit for objects without labels (e.g. facts).
     * Ignored when `controller` is supplied (pass `labelsError` to
     * {@link useObjectShare} instead).
     */
    labelsError?: boolean;
    /**
     * Escape hatch: supply a controller from {@link useObjectShare} to share its
     * single access-list fetch with an inline summary row. When omitted, the
     * dialog manages its own controller from `target`/`onSaved`/`labels`.
     */
    controller?: IObjectShareController;
}

/**
 * Connected share dialog. Renders the main share modal, the add-grantee
 * sub-dialog and the general-access confirm dialog, all driven by one
 * controller. Each underlying dialog manages its own open state, so they can
 * be safely co-mounted; focus, backdrop and portal lifecycles are owned by
 * `UiModalDialog` inside the kit.
 *
 * Mount unconditionally and toggle via `isOpen`; the contents stay invisible
 * while closed. For the common case pass plain props and let the dialog own its
 * controller:
 *
 * ```tsx
 * <ObjectShareDialog target={ref} objectTitle={title} isOpen={open} onClose={close} />
 * ```
 *
 * @internal
 */
export function ObjectShareDialog({
    target,
    objectTitle,
    isOpen,
    onClose,
    onSaved,
    labels,
    labelsLoading,
    labelsError,
    controller,
}: IObjectShareDialogProps) {
    const intl = useIntl();
    // Own a controller unless the consumer injects one. The hook must run
    // unconditionally (rules of hooks), so when a controller is injected we pass
    // it an undefined target — it then no-ops and never duplicates the fetch the
    // injected controller already owns.
    const ownController = useObjectShareController(controller ? undefined : target, {
        onSaved,
        labels,
        labelsError,
        labelsLoading,
        isOpen,
    });
    const { state, actions } = controller ?? ownController;

    // Staged self-restriction — the level (or removal) the signed-in user picked
    // for their own sole grant, held until the "Restrict your access?" confirm.
    const [pendingSelfChange, setPendingSelfChange] = useState<
        { granteeId: string; level: ObjectSharePermissionLevel | "none" } | undefined
    >(undefined);

    // Drop the staged self-restriction whenever `isOpen` flips OR the target
    // changes — the detail view navigates between objects by toggling `isOpen`
    // alone (no onClose), but a consumer may also swap the target while open, and
    // the self row's id is target-independent: a stale confirm could otherwise
    // apply the restriction to the NEXT object. Render-time adjust, matching the
    // controller's own reset-on-target idiom.
    const [lastOpen, setLastOpen] = useState(isOpen);
    const [lastTargetKey, setLastTargetKey] = useState(state.targetKey);
    if (lastOpen !== isOpen || lastTargetKey !== state.targetKey) {
        setLastOpen(isOpen);
        setLastTargetKey(state.targetKey);
        setPendingSelfChange(undefined);
    }

    const handleClose = useCallback(() => {
        setPendingSelfChange(undefined);
        actions.reset();
        onClose();
    }, [actions, onClose]);

    const isAddGranteeOpen = isOpen && state.subview === "addGrantee";
    const isShareOpen = isOpen && state.subview === "main";
    const isConfirmOpen = isOpen && !!state.pendingGeneralAccess;

    // Don't allow mutations until the access list has loaded: before then the
    // controller reports empty grantees + RESTRICTED, which is a placeholder, not
    // the real state. Acting on it would write from a false assumption. Mutations
    // are also gated until per-label scope resolves (`labelsResolved`): a new
    // grantee defaults to all labels, and any access change before resolution
    // would diff against an assumed-full scope (skipping grants / revoking the
    // wrong labels). `labelsResolved` is false while labels are still loading and
    // when their fetch failed, so a pending/failed label set blocks every
    // access-changing control here — Add, row controls and general access alike.
    const isLoaded = state.status === "success";
    const isMutable = isLoaded && state.labelsResolved;
    const isAddDisabled = !isMutable;

    // Single-viewer empty states (design: the "restrict own access" board):
    // (a) the sole explicit grant is the signed-in user's own → their row hosts a
    //     merged menu managing their own access, with lowering gated by a confirm.
    const soleSelfGrantee = state.grantees.length === 1 && !!state.grantees[0].isSelf;
    // Until the profile resolves (or when it silently failed), a sole USER row
    // can't be told apart from the caller's own grant — mutating it then would
    // bypass the self-restriction confirm, so it stays disabled, not merely
    // unmerged. Group rows are never the caller's own, and multi-row lists are
    // unaffected: their rows aren't self-managed.
    const soleRowIdentityPending =
        state.grantees.length === 1 && state.grantees[0].kind === "user" && !state.selfIdentityResolved;
    // (b) the manage-gated list LOADED with no explicit grants at all → the caller
    //     can only have passed the backend's gate through administrator/manager
    //     rights, so render a synthesized self row with a static Admin tag. Keyed
    //     to the load-time fact (`seededWithoutGrants`), not the live list — a
    //     grant-holder who removes their own sole grant empties the list without
    //     having grant-independent access. A workspace-wide SHARE rule is the one
    //     other way through the gate — the viewer may then be any workspace
    //     member, so no badge (list stays empty).
    const workspaceShareCapable = state.generalAccess === "WORKSPACE" && state.workspaceLevel === "SHARE";
    const adminSelfIdentity =
        isLoaded && state.grantees.length === 0 && state.seededWithoutGrants && !workspaceShareCapable
            ? state.selfIdentity
            : undefined;
    const adminDisplay = adminSelfIdentity
        ? userDisplayPair(adminSelfIdentity, adminSelfIdentity.id)
        : undefined;

    // Map the controller's labels to the picker's item shape; the primary label
    // is rendered locked (always selected, can't be unchecked).
    const labelItems = state.labels.map((l) => ({
        id: l.id,
        label: l.title,
        kind: l.isPrimary ? ("primary" as const) : undefined,
        locked: l.isPrimary,
    }));

    return (
        <>
            <UiObjectShareDialog
                isOpen={isShareOpen}
                objectTitle={objectTitle}
                onClose={handleClose}
                grantees={
                    adminDisplay
                        ? [
                              {
                                  id: "self-admin",
                                  kind: "user" as const,
                                  name: intl.formatMessage(objectShareMessages.granteeYou, {
                                      name: adminDisplay.name,
                                  }),
                                  email: adminDisplay.email,
                                  controls: (
                                      <UiTooltip
                                          triggerBy={["hover", "focus"]}
                                          content={intl.formatMessage(objectShareMessages.adminTagTooltip)}
                                          anchor={
                                              <span tabIndex={0}>
                                                  <UiTag
                                                      label={intl.formatMessage(
                                                          objectShareMessages.adminTagLabel,
                                                      )}
                                                      size="small"
                                                      variant="solid"
                                                  />
                                              </span>
                                          }
                                      />
                                  ),
                              },
                          ]
                        : state.grantees.map((g) => {
                              const display = granteeDisplayPair(g);
                              const isManagedSelf = soleSelfGrantee && !!g.isSelf;
                              return {
                                  id: g.id,
                                  kind: g.kind,
                                  name: g.isSelf
                                      ? intl.formatMessage(objectShareMessages.granteeYou, {
                                            name: display.name,
                                        })
                                      : display.name,
                                  email: display.email,
                                  isPending: g.pending !== undefined,
                                  controls: (
                                      <UiGranteeRowControls
                                          labels={labelItems}
                                          selectedLabelIds={
                                              state.selectedLabelIdsByGrantee[g.id] ??
                                              state.labels.map((l) => l.id)
                                          }
                                          permissionLevel={g.level}
                                          effectivePermission={g.effectivePermission}
                                          mergedControls={isManagedSelf}
                                          // Above the user's own level there is no way back
                                          // (you can't raise yourself) — offered levels above
                                          // it render disabled with the shared warning.
                                          disabledLevels={
                                              isManagedSelf && g.level === "VIEW" ? ["SHARE"] : undefined
                                          }
                                          disabledTooltip={
                                              isManagedSelf
                                                  ? intl.formatMessage(
                                                        objectShareMessages.selfRestrictWarning,
                                                    )
                                                  : undefined
                                          }
                                          // Disable row controls while saving, until per-label
                                          // scope resolves (labels still loading, failed, or the
                                          // probe in flight) — removing or re-scoping before then
                                          // would diff against the "assume all"/empty placeholder
                                          // and silently orphan real per-label grants — and while
                                          // a sole row's self identity is still unknown.
                                          isDisabled={
                                              g.pending !== undefined ||
                                              !state.labelsResolved ||
                                              soleRowIdentityPending
                                          }
                                          onLabelsChange={(selectedIds) => {
                                              void actions.changeGranteeLabels(g.id, selectedIds);
                                          }}
                                          onPermissionChange={(level) => {
                                              if (isManagedSelf) {
                                                  if (level !== g.level) {
                                                      setPendingSelfChange({ granteeId: g.id, level });
                                                  }
                                                  return;
                                              }
                                              void actions.changePermissionLevel(g.id, level);
                                          }}
                                          onRemoveAccess={() => {
                                              if (isManagedSelf) {
                                                  setPendingSelfChange({ granteeId: g.id, level: "none" });
                                                  return;
                                              }
                                              void actions.removeGrantee(g.id);
                                          }}
                                      />
                                  ),
                              };
                          })
                }
                onAddClick={actions.openAddGrantee}
                isAddDisabled={isAddDisabled}
                generalAccess={state.generalAccess}
                onGeneralAccessChange={actions.requestGeneralAccessChange}
                // Inherited workspace access can't be revoked here — the kit disables
                // the Restricted option and explains why.
                workspaceAccessInherited={state.workspaceAccessInherited}
                // Permission dropdown on the "All workspace members" row — only while
                // workspace access is on (the rule must exist to be re-graded). No
                // labels (⋯) menu and no remove: per the Figma spec the workspace row
                // carries the permission picker alone; the workspace rule's label
                // scope is managed implicitly with the RESTRICTED↔WORKSPACE toggle.
                workspaceControls={
                    state.generalAccess === "WORKSPACE" ? (
                        <UiGranteeRowControls
                            labels={[]}
                            selectedLabelIds={[]}
                            permissionLevel={state.workspaceLevel}
                            // Also disabled while its own re-grade is committing, so
                            // rapid toggles can't queue overlapping writes — and when
                            // the level is locked (inherited-only access has no direct
                            // rule to re-grade; an inherited SHARE pins the level).
                            isDisabled={
                                !isMutable || state.workspaceLevelSaving || state.workspaceLevelLocked
                            }
                            onLabelsChange={noop}
                            onPermissionChange={(level) => {
                                void actions.changeWorkspaceLevel(level);
                            }}
                        />
                    ) : undefined
                }
                // Keep the "All workspace members" description in sync with the picked
                // level ("can view" vs "can view and share").
                workspaceLevel={state.workspaceLevel}
                // Gated on the same condition as Add: changing general access also
                // mirrors the label scope, so it must wait for resolution and stay
                // disabled when label metadata failed to load. Also gated while a
                // workspace-level re-grade is in flight: switching to Restricted then
                // would issue an allWorkspaceUsers:none write that could race the
                // pending re-grade and leave the backend on the wrong rule.
                isGeneralAccessDisabled={!isMutable || state.workspaceLevelSaving}
                // On a failed load the empty grantee list + RESTRICTED radio are a
                // placeholder, not the real policy — show why instead of letting it
                // read as "no one has access".
                error={
                    state.status === "error" ? intl.formatMessage(objectShareMessages.loadError) : undefined
                }
            />

            <UiAddGranteeDialog
                isOpen={isAddGranteeOpen}
                objectTitle={objectTitle}
                loadOptions={actions.loadOptions}
                selectedGrantees={state.pendingGrantees}
                onSelectedGranteesChange={actions.setPendingGrantees}
                onBack={actions.closeAddGrantee}
                onClose={handleClose}
                onCancel={actions.closeAddGrantee}
                onShare={() => {
                    void actions.confirmAddGrantees();
                }}
            />

            <UiConfirmDialog
                isOpen={isConfirmOpen}
                title={intl.formatMessage(
                    state.pendingGeneralAccess === "RESTRICTED"
                        ? objectShareMessages.confirmRestrictTitle
                        : objectShareMessages.confirmGrantWorkspaceTitle,
                )}
                description={intl.formatMessage(
                    state.pendingGeneralAccess === "RESTRICTED"
                        ? objectShareMessages.confirmRestrictDescription
                        : objectShareMessages.confirmGrantWorkspaceDescription,
                    { title: objectTitle },
                )}
                confirmLabel={intl.formatMessage(objectShareMessages.confirmButton)}
                confirmVariant="primary"
                onCancel={actions.cancelGeneralAccessChange}
                onClose={actions.cancelGeneralAccessChange}
                onConfirm={() => {
                    void actions.confirmGeneralAccessChange();
                }}
            />

            <UiConfirmDialog
                isOpen={Boolean(isOpen && pendingSelfChange)}
                title={intl.formatMessage(objectShareMessages.selfRestrictTitle)}
                description={intl.formatMessage(objectShareMessages.selfRestrictWarning)}
                confirmLabel={intl.formatMessage(objectShareMessages.confirmButton)}
                confirmVariant="primary"
                onCancel={() => setPendingSelfChange(undefined)}
                onClose={() => setPendingSelfChange(undefined)}
                onConfirm={() => {
                    if (!pendingSelfChange) {
                        return;
                    }
                    const { granteeId, level } = pendingSelfChange;
                    setPendingSelfChange(undefined);
                    if (level === "none") {
                        void actions.removeGrantee(granteeId);
                    } else {
                        void actions.changePermissionLevel(granteeId, level);
                    }
                }}
            />
        </>
    );
}
