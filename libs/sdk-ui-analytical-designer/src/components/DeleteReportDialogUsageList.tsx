// (C) 2021-2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type IMetadataObject } from "@gooddata/sdk-model";
import { Message, UiButton } from "@gooddata/sdk-ui-kit";

import { type AnalyticalDashboardUriFactory, type DocumentUriFactory } from "../selectors/uri_selector.js";
import { type IInsightUsageOnDashboard } from "../store/insight_usage/insight_usage_state.js";

import { Spinner } from "./catalog/blocks/Spinner.js";
import { DeleteReportDialogUsageListItem } from "./DeleteReportDialogUsageListItem.js";

const messages = defineMessages({
    checking: { id: "dialogs.deleteReportConfirmation.usage.checking" },
    notUsed: { id: "dialogs.deleteReportConfirmation.usage.notUsed" },
    dashboardsUsage: { id: "dialogs.deleteReportConfirmation.usage" },
    documentsUsage: { id: "dialogs.deleteReportConfirmation.usage.documents" },
    dashboardsAndDocumentsUsage: { id: "dialogs.deleteReportConfirmation.usage.dashboardsAndDocuments" },
    dashboardsGroup: { id: "dialogs.deleteReportConfirmation.usage.group.dashboards" },
    documentsGroup: { id: "dialogs.deleteReportConfirmation.usage.group.documents" },
    showMore: { id: "dialogs.deleteReportConfirmation.usage.showMore" },
    showLess: { id: "dialogs.deleteReportConfirmation.usage.showLess" },
    inaccessibleDashboards: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDashboards" },
    inaccessibleDashboardsOnly: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDashboardsOnly" },
});

type ReferencingDocument = Pick<IMetadataObject, "id" | "title">;

const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;

interface IDeleteReportDialogUsageListProps {
    isLoading: boolean;
    isEmbedded: boolean;
    referencingDashboards: IInsightUsageOnDashboard;
    referencingDocuments: ReferencingDocument[];
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
    documentUriFactory: DocumentUriFactory;
}

interface IUsageMessageProps {
    header: ReactNode;
    children: ReactNode;
}

function UsageMessage({ header, children }: IUsageMessageProps) {
    const intl = useIntl();
    const [showUsageList, setShowUsageList] = useState(false);

    return (
        <Message type="warning">
            <div className="gd-delete-report-dialog-usage-list-header">
                {header}
                <span className="gd-delete-report-dialog-usage-more s-delete-report-dialog-usage-more">
                    <UiButton
                        variant="link"
                        label={intl.formatMessage(showUsageList ? messages.showLess : messages.showMore)}
                        onClick={() => setShowUsageList(!showUsageList)}
                        accessibilityConfig={{ ariaExpanded: showUsageList }}
                    />
                </span>
            </div>
            {showUsageList ? (
                <div className="gd-delete-report-dialog-usage-list-wrapper">{children}</div>
            ) : null}
        </Message>
    );
}

interface IUsageGroupProps {
    title: ReactNode;
    className: string;
    children: ReactNode;
}

function UsageGroup({ title, className, children }: IUsageGroupProps) {
    return (
        <div className={`gd-delete-report-dialog-usage-group ${className}`}>
            <h4 className="gd-delete-report-dialog-usage-group-heading">{title}</h4>
            {children}
        </div>
    );
}

interface IReferencedDashboardsListProps {
    isEmbedded: boolean;
    referencingDashboards: IInsightUsageOnDashboard;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
}

function ReferencedDashboardsList({
    referencingDashboards,
    isEmbedded,
    analyticalDashboardUriFactory,
}: IReferencedDashboardsListProps) {
    const { accessibleDashboards, inaccessibleDashboardsCount } = referencingDashboards;

    const renderListOfAccessible = accessibleDashboards.length > 0;
    const renderInaccessibleOnly = accessibleDashboards.length === 0 && inaccessibleDashboardsCount > 0;
    const renderAlsoInaccessible = accessibleDashboards.length > 0 && inaccessibleDashboardsCount > 0;

    return (
        <>
            {renderListOfAccessible ? (
                <ul className="gd-delete-report-dialog-usage-list">
                    {accessibleDashboards.map(({ id, title }) => (
                        <DeleteReportDialogUsageListItem
                            key={id}
                            id={id}
                            title={title}
                            isEmbedded={isEmbedded}
                            uriFactory={analyticalDashboardUriFactory}
                        />
                    ))}
                </ul>
            ) : null}
            {renderAlsoInaccessible ? (
                <InaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
            ) : null}
            {renderInaccessibleOnly ? (
                <OnlyInaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
            ) : null}
        </>
    );
}

function InaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-delete-report-dialog-usage-inaccessible s-delete-report-dialog-usage-inaccessible">
            <FormattedMessage
                {...messages.inaccessibleDashboards}
                values={{ count, b: (chunks) => <b>{chunks}</b> }}
            />
        </div>
    );
}

function OnlyInaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-delete-report-dialog-usage-inaccessible s-delete-report-dialog-usage-inaccessible">
            <FormattedMessage {...messages.inaccessibleDashboardsOnly} values={{ count }} />
        </div>
    );
}

interface IReferencedDocumentsListProps {
    isEmbedded: boolean;
    referencingDocuments: ReferencingDocument[];
    documentUriFactory: DocumentUriFactory;
}

function ReferencedDocumentsList({
    isEmbedded,
    referencingDocuments,
    documentUriFactory,
}: IReferencedDocumentsListProps) {
    return (
        <ul className="gd-delete-report-dialog-usage-list">
            {referencingDocuments.map(({ id, title }) => (
                <DeleteReportDialogUsageListItem
                    key={id}
                    id={id}
                    title={title}
                    isEmbedded={isEmbedded}
                    uriFactory={documentUriFactory}
                />
            ))}
        </ul>
    );
}

export function DeleteReportDialogUsageList({
    isLoading,
    isEmbedded,
    referencingDashboards,
    referencingDocuments,
    analyticalDashboardUriFactory,
    documentUriFactory,
}: IDeleteReportDialogUsageListProps) {
    if (isLoading) {
        return (
            <div className="gd-delete-report-dialog-usage-loading s-delete-report-dialog-usage-loading">
                <Spinner />
                <span className="gd-delete-report-dialog-usage-loading-message">
                    <FormattedMessage {...messages.checking} />
                </span>
            </div>
        );
    }

    const dashboardsCount = referencingDashboards.allDashboardsCount;
    const documentsCount = referencingDocuments.length;

    const dashboardsList = (
        <ReferencedDashboardsList
            isEmbedded={isEmbedded}
            referencingDashboards={referencingDashboards}
            analyticalDashboardUriFactory={analyticalDashboardUriFactory}
        />
    );
    const documentsList = (
        <ReferencedDocumentsList
            isEmbedded={isEmbedded}
            referencingDocuments={referencingDocuments}
            documentUriFactory={documentUriFactory}
        />
    );

    return (
        <div className="gd-delete-report-dialog-usage s-delete-report-dialog-usage">
            {renderUsage(dashboardsCount, documentsCount, dashboardsList, documentsList)}
        </div>
    );
}

function renderUsage(
    dashboardsCount: number,
    documentsCount: number,
    dashboardsList: ReactNode,
    documentsList: ReactNode,
): ReactNode {
    if (dashboardsCount > 0 && documentsCount > 0) {
        return (
            <UsageMessage
                header={
                    <FormattedMessage
                        {...messages.dashboardsAndDocumentsUsage}
                        values={{ count: dashboardsCount + documentsCount, strong }}
                    />
                }
            >
                <UsageGroup
                    className="s-delete-report-dialog-usage-dashboards"
                    title={
                        <FormattedMessage {...messages.dashboardsGroup} values={{ count: dashboardsCount }} />
                    }
                >
                    {dashboardsList}
                </UsageGroup>
                <UsageGroup
                    className="s-delete-report-dialog-usage-documents"
                    title={
                        <FormattedMessage {...messages.documentsGroup} values={{ count: documentsCount }} />
                    }
                >
                    {documentsList}
                </UsageGroup>
            </UsageMessage>
        );
    }
    if (dashboardsCount > 0) {
        return (
            <UsageMessage
                header={
                    <FormattedMessage {...messages.dashboardsUsage} values={{ dashboardsCount, strong }} />
                }
            >
                {dashboardsList}
            </UsageMessage>
        );
    }
    if (documentsCount > 0) {
        return (
            <UsageMessage
                header={<FormattedMessage {...messages.documentsUsage} values={{ documentsCount, strong }} />}
            >
                {documentsList}
            </UsageMessage>
        );
    }
    return (
        <Message type="progress">
            <div className="gd-delete-report-dialog-no-usage">
                <FormattedMessage {...messages.notUsed} />
            </div>
        </Message>
    );
}
