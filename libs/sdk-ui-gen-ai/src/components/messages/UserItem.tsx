// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IChatConversationLocalItem } from "../../model.js";
import { useToolsReferences } from "../completion/useToolsReferences.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

import { ConversationItemContents } from "./ConversationItemContents.js";
import { getItemState } from "./itemState.js";

type UserItemProps = {
    message: IChatConversationLocalItem;
    groups: [IChatMessagesGroup | undefined, IChatMessagesGroup];
    isLast?: boolean;
};

export function UserItemComponent({ message, isLast, groups }: UserItemProps) {
    const intl = useIntl();

    const messageState = getItemState(message);
    const references = useToolsReferences(groups);

    const classNames = cx(
        "gd-gen-ai-chat__messages__conversation",
        "gd-gen-ai-chat__messages__conversation--user",
        messageState === "cancelled" && "gd-gen-ai-chat__messages__conversation--cancelled",
    );

    return (
        <div className={classNames} data-state={messageState}>
            <span className="gd-gen-ai-chat__visually__hidden">
                {intl.formatMessage({ id: "gd.gen-ai.message.label.user" })}
            </span>
            <ConversationItemContents
                role="user"
                message={message}
                references={references}
                isLoading={messageState === "loading"}
                isLast={isLast}
            />
        </div>
    );
}
