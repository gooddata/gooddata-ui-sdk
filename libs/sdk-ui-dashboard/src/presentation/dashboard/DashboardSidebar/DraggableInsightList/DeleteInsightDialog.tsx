// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type IInsight, type ObjRef, insightRef, insightTitle, serializeObjRef } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog, LoadingSpinner, Message, useToastMessage } from "@gooddata/sdk-ui-kit";

import { deleteInsight } from "../../../../model/commands/insightDelete.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";
import { selectAccessibleDashboardsMap } from "../../../../model/store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectIsInsightUsedByDashboard } from "../../../../model/store/insights/insightUsageSelectors.js";
import { selectDashboardId } from "../../../../model/store/meta/metaSelectors.js";

const messages = defineMessages({
    headline: { id: "deleteInsightDialog.headline" },
    submit: { id: "delete" },
    cancel: { id: "cancel" },
    description: { id: "deleteInsightDialog.description" },
    checking: { id: "deleteInsightDialog.checking" },
    notUsed: { id: "deleteInsightDialog.notUsed" },
    checkFailed: { id: "deleteInsightDialog.checkFailed" },
    usedOnDashboards: { id: "deleteInsightDialog.usedOnDashboards" },
    usage: { id: "deleteInsightDialog.usage" },
    showMore: { id: "deleteInsightDialog.usage.showMore" },
    showLess: { id: "deleteInsightDialog.usage.showLess" },
    inaccessibleDashboards: { id: "deleteInsightDialog.inaccessibleDashboards" },
    inaccessibleDashboardsOnly: { id: "deleteInsightDialog.inaccessibleDashboardsOnly" },
    usedOnThisDashboard: { id: "deleteInsightDialog.usedOnThisDashboard" },
    success: { id: "deleteInsightDialog.success" },
    error: { id: "deleteInsightDialog.error" },
});

const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;

/**
 * @internal
 */
export interface IDeleteInsightDialogProps {
    insight: IInsight;
    onClose: () => void;
    onDeleted: (ref: ObjRef) => void;
}

interface IUsageWarningProps {
    accessibleTitles: string[];
    inaccessibleCount: number;
}

function UsageWarning({ accessibleTitles, inaccessibleCount }: IUsageWarningProps) {
    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);
    const count = accessibleTitles.length + inaccessibleCount;

    return (
        <Message type="warning" className="gd-delete-insight-dialog__usage s-delete-insight-dialog-usage">
            <div className="gd-delete-insight-dialog__usage-header">
                <span>
                    <FormattedMessage {...messages.usage} values={{ count, strong }} />
                </span>
                <button
                    type="button"
                    className="gd-delete-insight-dialog__usage-toggle s-delete-insight-dialog-usage-toggle"
                    aria-expanded={isExpanded}
                    onClick={() => setIsExpanded((expanded) => !expanded)}
                >
                    {intl.formatMessage(isExpanded ? messages.showLess : messages.showMore)}
                </button>
            </div>
            {isExpanded ? (
                <div className="gd-delete-insight-dialog__usage-details">
                    {accessibleTitles.length > 0 ? (
                        <ul className="gd-delete-insight-dialog__usage-list">
                            {accessibleTitles.map((dashboardTitle, index) => (
                                <li key={index}>{dashboardTitle}</li>
                            ))}
                        </ul>
                    ) : null}
                    {inaccessibleCount > 0 ? (
                        <p className="gd-delete-insight-dialog__usage-inaccessible s-delete-insight-dialog-inaccessible">
                            <FormattedMessage
                                {...(accessibleTitles.length > 0
                                    ? messages.inaccessibleDashboards
                                    : messages.inaccessibleDashboardsOnly)}
                                values={{ count: inaccessibleCount, strong }}
                            />
                        </p>
                    ) : null}
                </div>
            ) : null}
        </Message>
    );
}

export function DeleteInsightDialog({ insight, onClose, onDeleted }: IDeleteInsightDialogProps) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { addSuccess, addError } = useToastMessage();

    const ref = insightRef(insight);
    const title = insightTitle(insight);
    const refKey = serializeObjRef(ref);

    const usage = useCancelablePromise(
        {
            promise: () =>
                backend
                    .workspace(workspace)
                    .insights()
                    .getInsightReferencingObjects(ref)
                    .then((references) => references.analyticalDashboards ?? []),
        },
        [backend, workspace, refKey],
    );
    const accessibleDashboards = useDashboardSelector(selectAccessibleDashboardsMap);
    const usedOnThisDashboard = useDashboardSelector(selectIsInsightUsedByDashboard(ref));
    const dashboardId = useDashboardSelector(selectDashboardId);

    const { run, status } = useDashboardCommandProcessing({
        commandCreator: deleteInsight,
        successEvent: "GDC.DASH/EVT.INSIGHT.DELETED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess: () => {
            addSuccess(messages.success);
            onDeleted(ref);
            onClose();
        },
        onError: () => {
            addError(messages.error);
        },
    });

    const dashboards = usage.result ?? [];
    const otherDashboards = dashboards.filter((dashboard) => dashboard.id !== dashboardId);
    const accessibleTitles = otherDashboards
        .map((dashboard) => accessibleDashboards.get(dashboard.ref)?.title)
        .filter((dashboardTitle): dashboardTitle is string => dashboardTitle !== undefined);
    const inaccessibleCount = otherDashboards.length - accessibleTitles.length;

    const isChecking = usage.status === "pending" || usage.status === "loading";
    const canDelete = usage.status === "success" && otherDashboards.length === 0 && !usedOnThisDashboard;
    const isDeleting = status === "running";

    let body: ReactNode;
    if (isChecking) {
        body = (
            <div
                role="status"
                className="gd-delete-insight-dialog__checking s-delete-insight-dialog-checking"
            >
                <LoadingSpinner className="small" />
                <span>{intl.formatMessage(messages.checking)}</span>
            </div>
        );
    } else if (usage.status === "error") {
        body = (
            <p role="alert" className="s-delete-insight-dialog-check-failed">
                {intl.formatMessage(messages.checkFailed)}
            </p>
        );
    } else if (otherDashboards.length > 0) {
        body = (
            <>
                <p className="s-delete-insight-dialog-used-on-dashboards">
                    <FormattedMessage {...messages.usedOnDashboards} values={{ title, strong }} />
                </p>
                <UsageWarning accessibleTitles={accessibleTitles} inaccessibleCount={inaccessibleCount} />
            </>
        );
    } else if (usedOnThisDashboard) {
        body = (
            <p className="s-delete-insight-dialog-used-on-this-dashboard">
                <FormattedMessage {...messages.usedOnThisDashboard} values={{ title, strong }} />
            </p>
        );
    } else {
        body = (
            <>
                <p className="s-delete-insight-dialog-description">
                    <FormattedMessage {...messages.description} values={{ title, strong }} />
                </p>
                <Message
                    type="progress"
                    className="gd-delete-insight-dialog__not-used s-delete-insight-dialog-not-used"
                >
                    {intl.formatMessage(messages.notUsed)}
                </Message>
            </>
        );
    }

    return (
        <ConfirmDialog
            onCancel={isDeleting ? undefined : onClose}
            displayCloseButton={!isDeleting}
            onSubmit={() => run(ref)}
            isPositive={false}
            className="gd-delete-insight-dialog s-dialog s-delete-insight-dialog"
            headline={intl.formatMessage(messages.headline)}
            cancelButtonText={intl.formatMessage(messages.cancel)}
            submitButtonText={intl.formatMessage(messages.submit)}
            isSubmitDisabled={!canDelete || isDeleting}
            isCancelDisabled={isDeleting}
            showProgressIndicator={isDeleting}
        >
            {body}
        </ConfirmDialog>
    );
}
