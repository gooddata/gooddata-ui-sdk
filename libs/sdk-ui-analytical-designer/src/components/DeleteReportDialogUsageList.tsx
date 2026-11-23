// (C) 2021-2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { Message, UiButton } from "@gooddata/sdk-ui-kit";

import { type AnalyticalDashboardUriFactory, type DocumentUriFactory } from "../selectors/uri_selector.js";
import {
    type IInsightUsageInDocuments,
    type IInsightUsageOnDashboard,
} from "../store/insight_usage/insight_usage_state.js";

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
    inaccessibleDocuments: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDocuments" },
    inaccessibleDocumentsOnly: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDocumentsOnly" },
});

const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;

interface IDeleteReportDialogUsageListProps {
    isLoading: boolean;
    isEmbedded: boolean;
    referencingDashboards: IInsightUsageOnDashboard;
    referencingDocuments: IInsightUsageInDocuments;
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
                            title={title}
                            href={isEmbedded ? undefined : analyticalDashboardUriFactory(id)}
                        />
                    ))}
                </ul>
            ) : null}
            {renderAlsoInaccessible ? (
                <InaccessibleMessage
                    message={messages.inaccessibleDashboards}
                    count={inaccessibleDashboardsCount}
                />
            ) : null}
            {renderInaccessibleOnly ? (
                <OnlyInaccessibleMessage
                    message={messages.inaccessibleDashboardsOnly}
                    count={inaccessibleDashboardsCount}
                />
            ) : null}
        </>
    );
}

interface IInaccessibleMessageProps {
    message: MessageDescriptor;
    count: number;
}

function InaccessibleMessage({ message, count }: IInaccessibleMessageProps) {
    return (
        <div className="gd-delete-report-dialog-usage-inaccessible s-delete-report-dialog-usage-inaccessible">
            <FormattedMessage {...message} values={{ count, b: (chunks) => <b>{chunks}</b> }} />
        </div>
    );
}

function OnlyInaccessibleMessage({ message, count }: IInaccessibleMessageProps) {
    return (
        <div className="gd-delete-report-dialog-usage-inaccessible s-delete-report-dialog-usage-inaccessible">
            <FormattedMessage {...message} values={{ count }} />
        </div>
    );
}

interface IReferencedDocumentsListProps {
    isEmbedded: boolean;
    referencingDocuments: IInsightUsageInDocuments;
    documentUriFactory: DocumentUriFactory;
}

function ReferencedDocumentsList({
    isEmbedded,
    referencingDocuments,
    documentUriFactory,
}: IReferencedDocumentsListProps) {
    const { accessibleDocuments, inaccessibleDocumentsCount } = referencingDocuments;

    return (
        <>
            {accessibleDocuments.length > 0 ? (
                <ul className="gd-delete-report-dialog-usage-list">
                    {accessibleDocuments.map((item) => (
                        <DeleteReportDialogUsageListItem
                            key={`${item.type}/${item.id}`}
                            title={item.title}
                            href={isEmbedded ? undefined : documentUriFactory(item)}
                        />
                    ))}
                </ul>
            ) : null}
            {accessibleDocuments.length > 0 && inaccessibleDocumentsCount > 0 ? (
                <InaccessibleMessage
                    message={messages.inaccessibleDocuments}
                    count={inaccessibleDocumentsCount}
                />
            ) : null}
            {accessibleDocuments.length === 0 ? (
                <OnlyInaccessibleMessage
                    message={messages.inaccessibleDocumentsOnly}
                    count={inaccessibleDocumentsCount}
                />
            ) : null}
        </>
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
    const documentsCount = referencingDocuments.allDocumentsCount;

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
