// (C) 2020-2026 GoodData Corporation

import { useCallback, useId, useState } from "react";

import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Header, Item, ItemsWrapper, Overlay, UiButton, UiFocusManager } from "@gooddata/sdk-ui-kit";

import { getIsEmbedded } from "../selectors/meta_selector.js";
import { getSourceDashboardId, isAllowedDashboardLinks } from "../selectors/route_selector.js";
import {
    type AnalyticalDashboardUriFactory,
    analyticalDashboardUriFactorySelector,
} from "../selectors/uri_selector.js";
import { getInsightUsageOnDashboardsSelector } from "../store/insight_usage/insight_usage_selectors.js";
import {
    type IInsightUsageOnDashboard,
    type IInsightUsageOnDashboardItem,
} from "../store/insight_usage/insight_usage_state.js";

interface IDashboardItemProps {
    dashboard: IInsightUsageOnDashboardItem;
    isEmbedded: boolean;
    sourceDashboardIdentifier: string;
    isAllowedDashboardLinks: boolean;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
}

function DashboardItem({
    dashboard,
    sourceDashboardIdentifier,
    isEmbedded,
    analyticalDashboardUriFactory,
}: IDashboardItemProps) {
    const { title, id } = dashboard;

    const isEditingNow = id === sourceDashboardIdentifier && isEmbedded;
    const isAllowedGoToDashboard = !isEmbedded && isAllowedDashboardLinks && id !== sourceDashboardIdentifier;

    const cssClassNames = classNames("gd-list-item", "gd-menu-item s-usage-item", {
        "editing-now": isEditingNow,
        "external-icon-link": isAllowedGoToDashboard,
    });

    const goToDashboard = useCallback(() => {
        if (isAllowedGoToDashboard) {
            const dashboardUri = analyticalDashboardUriFactory(id);
            const externalUri = `${window.location.origin}${dashboardUri}`;
            window.open(externalUri, "_blank");
        }
    }, [isAllowedGoToDashboard, id, analyticalDashboardUriFactory]);

    return (
        <Item className={cssClassNames} onClick={goToDashboard}>
            <p className="gd-dashboard-link" title={title}>
                {title}
            </p>
            <span className={"gd-dashboard-link-hover-icon"}>
                {isEditingNow ? <FormattedMessage id="dashboard.editing.now" /> : null}
            </span>
        </Item>
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
    isEmbedded: boolean;
    sourceDashboardIdentifier: string;
    isAllowedDashboardLinks: boolean;
    onClose: () => void;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
}

function DashboardItemsDialog({
    onClose,
    insightUsageOnDashboard,
    sourceDashboardIdentifier,
    isEmbedded,
    analyticalDashboardUriFactory,
    isAllowedDashboardLinks,
}: IDashboardItemsDialog) {
    const { accessibleDashboards, inaccessibleDashboardsCount } = insightUsageOnDashboard;
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
                <div role="dialog" aria-labelledby={headerId} tabIndex={0}>
                    <ItemsWrapper smallItemsSpacing>
                        <Header>
                            <span id={headerId}>
                                <FormattedMessage id="insight.usages.overlay.header" />
                            </span>
                        </Header>
                        <div className="gd-usages-overlay-body s-usages-overlay-body">
                            {insightUsageOnDashboard.accessibleDashboards.map(
                                (dashboard: IInsightUsageOnDashboardItem) => (
                                    <DashboardItem
                                        key={dashboard.id}
                                        dashboard={dashboard}
                                        isEmbedded={isEmbedded}
                                        sourceDashboardIdentifier={sourceDashboardIdentifier}
                                        isAllowedDashboardLinks={isAllowedDashboardLinks}
                                        analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                                    />
                                ),
                            )}
                            {renderAlsoInaccessible ? (
                                <InaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                            ) : null}
                            {renderInaccessibleOnly ? (
                                <OnlyInaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                            ) : null}
                        </div>
                    </ItemsWrapper>
                </div>
            </UiFocusManager>
        </Overlay>
    );
}

export function InsightUsageOnDashboards() {
    const insightUsageOnDashboard = useSelector(getInsightUsageOnDashboardsSelector);
    const isEmbedded = useSelector(getIsEmbedded);
    const sourceDashboardIdentifier = useSelector(getSourceDashboardId);
    // aliased so the local value does not shadow the isAllowedDashboardLinks selector it is read with
    const isDashboardLinksAllowed = useSelector(isAllowedDashboardLinks);
    const analyticalDashboardUriFactory = useSelector(analyticalDashboardUriFactorySelector);

    const intl = useIntl();

    const [isOpen, setOpen] = useState(false);
    const toggleOpen = () => setOpen((state) => !state);

    const usageLabel = intl.formatMessage(
        { id: "insight.usages.button.label" },
        { dashboardsCount: insightUsageOnDashboard.allDashboardsCount },
    );
    return (
        <div className="gd-insight-usage-on-dashboards s-gd-insight-usage-on-dashboards">
            <UiButton
                label={String(insightUsageOnDashboard.allDashboardsCount)}
                variant="tertiary"
                size="medium"
                iconBefore="dashboard"
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
                    isEmbedded={isEmbedded}
                    sourceDashboardIdentifier={sourceDashboardIdentifier}
                    isAllowedDashboardLinks={isDashboardLinksAllowed}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                    onClose={toggleOpen}
                />
            ) : null}
        </div>
    );
}
