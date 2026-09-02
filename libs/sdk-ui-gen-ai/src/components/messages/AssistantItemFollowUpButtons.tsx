// (C) 2026 GoodData Corporation

import { useDispatch, useSelector } from "react-redux";

import { type IChatSuggestion } from "@gooddata/sdk-backend-spi";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, makeUserItem } from "../../model.js";
import { agentSwitchingActiveSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { agentsAvailableSelector } from "../../store/messages/messagesSelectors.js";
import { newMessageAction } from "../../store/messages/messagesSlice.js";

/**
 * @internal
 */
export interface IAssistantItemFollowUpButtonsProps {
    message: IChatConversationLocalItem;
    suggestions: IChatSuggestion[];
}

/**
 * @internal
 */
export function AssistantItemFollowUpButtons({ suggestions }: IAssistantItemFollowUpButtonsProps) {
    const dispatch = useDispatch();
    const agentSwitchingActive = useSelector(agentSwitchingActiveSelector);
    const agentsAvailable = useSelector(agentsAvailableSelector);
    const isDisabled = agentSwitchingActive && agentsAvailable !== true;

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__conversation__visualization__suggestions">
            {suggestions.map((suggestion) => (
                <UiButton
                    key={suggestion.label}
                    label={suggestion.label}
                    variant="secondary"
                    size="small"
                    isDisabled={isDisabled}
                    onClick={() => {
                        dispatch(newMessageAction(makeUserItem({ type: "text", text: suggestion.query })));
                    }}
                    tooltip={suggestion.query}
                />
            ))}
        </div>
    );
}
