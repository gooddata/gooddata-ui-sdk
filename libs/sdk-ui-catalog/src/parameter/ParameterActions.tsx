// (C) 2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useCallback, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { catalogDetailActionDelete, catalogDetailActionDuplicate } from "../automation/testIds.js";
import type { EditHandlerEvent, ICatalogDetailAction } from "../catalogDetail/types.js";
import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { isCatalogItemParameter } from "../catalogItem/guards.js";
import type { ICatalogItem, ICatalogItemParameter, ICatalogItemRef } from "../catalogItem/types.js";
import { ParameterDeleteDialog } from "./ParameterDeleteDialog.js";
import { ParameterDuplicateDialog } from "./ParameterDuplicateDialog.js";
import { ParameterEditDialog } from "./ParameterEditDialog.js";

const messages = defineMessages({
    parameterDuplicate: { id: "analyticsCatalog.parameter.dialog.edit.duplicate" },
    parameterDelete: { id: "analyticsCatalog.parameter.dialog.delete.submit" },
});

const ParameterDialogType = {
    EDIT: "edit",
    DUPLICATE: "duplicate",
    DELETE: "delete",
} as const;

type ParameterDialogState =
    | { type: "edit"; item: ICatalogItemParameter }
    | { type: "duplicate"; item: ICatalogItemParameter }
    | { type: "delete"; item: ICatalogItemParameter };

export type ParameterActionsRenderProps = {
    getItemActions: (item: ICatalogItem) => ICatalogDetailAction[];
    onItemAction: (item: ICatalogItem, actionId: string) => void;
    onEditClick: (event: MouseEvent, editClickEvent: EditHandlerEvent) => void;
    onItemUpdate: (item: ICatalogItem) => void;
};

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    setItemOpened: (item: ICatalogItemRef | ICatalogItem | null) => void;
    onCloseDetail: () => void;
    children: (props: ParameterActionsRenderProps) => ReactNode;
};

export function ParameterActions({ backend, workspace, setItemOpened, onCloseDetail, children }: Props) {
    const intl = useIntl();
    const { updateItem, removeItem } = useCatalogFeedActions();
    const [parameterDialog, setParameterDialog] = useState<ParameterDialogState | undefined>(undefined);

    const openDialog = useCallback((type: ParameterDialogState["type"], item: ICatalogItemParameter) => {
        setParameterDialog({ type, item });
    }, []);

    const closeDialog = useCallback(() => {
        setParameterDialog(undefined);
    }, []);

    const handleDuplicateFromEdit = useCallback((parameter: IParameterMetadataObjectDefinition) => {
        setParameterDialog((prev) => {
            if (prev?.type !== ParameterDialogType.EDIT) {
                return prev;
            }
            return {
                type: ParameterDialogType.DUPLICATE,
                item: {
                    ...prev.item,
                    identifier: parameter.id ?? prev.item.identifier,
                    title: parameter.title ?? prev.item.title,
                    description: parameter.description ?? prev.item.description,
                    tags: parameter.tags ?? prev.item.tags,
                    definition: parameter.definition,
                },
            };
        });
    }, []);

    const onItemUpdate = useCallback(
        (item: ICatalogItem) => {
            setItemOpened(item);
            updateItem(item);
        },
        [setItemOpened, updateItem],
    );

    const handleDelete = useCallback(() => {
        if (parameterDialog?.type === "delete") {
            removeItem(parameterDialog.item);
        }
        onCloseDetail();
    }, [onCloseDetail, parameterDialog, removeItem]);

    const getItemActions = useCallback(
        (item: ICatalogItem): ICatalogDetailAction[] => {
            if (!isCatalogItemParameter(item)) {
                return [];
            }
            return [
                {
                    id: ParameterDialogType.DUPLICATE,
                    label: intl.formatMessage(messages.parameterDuplicate),
                    dataTestId: catalogDetailActionDuplicate,
                },
                {
                    id: ParameterDialogType.DELETE,
                    label: intl.formatMessage(messages.parameterDelete),
                    isDestructive: true,
                    dataTestId: catalogDetailActionDelete,
                },
            ];
        },
        [intl],
    );

    const onItemAction = useCallback(
        (item: ICatalogItem, actionId: string) => {
            if (!isCatalogItemParameter(item)) {
                return;
            }
            if (actionId === ParameterDialogType.DUPLICATE) {
                openDialog("duplicate", item);
                return;
            }
            if (actionId === ParameterDialogType.DELETE) {
                openDialog("delete", item);
            }
        },
        [openDialog],
    );

    const onEditClick = useCallback(
        (_event: MouseEvent, editClickEvent: EditHandlerEvent) => {
            if (!isCatalogItemParameter(editClickEvent.item)) {
                return;
            }
            openDialog("edit", editClickEvent.item);
        },
        [openDialog],
    );

    return (
        <>
            {parameterDialog?.type === ParameterDialogType.EDIT && (
                <ParameterEditDialog
                    backend={backend}
                    workspace={workspace}
                    item={parameterDialog.item}
                    onClose={closeDialog}
                    onSaved={onItemUpdate}
                    onDuplicate={handleDuplicateFromEdit}
                />
            )}
            {parameterDialog?.type === ParameterDialogType.DUPLICATE && (
                <ParameterDuplicateDialog
                    backend={backend}
                    workspace={workspace}
                    item={parameterDialog.item}
                    onClose={closeDialog}
                    onSaved={onItemUpdate}
                />
            )}
            {parameterDialog?.type === ParameterDialogType.DELETE && (
                <ParameterDeleteDialog
                    backend={backend}
                    workspace={workspace}
                    item={parameterDialog.item}
                    onClose={closeDialog}
                    onDeleted={handleDelete}
                />
            )}
            {children({ getItemActions, onItemAction, onEditClick, onItemUpdate })}
        </>
    );
}
