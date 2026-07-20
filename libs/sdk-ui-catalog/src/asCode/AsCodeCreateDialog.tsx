// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";

import { AsCodeDialog } from "./AsCodeDialog.js";
import { isDuplicateIdError } from "./copy.js";
import type { IAsCodeDefinition, IAsCodeDescriptor } from "./descriptor.js";
import { useAsCodeBase } from "./useAsCodeBase.js";

type Props = {
    descriptor: IAsCodeDescriptor;
    // Duplicate an existing item — loaded here (like the edit dialog) to seed the copy.
    duplicateOf?: ICatalogItem;
    // Duplicate from an already-resolved definition (the edit dialog's current unsaved edits). At most
    // one of duplicateOf / duplicateSource is set; neither means a blank create.
    duplicateSource?: IAsCodeDefinition;
    onClose: () => void;
    onCreated?: (item: ICatalogItem) => void;
};

/**
 * Creates an as-code object — blank, or seeded from a copy source when duplicating. Generic over the
 * entity type via its descriptor.
 * @internal
 */
export function AsCodeCreateDialog({ descriptor, duplicateOf, duplicateSource, onClose, onCreated }: Props) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const {
        base: loadedSource,
        isLoading,
        port,
    } = useAsCodeBase(descriptor, duplicateOf, () => {
        if (descriptor.messages.loadError) {
            addError(descriptor.messages.loadError);
        }
        onClose();
    });

    const source = duplicateSource ?? loadedSource;
    const copied = useMemo(
        () => (source === undefined ? undefined : descriptor.toCopy(source)),
        [descriptor, source],
    );
    const initialDefinition = useMemo(
        () =>
            copied ?? descriptor.emptyDefinition(intl.formatMessage(descriptor.messages.createDefaultTitle)),
        [copied, descriptor, intl],
    );
    const copiedId = copied?.id;

    const handleSubmit = useCallback(
        async (definition: IAsCodeDefinition) => {
            // A duplicate re-applies the copied source's non-YAML fields; otherwise persist the parsed YAML.
            const toPersist =
                copied && descriptor.applyYamlEdits
                    ? descriptor.applyYamlEdits(copied, definition)
                    : definition;
            let created: ICatalogItem;
            try {
                created = await port.create(toPersist);
            } catch (error) {
                // The copied identity collided; let the backend derive a fresh one by dropping the id.
                if (copiedId !== undefined && toPersist.id === copiedId && isDuplicateIdError(error)) {
                    const { id: _id, ...withoutId } = toPersist;
                    created = await port.create(withoutId);
                } else {
                    throw error;
                }
            }
            onCreated?.(created);
            onClose();
            addSuccess(descriptor.messages.createSuccess);
        },
        [addSuccess, copied, copiedId, descriptor, onClose, onCreated, port],
    );

    return (
        <AsCodeDialog
            descriptor={descriptor}
            mode="create"
            isLoading={isLoading}
            initialDefinition={isLoading ? undefined : initialDefinition}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}
