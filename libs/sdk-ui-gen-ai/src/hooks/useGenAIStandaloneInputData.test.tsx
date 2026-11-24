// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { type AgentCustomSkill } from "@gooddata/sdk-model";

import { type GenAIAgent } from "../model.js";
import {
    messagesSliceReducer,
    setAgentsAction,
    setSelectedAgentAction,
} from "../store/messages/messagesSlice.js";

import { useGenAIStandaloneInputData } from "./useGenAIStandaloneInputData.js";

const agents: GenAIAgent[] = [
    { id: "sales", title: "Sales", effectiveSkills: ["alert"] },
    {
        id: "support",
        title: "Support",
        effectiveSkills: ["alert", "anomaly_detection"],
        lastUsedAt: "2026-02-01T00:00:00Z",
    },
    { id: "unskilled", title: "No skills" },
];

function renderInputData({
    availableAgents = agents,
    selectedAgentId,
    requiredSkills,
}: {
    availableAgents?: GenAIAgent[];
    selectedAgentId?: string;
    requiredSkills?: AgentCustomSkill[];
} = {}) {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer },
        preloadedState: {
            messages: {
                ...messagesSliceReducer(undefined, { type: "test/init" }),
                agents: availableAgents,
                selectedAgentId,
                conversationsLoaded: true,
            },
        },
    });
    function Wrapper({ children }: PropsWithChildren) {
        return <Provider store={store}>{children}</Provider>;
    }
    return {
        ...renderHook(({ skills }) => useGenAIStandaloneInputData(skills), {
            wrapper: Wrapper,
            initialProps: { skills: requiredSkills },
        }),
        store,
    };
}

describe("useGenAIStandaloneInputData selection", () => {
    it.each([undefined, "retired", "sales", "support"])(
        "preserves the first-agent fallback for selection %s without synchronizing the store",
        (selectedAgentId) => {
            const { result, store } = renderInputData({ selectedAgentId });

            expect(result.current.selectedAgentId).toBe(selectedAgentId === "support" ? "support" : "sales");
            expect(result.current.agents).toEqual(agents);
            expect(result.current.conversationsLoaded).toBe(true);
            expect(store.getState().messages.selectedAgentId).toBe(selectedAgentId);
        },
    );

    it("requires every skill before resolving the selected agent", () => {
        const { result, rerender } = renderInputData({
            selectedAgentId: "sales",
            requiredSkills: ["alert", "anomaly_detection"],
        });

        expect(result.current.agents).toEqual([agents[1]]);
        expect(result.current.selectedAgentId).toBe("support");

        rerender({ skills: [] });
        expect(result.current.agents).toEqual(agents);
        expect(result.current.selectedAgentId).toBe("sales");
    });

    it("returns no selection when no agent matches the required skills", () => {
        const { result } = renderInputData({ availableAgents: [agents[2]], requiredSkills: ["alert"] });

        expect(result.current.agents).toEqual([]);
        expect(result.current.selectedAgentId).toBeUndefined();
    });

    it("handles unresolved, empty, and newly loaded agent lists without dispatching a default", () => {
        const { result, store } = renderInputData();

        act(() => store.dispatch(setAgentsAction({ agents: undefined })));
        expect(result.current.agents).toBeUndefined();
        expect(result.current.selectedAgentId).toBeUndefined();

        act(() => store.dispatch(setAgentsAction({ agents: [] })));
        expect(result.current.agents).toEqual([]);
        expect(result.current.selectedAgentId).toBeUndefined();

        act(() => store.dispatch(setAgentsAction({ agents })));
        expect(result.current.selectedAgentId).toBe("sales");
        expect(store.getState().messages.selectedAgentId).toBeUndefined();
    });

    it("dispatches explicit selection and clearing through the existing action", () => {
        const { result, store } = renderInputData();

        act(() => result.current.setSelectedAgent("support"));
        expect(store.getState().messages.selectedAgentId).toBe("support");
        expect(result.current.selectedAgentId).toBe("support");

        act(() => result.current.setSelectedAgent(undefined));
        expect(store.getState().messages.selectedAgentId).toBeUndefined();
        expect(result.current.selectedAgentId).toBe("sales");

        act(() => store.dispatch(setSelectedAgentAction({ agentId: "retired" })));
        expect(result.current.selectedAgentId).toBe("sales");
    });
});
