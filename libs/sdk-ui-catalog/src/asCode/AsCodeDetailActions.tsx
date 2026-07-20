// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { catalogDetailActionDelete, catalogDetailActionDuplicate } from "../automation/testIds.js";
import { CatalogDetailActionBar } from "../catalogDetail/CatalogDetailActionBar.js";
import { ShareButton } from "../catalogDetail/share/ShareButton.js";
import type { ICatalogDetailAction, OpenHandlerEvent } from "../catalogDetail/types.js";
import type { ICatalogItem, ICatalogItemRef } from "../catalogItem/types.js";

import { AsCodeCreateDialog } from "./AsCodeCreateDialog.js";
import { AsCodeDeleteDialog } from "./AsCodeDeleteDialog.js";
import { AsCodeEditDialog } from "./AsCodeEditDialog.js";
import type { IAsCodeDefinition, IAsCodeDescriptor } from "./descriptor.js";

const OPEN_ACTION_ID = "open";

// edit/delete freeze the item selected when the action started, so a later change to the live `item`
// prop can't retarget the operation. A duplicate seeds either from an existing item (loaded by the
// create dialog) or from the edit dialog's current unsaved edits.
type DialogState =
    | { kind: "edit"; item: ICatalogItem }
    | { kind: "delete"; item: ICatalogItem }
    | { kind: "duplicate"; duplicateOf?: ICatalogItem; duplicateSource?: IAsCodeDefinition };

/**
 * @internal
 */
export interface IAsCodeDetailActionsProps {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    /** When provided and the descriptor declares an `openAction` (e.g. "Open in metric editor"), that
     *  action opens the standalone editor through this handler; omitted, it is not offered. */
    onOpen?: (event: MouseEvent, openEvent: OpenHandlerEvent) => void;
    canShare?: boolean;
    onShare?: () => void;
    onCatalogItemCreate?: (item: ICatalogItem) => void;
    onCatalogItemUpdate?: (item: ICatalogItem) => void;
    onCatalogItemDelete?: (ref: ICatalogItemRef) => void;
}

/**
 * Detail-panel actions for an as-code object: inline edit, duplicate, and delete via the shared
 * dialogs, plus the Share button and the descriptor's open action if it declares one. Generic over the
 * entity type via its descriptor.
 * @internal
 */
export function AsCodeDetailActions({
    descriptor,
    item,
    onOpen,
    canShare,
    onShare,
    onCatalogItemCreate,
    onCatalogItemUpdate,
    onCatalogItemDelete,
}: IAsCodeDetailActionsProps) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();
    const [dialog, setDialog] = useState<DialogState | undefined>(undefined);

    const actions = useMemo<ICatalogDetailAction[]>(() => {
        const result: ICatalogDetailAction[] = [];
        // The open action reaches the standalone editor via onOpen, so it is offered only when the host
        // provides that handler and the descriptor declares one; the menu then never shows a dead item.
        if (onOpen && descriptor.openAction) {
            result.push({ id: OPEN_ACTION_ID, label: intl.formatMessage(descriptor.openAction) });
        }
        result.push(
            {
                id: "duplicate",
                label: intl.formatMessage(descriptor.messages.duplicate),
                dataTestId: catalogDetailActionDuplicate,
            },
            {
                id: "delete",
                label: intl.formatMessage(descriptor.messages.deleteSubmit),
                isDestructive: true,
                dataTestId: catalogDetailActionDelete,
            },
        );
        return result;
    }, [descriptor, intl, onOpen]);

    const closeDialog = useCallback(() => setDialog(undefined), []);

    const handleEditOpen = useCallback(() => setDialog({ kind: "edit", item }), [item]);

    const handleActionsMenuSelect = useCallback(
        (actionId: string, event: MouseEvent | KeyboardEvent) => {
            if (actionId === OPEN_ACTION_ID) {
                onOpen?.(event as MouseEvent, {
                    item,
                    workspaceId,
                    newTab: event.metaKey || event.ctrlKey,
                    preventDefault: event.preventDefault.bind(event),
                });
                return;
            }
            if (actionId === "delete") {
                setDialog({ kind: "delete", item });
                return;
            }
            if (actionId === "duplicate") {
                setDialog({ kind: "duplicate", duplicateOf: item });
            }
        },
        [item, onOpen, workspaceId],
    );

    const handleEditDuplicate = useCallback((source: IAsCodeDefinition) => {
        setDialog({ kind: "duplicate", duplicateSource: source });
    }, []);

    return (
        <>
            <CatalogDetailActionBar
                item={item}
                workspaceId={workspaceId}
                actions={actions}
                leadingActions={canShare && onShare ? <ShareButton onClick={onShare} /> : null}
                onEditClick={handleEditOpen}
                onActionsMenuSelect={handleActionsMenuSelect}
            />
            {dialog?.kind === "edit" ? (
                <AsCodeEditDialog
                    descriptor={descriptor}
                    item={dialog.item}
                    onClose={closeDialog}
                    onSaved={onCatalogItemUpdate}
                    onDuplicate={handleEditDuplicate}
                />
            ) : null}
            {dialog?.kind === "duplicate" ? (
                <AsCodeCreateDialog
                    descriptor={descriptor}
                    duplicateOf={dialog.duplicateOf}
                    duplicateSource={dialog.duplicateSource}
                    onClose={closeDialog}
                    onCreated={onCatalogItemCreate}
                />
            ) : null}
            {dialog?.kind === "delete" ? (
                <AsCodeDeleteDialog
                    descriptor={descriptor}
                    item={dialog.item}
                    onClose={closeDialog}
                    onDeleted={() => onCatalogItemDelete?.(dialog.item)}
                />
            ) : null}
        </>
    );
}
