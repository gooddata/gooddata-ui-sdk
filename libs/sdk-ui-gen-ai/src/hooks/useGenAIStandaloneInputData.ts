// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import { agentSwitchingEnabledSelector } from "../store/chatWindow/chatWindowSelectors.js";
import {
    agentsSelector,
    conversationsLoadedSelector,
    selectedAgentIdSelector,
} from "../store/messages/messagesSelectors.js";
import { setSelectedAgentAction } from "../store/messages/messagesSlice.js";

/**
 * @public
 */
export function useGenAIStandaloneInputData() {
    const dispatch = useDispatch();
    const agents = useSelector(agentsSelector);
    const selectedAgentId = useSelector(selectedAgentIdSelector);
    const conversationsLoaded = useSelector(conversationsLoadedSelector);
    const agentSwitchingEnabled = useSelector(agentSwitchingEnabledSelector);

    const setSelectedAgent = useCallback(
        (agentId: string | undefined) => {
            dispatch(setSelectedAgentAction({ agentId }));
        },
        [dispatch],
    );

    return {
        agents,
        selectedAgentId,
        conversationsLoaded,
        agentSwitchingEnabled,
        setSelectedAgent,
    };
}
