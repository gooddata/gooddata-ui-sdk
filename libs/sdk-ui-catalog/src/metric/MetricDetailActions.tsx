// (C) 2026 GoodData Corporation

import {
    type KeyboardEvent,
    type MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { catalogDetailActionDelete, catalogDetailActionDuplicate } from "../automation/testIds.js";
import { CatalogDetailActionBar } from "../catalogDetail/CatalogDetailActionBar.js";
import { ShareButton } from "../catalogDetail/share/ShareButton.js";
import type { ICatalogDetailAction, OpenHandlerEvent } from "../catalogDetail/types.js";
import type { ICatalogItemMeasure, ICatalogItemRef } from "../catalogItem/types.js";

import { MetricCreateDialog } from "./MetricCreateDialog.js";
import { MetricDeleteDialog } from "./MetricDeleteDialog.js";
import { MetricEditDialog } from "./MetricEditDialog.js";
import { useMetricMutation } from "./MetricMutationContext.js";

const messages = defineMessages({
    openInEditor: { id: "analyticsCatalog.metric.actions.openInEditor" },
    duplicate: { id: "analyticsCatalog.metric.dialog.edit.duplicate" },
    delete: { id: "analyticsCatalog.metric.dialog.delete.submit" },
    loadError: { id: "analyticsCatalog.metric.load.error" },
});

// edit/delete freeze the item selected when the action started, so a later change to the live
// `item` prop (routing/refetch while the dialog is open) can't retarget the operation.
type DialogState =
    | { kind: "edit"; item: ICatalogItemMeasure }
    | { kind: "delete"; item: ICatalogItemMeasure }
    | { kind: "duplicate"; sourceDefinition?: IMeasureMetadataObjectDefinition; isLoading: boolean };

/**
 * @internal
 */
export interface IMetricDetailActionsProps {
    item: ICatalogItemMeasure;
    /** When provided, adds an "Open in metric editor" menu action that opens the standalone editor. */
    onOpen?: (event: MouseEvent, openEvent: OpenHandlerEvent) => void;
    canShare?: boolean;
    onShare?: () => void;
    onCatalogItemCreate?: (item: ICatalogItemMeasure) => void;
    onCatalogItemUpdate?: (item: ICatalogItemMeasure) => void;
    onCatalogItemDelete?: (ref: ICatalogItemRef) => void;
}

/**
 * Detail-panel actions for a metric: inline edit, duplicate, and delete via the as-code editor,
 * alongside the shared Share button and "Open in metric editor" action.
 * @internal
 */
export function MetricDetailActions({
    item,
    onOpen,
    canShare,
    onShare,
    onCatalogItemCreate,
    onCatalogItemUpdate,
    onCatalogItemDelete,
}: IMetricDetailActionsProps) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();
    const { addError } = useToastMessage();
    const mutation = useMetricMutation();
    const [dialog, setDialog] = useState<DialogState | undefined>(undefined);
    const isMounted = useRef(true);
    useEffect(() => {
        // Reset on (re)mount: StrictMode runs mount -> cleanup -> remount, and without this the ref
        // would stay false after the remount even though the component is mounted.
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const actions = useMemo<ICatalogDetailAction[]>(() => {
        const result: ICatalogDetailAction[] = [];
        // The standalone metric editor stays reachable alongside the inline Edit; omitted when the
        // host does not provide an open handler, so the menu never shows a dead item.
        if (onOpen) {
            result.push({ id: "open", label: intl.formatMessage(messages.openInEditor) });
        }
        result.push(
            {
                id: "duplicate",
                label: intl.formatMessage(messages.duplicate),
                dataTestId: catalogDetailActionDuplicate,
            },
            {
                id: "delete",
                label: intl.formatMessage(messages.delete),
                isDestructive: true,
                dataTestId: catalogDetailActionDelete,
            },
        );
        return result;
    }, [intl, onOpen]);

    const closeDialog = useCallback(() => setDialog(undefined), []);

    const handleEditOpen = useCallback(() => setDialog({ kind: "edit", item }), [item]);

    const handleActionsMenuSelect = useCallback(
        async (actionId: string, event: MouseEvent | KeyboardEvent) => {
            if (actionId === "open") {
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
                // The catalog item carries no MAQL, so show the create dialog in its loading state
                // and feed it the copied definition once the full metric is fetched. Only advance
                // while still in this loading state, so closing the dialog or opening Edit/Delete
                // meanwhile cancels the duplicate.
                setDialog({ kind: "duplicate", isLoading: true });
                try {
                    const measure = await mutation.load(item);
                    if (isMounted.current) {
                        setDialog((current) =>
                            current?.kind === "duplicate" && current.isLoading
                                ? { kind: "duplicate", sourceDefinition: measure, isLoading: false }
                                : current,
                        );
                    }
                } catch {
                    if (isMounted.current) {
                        addError(messages.loadError);
                        setDialog((current) =>
                            current?.kind === "duplicate" && current.isLoading ? undefined : current,
                        );
                    }
                }
            }
        },
        [addError, item, mutation, onOpen, workspaceId],
    );

    const handleEditDuplicate = useCallback((sourceDefinition: IMeasureMetadataObjectDefinition) => {
        setDialog({ kind: "duplicate", sourceDefinition, isLoading: false });
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
                <MetricEditDialog
                    item={dialog.item}
                    onClose={closeDialog}
                    onSaved={(saved) => onCatalogItemUpdate?.(saved)}
                    onDuplicate={handleEditDuplicate}
                />
            ) : null}
            {dialog?.kind === "duplicate" ? (
                <MetricCreateDialog
                    sourceDefinition={dialog.sourceDefinition}
                    isLoading={dialog.isLoading}
                    onClose={closeDialog}
                    onCreated={(created) => onCatalogItemCreate?.(created)}
                />
            ) : null}
            {dialog?.kind === "delete" ? (
                <MetricDeleteDialog
                    item={dialog.item}
                    onClose={closeDialog}
                    onDeleted={() => onCatalogItemDelete?.(dialog.item)}
                />
            ) : null}
        </>
    );
}
