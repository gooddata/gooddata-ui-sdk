// (C) 2024 GoodData Corporation

import { IGenAIChatEvaluation } from "@gooddata/sdk-model";
import {
    AssistantMessage,
    makeAssistantErrorMessage,
    makeAssistantSearchCreateMessage,
} from "../../../model.js";

/**
 * Converts evaluation result to a message.
 */
export const evalToMessage = (evalResult: IGenAIChatEvaluation): AssistantMessage => {
    if (evalResult.invalidQuestion) {
        // Convert to the error message
        const message = evalResult.createdVisualizations?.reasoning || "Invalid question. Try again.";

        return makeAssistantErrorMessage(message, evalResult.foundObjects);
    }

    return makeAssistantSearchCreateMessage(evalResult);
};
