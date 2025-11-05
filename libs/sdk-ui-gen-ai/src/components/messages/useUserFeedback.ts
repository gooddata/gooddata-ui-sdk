// (C) 2024-2025 GoodData Corporation

import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { IFeedbackData } from "./FeedbackPopup.js";
import { AssistantMessage } from "../../model.js";
import { clearUserFeedbackError, setUserFeedback } from "../../store/index.js";

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
    const dispatch = useDispatch();
    const { addSuccess, addError } = useToastMessage();

    // Watch for feedback errors and show error toast
    useEffect(() => {
        if (message.feedbackError) {
            addError({ id: "gd.gen-ai.feedback.error" });
            // Clear the error after showing the toast
            dispatch(clearUserFeedbackError({ assistantMessageId: message.localId }));
        }
    }, [message.feedbackError, addError, dispatch, message.localId]);

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
        let userTextFeedback = feedbackData.reason;
        if (feedbackData.reason === "other" && feedbackData.description.trim()) {
            userTextFeedback = feedbackData.description.trim();
        }

        setUserFeedback({
            assistantMessageId: message.localId,
            feedback: "NEGATIVE",
            userTextFeedback,
        });

        // Show success notification
        addSuccess({ id: "gd.gen-ai.feedback.success" });
    };

    return {
        handlePositiveFeedbackClick,
        handleNegativeFeedbackClick,
        handleFeedbackSubmit,
    };
}
