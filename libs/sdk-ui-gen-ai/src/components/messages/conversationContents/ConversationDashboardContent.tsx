// (C) 2024-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useMemo } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import type { IDashboard, IInsight } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../model.js";
import { settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { getDashboardHref } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";

export type ConversationDashboardContentProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    dashboard?: IDashboard | null;
    insights?: IInsight[] | null;
    saved?: string | null;
    className?: string;
};

export function ConversationDashboardContent(props: ConversationDashboardContentProps) {
    const { className, dashboard, insights, saved } = props;
    const intl = useIntl();
    const config = useConfig();

    const workspaceId = useWorkspaceStrict();
    const useHostedDashboards = Boolean(useSelector(settingsSelector)?.enableShellApplication_dashboards);

    const handleOpenDashboard = useMemo(() => {
        if (!dashboard) {
            return undefined;
        }

        return (e: MouseEvent | KeyboardEvent) => {
            const dashboardStatus = saved ? "saved" : "draft";
            if (config.allowNativeLinks) {
                window.location.href = getDashboardHref(
                    workspaceId,
                    dashboard.identifier,
                    dashboardStatus,
                    useHostedDashboards,
                );
            } else {
                config.linkHandler?.({
                    type: "dashboard",
                    id: dashboard.identifier,
                    workspaceId,
                    newTab: e.metaKey,
                    preventDefault: e.preventDefault.bind(e),
                    itemUrl: getDashboardHref(
                        workspaceId,
                        dashboard.identifier,
                        dashboardStatus,
                        useHostedDashboards,
                    ),
                    dashboard,
                    insights: insights ?? [],
                    dashboardStatus,
                    action: "open",
                });
            }
        };
    }, [dashboard, insights, config, workspaceId, useHostedDashboards, saved]);

    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--dashboard",
        className,
    );

    if (!dashboard) {
        return null;
    }

    return (
        <div className={classNames}>
            <div className="gd-gen-ai-chat__conversation__item__content-dashboard-header">
                <UiIcon
                    type="dashboard"
                    size={14}
                    color="complementary-6"
                    backgroundSize={26}
                    backgroundColor="complementary-2"
                />
                <FormattedMessage id="gd.gen-ai.dashboard.title" />
            </div>
            <div className="gd-gen-ai-chat__conversation__item__content-dashboard-frame">
                <ul>
                    <li className="gd-gen-ai-chat__conversation__item__content-dashboard-item">
                        <div className="gd-gen-ai-chat__conversation__item__content-dashboard-item-title">
                            {intl.formatMessage({ id: "gd.gen-ai.dashboard.name" })}:
                        </div>
                        <div
                            className={cx(
                                "gd-gen-ai-chat__conversation__item__content-dashboard-item-description",
                                "gd-gen-ai-chat__conversation__item__content-dashboard-item-bold",
                            )}
                        >
                            <p>{dashboard.title}</p>
                        </div>
                    </li>
                    <li className="gd-gen-ai-chat__conversation__item__content-dashboard-item">
                        <div className="gd-gen-ai-chat__conversation__item__content-dashboard-item-title">
                            {intl.formatMessage({ id: "gd.gen-ai.dashboard.description" })}:
                        </div>
                        <div
                            className={
                                "gd-gen-ai-chat__conversation__item__content-dashboard-item-description"
                            }
                        >
                            <p>{dashboard.description}</p>
                        </div>
                    </li>
                </ul>
                <div className="gd-gen-ai-chat__conversation__item__content-dashboard-item-buttons">
                    <UiButton
                        label={intl.formatMessage({ id: "gd.gen-ai.dashboard.open-dashboard" })}
                        variant="tertiary"
                        onClick={handleOpenDashboard}
                    />
                </div>
            </div>
        </div>
    );
}
