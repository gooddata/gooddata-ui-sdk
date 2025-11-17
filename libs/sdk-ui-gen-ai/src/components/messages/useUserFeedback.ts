// (C) 2024-2025 GoodData Corporation

import { IFeedbackData } from "./FeedbackPopup.js";
import { AssistantMessage } from "../../model.js";
import { setUserFeedback } from "../../store/index.js";

/**
 * @internal
 */
export interface UseUserFeedbackProps {
    message: AssistantMessage;
    setUserFeedback: typeof setUserFeedback;
}

/**
 * @internal
 */
export interface UseUserFeedbackReturn {
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
export function useUserFeedback({ message, setUserFeedback }: UseUserFeedbackProps): UseUserFeedbackReturn {
    const handlePositiveFeedbackClick = () => {
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
    };

    const handleNegativeFeedbackClick = () => {
        if (message.feedback === "NEGATIVE") {
            // If already negative, toggle back to none
            setUserFeedback({
                assistantMessageId: message.localId,
                feedback: "NONE",
            });
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
