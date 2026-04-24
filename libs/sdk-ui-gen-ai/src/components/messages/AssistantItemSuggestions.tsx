// (C) 2026 GoodData Corporation

import { useDispatch } from "react-redux";

import { type IChatSuggestionsItem } from "@gooddata/sdk-backend-spi";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { makeUserItem } from "../../model.js";
import { newMessageAction } from "../../store/messages/messagesSlice.js";

export interface IAssistantItemSuggestionsProps {
    showSuggestions?: boolean;
    suggestions: IChatSuggestionsItem | undefined;
    type: "followUp" | "actions";
}

export function AssistantItemSuggestions({
    type,
    suggestions,
    showSuggestions,
}: IAssistantItemSuggestionsProps) {
    const dispatch = useDispatch();

    if (!suggestions || !showSuggestions) {
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
            {suggestions.followUp && type === "followUp" ? (
                <div className="gd-gen-ai-chat__conversation__visualization__followUp">
                    {suggestions.followUp}
                </div>
            ) : null}
        </>
    );
}
