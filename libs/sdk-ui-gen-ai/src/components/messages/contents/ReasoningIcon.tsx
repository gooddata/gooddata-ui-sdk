// (C) 2026 GoodData Corporation

import { UiIcon } from "@gooddata/sdk-ui-kit";

import { type IChatConversationErrorContent, type IChatConversationLocalContent } from "../../../model.js";

export interface IReasoningIconProps {
    content: IChatConversationLocalContent | IChatConversationErrorContent;
}

export function ReasoningIcon({ content }: IReasoningIconProps) {
    return (
        <div className="gd-gen-ai-chat__icon">
            {(() => {
                switch (content.type) {
                    case "toolCall":
                    case "toolResult":
                        return (
                            <div className="gd-gen-ai-chat__icon__special">
                                <UiIcon type="code" size={12} />
                            </div>
                        );
                    default:
                        return <div className="gd-gen-ai-chat__icon__point" />;
                }
            })()}
        </div>
    );
}
