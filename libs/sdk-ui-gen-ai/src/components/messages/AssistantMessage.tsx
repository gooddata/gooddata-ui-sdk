// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { FeedbackPopup } from "./FeedbackPopup.js";
import { MessageContents } from "./MessageContents.js";
import { getAssistantMessageState } from "./messageState.js";
import { useUserFeedback } from "./useUserFeedback.js";
import { AssistantMessage } from "../../model.js";
import { setUserFeedback } from "../../store/index.js";

type AssistantMessageProps = {
    message: AssistantMessage;
    setUserFeedback: typeof setUserFeedback;
    isLast?: boolean;
};

function AssistantMessageComponentCore({ message, setUserFeedback, isLast }: AssistantMessageProps) {
    const intl = useIntl();

    const { handlePositiveFeedbackClick, handleNegativeFeedbackClick, handleFeedbackSubmit } =
        useUserFeedback({ message, setUserFeedback });

    const messageState = getAssistantMessageState(message);
    const thumbsUpLabel = intl.formatMessage({ id: "gd.gen-ai.feedback.like" });
    const thumbsDownLabel = intl.formatMessage({ id: "gd.gen-ai.feedback.dislike" });

    return (
        <div
            className={cx(
                "gd-gen-ai-chat__messages__message",
                "gd-gen-ai-chat__messages__message--assistant",
                messageState === "cancelled" && "gd-gen-ai-chat__messages__message--cancelled",
            )}
            data-state={messageState}
        >
            <span className="gd-gen-ai-chat__visually__hidden">
                {intl.formatMessage({ id: "gd.gen-ai.message.label.assistant" })}
            </span>
            <div className="gd-gen-ai-chat__messages__message__contents_wrap">
                <MessageContents
                    useMarkdown
                    content={message.content}
                    isLoading={messageState === "loading"}
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
                                    size="small"
                                    isActive={message.feedback === "POSITIVE"}
                                    onClick={handlePositiveFeedbackClick}
                                    accessibilityConfig={{
                                        ariaLabel: thumbsUpLabel,
                                        ariaPressed: message.feedback === "POSITIVE" ? "true" : "false",
                                    }}
                                />
                            }
                            content={thumbsUpLabel}
                        />
                        <FeedbackPopup
                            anchor={(opened) => {
                                return (
                                    <UiTooltip
                                        triggerBy={["focus", "hover"]}
                                        arrowPlacement="bottom"
                                        anchor={
                                            <UiIconButton
                                                icon="thumbsDown"
                                                variant="tertiary"
                                                size="small"
                                                isActive={message.feedback === "NEGATIVE" || opened}
                                                onClick={handleNegativeFeedbackClick}
                                                accessibilityConfig={{
                                                    ariaLabel: thumbsDownLabel,
                                                    ariaPressed:
                                                        message.feedback === "NEGATIVE" ? "true" : "false",
                                                }}
                                            />
                                        }
                                        content={thumbsDownLabel}
                                    />
                                );
                            }}
                            onSubmit={handleFeedbackSubmit}
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
