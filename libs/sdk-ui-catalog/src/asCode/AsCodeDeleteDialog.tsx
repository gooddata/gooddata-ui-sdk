// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog, useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";

import type { IAsCodeDescriptor } from "./descriptor.js";
import { useMutationPort } from "./useMutationPort.js";

const messages = defineMessages({
    cancel: { id: "analyticsCatalog.asCode.dialog.cancel" },
});

type Props = {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    onClose: () => void;
    onDeleted: () => void;
};

/** @internal */
export function AsCodeDeleteDialog({ descriptor, item, onClose, onDeleted }: Props) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const port = useMutationPort(descriptor);
    const { messages: msg, referenceCounted } = descriptor;
    const [isDeleting, setIsDeleting] = useState(false);

    // Block deletion until the usage lookup resolves, so the dependent-object warning surfaces first.
    const { result, status } = useCancelablePromise(
        { promise: referenceCounted ? () => referenceCounted.count(backend, workspace, item) : undefined },
        [item, backend, workspace],
    );
    const referencingCount = !referenceCounted || status === "error" ? 0 : result;

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
            {referencingCount && referenceCounted ? (
                <div>
                    <FormattedMessage
                        {...referenceCounted.usageWarning}
                        values={{ count: referencingCount }}
                    />
                </div>
            ) : null}
        </ConfirmDialog>
    );
}
