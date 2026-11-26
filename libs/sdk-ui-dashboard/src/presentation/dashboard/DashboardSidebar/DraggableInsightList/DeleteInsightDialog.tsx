// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IMetadataObject,
    type ObjRef,
    insightRef,
    insightTitle,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog, LoadingSpinner, Message, useToastMessage } from "@gooddata/sdk-ui-kit";

import { deleteInsight } from "../../../../model/commands/insightDelete.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";
import { selectAccessibleDashboardsMap } from "../../../../model/store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectIsInsightUsedByDashboard } from "../../../../model/store/insights/insightUsageSelectors.js";
import { selectDashboardId } from "../../../../model/store/meta/metaSelectors.js";
import { selectPermissions } from "../../../../model/store/permissions/permissionsSelectors.js";

const messages = defineMessages({
    headline: { id: "deleteInsightDialog.headline" },
    submit: { id: "delete" },
    cancel: { id: "cancel" },
    description: { id: "deleteInsightDialog.description" },
    checking: { id: "deleteInsightDialog.checking" },
    notUsed: { id: "deleteInsightDialog.notUsed" },
    checkFailed: { id: "deleteInsightDialog.checkFailed" },
    usedOnDashboards: { id: "deleteInsightDialog.usedOnDashboards" },
    usedInDocuments: { id: "deleteInsightDialog.usedInDocuments" },
    usedInDocumentsAndDashboards: { id: "deleteInsightDialog.usedInDocumentsAndDashboards" },
    usedInDocumentsAndThisDashboard: { id: "deleteInsightDialog.usedInDocumentsAndThisDashboard" },
    usage: { id: "deleteInsightDialog.usage" },
    documentsUsage: { id: "deleteInsightDialog.documentsUsage" },
    showMore: { id: "deleteInsightDialog.usage.showMore" },
    showLess: { id: "deleteInsightDialog.usage.showLess" },
    inaccessibleDashboards: { id: "deleteInsightDialog.inaccessibleDashboards" },
    inaccessibleDashboardsOnly: { id: "deleteInsightDialog.inaccessibleDashboardsOnly" },
    inaccessibleDocuments: { id: "deleteInsightDialog.inaccessibleDocuments" },
    inaccessibleDocumentsOnly: { id: "deleteInsightDialog.inaccessibleDocumentsOnly" },
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
    usage: MessageDescriptor;
    titles: string[];
    inaccessibleCount: number;
    inaccessible: MessageDescriptor;
    inaccessibleOnly: MessageDescriptor;
}

function UsageWarning({
    usage,
    titles,
    inaccessibleCount,
    inaccessible,
    inaccessibleOnly,
}: IUsageWarningProps) {
    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);
    const count = titles.length + inaccessibleCount;

    return (
        <Message type="warning" className="gd-delete-insight-dialog__usage s-delete-insight-dialog-usage">
            <div className="gd-delete-insight-dialog__usage-header">
                <span>
                    <FormattedMessage {...usage} values={{ count, strong }} />
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
                    {titles.length > 0 ? (
                        <ul className="gd-delete-insight-dialog__usage-list">
                            {titles.map((itemTitle, index) => (
                                <li key={index}>{itemTitle}</li>
                            ))}
                        </ul>
                    ) : null}
                    {inaccessibleCount > 0 ? (
                        <p className="gd-delete-insight-dialog__usage-inaccessible s-delete-insight-dialog-inaccessible">
                            <FormattedMessage
                                {...(titles.length > 0 ? inaccessible : inaccessibleOnly)}
                                values={{ count: inaccessibleCount, strong }}
                            />
                        </p>
                    ) : null}
                </div>
            ) : null}
        </Message>
    );
}

async function loadAccessibleDocumentIds(
    backend: IAnalyticalBackend,
    workspace: string,
    documentIds: string[],
): Promise<string[]> {
    try {
        const result = await backend
            .workspace(workspace)
            .publisherV2()
            .getDocumentsQuery()
            .withFilter({ id: documentIds })
            .withSize(documentIds.length)
            .query();
        return result.items.map((document) => objRefToString(document.ref));
    } catch {
        return [];
    }
}

/**
 * The documents the user may open: all of them when the user may create documents, otherwise the ones the
 * backend returns. When they cannot be loaded, none count as open, so no document the user may not see is named.
 * Templates are visible to every user.
 */
async function loadVisibleDocuments(
    backend: IAnalyticalBackend,
    workspace: string,
    documents: IMetadataObject[],
    canCreateDocument: boolean,
): Promise<IMetadataObject[]> {
    const documentIds = documents.filter(({ type }) => type === "document").map(({ id }) => id);
    if (documentIds.length === 0 || canCreateDocument) {
        return documents;
    }
    const accessibleIds = await loadAccessibleDocumentIds(backend, workspace, documentIds);
    return documents.filter(({ id, type }) => type !== "document" || accessibleIds.includes(id));
}

export function DeleteInsightDialog({ insight, onClose, onDeleted }: IDeleteInsightDialogProps) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { addSuccess, addError } = useToastMessage();

    const ref = insightRef(insight);
    const title = insightTitle(insight);
    const refKey = serializeObjRef(ref);

    const canCreateDocument = useDashboardSelector(selectPermissions).canCreateDocument ?? false;

    const usage = useCancelablePromise(
        {
            promise: async () => {
                const references = await backend
                    .workspace(workspace)
                    .insights()
                    .getInsightReferencingObjects(ref);
                const documents = references.documents ?? [];
                const visibleDocuments = await loadVisibleDocuments(
                    backend,
                    workspace,
                    documents,
                    canCreateDocument,
                );
                return {
                    dashboards: references.analyticalDashboards ?? [],
                    documentsCount: documents.length,
                    visibleDocumentTitles: visibleDocuments.map((document) => document.title),
                };
            },
        },
        [backend, workspace, refKey, canCreateDocument],
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

    const dashboards = usage.result?.dashboards ?? [];
    const documentsCount = usage.result?.documentsCount ?? 0;
    const documentTitles = usage.result?.visibleDocumentTitles ?? [];
    const otherDashboards = dashboards.filter((dashboard) => dashboard.id !== dashboardId);
    const accessibleTitles = otherDashboards
        .map((dashboard) => accessibleDashboards.get(dashboard.ref)?.title)
        .filter((dashboardTitle): dashboardTitle is string => dashboardTitle !== undefined);
    const inaccessibleCount = otherDashboards.length - accessibleTitles.length;

    const isChecking = usage.status === "pending" || usage.status === "loading";
    const canDelete =
        usage.status === "success" &&
        otherDashboards.length === 0 &&
        documentsCount === 0 &&
        !usedOnThisDashboard;
    const documentsWarning =
        documentsCount > 0 ? (
            <UsageWarning
                usage={messages.documentsUsage}
                titles={documentTitles}
                inaccessibleCount={documentsCount - documentTitles.length}
                inaccessible={messages.inaccessibleDocuments}
                inaccessibleOnly={messages.inaccessibleDocumentsOnly}
            />
        ) : null;
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
                    <FormattedMessage
                        {...(documentsCount > 0
                            ? messages.usedInDocumentsAndDashboards
                            : messages.usedOnDashboards)}
                        values={{ title, strong }}
                    />
                </p>
                <UsageWarning
                    usage={messages.usage}
                    titles={accessibleTitles}
                    inaccessibleCount={inaccessibleCount}
                    inaccessible={messages.inaccessibleDashboards}
                    inaccessibleOnly={messages.inaccessibleDashboardsOnly}
                />
                {documentsWarning}
            </>
        );
    } else if (documentsCount > 0) {
        body = (
            <>
                <p className="s-delete-insight-dialog-used-in-documents">
                    <FormattedMessage
                        {...(usedOnThisDashboard
                            ? messages.usedInDocumentsAndThisDashboard
                            : messages.usedInDocuments)}
                        values={{ title, strong }}
                    />
                </p>
                {documentsWarning}
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
