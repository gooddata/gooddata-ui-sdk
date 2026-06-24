// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import {
    UiAddGranteeDialog,
    UiConfirmDialog,
    UiGranteeRowControls,
    UiObjectShareDialog,
} from "@gooddata/sdk-ui-kit";

import { objectShareMessages } from "./messages.js";
import type { IObjectShareController } from "./objectShareController.types.js";
import type { IObjectShareLabel } from "./types.js";
import { useObjectShareController } from "./useObjectShareController.js";

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
    });
    const { state, actions } = controller ?? ownController;

    const handleClose = useCallback(() => {
        actions.reset();
        onClose();
    }, [actions, onClose]);

    const isAddGranteeOpen = isOpen && state.subview === "addGrantee";
    const isShareOpen = isOpen && state.subview !== "addGrantee";
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
                grantees={state.grantees.map((g) => ({
                    id: g.id,
                    kind: g.kind,
                    name: g.name,
                    email: g.email,
                    isPending: g.pending !== undefined,
                    controls: (
                        <UiGranteeRowControls
                            labels={labelItems}
                            selectedLabelIds={
                                state.selectedLabelIdsByGrantee[g.id] ?? state.labels.map((l) => l.id)
                            }
                            permissionLevel={g.level}
                            effectivePermission={g.effectivePermission}
                            // Disable row controls while saving, and until per-label
                            // scope resolves (labels still loading, failed, or the
                            // probe in flight) — removing or re-scoping before then
                            // would diff against the "assume all"/empty placeholder
                            // and silently orphan real per-label grants.
                            isDisabled={g.pending !== undefined || !state.labelsResolved}
                            onLabelsChange={(selectedIds) => {
                                void actions.changeGranteeLabels(g.id, selectedIds);
                            }}
                            onPermissionChange={(level) => {
                                void actions.changePermissionLevel(g.id, level);
                            }}
                            onRemoveAccess={() => {
                                void actions.removeGrantee(g.id);
                            }}
                        />
                    ),
                }))}
                onAddClick={actions.openAddGrantee}
                isAddDisabled={isAddDisabled}
                generalAccess={state.generalAccess}
                onGeneralAccessChange={actions.requestGeneralAccessChange}
                // Gated on the same condition as Add: changing general access also
                // mirrors the label scope, so it must wait for resolution and stay
                // disabled when label metadata failed to load.
                isGeneralAccessDisabled={!isMutable}
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
        </>
    );
}
