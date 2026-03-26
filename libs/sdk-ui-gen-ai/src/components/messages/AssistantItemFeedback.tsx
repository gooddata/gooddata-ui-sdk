// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { FeedbackPopup } from "./FeedbackPopup.js";
import { useUserFeedback } from "./useUserFeedback.js";
import type { IChatConversationLocalItem } from "../../model.js";
import { setUserFeedback } from "../../store/messages/messagesSlice.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

export interface IAssistantItemFeedbackProps {
    group: IChatMessagesGroup;
    message: IChatConversationLocalItem;
    setUserFeedback: typeof setUserFeedback;
    isLast?: boolean;
}

function AssistantItemFeedbackCore({ message, group, isLast, setUserFeedback }: IAssistantItemFeedbackProps) {
    const intl = useIntl();

    const { handlePositiveFeedbackClick, handleNegativeFeedbackClick, handleFeedbackSubmit } =
        useUserFeedback({ message, setUserFeedback });

    if (group.type !== "assistant" || !message.complete) {
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

const mapDispatchToProps = {
    setUserFeedback,
};

export const AssistantItemFeedback: any = connect(null, mapDispatchToProps)(AssistantItemFeedbackCore);
