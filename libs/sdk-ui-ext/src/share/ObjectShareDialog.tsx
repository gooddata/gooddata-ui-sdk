// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import {
    type IUiObjectShareDialogGrantee,
    UiAddGranteeDialog,
    UiConfirmDialog,
    UiGranteeRowControls,
    UiObjectShareDialog,
    UiTag,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import { objectShareMessages } from "./messages.js";
import { granteeDisplayPair } from "./objectShareController.helpers.js";
import type { IObjectShareGrantee } from "./objectShareController.types.js";
import type { IObjectAccessSummary, IObjectShareLabel } from "./types.js";
import { useObjectShareDialog } from "./useObjectShareDialog.js";

// The workspace row has no labels menu (see workspaceControls below), so its
// required onLabelsChange never fires; a stable no-op satisfies the prop type
// without churning the controls' identity each render.
const noop = () => {};

// Static Admin badge on the synthesized administrator self row — the tooltip
// explains the grant-independent access; the focusable span keeps it
// keyboard-reachable (UiTag itself is not interactive).
function AdminSelfTag() {
    const intl = useIntl();
    return (
        <UiTooltip
            triggerBy={["hover", "focus"]}
            content={intl.formatMessage(objectShareMessages.adminTagTooltip)}
            anchor={
                <span tabIndex={0}>
                    <UiTag
                        label={intl.formatMessage(objectShareMessages.adminTagLabel)}
                        size="small"
                        variant="solid"
                    />
                </span>
            }
        />
    );
}

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
    /**
     * Whether the dialog is shown. Owned by the consumer. While false nothing is
     * mounted — each open starts a fresh dialog session and closing discards it
     * (see the component doc).
     */
    isOpen: boolean;
    /** Called when the dialog requests to close (backdrop, close button, after share). */
    onClose: () => void;
    /**
     * Fires with the current access summary whenever the displayed access changes —
     * when the list loads, and after each summary-affecting mutation. Lets a consumer
     * keep an inline access row in sync without refetching.
     */
    onSummaryChange?: (summary: IObjectAccessSummary) => void;
    /**
     * Labels (display forms) of the shared attribute, enabling the per-grantee
     * label-scope picker. Omit for objects without labels (e.g. facts).
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
     */
    labelsError?: boolean;
}

/**
 * Connected share dialog. Renders the main share modal, the add-grantee
 * sub-dialog and the general-access confirm dialog, all driven by one
 * controller. Each underlying dialog manages its own open state, so they can
 * be safely co-mounted; focus, backdrop and portal lifecycles are owned by
 * `UiModalDialog` inside the kit.
 *
 * One open = one dialog session over one fixed `target`: the session (the
 * controller, its fetches, every transient — pending rows, staged confirms,
 * optimistic edits) exists only while `isOpen`, enforced here, so the component
 * may safely stay mounted across open/close cycles. Do not swap the target —
 * or the backend/workspace context — while open; close and reopen instead.
 *
 * @internal
 */
export function ObjectShareDialog(props: IObjectShareDialogProps) {
    if (!props.isOpen) {
        return null;
    }
    return <ObjectShareDialogSession {...props} />;
}

/** The dialog session — mounted only while open, so its state cannot outlive a close. */
function ObjectShareDialogSession({
    target,
    objectTitle,
    onClose,
    onSummaryChange,
    labels,
    labelsLoading,
    labelsError,
}: IObjectShareDialogProps) {
    const intl = useIntl();
    const {
        state,
        actions,
        isShareViewOpen,
        isAddGranteeOpen,
        isGeneralAccessConfirmOpen,
        isSelfRestrictConfirmOpen,
        isMutable,
        isLoading,
        workspaceDisabledLevels,
        rowDisabledLevels,
        onClose: closeDialog,
        onRowPermissionChange,
        onRowRemove,
        onSelfRestrictCancel,
        onSelfRestrictConfirm,
    } = useObjectShareDialog({
        target,
        onClose,
        onSummaryChange,
        labels,
        labelsLoading,
        labelsError,
    });

    // Primary label is locked — always selected, can't be unchecked.
    const labelItems = state.labels.map((l) => ({
        id: l.id,
        label: l.title,
        kind: l.isPrimary ? ("primary" as const) : undefined,
        locked: l.isPrimary,
    }));

    const toGranteeRow = (g: IObjectShareGrantee): IUiObjectShareDialogGrantee => {
        const display = granteeDisplayPair(g);
        // Levels come back only for the signed-in user's own sole grant (you can't
        // raise yourself); the confirm-vs-direct routing lives in the hook too.
        const disabledLevels = rowDisabledLevels(g);

        return {
            id: g.id,
            kind: g.kind,
            name: g.isSelf
                ? intl.formatMessage(objectShareMessages.granteeYou, { name: display.name })
                : display.name,
            email: display.email,
            isPending: g.pending !== undefined,
            controls: (
                <UiGranteeRowControls
                    labels={labelItems}
                    selectedLabelIds={state.selectedLabelIdsByGrantee[g.id] ?? state.labels.map((l) => l.id)}
                    permissionLevel={g.level}
                    effectivePermission={g.effectivePermission}
                    disabledLevels={disabledLevels}
                    disabledTooltip={
                        disabledLevels
                            ? intl.formatMessage(objectShareMessages.selfRestrictWarning)
                            : undefined
                    }
                    // Disabled while the row's own write is saving, while mutations are
                    // gated (unresolved label scope would orphan real per-label grants),
                    // and while a sole row's self identity is unknown.
                    isDisabled={g.pending !== undefined || !isMutable || state.granteeControlsLocked}
                    onLabelsChange={(selectedIds) => {
                        void actions.changeGranteeLabels(g.id, selectedIds);
                    }}
                    onPermissionChange={(level) => onRowPermissionChange(g, level)}
                    onRemoveAccess={() => onRowRemove(g)}
                />
            ),
        };
    };

    // Synthesized empty-state row: the controller reports it only while the list
    // holds no grantees (adding one replaces it, removing the last one restores
    // it — see `adminSelfRow`). The controller decides; this only renders it.
    const rows: IUiObjectShareDialogGrantee[] = [
        ...(state.adminSelfRow
            ? [
                  {
                      id: "self-admin",
                      kind: "user" as const,
                      name: intl.formatMessage(objectShareMessages.granteeYou, {
                          name: state.adminSelfRow.name,
                      }),
                      email: state.adminSelfRow.email,
                      controls: <AdminSelfTag />,
                  },
              ]
            : []),
        ...state.grantees.map(toGranteeRow),
    ];

    return (
        <>
            <UiObjectShareDialog
                isOpen={isShareViewOpen}
                objectTitle={objectTitle}
                onClose={closeDialog}
                grantees={rows}
                isLoading={isLoading}
                onAddClick={actions.openAddGrantee}
                isAddDisabled={!isMutable}
                generalAccess={state.generalAccess}
                onGeneralAccessChange={actions.requestGeneralAccessChange}
                // Inherited workspace access can't be revoked here.
                workspaceAccessInherited={state.workspaceInheritedLevel !== undefined}
                // Only while workspace access is on (the rule must exist to re-grade).
                // The workspace row has the permission picker alone — no labels/remove;
                // its label scope follows the RESTRICTED↔WORKSPACE toggle implicitly.
                workspaceControls={
                    state.generalAccess === "WORKSPACE" ? (
                        <UiGranteeRowControls
                            labels={[]}
                            selectedLabelIds={[]}
                            permissionLevel={state.workspaceLevel}
                            // Levels below an inherited workspace-wide level can't take
                            // effect (the inherited grant already exceeds them).
                            disabledLevels={workspaceDisabledLevels}
                            disabledTooltip={intl.formatMessage(objectShareMessages.workspaceLevelInherited)}
                            // Also disabled while its own re-grade is committing, so
                            // rapid toggles can't queue overlapping writes — and when
                            // the level is locked (inherited-only access has no direct
                            // rule to re-grade; an inherited EDIT pins the level).
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
                onClose={closeDialog}
                onCancel={actions.closeAddGrantee}
                onShare={() => {
                    void actions.confirmAddGrantees();
                }}
            />

            <UiConfirmDialog
                isOpen={isGeneralAccessConfirmOpen}
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
                isOpen={isSelfRestrictConfirmOpen}
                title={intl.formatMessage(objectShareMessages.selfRestrictTitle)}
                description={intl.formatMessage(objectShareMessages.selfRestrictWarning)}
                confirmLabel={intl.formatMessage(objectShareMessages.confirmButton)}
                confirmVariant="primary"
                onCancel={onSelfRestrictCancel}
                onClose={onSelfRestrictCancel}
                onConfirm={onSelfRestrictConfirm}
            />
        </>
    );
}
