// (C) 2024-2026 GoodData Corporation

import { type IChatConversationLocalItem } from "../../model.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

type ToolItemProps = {
    message: IChatConversationLocalItem;
    groups: IChatMessagesGroup[];
    isLast?: boolean;
};

export function ToolItemComponent(_: ToolItemProps) {
    return null;

    //NOTE: For now we want to hide all tool calls but keep content for future use
    // const intl = useIntl();
    //
    // const messageState = getItemState(message);
    // const references = useToolsReferences(groups);
    //
    // const classNames = cx(
    //     "gd-gen-ai-chat__messages__conversation",
    //     "gd-gen-ai-chat__messages__conversation--tool",
    //     messageState === "cancelled" && "gd-gen-ai-chat__messages__conversation--cancelled",
    // );
    //
    // return (
    //     <div className={classNames} data-state={messageState}>
    //         <span className="gd-gen-ai-chat__visually__hidden">
    //             {intl.formatMessage({ id: "gd.gen-ai.message.label.tool" })}
    //         </span>
    //         <ConversationItemContents
    //             role="tool"
    //             isLast={isLast}
    //             message={message}
    //             references={references}
    //             isLoading={messageState === "loading"}
    //         />
    //     </div>
    // );
}
