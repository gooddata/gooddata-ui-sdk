// (C) 2024-2025 GoodData Corporation

import React, { useState, useRef } from "react";
import cx from "classnames";
import { Button, Icon, Input } from "@gooddata/sdk-ui-kit";
import { defineMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { connect } from "react-redux";

import { AssistantMessage, isErrorContents } from "../../model.js";
import { setUserFeedback } from "../../store/index.js";

import { MessageContents } from "./MessageContents.js";
import { AgentIcon } from "./AgentIcon.js";
import { SendIcon } from "../SendIcon.js";
import { DefaultFeedbackAnimation } from "../DefaultFeedbackAnimation.js";

type AssistantMessageProps = {
    message: AssistantMessage;
    setUserFeedback: typeof setUserFeedback;
    isLast?: boolean;
    onFeedbackCallback?: () => void;
    feedbackAnimationComponent?: React.ComponentType<{
        onComplete: () => void;
        triggerElement?: HTMLElement | null;
    }>;
};

const labelMessage = defineMessage({ id: "gd.gen-ai.assistant-icon" });
const feedbackPlaceholderMessage = defineMessage({ id: "gd.gen-ai.feedback.placeholder" });

const AssistantMessageComponentCore: React.FC<AssistantMessageProps & WrappedComponentProps> = ({
    message,
    setUserFeedback,
    isLast,
    onFeedbackCallback,
    feedbackAnimationComponent,
    intl,
}) => {
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [showFeedbackAnimation, setShowFeedbackAnimation] = useState(false);
    const [animationTriggerElement, setAnimationTriggerElement] = useState<HTMLElement | null>(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Refs for the feedback buttons
    const likeButtonRef = useRef<HTMLButtonElement>(null);
    const dislikeButtonRef = useRef<HTMLButtonElement>(null);
    const sendButtonRef = useRef<HTMLButtonElement>(null);

    // Use the provided animation component or default to FeedbackAnimationExample
    const FeedbackAnimationComponent = feedbackAnimationComponent || DefaultFeedbackAnimation;

    const classNames = cx(
        "gd-gen-ai-chat__messages__message",
        "gd-gen-ai-chat__messages__message--assistant",
        message.cancelled && "gd-gen-ai-chat__messages__message--cancelled",
    );
    const hasError = message.content.some(isErrorContents);

    const triggerFeedbackAnimation = (triggerElement: HTMLElement | null = null) => {
        // Always show animation since we have a default component
        setAnimationTriggerElement(triggerElement);
        setShowFeedbackAnimation(true);
        onFeedbackCallback?.();
    };

    const handleAnimationComplete = () => {
        setShowFeedbackAnimation(false);
        setAnimationTriggerElement(null);
    };

    const handleDislikeClick = () => {
        // Prevent interaction if feedback has already been submitted
        if (feedbackSubmitted) {
            return;
        }

        if (message.feedback === "NEGATIVE" && showFeedbackInput) {
            // If already negative and input is showing, hide input but keep negative feedback
            setShowFeedbackInput(false);
            setFeedbackText("");
        } else if (message.feedback === "NEGATIVE" && !showFeedbackInput) {
            // If already negative but input is hidden, show input
            setShowFeedbackInput(true);
        } else if (message.feedback !== "NEGATIVE") {
            // If not negative, set to negative and show input
            setUserFeedback({
                assistantMessageId: message.localId,
                feedback: "NEGATIVE",
            });
            setShowFeedbackInput(true);
        }
        triggerFeedbackAnimation(dislikeButtonRef.current);
    };

    const handleLikeClick = () => {
        // Prevent interaction if feedback has already been submitted
        if (feedbackSubmitted) {
            return;
        }

        setUserFeedback({
            assistantMessageId: message.localId,
            feedback: message.feedback === "POSITIVE" ? "NONE" : "POSITIVE",
        });

        // Mark feedback as submitted when giving positive feedback
        if (message.feedback !== "POSITIVE") {
            setFeedbackSubmitted(true);
        }

        triggerFeedbackAnimation(likeButtonRef.current);
    };

    const handleFeedbackSubmit = () => {
        // Capture the button position before removing the input
        const triggerElement = sendButtonRef.current;

        // Mark feedback as submitted to prevent further changes
        setFeedbackSubmitted(true);

        // Trigger animation first
        triggerFeedbackAnimation(triggerElement);

        // Delay removing the input to allow animation to start
        setTimeout(() => {
            // TODO: This will need to be extended to support text feedback in the store
            // For now, we'll just close the input and call the callback
            setShowFeedbackInput(false);
            setFeedbackText("");
        }, 650); // Delay to ensure animation starts
    };

    const handleFeedbackCancel = () => {
        // Same as submit for now - just close the input
        handleFeedbackSubmit();
    };

    const handleFeedbackChange = (value: string | number) => {
        setFeedbackText(String(value));
    };

    const handleEnterKeyPress = () => {
        if (feedbackText.trim()) {
            handleFeedbackSubmit();
        }
    };

    const handleEscKeyPress = () => {
        handleFeedbackCancel();
    };

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
                    <div>
                        <div
                            className={cx({
                                "gd-gen-ai-chat__messages__feedback": true,
                                "gd-gen-ai-chat__messages__feedback--assigned": message.feedback !== "NONE",
                                "gd-gen-ai-chat__messages__feedback--disabled": feedbackSubmitted,
                            })}
                        >
                            <Button
                                ref={likeButtonRef}
                                className={cx({
                                    "gd-gen-ai-chat__messages__feedback__button": true,
                                    "gd-gen-ai-chat__messages__feedback__button--positive":
                                        message.feedback === "POSITIVE",
                                })}
                                onClick={handleLikeClick}
                                disabled={feedbackSubmitted}
                                accessibilityConfig={{
                                    ariaLabel: intl.formatMessage({ id: "gd.gen-ai.feedback.like" }),
                                }}
                            >
                                <Icon.ThumbsUp />
                            </Button>
                            <Button
                                ref={dislikeButtonRef}
                                className={cx({
                                    "gd-gen-ai-chat__messages__feedback__button": true,
                                    "gd-gen-ai-chat__messages__feedback__button--negative":
                                        message.feedback === "NEGATIVE",
                                })}
                                type="button"
                                onClick={handleDislikeClick}
                                disabled={feedbackSubmitted}
                                accessibilityConfig={{
                                    ariaLabel: intl.formatMessage({ id: "gd.gen-ai.feedback.dislike" }),
                                }}
                            >
                                <Icon.ThumbsDown />
                            </Button>
                        </div>
                        {showFeedbackInput ? (
                            <div className="gd-gen-ai-chat__messages__feedback__input">
                                <div className="gd-gen-ai-chat__messages__feedback__input__wrapper">
                                    <Input
                                        value={feedbackText}
                                        onChange={handleFeedbackChange}
                                        placeholder={intl.formatMessage(feedbackPlaceholderMessage)}
                                        maxlength={500}
                                        onEnterKeyPress={handleEnterKeyPress}
                                        onEscKeyPress={handleEscKeyPress}
                                        className="gd-gen-ai-chat__messages__feedback__input__field"
                                    />
                                    <Button
                                        ref={sendButtonRef}
                                        className="gd-gen-ai-chat__messages__feedback__input__send"
                                        onClick={handleFeedbackSubmit}
                                        disabled={!feedbackText.trim()}
                                        accessibilityConfig={{
                                            ariaLabel: intl.formatMessage({ id: "gd.gen-ai.feedback.send" }),
                                        }}
                                    >
                                        <SendIcon />
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
            {showFeedbackAnimation && FeedbackAnimationComponent ? (
                <FeedbackAnimationComponent
                    onComplete={handleAnimationComplete}
                    triggerElement={animationTriggerElement}
                />
            ) : null}
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
