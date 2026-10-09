// (C) 2024-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import type { IDashboard, IInsight } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../model.js";
import { settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { conversationSelector } from "../../../store/messages/messagesSelectors.js";
import { getDashboardHref } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";

import { useDashboardSaveCheck } from "./useSaveCheck.js";

export type ConversationDashboardContentProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    dashboard?: IDashboard | null;
    insights?: IInsight[] | null;
    saved?: string | null;
    className?: string;
};

export function ConversationDashboardContent(props: ConversationDashboardContentProps) {
    const { className, dashboard, insights, message, part } = props;
    const intl = useIntl();
    const config = useConfig();

    const workspaceId = useWorkspaceStrict();
    const useHostedDashboards = Boolean(useSelector(settingsSelector)?.enableShellApplication_dashboards);
    const conversation = useSelector(conversationSelector);
    const { dashboardCheckLoading, dashboardSaved } = useDashboardSaveCheck(part, dashboard, true);
    const isDashboardSaved = dashboardSaved || part.saved;

    const handleOpenDashboard = useMemo(() => {
        if (!dashboard) {
            return undefined;
        }

        return (e: MouseEvent | KeyboardEvent) => {
            //NOTE: Dashboard click here is always in draft mode
            const dashboardStatus = "draft";
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
                    conversationId: conversation?.localId,
                });
            }
        };
    }, [dashboard, insights, config, workspaceId, useHostedDashboards, conversation]);

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
            <div className="gd-gen-ai-chat__conversation__item__content-dashboard-frame">
                <div className="gd-gen-ai-chat__conversation__item__content-dashboard-icon">
                    <UiIcon
                        type="dashboard"
                        size={14}
                        color="complementary-6"
                        backgroundSize={26}
                        backgroundColor="complementary-2"
                    />
                </div>
                <div className="gd-gen-ai-chat__conversation__item__content-dashboard-content">
                    <div className="gd-gen-ai-chat__conversation__item__content-dashboard-content-title">
                        {dashboard.title}
                    </div>
                    <div className="gd-gen-ai-chat__conversation__item__content-dashboard-content-date">
                        {Intl.DateTimeFormat(intl.locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        }).format(showDate(dashboard.created, message.createdAt))}
                    </div>
                </div>
                <div className="gd-gen-ai-chat__conversation__item__content-dashboard-item-buttons">
                    <UiButton
                        label={
                            isDashboardSaved
                                ? intl.formatMessage({ id: "gd.gen-ai.dashboard.edit-dashboard" })
                                : intl.formatMessage({ id: "gd.gen-ai.dashboard.open-dashboard" })
                        }
                        variant="secondary"
                        onClick={handleOpenDashboard}
                        isLoading={dashboardCheckLoading}
                        isDisabled={dashboardCheckLoading}
                    />
                </div>
            </div>
        </div>
    );
}

function showDate(...args: (string | number)[]): Date {
    const dates = args.map((arg) => {
        if (typeof arg === "string") {
            if (!isNaN(Date.parse(arg))) {
                return new Date(arg);
            }
        }
        if (typeof arg === "number") {
            return new Date(arg);
        }
        return null;
    });
    return dates.find((date) => date !== null) ?? new Date();
}
