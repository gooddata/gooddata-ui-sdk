// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";

import { type AgentCustomSkill } from "@gooddata/sdk-model";

import {
    agentsSelector,
    conversationsLoadedSelector,
    selectedAgentIdSelector,
} from "../store/messages/messagesSelectors.js";
import { setSelectedAgentAction } from "../store/messages/messagesSlice.js";

/**
 * @public
 */
export function useGenAIStandaloneInputData(requiredSkills?: AgentCustomSkill[]) {
    const dispatch = useDispatch();
    const agentsList = useSelector(agentsSelector);
    const currentAgentId = useSelector(selectedAgentIdSelector);
    const conversationsLoaded = useSelector(conversationsLoadedSelector);

    const setSelectedAgent = useCallback(
        (agentId: string | undefined) => {
            dispatch(setSelectedAgentAction({ agentId }));
        },
        [dispatch],
    );

    const agents = useMemo(() => {
        if (requiredSkills) {
            return agentsList?.filter((agent) => {
                return requiredSkills.every((skill) => {
                    return agent?.effectiveSkills?.includes(skill);
                });
            });
        }
        return agentsList;
    }, [requiredSkills, agentsList]);

    const selectedAgentId = agents?.find((agent) => agent.id === currentAgentId)
        ? currentAgentId
        : agents?.[0]?.id;

    return {
        agents,
        selectedAgentId,
        conversationsLoaded,
        setSelectedAgent,
    };
}
