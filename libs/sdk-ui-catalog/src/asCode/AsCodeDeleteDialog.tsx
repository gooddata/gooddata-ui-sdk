// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { ConfirmDialog, useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";

import { useAsCodePort } from "./AsCodeMutationContext.js";
import type { IAsCodeDescriptor } from "./descriptor.js";

const messages = defineMessages({
    cancel: { id: "analyticsCatalog.asCode.dialog.cancel" },
});

type Props = {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    onClose: () => void;
    onDeleted: () => void;
};

/**
 * Confirms deletion of an as-code object. A type that reports a referencing count (see
 * `port.getReferencingObjectsCount`) withholds the confirm until the lookup resolves and warns when
 * the object is in use; a type without one deletes straight away. Generic over the descriptor.
 * @internal
 */
export function AsCodeDeleteDialog({ descriptor, item, onClose, onDeleted }: Props) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const port = useAsCodePort(descriptor.objectType);
    const { messages: msg } = descriptor;
    const [isDeleting, setIsDeleting] = useState(false);

    // For a type with a usage lookup, withhold deletion until it resolves so the dependent-object
    // warning can surface first; a type without one has nothing to wait for, so starts unblocked.
    const lookup = port.getReferencingObjectsCount;
    const { result, status } = useCancelablePromise({ promise: lookup ? () => lookup(item) : undefined }, [
        item,
        port,
    ]);
    // The lookup is advisory: no lookup or a failed one means no warning and nothing to wait for.
    const referencingCount = !lookup || status === "error" ? 0 : result;

    const displayName = item.title || item.identifier;

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await port.delete(item);
            onDeleted();
            onClose();
            addSuccess(msg.deleteSuccess);
        } catch {
            addError(msg.deleteError);
            setIsDeleting(false);
        }
    }, [addError, addSuccess, item, msg, onClose, onDeleted, port]);

    const handleClose = useCallback(() => {
        if (!isDeleting) {
            onClose();
        }
    }, [isDeleting, onClose]);

    return (
        <ConfirmDialog
            headline={intl.formatMessage(msg.deleteTitle)}
            cancelButtonText={intl.formatMessage(messages.cancel)}
            submitButtonText={intl.formatMessage(msg.deleteSubmit)}
            isPositive={false}
            isSubmitDisabled={isDeleting || referencingCount === undefined}
            isCancelDisabled={isDeleting}
            showProgressIndicator={isDeleting}
            onCancel={handleClose}
            onClose={handleClose}
            onSubmit={handleDelete}
            displayCloseButton={!isDeleting}
        >
            <FormattedMessage
                {...msg.deleteBody}
                values={{
                    name: displayName,
                    b: (chunks) => <b>{chunks}</b>,
                }}
            />
            {referencingCount && msg.deleteUsageWarning ? (
                <div>
                    <FormattedMessage {...msg.deleteUsageWarning} values={{ count: referencingCount }} />
                </div>
            ) : null}
        </ConfirmDialog>
    );
}
