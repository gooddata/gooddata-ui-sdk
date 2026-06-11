// (C) 2026 GoodData Corporation

import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { type IChatConversationLocalItem } from "../../model.js";
import { agentsSelector } from "../../store/messages/messagesSelectors.js";

const msgs = defineMessages({
    unknown: { id: "gd.gen-ai.agent.unknown" },
});

type AgentChangeItemProps = {
    message: IChatConversationLocalItem;
};

export function AgentChangeItem({ message }: AgentChangeItemProps) {
    const intl = useIntl();
    const agents = useSelector(agentsSelector);

    const { agentId } = message;
    const title = agents?.find((agent) => agent.id === agentId)?.title ?? intl.formatMessage(msgs.unknown);

    return (
        <div className="gd-gen-ai-chat__messages__agent-change">
            <div className="gd-gen-ai-chat__messages__agent-change__line" />
            <div className="gd-gen-ai-chat__messages__agent-change__label">
                <FormattedMessage id="gd.gen-ai.agent.switched" values={{ title }} />
            </div>
            <div className="gd-gen-ai-chat__messages__agent-change__line" />
        </div>
    );
}
