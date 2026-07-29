// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";

import { AsCodeDialog } from "./AsCodeDialog.js";
import type { IAsCodeDescriptor } from "./descriptor.js";
import { useAsCodeBase } from "./useAsCodeBase.js";

type Props = {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    onClose: () => void;
    onSaved?: (item: ICatalogItem) => void;
    // Emits the current unsaved edits (reconciled) for the create dialog to copy from.
    onDuplicate?: (source: unknown) => void;
};

/** @internal */
export function AsCodeEditDialog({ descriptor, item, onClose, onSaved, onDuplicate }: Props) {
    const { addSuccess } = useToastMessage();
    const { base, isLoading, port } = useAsCodeBase(descriptor, item, onClose);

    const handleSubmit = useCallback(
        async (definition: unknown) => {
            if (base === undefined) {
                return;
            }
            const saved = await port.update(base, definition);
            onSaved?.(saved);
            onClose();
            addSuccess(descriptor.messages.updateSuccess);
        },
        [addSuccess, base, descriptor, onClose, onSaved, port],
    );

    return (
        <AsCodeDialog
            descriptor={descriptor}
            mode="edit"
            isLoading={isLoading}
            initialDefinition={base}
            fixedIdentifier={item.identifier}
            onClose={onClose}
            onSubmit={handleSubmit}
            onDuplicate={onDuplicate}
        />
    );
}
