// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

import { type IChatConversationLocalItem } from "../../model.js";
import { agentsSelector } from "../../store/messages/messagesSelectors.js";

type AgentChangeItemProps = {
    message: IChatConversationLocalItem;
};

export function AgentChangeItem({ message }: AgentChangeItemProps) {
    const agents = useSelector(agentsSelector);

    const { agentId } = message;
    const agent = agents?.find((a) => a.id === agentId);

    if (!agent) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__messages__agent-change">
            <div className="gd-gen-ai-chat__messages__agent-change__line" />
            <div className="gd-gen-ai-chat__messages__agent-change__label" data-testid="agent_change_label">
                <FormattedMessage id="gd.gen-ai.agent.switched" values={{ title: agent.title }} />
            </div>
            <div className="gd-gen-ai-chat__messages__agent-change__line" />
        </div>
    );
}
