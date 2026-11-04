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

interface IUsageSectionProps {
    header: ReactNode;
    toggleClassName: string;
    children: ReactNode;
}

function UsageSection({ header, toggleClassName, children }: IUsageSectionProps) {
    const intl = useIntl();
    const [showUsageList, setShowUsageList] = useState(false);

    return (
        <Message type="warning">
            <div className="gd-delete-report-dialog-usage-list-header">
                {header}
                <span className={`gd-delete-report-dialog-usage-more ${toggleClassName}`}>
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
    const { accessibleDashboards } = referencingDashboards;
    return (
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

function ReferencedDashboards({
    referencingDashboards,
    isEmbedded,
    analyticalDashboardUriFactory,
}: IReferencedDashboardsListProps) {
    const { allDashboardsCount, accessibleDashboards, inaccessibleDashboardsCount } = referencingDashboards;

    const renderListOfAccessible = accessibleDashboards.length > 0;
    const renderInaccessibleOnly = accessibleDashboards.length === 0 && inaccessibleDashboardsCount > 0;
    const renderAlsoInaccessible = accessibleDashboards.length > 0 && inaccessibleDashboardsCount > 0;

    return (
        <UsageSection
            header={
                <FormattedMessage
                    {...messages.dashboardsUsage}
                    values={{ dashboardsCount: allDashboardsCount, strong }}
                />
            }
            toggleClassName="s-delete-report-dialog-usage-more"
        >
            {renderListOfAccessible ? (
                <ReferencedDashboardsList
                    isEmbedded={isEmbedded}
                    referencingDashboards={referencingDashboards}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                />
            ) : null}
            {renderAlsoInaccessible ? (
                <InaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
            ) : null}
            {renderInaccessibleOnly ? (
                <OnlyInaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
            ) : null}
        </UsageSection>
    );
}

interface IReferencedDocumentsProps {
    isEmbedded: boolean;
    referencingDocuments: ReferencingDocument[];
    documentUriFactory: DocumentUriFactory;
}

function ReferencedDocuments({
    isEmbedded,
    referencingDocuments,
    documentUriFactory,
}: IReferencedDocumentsProps) {
    return (
        <UsageSection
            header={
                <FormattedMessage
                    {...messages.documentsUsage}
                    values={{ documentsCount: referencingDocuments.length, strong }}
                />
            }
            toggleClassName="s-delete-report-dialog-usage-documents-more"
        >
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
        </UsageSection>
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

    const isReferencedOnSomeDashboard = referencingDashboards.allDashboardsCount > 0;
    const isReferencedInSomeDocument = referencingDocuments.length > 0;

    return (
        <div className="gd-delete-report-dialog-usage s-delete-report-dialog-usage">
            {isReferencedOnSomeDashboard ? (
                <ReferencedDashboards
                    isEmbedded={isEmbedded}
                    referencingDashboards={referencingDashboards}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                />
            ) : null}
            {isReferencedInSomeDocument ? (
                <ReferencedDocuments
                    isEmbedded={isEmbedded}
                    referencingDocuments={referencingDocuments}
                    documentUriFactory={documentUriFactory}
                />
            ) : null}
            {isReferencedOnSomeDashboard || isReferencedInSomeDocument ? null : (
                <Message type="progress">
                    <div className="gd-delete-report-dialog-no-usage">
                        <FormattedMessage {...messages.notUsed} />
                    </div>
                </Message>
            )}
        </div>
    );
}
