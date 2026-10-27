// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectAiReasoningTitle,
    selectIsAiBuilding,
    selectIsAiGenerating,
    selectIsAiWaiting,
} from "../../../model/store/config/configSelectors.js";

import { DashboardAiComposingOverlay } from "./DashboardAiComposingOverlay.js";

const messages = defineMessages({
    replyNow: { id: "dashboard.ai.composing.replyNow", defaultMessage: "Reply now" },
});

interface IDashboardInteractionComposingProps {
    children: ReactNode;
    onReplyInChat?: () => void;
}

export function DashboardInteractionComposing({
    children,
    onReplyInChat,
}: IDashboardInteractionComposingProps) {
    const intl = useIntl();
    const isAiGenerating = useDashboardSelector(selectIsAiGenerating);
    const isAiBuilding = useDashboardSelector(selectIsAiBuilding);
    const isAiWaiting = useDashboardSelector(selectIsAiWaiting);
    const aiReasoningTitle = useDashboardSelector(selectAiReasoningTitle);

    const isAiActive = isAiBuilding || isAiWaiting || isAiGenerating;
    const showReasoningTitle = (isAiGenerating || isAiBuilding) && !!aiReasoningTitle;
    const showStatus = isAiWaiting || showReasoningTitle;

    return (
        <>
            {children}
            {isAiActive ? (
                <div>
                    <DashboardAiComposingOverlay isWaiting={isAiWaiting} />
                </div>
            ) : null}
            <div
                className={cx("gd-dashboard-interaction-composing__status", {
                    hidden: !showStatus,
                })}
                aria-hidden={!showStatus}
            >
                <div
                    className="gd-dashboard-interaction-composing__message"
                    role={showStatus ? "status" : undefined}
                    aria-hidden={!showStatus}
                >
                    {isAiWaiting || !showReasoningTitle ? (
                        <FormattedMessage id="dashboard.ai.composing.waiting" />
                    ) : (
                        aiReasoningTitle
                    )}
                </div>
                {isAiWaiting && onReplyInChat ? (
                    <UiButton
                        variant="tertiary"
                        label={intl.formatMessage(messages.replyNow)}
                        onClick={onReplyInChat}
                    />
                ) : null}
            </div>
        </>
    );
}
