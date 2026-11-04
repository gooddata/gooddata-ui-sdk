// (C) 2007-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { sortBy } from "lodash-es";
import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ObjRef } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { ConfirmDialog as ConfirmDialogComponent } from "@gooddata/sdk-ui-kit";

import { deleteReport } from "../actions/delete_actions.js";
import { hideDialog } from "../actions/dialogs_actions.js";
import { deleteReportDialogSelector } from "../selectors/dialogs_selector.js";
import {
    EMPTY_INSIGHT_USAGE_ON_DASHBOARDS,
    getInsightUsageOnDashboards,
} from "../store/insight_usage/insight_usage_helpers.js";
import { type AppDispatch } from "../store/types.js";
import { getAnalyticalDashboards, getInsightReferences } from "../utils/api.js";
import { shortenText } from "../utils/base.js";

import { DeleteReportDialogUsageList } from "./DeleteReportDialogUsageList.js";

const MAX_TITLE_LENGTH = 28;

const deleteProhibitedMessages = defineMessages({
    dashboards: { id: "dialogs.deleteReportConfirmation.deleteProhibited" },
    documents: { id: "dialogs.deleteReportConfirmation.deleteProhibitedDocuments" },
    documentsAndDashboards: { id: "dialogs.deleteReportConfirmation.deleteProhibitedDocumentsAndDashboards" },
});

function getDeleteProhibitedMessage(
    isUsedOnDashboards: boolean,
    isUsedInDocuments: boolean,
): MessageDescriptor {
    if (!isUsedInDocuments) {
        return deleteProhibitedMessages.dashboards;
    }
    return isUsedOnDashboards
        ? deleteProhibitedMessages.documentsAndDashboards
        : deleteProhibitedMessages.documents;
}

export interface IDeleteReportDialogProps {
    /** test seam: defaults to the ui-kit dialog */
    ConfirmDialog?: typeof ConfirmDialogComponent;
}

const useReferencingObjects = (projectId: string, insightRef: ObjRef, isActive: boolean) => {
    return useCancelablePromise(
        {
            promise: async () => {
                if (!insightRef || !isActive) {
                    return null;
                }

                const { analyticalDashboards, documents } = await getInsightReferences(projectId, insightRef);
                const userDashboards = await getAnalyticalDashboards(projectId);

                return {
                    dashboards: getInsightUsageOnDashboards(analyticalDashboards || [], userDashboards),
                    documents: sortBy(documents ?? [], (document) => document.title.trim().toLowerCase()),
                };
            },
        },
        [projectId, insightRef, isActive],
    );
};

export function DeleteReportDialog({ ConfirmDialog = ConfirmDialogComponent }: IDeleteReportDialogProps) {
    const intl = useIntl();

    const { deleteReportDialog, projectId, isEmbedded, analyticalDashboardUriFactory, documentUriFactory } =
        useSelector(deleteReportDialogSelector);
    const dispatch = useDispatch<AppDispatch>();

    const insightRef = deleteReportDialog?.data?.insightRef;
    const active = deleteReportDialog.active;

    const [isDeleting, setIsDeleting] = useState(false);

    // reset the deleting status whenever this goes from !active -> active (i.e. the dialog is opened)
    // this is needed because the dialog is not actually unmounted when closed, but merely hidden
    useEffect(() => {
        if (active) {
            setIsDeleting(false);
        }
    }, [active]);

    const { result: referencing, status } = useReferencingObjects(projectId, insightRef, active);

    const isLoadingUsages = status === "loading" || status === "pending";

    const onConfirm = () => {
        dispatch(deleteReport(deleteReportDialog.data.insightRef, true));
        setIsDeleting(true);
    };

    const onClose = () => {
        dispatch(hideDialog());
        setIsDeleting(false);
    };

    // TODO it might make sense to unify this and use the tiger way also on bear
    // on tiger we enable the delete once we are sure the insight is not used on any dashboard or in any document
    const isUsedOnDashboards = (referencing?.dashboards.allDashboardsCount ?? 0) > 0;
    const isUsedInDocuments = (referencing?.documents.length ?? 0) > 0;
    const canDelete = !isLoadingUsages && !isUsedOnDashboards && !isUsedInDocuments;

    const shouldDisableDelete = isDeleting || !canDelete;

    if (deleteReportDialog.active) {
        const decoratedTitle = shortenText(deleteReportDialog.data.meta.title, {
            maxLength: MAX_TITLE_LENGTH,
        });

        return (
            <ConfirmDialog
                onCancel={onClose}
                onSubmit={onConfirm}
                className="gd-delete-report-dialog s-dialog"
                headline={intl.formatMessage({ id: "dialogs.deleteReportConfirmation.headline" })}
                cancelButtonText={intl.formatMessage({ id: "dialogs.deleteReportConfirmation.cancel" })}
                submitButtonText={intl.formatMessage({ id: "dialogs.deleteReportConfirmation.confirm" })}
                isSubmitDisabled={shouldDisableDelete}
            >
                {/* on non-tiger show the default message. also show it on tiger once we *know* we can delete the insight */}
                {canDelete ? (
                    <p className="s-delete-report-dialog-title">
                        <FormattedMessage
                            id="dialogs.deleteReportConfirmation.description"
                            values={{
                                deletedReportTitle: decoratedTitle,
                                strong: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>
                ) : null}
                {/* on tiger show message about disabled delete because of insight being used */}
                {!isLoadingUsages && !canDelete && (
                    <p className="s-delete-report-dialog-title">
                        <FormattedMessage
                            {...getDeleteProhibitedMessage(isUsedOnDashboards, isUsedInDocuments)}
                            values={{
                                deletedReportTitle: decoratedTitle,
                                strong: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>
                )}
                <DeleteReportDialogUsageList
                    isLoading={isLoadingUsages}
                    isEmbedded={isEmbedded}
                    referencingDashboards={referencing?.dashboards ?? EMPTY_INSIGHT_USAGE_ON_DASHBOARDS}
                    referencingDocuments={referencing?.documents ?? []}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                    documentUriFactory={documentUriFactory}
                />
            </ConfirmDialog>
        );
    }

    return null;
}
