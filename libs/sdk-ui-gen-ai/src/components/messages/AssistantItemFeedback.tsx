// (C) 2024-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import type { IChatConversationLocalItem } from "../../model.js";
import { setUserFeedback } from "../../store/messages/messagesSlice.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

import { FeedbackPopup } from "./FeedbackPopup.js";
import { type SetUserFeedbackHandler, useUserFeedback } from "./useUserFeedback.js";

export interface IAssistantItemFeedbackProps {
    group: IChatMessagesGroup;
    message: IChatConversationLocalItem;
    isLast?: boolean;
}

export function AssistantItemFeedback({ message, group, isLast }: IAssistantItemFeedbackProps) {
    const intl = useIntl();
    const dispatch = useDispatch();

    const setUserFeedbackAction = useCallback<SetUserFeedbackHandler>(
        (payload) => {
            dispatch(setUserFeedback(payload));
        },
        [dispatch],
    );

    const { handlePositiveFeedbackClick, handleNegativeFeedbackClick, handleFeedbackSubmit } =
        useUserFeedback({ message, setUserFeedback: setUserFeedbackAction });

    if (group.type !== "assistant" || !message.complete) {
        return null;
    }
    if (message.content.type === "reasoning") {
        return null;
    }

    const thumbsUpLabel = intl.formatMessage({ id: "gd.gen-ai.feedback.like" });
    const thumbsDownLabel = intl.formatMessage({ id: "gd.gen-ai.feedback.dislike" });
    const type = message.feedback?.feedback;

    return (
        <div
            className={cx({
                "gd-gen-ai-chat__conversation__item__feedback": true,
                "gd-gen-ai-chat__conversation__item__feedback--assigned": type ? type !== "NONE" : false,
                "gd-gen-ai-chat__conversation__item__feedback--last": isLast,
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
                        isActive={type === "POSITIVE"}
                        onClick={handlePositiveFeedbackClick}
                        accessibilityConfig={{
                            ariaLabel: thumbsUpLabel,
                            ariaPressed: type === "POSITIVE" ? "true" : "false",
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
                                    isActive={type === "NEGATIVE" || opened}
                                    onClick={handleNegativeFeedbackClick}
                                    accessibilityConfig={{
                                        ariaLabel: thumbsDownLabel,
                                        ariaPressed: type === "NEGATIVE" ? "true" : "false",
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
    );
}
