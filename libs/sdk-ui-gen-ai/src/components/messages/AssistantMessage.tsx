// (C) 2024-2025 GoodData Corporation

import React from "react";
import cx from "classnames";
import { Icon } from "@gooddata/sdk-ui-kit";
import { defineMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { connect } from "react-redux";

import { AssistantMessage, isErrorContents } from "../../model.js";
import { setUserFeedback } from "../../store/index.js";

import { MessageContents } from "./MessageContents.js";
import { AgentIcon } from "./AgentIcon.js";

type AssistantMessageProps = {
    message: AssistantMessage;
    setUserFeedback: typeof setUserFeedback;
    isLast?: boolean;
};

const labelMessage = defineMessage({ id: "gd.gen-ai.assistant-icon" });

const AssistantMessageComponentCore: React.FC<AssistantMessageProps & WrappedComponentProps> = ({
    message,
    setUserFeedback,
    isLast,
    intl,
}) => {
    const classNames = cx(
        "gd-gen-ai-chat__messages__message",
        "gd-gen-ai-chat__messages__message--assistant",
        message.cancelled && "gd-gen-ai-chat__messages__message--cancelled",
    );
    const hasError = message.content.some(isErrorContents);

    return (
        <section className={classNames}>
            <AgentIcon
                loading={!message.complete}
                error={hasError}
                cancelled={message.cancelled}
                aria-label={intl.formatMessage(labelMessage)}
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
                        <button
                            className={cx({
                                "gd-gen-ai-chat__messages__feedback__button": true,
                                "gd-gen-ai-chat__messages__feedback__button--positive":
                                    message.feedback === "POSITIVE",
                            })}
                            type="button"
                            onClick={() =>
                                setUserFeedback({
                                    assistantMessageId: message.localId,
                                    feedback: message.feedback === "POSITIVE" ? "NONE" : "POSITIVE",
                                })
                            }
                        >
                            <Icon.ThumbsUp />
                        </button>
                        <button
                            className={cx({
                                "gd-gen-ai-chat__messages__feedback__button": true,
                                "gd-gen-ai-chat__messages__feedback__button--negative":
                                    message.feedback === "NEGATIVE",
                            })}
                            type="button"
                            onClick={() =>
                                setUserFeedback({
                                    assistantMessageId: message.localId,
                                    feedback: message.feedback === "NEGATIVE" ? "NONE" : "NEGATIVE",
                                })
                            }
                        >
                            <Icon.ThumbsDown />
                        </button>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

const mapDispatchToProps = {
    setUserFeedback,
};

export const AssistantMessageComponent = connect(
    null,
    mapDispatchToProps,
)(injectIntl(AssistantMessageComponentCore));
