// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { AgentIcon } from "./AgentIcon.js";
import { MessageContents } from "./MessageContents.js";
import { AssistantMessage, isErrorContents } from "../../model.js";
import { setUserFeedback } from "../../store/index.js";

type AssistantMessageProps = {
    message: AssistantMessage;
    setUserFeedback: typeof setUserFeedback;
    isLast?: boolean;
};

function AssistantMessageComponentCore({ message, setUserFeedback, isLast }: AssistantMessageProps) {
    const intl = useIntl();

    const classNames = cx(
        "gd-gen-ai-chat__messages__message",
        "gd-gen-ai-chat__messages__message--assistant",
        message.cancelled && "gd-gen-ai-chat__messages__message--cancelled",
    );
    const hasError = message.content.some(isErrorContents);

    const thumbsUpLabel = intl.formatMessage({ id: "gd.gen-ai.feedback.like" });
    const thumbsDownLabel = intl.formatMessage({ id: "gd.gen-ai.feedback.dislike" });

    return (
        <div className={classNames}>
            <span className="gd-gen-ai-chat__visually__hidden">
                {intl.formatMessage({ id: "gd.gen-ai.message.label.assistant" })}
            </span>
            <AgentIcon
                loading={!message.complete}
                error={hasError}
                cancelled={message.cancelled}
                aria-hidden="true"
            />
            <div className="gd-gen-ai-chat__messages__message__contents_wrap">
                <MessageContents
                    useMarkdown
                    content={message.content}
                    isComplete={Boolean(message.content.length > 0 || message.complete || message.cancelled)}
                    isCancelled={message.cancelled}
                    isLastMessage={isLast}
                    messageId={message.localId}
                />
                {message.complete ? (
                    <div
                        className={cx({
                            "gd-gen-ai-chat__messages__feedback": true,
                            "gd-gen-ai-chat__messages__feedback--assigned": message.feedback !== "NONE",
                        })}
                    >
                        <UiTooltip
                            triggerBy={["focus", "hover"]}
                            arrowPlacement="bottom"
                            anchor={
                                <UiIconButton
                                    icon="thumbsUp"
                                    variant="tertiary"
                                    isActive={message.feedback === "POSITIVE"}
                                    onClick={() =>
                                        setUserFeedback({
                                            assistantMessageId: message.localId,
                                            feedback: message.feedback === "POSITIVE" ? "NONE" : "POSITIVE",
                                        })
                                    }
                                    accessibilityConfig={{
                                        ariaLabel: thumbsUpLabel,
                                    }}
                                />
                            }
                            content={thumbsUpLabel}
                        />
                        <UiTooltip
                            triggerBy={["focus", "hover"]}
                            arrowPlacement="bottom"
                            anchor={
                                <UiIconButton
                                    icon="thumbsDown"
                                    variant="tertiary"
                                    isActive={message.feedback === "NEGATIVE"}
                                    onClick={() =>
                                        setUserFeedback({
                                            assistantMessageId: message.localId,
                                            feedback: message.feedback === "NEGATIVE" ? "NONE" : "NEGATIVE",
                                        })
                                    }
                                    accessibilityConfig={{
                                        ariaLabel: thumbsDownLabel,
                                    }}
                                />
                            }
                            content={thumbsDownLabel}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

const mapDispatchToProps = {
    setUserFeedback,
};

export const AssistantMessageComponent: any = connect(
    null,
    mapDispatchToProps,
)(AssistantMessageComponentCore);
