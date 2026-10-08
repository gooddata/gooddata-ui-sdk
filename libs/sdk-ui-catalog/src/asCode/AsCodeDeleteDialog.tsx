// (C) 2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useCallback, useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import {
    type UseCancelablePromiseState,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { ConfirmDialog, LoadingSpinner, useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem, ICatalogItemRef } from "../catalogItem/types.js";

import type { AsCodeUsageCheck, IAsCodeDescriptor, IAsCodeReference } from "./descriptor.js";
import { UsageError, UsageWarning } from "./UsageNotice.js";
import { useMutationPort } from "./useMutationPort.js";

const messages = defineMessages({
    cancel: { id: "analyticsCatalog.asCode.dialog.cancel" },
    checkingUsage: { id: "analyticsCatalog.asCode.dialog.delete.checkingUsage" },
});

type Props = {
    descriptor: IAsCodeDescriptor;
    item: ICatalogItem;
    onClose: () => void;
    onDeleted: () => void;
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
};

/** @internal */
export function AsCodeDeleteDialog({ descriptor, item, onClose, onDeleted, onCatalogItemNavigation }: Props) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const port = useMutationPort(descriptor);
    const { messages: msg, usageCheck } = descriptor;
    const [isDeleting, setIsDeleting] = useState(false);
    const [lookupAttempt, setLookupAttempt] = useState(0);

    const lookup = useCancelablePromise(
        { promise: usageCheck ? () => usageCheck.load(backend, workspace, item) : undefined },
        [item, backend, workspace, lookupAttempt],
    );
    const usage = getUsageView(
        usageCheck,
        lookup,
        msg.deleteBody,
        () => setLookupAttempt((attempt) => attempt + 1),
        onCatalogItemNavigation,
    );

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
            className="gd-analytics-catalog__as-code-dialog"
            headline={intl.formatMessage(msg.deleteTitle)}
            cancelButtonText={intl.formatMessage(messages.cancel)}
            submitButtonText={intl.formatMessage(msg.deleteSubmit)}
            isPositive={false}
            isSubmitDisabled={isDeleting || usage.isChecking || usage.isBlocked}
            isCancelDisabled={isDeleting}
            showProgressIndicator={isDeleting}
            onCancel={handleClose}
            onClose={handleClose}
            onSubmit={handleDelete}
            displayCloseButton={!isDeleting}
        >
            {usage.isChecking ? (
                <div className="gd-analytics-catalog__as-code-dialog__checking">
                    <LoadingSpinner className="small" />
                    {intl.formatMessage(messages.checkingUsage)}
                </div>
            ) : (
                <>
                    <FormattedMessage
                        {...usage.body}
                        values={{
                            name: displayName,
                            b: (chunks) => <b>{chunks}</b>,
                        }}
                    />
                    {usage.notice ? (
                        <div className="gd-analytics-catalog__as-code-dialog__usage">{usage.notice}</div>
                    ) : null}
                </>
            )}
        </ConfirmDialog>
    );
}

interface IUsageView {
    isChecking: boolean;
    isBlocked: boolean;
    body: MessageDescriptor;
    notice?: ReactNode;
}

function getUsageView(
    usageCheck: AsCodeUsageCheck<ICatalogItem> | undefined,
    lookup: UseCancelablePromiseState<IAsCodeReference[], unknown>,
    deleteBody: MessageDescriptor,
    onRetry: () => void,
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void,
): IUsageView {
    const unused: IUsageView = { isChecking: false, isBlocked: false, body: deleteBody };
    if (!usageCheck) {
        return unused;
    }
    switch (lookup.status) {
        case "pending":
        case "loading":
            return { ...unused, isChecking: true };
        case "error":
            return {
                ...unused,
                isBlocked: usageCheck.mode === "block",
                notice: <UsageError onRetry={onRetry} />,
            };
        case "success":
            if (lookup.result.length === 0) {
                return unused;
            }
            return {
                ...unused,
                isBlocked: usageCheck.mode === "block",
                body: usageCheck.mode === "block" ? usageCheck.blockedMessage : deleteBody,
                notice: (
                    <UsageWarning
                        usageCheck={usageCheck}
                        references={lookup.result}
                        onCatalogItemNavigation={onCatalogItemNavigation}
                    />
                ),
            };
    }
}
