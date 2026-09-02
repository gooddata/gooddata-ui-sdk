// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { type IChatConversationLocalItem, type TextContentObject } from "../../model.js";
import { settingsSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { useCustomization } from "../CustomizationContext.js";

export interface IAssistantItemSuggestionsProps {
    showSuggestions?: boolean;
    references?: TextContentObject[];
    message: IChatConversationLocalItem;
    type: "followUp" | "actions";
}

export function AssistantItemSuggestions({
    type,
    message,
    showSuggestions,
    references,
}: IAssistantItemSuggestionsProps) {
    const settings = useSelector(settingsSelector);
    const { FollowUpButtonsComponent, FollowUpQuestionComponent } = useCustomization();

    if (!showSuggestions || !settings?.enableAiAgenticSuggestions) {
        return null;
    }

    const content = message.content;
    if (content.type !== "multipart") {
        return null;
    }

    const suggestions = content.suggestions;
    if (!suggestions) {
        return null;
    }

    return (
        <>
            {type === "actions" ? (
                <FollowUpButtonsComponent message={message} suggestions={suggestions.actions ?? []} />
            ) : null}
            {suggestions.followUpQuestion && type === "followUp" ? (
                <FollowUpQuestionComponent
                    message={message}
                    question={suggestions.followUpQuestion}
                    references={references ?? []}
                />
            ) : null}
        </>
    );
}
