// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";

import { AsCodeDialog } from "./AsCodeDialog.js";
import type { IAsCodeDefinition, IAsCodeDescriptor } from "./descriptor.js";
import { useAsCodeBase } from "./useAsCodeBase.js";

type Props = {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    onClose: () => void;
    onSaved?: (item: ICatalogItem) => void;
    // Emits the current unsaved edits, as a definition, for the host's create dialog to copy from.
    // Omitted when duplication is not offered.
    onDuplicate?: (source: IAsCodeDefinition) => void;
};

/**
 * Edits an existing as-code object. Its editable definition is resolved by {@link useAsCodeBase} —
 * fetched for a type with `port.load` (a metric's MAQL), or mapped from the item for one without.
 * Generic over the entity type via its descriptor.
 * @internal
 */
export function AsCodeEditDialog({ descriptor, item, onClose, onSaved, onDuplicate }: Props) {
    const { addSuccess, addError } = useToastMessage();
    const { base, isLoading, port } = useAsCodeBase(descriptor, item, () => {
        if (descriptor.messages.loadError) {
            addError(descriptor.messages.loadError);
        }
        onClose();
    });

    const handleSubmit = useCallback(
        async (definition: IAsCodeDefinition) => {
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

    const handleDuplicate = useCallback(
        (edited: IAsCodeDefinition) => {
            if (base === undefined || !onDuplicate) {
                return;
            }
            // Overlay the edits onto the loaded base so the copy keeps fields the YAML can't express.
            onDuplicate(descriptor.applyYamlEdits ? descriptor.applyYamlEdits(base, edited) : edited);
        },
        [base, descriptor, onDuplicate],
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
            onDuplicate={onDuplicate ? handleDuplicate : undefined}
        />
    );
}
