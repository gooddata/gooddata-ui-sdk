// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog, Message, UiLink, useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";

import type { IAsCodeDescriptor } from "./descriptor.js";
import { useMutationPort } from "./useMutationPort.js";

const messages = defineMessages({
    cancel: { id: "analyticsCatalog.asCode.dialog.cancel" },
    showMore: { id: "analyticsCatalog.asCode.dialog.delete.showMore" },
    showLess: { id: "analyticsCatalog.asCode.dialog.delete.showLess" },
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

    const [areReferencesShown, setAreReferencesShown] = useState(false);

    // Block deletion until the usage lookup resolves, so the dependent-object warning surfaces first.
    const { result, status } = useCancelablePromise(
        { promise: referenceCounted ? () => referenceCounted.load(backend, workspace, item) : undefined },
        [item, backend, workspace],
    );
    const references = !referenceCounted || status === "error" ? [] : result;
    const referencingCount = references?.length;
    // A failed lookup leaves the count at zero, so a blocking type stays deletable rather than
    // becoming permanently undeletable on a transient error; the backend refuses it either way.
    const isBlocked = Boolean(referenceCounted?.blockedBody) && Boolean(referencingCount);

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
            isSubmitDisabled={isDeleting || referencingCount === undefined || isBlocked}
            isCancelDisabled={isDeleting}
            showProgressIndicator={isDeleting}
            onCancel={handleClose}
            onClose={handleClose}
            onSubmit={handleDelete}
            displayCloseButton={!isDeleting}
        >
            <FormattedMessage
                {...(isBlocked && referenceCounted?.blockedBody
                    ? referenceCounted.blockedBody
                    : msg.deleteBody)}
                values={{
                    name: displayName,
                    b: (chunks) => <b>{chunks}</b>,
                }}
            />
            {referencingCount && referenceCounted ? (
                <div className="gd-analytics-catalog__as-code-dialog__usage">
                    <Message type="warning">
                        <FormattedMessage
                            {...referenceCounted.usageWarning}
                            values={{
                                count: referencingCount,
                                b: (chunks) => <b>{chunks}</b>,
                            }}
                        />
                        {referenceCounted.listReferences ? (
                            <>
                                {" "}
                                <UiLink
                                    variant="secondary"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setAreReferencesShown(!areReferencesShown)}
                                    aria-expanded={areReferencesShown}
                                >
                                    {intl.formatMessage(
                                        areReferencesShown ? messages.showLess : messages.showMore,
                                    )}
                                </UiLink>
                            </>
                        ) : null}

                        {referenceCounted.listReferences && areReferencesShown ? (
                            <ul className="gd-analytics-catalog__as-code-dialog__usage-list">
                                {references?.map((title) => (
                                    <li key={title}>{title}</li>
                                ))}
                            </ul>
                        ) : null}
                    </Message>
                </div>
            ) : null}
        </ConfirmDialog>
    );
}
