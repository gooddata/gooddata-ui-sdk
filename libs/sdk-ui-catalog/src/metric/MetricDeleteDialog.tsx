// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ConfirmDialog, useToastMessage } from "@gooddata/sdk-ui-kit";

import { type ICatalogItemMeasure } from "../catalogItem/types.js";

import { useMetricMutation } from "./MetricMutationContext.js";

const messages = defineMessages({
    title: { id: "analyticsCatalog.metric.dialog.delete.title" },
    body: { id: "analyticsCatalog.metric.dialog.delete.body" },
    usageWarning: { id: "analyticsCatalog.metric.dialog.delete.usageWarning" },
    submit: { id: "analyticsCatalog.metric.dialog.delete.submit" },
    cancel: { id: "analyticsCatalog.metric.dialog.cancel" },
    deleteSuccess: { id: "analyticsCatalog.metric.delete.success" },
    deleteError: { id: "analyticsCatalog.metric.delete.error" },
});

type Props = {
    item: ICatalogItemMeasure;
    onClose: () => void;
    onDeleted: () => void;
};

export function MetricDeleteDialog({ item, onClose, onDeleted }: Props) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const mutation = useMetricMutation();
    const [isDeleting, setIsDeleting] = useState(false);
    // undefined until the usage lookup resolves; deletion is withheld until then so the dependent-object
    // warning can surface before the user can confirm.
    const [referencingCount, setReferencingCount] = useState<number | undefined>(undefined);

    const displayName = item.title || item.identifier;

    useEffect(() => {
        let cancelled = false;
        mutation
            .getReferencingObjects(item)
            .then((referencing) => {
                if (!cancelled) {
                    const count = (referencing.insights?.length ?? 0) + (referencing.measures?.length ?? 0);
                    setReferencingCount(count);
                }
            })
            .catch(() => {
                // Usage lookup is advisory; on failure fall back to no warning rather than block deletion.
                if (!cancelled) {
                    setReferencingCount(0);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [item, mutation]);

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await mutation.delete(item);
            onDeleted();
            onClose();
            addSuccess(messages.deleteSuccess);
        } catch {
            addError(messages.deleteError);
            setIsDeleting(false);
        }
    }, [addError, addSuccess, item, mutation, onClose, onDeleted]);

    const handleClose = useCallback(() => {
        if (!isDeleting) {
            onClose();
        }
    }, [isDeleting, onClose]);

    return (
        <ConfirmDialog
            headline={intl.formatMessage(messages.title)}
            cancelButtonText={intl.formatMessage(messages.cancel)}
            submitButtonText={intl.formatMessage(messages.submit)}
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
                {...messages.body}
                values={{
                    name: displayName,
                    b: (chunks) => <b>{chunks}</b>,
                }}
            />
            {referencingCount ? (
                <div>
                    <FormattedMessage {...messages.usageWarning} values={{ count: referencingCount }} />
                </div>
            ) : null}
        </ConfirmDialog>
    );
}
