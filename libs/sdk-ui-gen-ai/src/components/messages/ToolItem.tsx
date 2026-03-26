// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { ConversationItemContents } from "./ConversationItemContents.js";
import { getItemState } from "./itemState.js";
import { type IChatConversationLocalItem } from "../../model.js";

type ToolItemProps = {
    message: IChatConversationLocalItem;
    isLast?: boolean;
};

export function ToolItemComponent({ message, isLast }: ToolItemProps) {
    const intl = useIntl();

    const messageState = getItemState(message);

    const classNames = cx(
        "gd-gen-ai-chat__messages__conversation",
        "gd-gen-ai-chat__messages__conversation--tool",
        messageState === "cancelled" && "gd-gen-ai-chat__messages__conversation--cancelled",
    );

    return (
        <div className={classNames} data-state={messageState}>
            <span className="gd-gen-ai-chat__visually__hidden">
                {intl.formatMessage({ id: "gd.gen-ai.message.label.tool" })}
            </span>
            <ConversationItemContents
                role="tool"
                isLast={isLast}
                message={message}
                isLoading={messageState === "loading"}
            />
        </div>
    );
}
