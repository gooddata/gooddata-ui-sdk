// (C) 2024-2026 GoodData Corporation

import { isChatConversationItem } from "@gooddata/sdk-backend-spi";

import { type IFeedbackData } from "./FeedbackPopup.js";
import { type AssistantMessage, type IChatConversationLocalItem } from "../../model.js";
import { type setUserFeedback } from "../../store/messages/messagesSlice.js";

/**
 * @internal
 */
export interface IUseUserFeedbackProps {
    message: AssistantMessage | IChatConversationLocalItem;
    setUserFeedback: typeof setUserFeedback;
}

/**
 * @internal
 */
export interface IUseUserFeedbackReturn {
    handlePositiveFeedbackClick: () => void;
    handleNegativeFeedbackClick: () => void;
    handleFeedbackSubmit: (feedbackData: IFeedbackData) => void;
}

/**
 * Custom hook to manage user feedback functionality for assistant messages.
 * Handles positive/negative feedback clicks and feedback submission.
 *
 * @internal
 */
export function useUserFeedback({ message, setUserFeedback }: IUseUserFeedbackProps): IUseUserFeedbackReturn {
    const handlePositiveFeedbackClick = () => {
        if (isChatConversationItem(message)) {
            if (message.feedback?.feedback === "POSITIVE") {
                // If already positive, toggle back to none
                setUserFeedback({
                    assistantMessageId: message.localId,
                    feedback: "NONE",
                });
            } else {
                // Set positive feedback
                setUserFeedback({
                    assistantMessageId: message.localId,
                    feedback: "POSITIVE",
                });
            }
        } else {
            if (message.feedback === "POSITIVE") {
                // If already positive, toggle back to none
                setUserFeedback({
                    assistantMessageId: message.localId,
                    feedback: "NONE",
                });
            } else {
                // Set positive feedback
                setUserFeedback({
                    assistantMessageId: message.localId,
                    feedback: "POSITIVE",
                });
            }
        }
    };

    const handleNegativeFeedbackClick = () => {
        if (isChatConversationItem(message)) {
            if (message.feedback?.feedback === "NEGATIVE") {
                // If already negative, toggle back to none
                setUserFeedback({
                    assistantMessageId: message.localId,
                    feedback: "NONE",
                });
            }
        } else {
            if (message.feedback === "NEGATIVE") {
                // If already negative, toggle back to none
                setUserFeedback({
                    assistantMessageId: message.localId,
                    feedback: "NONE",
                });
            }
        }
        // Note: If not negative, the popup will be shown automatically by UiPopover when anchor is clicked
    };

    const handleFeedbackSubmit = (feedbackData: IFeedbackData) => {
        // Construct userTextFeedback from the feedback data
        let userTextFeedback = feedbackData.reason.join(", ");
        if (feedbackData.reason.includes("other") && feedbackData.description.trim()) {
            userTextFeedback = feedbackData.description.trim();
        }

        setUserFeedback({
            assistantMessageId: message.localId,
            feedback: "NEGATIVE",
            userTextFeedback,
        });
    };

    return {
        handlePositiveFeedbackClick,
        handleNegativeFeedbackClick,
        handleFeedbackSubmit,
    };
}
