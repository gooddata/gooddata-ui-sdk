// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { type IChatConversationLocalItem } from "../../model.js";
import { agentSwitchingActiveSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { type RootState } from "../../store/types.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

import { AgentChangeItem } from "./AgentChangeItem.js";

type SystemItemProps = {
    groups: [IChatMessagesGroup | undefined, IChatMessagesGroup];
    message: IChatConversationLocalItem;
};

export function SystemItemComponent({ message }: SystemItemProps) {
    const agentSwitchingActive = useSelector((state: RootState) => agentSwitchingActiveSelector(state));

    if (message.agentId !== undefined && agentSwitchingActive) {
        return <AgentChangeItem message={message} />;
    }

    return null;
}
