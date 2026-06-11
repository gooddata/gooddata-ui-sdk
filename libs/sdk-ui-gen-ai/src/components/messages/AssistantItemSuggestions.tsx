// (C) 2026 GoodData Corporation

import { useDispatch, useSelector } from "react-redux";

import { UiButton } from "@gooddata/sdk-ui-kit";

import {
    type IChatConversationErrorContent,
    type IChatConversationLocalContent,
    type IChatConversationSystemContent,
    makeUserItem,
} from "../../model.js";
import {
    agentSwitchingActiveSelector,
    settingsSelector,
} from "../../store/chatWindow/chatWindowSelectors.js";
import { agentsAvailableSelector } from "../../store/messages/messagesSelectors.js";
import { newMessageAction } from "../../store/messages/messagesSlice.js";

export interface IAssistantItemSuggestionsProps {
    showSuggestions?: boolean;
    content: IChatConversationLocalContent | IChatConversationErrorContent | IChatConversationSystemContent;
    type: "followUp" | "actions";
}

export function AssistantItemSuggestions({ type, content, showSuggestions }: IAssistantItemSuggestionsProps) {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const agentSwitchingActive = useSelector(agentSwitchingActiveSelector);
    const agentsAvailable = useSelector(agentsAvailableSelector);
    const isDisabled = agentSwitchingActive && agentsAvailable !== true;

    if (!showSuggestions || !settings?.enableAiAgenticSuggestions) {
        return null;
    }

    if (content.type !== "multipart") {
        return null;
    }

    const suggestions = content.suggestions;
    if (!suggestions) {
        return null;
    }

    return (
        <>
            {suggestions.actions && type === "actions" ? (
                <div className="gd-gen-ai-chat__conversation__visualization__suggestions">
                    {suggestions.actions?.map((suggestion) => (
                        <UiButton
                            key={suggestion.label}
                            label={suggestion.label}
                            variant="secondary"
                            size="small"
                            isDisabled={isDisabled}
                            onClick={() => {
                                dispatch(
                                    newMessageAction(makeUserItem({ type: "text", text: suggestion.query })),
                                );
                            }}
                            tooltip={suggestion.query}
                        />
                    ))}
                </div>
            ) : null}
            {suggestions.followUpQuestion && type === "followUp" ? (
                <div className="gd-gen-ai-chat__conversation__visualization__followUp">
                    {suggestions.followUpQuestion}
                </div>
            ) : null}
        </>
    );
}
