// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { AssistantItemFeedback } from "./AssistantItemFeedback.js";
import { ConversationItemContents } from "./ConversationItemContents.js";
import { getItemState } from "./itemState.js";
import { type IChatConversationLocalItem } from "../../model.js";
import { ReasoningIcon } from "./contents/ReasoningIcon.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

type AssistantItemProps = {
    group: IChatMessagesGroup;
    message: IChatConversationLocalItem;
    isLast?: boolean;
};

export function AssistantItemComponent({ message, group, isLast }: AssistantItemProps) {
    const intl = useIntl();

    const messageState = getItemState(message);

    const classNames = cx(
        "gd-gen-ai-chat__messages__conversation",
        "gd-gen-ai-chat__messages__conversation--assistant",
        `gd-gen-ai-chat__messages__conversation--${message.content.type}`,
        messageState === "cancelled" && "gd-gen-ai-chat__messages__conversation--cancelled",
        isLast && "gd-gen-ai-chat__messages__conversation--isLast",
    );

    return (
        <div className={classNames} data-state={messageState}>
            <span className="gd-gen-ai-chat__visually__hidden">
                {intl.formatMessage({ id: "gd.gen-ai.message.label.assistant" })}
            </span>
            <ReasoningIcon content={message.content} />
            <ConversationItemContents
                role="assistant"
                message={message}
                isLoading={messageState === "loading"}
                isLast={isLast}
            />
            <AssistantItemFeedback group={group} message={message} isLast={isLast} />
        </div>
    );
}
