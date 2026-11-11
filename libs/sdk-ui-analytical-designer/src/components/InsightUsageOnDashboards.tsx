// (C) 2020-2026 GoodData Corporation

import { type ReactNode, useId, useState } from "react";

import classNames from "classnames";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Overlay, UiButton, UiFocusManager, UiIcon, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { getIsEmbedded } from "../selectors/meta_selector.js";
import { getSourceDashboardId } from "../selectors/route_selector.js";
import {
    type AnalyticalDashboardUriFactory,
    type DocumentUriFactory,
    analyticalDashboardUriFactorySelector,
    documentUriFactorySelector,
} from "../selectors/uri_selector.js";
import {
    getInsightUsageInDocumentsSelector,
    getInsightUsageOnDashboardsSelector,
} from "../store/insight_usage/insight_usage_selectors.js";
import {
    type IInsightUsageInDocumentItem,
    type IInsightUsageOnDashboard,
    type IInsightUsageOnDashboardItem,
} from "../store/insight_usage/insight_usage_state.js";

interface IUsageItemProps {
    title: string;
    icon: "dashboard" | "report";
    /** Absolute URL to open in a new tab, or undefined when the row must not navigate. */
    href: string | undefined;
    className: string;
    suffix?: ReactNode;
}

function UsageItem({ title, icon, href, className, suffix }: IUsageItemProps) {
    return (
        <li className={classNames("gd-usages-item", className)}>
            <UiIcon
                type={icon}
                size={18}
                color="complementary-5"
                accessibilityConfig={{ ariaHidden: true }}
            />
            {href ? (
                <a className="gd-dashboard-link" href={href} target="_blank" rel="noopener noreferrer">
                    {title}
                </a>
            ) : (
                <span className="gd-dashboard-link">{title}</span>
            )}
            {suffix ? <span className="gd-dashboard-link-hover-icon">{suffix}</span> : null}
        </li>
    );
}

interface IDashboardItemProps {
    dashboard: IInsightUsageOnDashboardItem;
    isEmbedded: boolean;
    sourceDashboardIdentifier: string;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
}

function DashboardItem({
    dashboard,
    sourceDashboardIdentifier,
    isEmbedded,
    analyticalDashboardUriFactory,
}: IDashboardItemProps) {
    const { title, id } = dashboard;
    const isSourceDashboard = id === sourceDashboardIdentifier;
    const isEditingNow = isSourceDashboard && isEmbedded;
    const isLinkable = !isEmbedded && !isSourceDashboard;

    return (
        <UsageItem
            title={title}
            icon="dashboard"
            href={isLinkable ? `${window.location.origin}${analyticalDashboardUriFactory(id)}` : undefined}
            className={classNames("s-usage-item", { "editing-now": isEditingNow })}
            suffix={isEditingNow ? <FormattedMessage id="dashboard.editing.now" /> : undefined}
        />
    );
}

interface IDocumentItemProps {
    item: IInsightUsageInDocumentItem;
    isEmbedded: boolean;
    documentUriFactory: DocumentUriFactory;
}

function DocumentItem({ item, isEmbedded, documentUriFactory }: IDocumentItemProps) {
    const { title, id } = item;
    return (
        <UsageItem
            title={title}
            icon="report"
            href={isEmbedded ? undefined : `${window.location.origin}${documentUriFactory(id)}`}
            className="s-usage-document-item"
        />
    );
}

interface IUsageGroupProps {
    title: ReactNode;
    className: string;
    children: ReactNode;
}

function UsageGroup({ title, className, children }: IUsageGroupProps) {
    const [isExpanded, setExpanded] = useState(true);
    const contentId = useId();

    return (
        <div className={classNames("gd-usages-group", className)}>
            <h4 className="gd-usages-group-heading">
                <button
                    type="button"
                    className="gd-usages-group-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={isExpanded ? contentId : undefined}
                    onClick={() => setExpanded((expanded) => !expanded)}
                >
                    <UiIcon
                        type={isExpanded ? "navigateDown" : "navigateRight"}
                        size={14}
                        accessibilityConfig={{ ariaHidden: true }}
                    />
                    <span>{title}</span>
                </button>
            </h4>
            {isExpanded ? <div id={contentId}>{children}</div> : null}
        </div>
    );
}

function InaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-usages-inaccessible-dashboards s-usages-inaccessible-dashboards">
            <FormattedMessage
                id="dialogs.usage.inaccessibleDashboards"
                values={{ count, b: (chunks) => <b>{chunks}</b> }}
            />
        </div>
    );
}

function OnlyInaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-usages-inaccessible-dashboards-only s-usages-inaccessible-dashboards-only">
            <FormattedMessage id="dialogs.usage.inaccessibleDashboardsOnly" values={{ count }} />
        </div>
    );
}

interface IDashboardItemsDialog {
    insightUsageOnDashboard: IInsightUsageOnDashboard;
    documents: IInsightUsageInDocumentItem[];
    isEmbedded: boolean;
    sourceDashboardIdentifier: string;
    onClose: () => void;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
    documentUriFactory: DocumentUriFactory;
}

function DashboardItemsDialog({
    onClose,
    insightUsageOnDashboard,
    documents,
    sourceDashboardIdentifier,
    isEmbedded,
    analyticalDashboardUriFactory,
    documentUriFactory,
}: IDashboardItemsDialog) {
    const intl = useIntl();
    const { accessibleDashboards, inaccessibleDashboardsCount, allDashboardsCount } = insightUsageOnDashboard;
    const headerId = useId();
    const renderInaccessibleOnly = accessibleDashboards.length === 0 && inaccessibleDashboardsCount > 0;
    const renderAlsoInaccessible = accessibleDashboards.length > 0 && inaccessibleDashboardsCount > 0;
    return (
        <Overlay
            alignTo=".gd-insight-usage-on-dashboards"
            alignPoints={[{ align: "bl tl" }]}
            closeOnMouseDrag
            closeOnOutsideClick
            closeOnEscape
            onClose={onClose}
            className="gd-insight-usages-overlay s-insight-usages-overlay"
        >
            <UiFocusManager enableAutofocus enableReturnFocusOnUnmount>
                <div
                    className="gd-insight-usages-dialog"
                    role="dialog"
                    aria-labelledby={headerId}
                    tabIndex={0}
                >
                    <UiSubmenuHeader
                        title={intl.formatMessage({ id: "insight.usages.overlay.header" })}
                        titleId={headerId}
                        height="medium"
                    />
                    <div className="gd-usages-overlay-body s-usages-overlay-body">
                        {allDashboardsCount > 0 ? (
                            <UsageGroup
                                className="s-usages-group-dashboards"
                                title={
                                    <FormattedMessage
                                        id="insight.usages.overlay.group.dashboards"
                                        values={{ count: allDashboardsCount }}
                                    />
                                }
                            >
                                {accessibleDashboards.length > 0 ? (
                                    <ul className="gd-usages-group-items" role="list">
                                        {accessibleDashboards.map(
                                            (dashboard: IInsightUsageOnDashboardItem) => (
                                                <DashboardItem
                                                    key={dashboard.id}
                                                    dashboard={dashboard}
                                                    isEmbedded={isEmbedded}
                                                    sourceDashboardIdentifier={sourceDashboardIdentifier}
                                                    analyticalDashboardUriFactory={
                                                        analyticalDashboardUriFactory
                                                    }
                                                />
                                            ),
                                        )}
                                    </ul>
                                ) : null}
                                {renderAlsoInaccessible ? (
                                    <InaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                                ) : null}
                                {renderInaccessibleOnly ? (
                                    <OnlyInaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                                ) : null}
                            </UsageGroup>
                        ) : null}
                        {documents.length > 0 ? (
                            <UsageGroup
                                className="s-usages-group-documents"
                                title={
                                    <FormattedMessage
                                        id="insight.usages.overlay.group.documents"
                                        values={{ count: documents.length }}
                                    />
                                }
                            >
                                <ul className="gd-usages-group-items" role="list">
                                    {documents.map((item) => (
                                        <DocumentItem
                                            key={item.id}
                                            item={item}
                                            isEmbedded={isEmbedded}
                                            documentUriFactory={documentUriFactory}
                                        />
                                    ))}
                                </ul>
                            </UsageGroup>
                        ) : null}
                    </div>
                </div>
            </UiFocusManager>
        </Overlay>
    );
}

function getUsageLabel(intl: IntlShape, dashboardsCount: number, documentsCount: number): string {
    if (documentsCount === 0) {
        return intl.formatMessage({ id: "insight.usages.button.label" }, { dashboardsCount });
    }
    if (dashboardsCount === 0) {
        return intl.formatMessage({ id: "insight.usages.button.label.documents" }, { documentsCount });
    }
    return intl.formatMessage(
        { id: "insight.usages.button.label.dashboardsAndDocuments" },
        { dashboardsCount, documentsCount },
    );
}

export function InsightUsageOnDashboards() {
    const insightUsageOnDashboard = useSelector(getInsightUsageOnDashboardsSelector);
    const documents = useSelector(getInsightUsageInDocumentsSelector);
    const isEmbedded = useSelector(getIsEmbedded);
    const sourceDashboardIdentifier = useSelector(getSourceDashboardId);
    const analyticalDashboardUriFactory = useSelector(analyticalDashboardUriFactorySelector);
    const documentUriFactory = useSelector(documentUriFactorySelector);

    const intl = useIntl();

    const [isOpen, setOpen] = useState(false);
    const toggleOpen = () => setOpen((state) => !state);

    const dashboardsCount = insightUsageOnDashboard.allDashboardsCount;
    const usageLabel = getUsageLabel(intl, dashboardsCount, documents.length);
    return (
        <div className="gd-insight-usage-on-dashboards s-gd-insight-usage-on-dashboards">
            <UiButton
                label={String(dashboardsCount + documents.length)}
                variant="tertiary"
                size="medium"
                iconBefore="lineage"
                isSelected={isOpen}
                onClick={toggleOpen}
                tooltip={usageLabel}
                dataTestId="s-insight-usages-of-dashboards-link"
                accessibilityConfig={{
                    ariaLabel: usageLabel,
                    ariaHaspopup: "dialog",
                    ariaExpanded: isOpen,
                    iconAriaHidden: true,
                }}
            />
            {isOpen ? (
                <DashboardItemsDialog
                    insightUsageOnDashboard={insightUsageOnDashboard}
                    documents={documents}
                    isEmbedded={isEmbedded}
                    sourceDashboardIdentifier={sourceDashboardIdentifier}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                    documentUriFactory={documentUriFactory}
                    onClose={toggleOpen}
                />
            ) : null}
        </div>
    );
}
