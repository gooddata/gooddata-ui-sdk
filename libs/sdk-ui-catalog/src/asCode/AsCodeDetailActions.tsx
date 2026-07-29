// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { catalogDetailActionDelete, catalogDetailActionDuplicate } from "../automation/testIds.js";
import { CatalogDetailActionBar } from "../catalogDetail/CatalogDetailActionBar.js";
import { toOpenHandlerEvent } from "../catalogDetail/openHandlerEvent.js";
import { ShareButton } from "../catalogDetail/share/ShareButton.js";
import type { ICatalogDetailAction, OpenHandlerEvent } from "../catalogDetail/types.js";
import type { ICatalogItem, ICatalogItemRef } from "../catalogItem/types.js";

import { AsCodeCreateDialog } from "./AsCodeCreateDialog.js";
import { AsCodeDeleteDialog } from "./AsCodeDeleteDialog.js";
import { AsCodeEditDialog } from "./AsCodeEditDialog.js";
import type { IAsCodeDescriptor } from "./descriptor.js";

const OPEN_ACTION_ID = "open";

// Freezes the item selected when the action started, so a later `item` prop change can't retarget it.
type DialogState =
    | { kind: "edit"; item: ICatalogItem }
    | { kind: "delete"; item: ICatalogItem }
    | { kind: "duplicate"; duplicateOf?: ICatalogItem; duplicateSource?: unknown };

/** @internal */
export interface IAsCodeDetailActionsProps {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    onOpen?: (event: MouseEvent, openEvent: OpenHandlerEvent) => void;
    canShare?: boolean;
    onShare?: () => void;
    onCatalogItemCreate?: (item: ICatalogItem) => void;
    onCatalogItemUpdate?: (item: ICatalogItem) => void;
    onCatalogItemDelete?: (ref: ICatalogItemRef) => void;
}

/** @internal */
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
    // When false, edit and duplicate are withheld (both need the codec); delete, share, and open remain.
    const canEditAsCode = descriptor.useIsItemEditable?.(item) ?? true;
    const [dialog, setDialog] = useState<DialogState | undefined>(undefined);

    const actionGroups = useMemo<ICatalogDetailAction[][]>(() => {
        const mainGroup: ICatalogDetailAction[] = [];
        if (onOpen && descriptor.openAction) {
            mainGroup.push({ id: OPEN_ACTION_ID, label: intl.formatMessage(descriptor.openAction) });
        }
        if (canEditAsCode) {
            mainGroup.push({
                id: "duplicate",
                label: intl.formatMessage(descriptor.messages.duplicate),
                dataTestId: catalogDetailActionDuplicate,
            });
        }
        // Drop an empty main group so the menu opens without a stray leading divider.
        return [
            mainGroup,
            [
                {
                    id: "delete",
                    label: intl.formatMessage(descriptor.messages.deleteSubmit),
                    isDestructive: true,
                    dataTestId: catalogDetailActionDelete,
                },
            ],
        ].filter((group) => group.length > 0);
    }, [canEditAsCode, descriptor, intl, onOpen]);

    const closeDialog = useCallback(() => setDialog(undefined), []);

    const handleEditOpen = useCallback(() => setDialog({ kind: "edit", item }), [item]);

    const handleActionsMenuSelect = useCallback(
        (actionId: string, event: MouseEvent | KeyboardEvent) => {
            if (actionId === OPEN_ACTION_ID) {
                onOpen?.(event as MouseEvent, toOpenHandlerEvent(event as MouseEvent, item, workspaceId));
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

    const handleEditDuplicate = useCallback((source: unknown) => {
        setDialog({ kind: "duplicate", duplicateSource: source });
    }, []);

    return (
        <>
            <CatalogDetailActionBar
                item={item}
                workspaceId={workspaceId}
                actionGroups={actionGroups}
                leadingActions={canShare && onShare ? <ShareButton onClick={onShare} /> : null}
                onEditClick={canEditAsCode ? handleEditOpen : undefined}
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
