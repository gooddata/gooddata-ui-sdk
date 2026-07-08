// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback, useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { catalogDetailActionDelete, catalogDetailActionDuplicate } from "../automation/testIds.js";
import { isCatalogItemMeasure, isCatalogItemParameter } from "../catalogItem/guards.js";
import type { ICatalogItem, ICatalogItemParameter, ICatalogItemRef } from "../catalogItem/types.js";
import { MetricDetailActions } from "../metric/MetricDetailActions.js";
import { ParameterCreateDialog } from "../parameter/ParameterCreateDialog.js";
import { ParameterDeleteDialog } from "../parameter/ParameterDeleteDialog.js";
import { ParameterEditDialog } from "../parameter/ParameterEditDialog.js";

import { CatalogDetailActionBar } from "./CatalogDetailActionBar.js";
import { useCatalogItemShareActions } from "./share/CatalogItemShareProvider.js";
import { ShareButton } from "./share/ShareButton.js";
import type { ICatalogDetailAction, OpenHandlerEvent } from "./types.js";

const messages = defineMessages({
    parameterDuplicate: { id: "analyticsCatalog.parameter.dialog.edit.duplicate" },
    parameterDelete: { id: "analyticsCatalog.parameter.dialog.delete.submit" },
});

type DialogKind = "edit" | "duplicate" | "delete";

type DialogState = {
    kind: DialogKind;
    item: ICatalogItemParameter;
};

/**
 * @internal
 */
export interface ICatalogDetailActionsProps {
    item: ICatalogItem;
    canEdit: boolean;
    isMetricEditorEnabled?: boolean;
    onOpen?: (event: MouseEvent, openEvent: OpenHandlerEvent) => void;
    onCatalogItemCreate?: (item: ICatalogItem) => void;
    onCatalogItemUpdate?: (item: ICatalogItem) => void;
    onCatalogItemDelete?: (ref: ICatalogItemRef) => void;
}

/**
 * @internal
 */
export function CatalogDetailActions({
    item,
    canEdit,
    isMetricEditorEnabled,
    onOpen,
    onCatalogItemCreate,
    onCatalogItemUpdate,
    onCatalogItemDelete,
}: ICatalogDetailActionsProps) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();
    const [dialog, setDialog] = useState<DialogState | undefined>(undefined);
    // The Share button reads the share context directly (actions only), so it never
    // re-renders as access is edited and is shown only when sharing is available.
    const share = useCatalogItemShareActions();

    const parameterActions = useMemo<ICatalogDetailAction[]>(
        () => [
            {
                id: "duplicate",
                label: intl.formatMessage(messages.parameterDuplicate),
                dataTestId: catalogDetailActionDuplicate,
            },
            {
                id: "delete",
                label: intl.formatMessage(messages.parameterDelete),
                isDestructive: true,
                dataTestId: catalogDetailActionDelete,
            },
        ],
        [intl],
    );

    const closeDialog = useCallback(() => setDialog(undefined), []);

    const handleEditOpen = useCallback(() => {
        if (isCatalogItemParameter(item)) {
            setDialog({ kind: "edit", item });
        }
    }, [item]);

    const handleSaved = useCallback(
        (saved: ICatalogItemParameter) => {
            onCatalogItemUpdate?.(saved);
        },
        [onCatalogItemUpdate],
    );

    const handleCreated = useCallback(
        (created: ICatalogItemParameter) => {
            onCatalogItemCreate?.(created);
        },
        [onCatalogItemCreate],
    );

    const handleDeleted = useCallback(() => {
        if (isCatalogItemParameter(item)) {
            onCatalogItemDelete?.(item);
        }
    }, [item, onCatalogItemDelete]);

    const handleActionsMenuSelect = useCallback(
        (actionId: string) => {
            if (!isCatalogItemParameter(item)) {
                return;
            }
            if (actionId === "duplicate" || actionId === "delete") {
                setDialog({ kind: actionId, item });
            }
        },
        [item],
    );

    const handleEditDuplicate = useCallback(
        (parameter: IParameterMetadataObjectDefinition) => {
            if (!isCatalogItemParameter(item)) {
                return;
            }
            setDialog({
                kind: "duplicate",
                item: {
                    ...item,
                    identifier: parameter.id ?? item.identifier,
                    title: parameter.title ?? item.title,
                    description: parameter.description ?? item.description,
                    tags: parameter.tags ?? item.tags,
                    definition: parameter.definition,
                },
            });
        },
        [item],
    );

    if (isCatalogItemParameter(item)) {
        if (!canEdit) {
            return null;
        }
        return (
            <>
                <CatalogDetailActionBar
                    item={item}
                    workspaceId={workspaceId}
                    actions={parameterActions}
                    onEditClick={handleEditOpen}
                    onActionsMenuSelect={handleActionsMenuSelect}
                />
                {dialog?.kind === "edit" ? (
                    <ParameterEditDialog
                        item={dialog.item}
                        onClose={closeDialog}
                        onSaved={handleSaved}
                        onDuplicate={handleEditDuplicate}
                    />
                ) : null}
                {dialog?.kind === "duplicate" ? (
                    <ParameterCreateDialog
                        sourceItem={dialog.item}
                        onClose={closeDialog}
                        onCreated={handleCreated}
                    />
                ) : null}
                {dialog?.kind === "delete" ? (
                    <ParameterDeleteDialog
                        item={dialog.item}
                        onClose={closeDialog}
                        onDeleted={handleDeleted}
                    />
                ) : null}
            </>
        );
    }

    if (isCatalogItemMeasure(item) && isMetricEditorEnabled && canEdit) {
        return (
            <MetricDetailActions
                item={item}
                onOpen={onOpen}
                canShare={share.active}
                onShare={share.open}
                onCatalogItemCreate={onCatalogItemCreate}
                onCatalogItemUpdate={onCatalogItemUpdate}
                onCatalogItemDelete={onCatalogItemDelete}
            />
        );
    }

    return (
        <div className="gd-analytics-catalog-detail__header-actions">
            {share.active ? <ShareButton onClick={share.open} /> : null}
            <UiButton
                label={intl.formatMessage({ id: "analyticsCatalog.catalogItem.open" })}
                variant="primary"
                accessibilityConfig={{ role: "link" }}
                onClick={(event) => {
                    onOpen?.(event, {
                        item,
                        workspaceId,
                        newTab: event.metaKey || event.ctrlKey,
                        preventDefault: event.preventDefault.bind(event),
                    });
                }}
            />
        </div>
    );
}
