// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type ILocale } from "@gooddata/sdk-ui";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../localization/IntlWrapper.js";

import { DashboardAiComposingOverlay as CopilotComposingOverlay } from "./CopilotComposingOverlay.js";
import { type CopilotStatus } from "./types.js";

const messages = defineMessages({
    waiting: {
        id: "gd.gen-ai.copilot.composing.waiting",
        defaultMessage: "Waiting for your reply",
    },
    replyNow: {
        id: "gd.gen-ai.copilot.composing.replyNow",
        defaultMessage: "Reply now",
    },
});

/** Configuration of the workflow-independent composing presentation. @alpha */
export interface ICopilotInteractionComposingProps {
    /** Content that remains mounted and visible regardless of composing progress. */
    children: ReactNode;
    /** Loading, building, waiting for a reply, or idle. */
    status: CopilotStatus;
    /** Optional reasoning heading displayed while generating or building. */
    reasoningTitle?: string;
    /** Pure host visibility predicate, evaluated on each render. Only composing UI is hidden. */
    isVisible?: () => boolean;
    /** Open the originating chat when the user chooses to reply. */
    onReplyInChat?: () => void;
    /** Locale for the waiting message and reply button. Defaults to en-US. */
    locale?: ILocale;
}

/**
 * Wrap content with a composing animation and optional reasoning or reply banner.
 *
 * @remarks
 * This controlled component has no workflow state or store dependency. Its container fills its
 * host; give the host a size and import `@gooddata/sdk-ui-gen-ai/styles/css/copilotInteractionComposing.css`.
 * A visibility predicate is not a subscription; rerender when external visibility facts change.
 * @alpha
 */
export function CopilotInteractionComposing({
    children,
    status,
    reasoningTitle,
    isVisible,
    onReplyInChat,
    locale,
}: ICopilotInteractionComposingProps) {
    const visible = isVisible?.() ?? true;
    const active = visible && status !== "idle";

    return (
        <div className="gd-copilot-interaction-composing">
            <div className="gd-copilot-interaction-composing__content">{children}</div>
            {active ? <CopilotComposingOverlay isWaiting={status === "waiting"} /> : null}
            {visible ? (
                <IntlWrapper locale={locale}>
                    <ComposingStatus
                        status={status}
                        reasoningTitle={reasoningTitle}
                        onReplyInChat={onReplyInChat}
                    />
                </IntlWrapper>
            ) : null}
        </div>
    );
}

function ComposingStatus({
    status,
    reasoningTitle,
    onReplyInChat,
}: Pick<ICopilotInteractionComposingProps, "status" | "reasoningTitle" | "onReplyInChat">) {
    const intl = useIntl();
    const isWaiting = status === "waiting";
    const showReasoning = (status === "generating" || status === "building") && !!reasoningTitle;
    const showStatus = isWaiting || showReasoning;

    return (
        <div
            className={cx("gd-copilot-interaction-composing__status", {
                "gd-copilot-interaction-composing__status--hidden": !showStatus,
            })}
            aria-hidden={!showStatus}
        >
            <div
                className="gd-copilot-interaction-composing__message"
                role={showStatus ? "status" : undefined}
            >
                {isWaiting ? (
                    <FormattedMessage {...messages.waiting} />
                ) : showReasoning ? (
                    reasoningTitle
                ) : null}
            </div>
            {isWaiting && onReplyInChat ? (
                <UiButton
                    variant="tertiary"
                    label={intl.formatMessage(messages.replyNow)}
                    onClick={onReplyInChat}
                />
            ) : null}
        </div>
    );
}
