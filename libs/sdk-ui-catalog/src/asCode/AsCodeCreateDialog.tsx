// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";

import { AsCodeDialog } from "./AsCodeDialog.js";
import { isDuplicateIdError } from "./copy.js";
import type { IAsCodeDescriptor } from "./descriptor.js";
import { useAsCodeBase } from "./useAsCodeBase.js";

type Props = {
    descriptor: IAsCodeDescriptor;
    duplicateOf?: ICatalogItem;
    // At most one of duplicateOf/duplicateSource; neither means a blank create.
    duplicateSource?: unknown;
    onClose: () => void;
    onCreated?: (item: ICatalogItem) => void;
};

/** @internal */
export function AsCodeCreateDialog({ descriptor, duplicateOf, duplicateSource, onClose, onCreated }: Props) {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();
    const { base: loadedSource, isLoading, port } = useAsCodeBase(descriptor, duplicateOf, onClose);

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
    const identity = descriptor.identity;
    const copiedId = copied === undefined ? undefined : identity?.read(copied);

    const handleSubmit = useCallback(
        async (definition: unknown) => {
            let created: ICatalogItem;
            try {
                created = await port.create(definition);
            } catch (error) {
                // The copied id collided; retry without it so the backend assigns a fresh one.
                if (
                    identity !== undefined &&
                    copiedId !== undefined &&
                    identity.read(definition) === copiedId &&
                    isDuplicateIdError(error)
                ) {
                    created = await port.create(identity.strip(definition));
                } else {
                    throw error;
                }
            }
            onCreated?.(created);
            onClose();
            addSuccess(descriptor.messages.createSuccess);
        },
        [addSuccess, copiedId, descriptor, identity, onClose, onCreated, port],
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
