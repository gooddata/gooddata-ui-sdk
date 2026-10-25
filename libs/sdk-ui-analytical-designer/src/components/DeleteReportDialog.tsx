// (C) 2007-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ObjRef } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { ConfirmDialog as ConfirmDialogComponent } from "@gooddata/sdk-ui-kit";

import { deleteReport } from "../actions/delete_actions.js";
import { hideDialog } from "../actions/dialogs_actions.js";
import { deleteReportDialogSelector } from "../selectors/dialogs_selector.js";
import { getInsightUsageOnDashboards } from "../store/insight_usage/insight_usage_helpers.js";
import { type AppDispatch } from "../store/types.js";
import { getAnalyticalDashboards, getInsightReferences } from "../utils/api.js";
import { shortenText } from "../utils/base.js";

import { DeleteReportDialogUsageList } from "./DeleteReportDialogUsageList.js";

const MAX_TITLE_LENGTH = 28;

export interface IDeleteReportDialogProps {
    /** test seam: defaults to the ui-kit dialog */
    ConfirmDialog?: typeof ConfirmDialogComponent;
}

const useReferencingDashboards = (projectId: string, insightRef: ObjRef, isActive: boolean) => {
    return useCancelablePromise(
        {
            promise: async () => {
                if (!insightRef || !isActive) {
                    return null;
                }

                const { analyticalDashboards } = await getInsightReferences(projectId, insightRef);
                const userDashboards = await getAnalyticalDashboards(projectId);

                return getInsightUsageOnDashboards(analyticalDashboards || [], userDashboards);
            },
        },
        [projectId, insightRef, isActive],
    );
};

export function DeleteReportDialog({ ConfirmDialog = ConfirmDialogComponent }: IDeleteReportDialogProps) {
    const intl = useIntl();

    const { deleteReportDialog, projectId, isEmbedded, analyticalDashboardUriFactory } =
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

    const { result: referencingDashboards, status } = useReferencingDashboards(projectId, insightRef, active);

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
    // on tiger we enable the delete once we are sure the insight is not used on any dashboard
    const canDelete = !isLoadingUsages && !referencingDashboards?.allDashboardsCount;

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
                            id="dialogs.deleteReportConfirmation.deleteProhibited"
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
                    referencingDashboards={referencingDashboards}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                />
            </ConfirmDialog>
        );
    }

    return null;
}
