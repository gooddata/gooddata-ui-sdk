// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import { agentSwitchingActiveSelector, settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { selectedAgentIdSelector, threadIdSelector } from "../messages/messagesSelectors.js";

import { onThreadClear } from "./onThreadClear.js";

const RESET_CONVERSATION = { id: "conv-new", createdAt: "", updatedAt: "", title: "" };

// Drives the saga without redux-saga's runtime. SELECT effects are answered from a per-selector
// queue, GET_CONTEXT from a map, a yielded sub-generator is delegated to, and the RACE that wraps
// the reset call is resolved as if the call won. Returns the args the reset call was made with.
function runOnThreadClear({
    settings,
    selects,
    isPreview,
}: {
    settings: Record<string, boolean>;
    selects: Map<unknown, unknown[]>;
    isPreview?: boolean;
}): { resetArgs: unknown[]; puts: PayloadAction[] } {
    const thread = { reset: () => Promise.resolve(RESET_CONVERSATION) };
    const backend = {
        workspace: () => ({
            genAI: () => ({
                getChatConversations: () => ({ getConversationThread: () => thread }),
            }),
        }),
    };
    const contexts = new Map<unknown, unknown>([
        ["backend", backend],
        ["workspace", "ws-1"],
        ["isPreview", isPreview],
    ]);
    const queues = new Map<unknown, unknown[]>(selects);
    queues.set(settingsSelector, [settings]);

    const puts: PayloadAction[] = [];
    let resetArgs: unknown[] = [];

    // Loosely typed so the manual driver can feed effect results into next() regardless of the
    // saga's inferred effect types.
    function drive(gen: Generator<any, void, unknown>): void {
        let next = gen.next();
        while (!next.done) {
            const effect = next.value as { type?: string; payload?: any; next?: unknown };
            if (typeof effect?.next === "function") {
                drive(effect as unknown as Generator<any, void, unknown>);
                next = gen.next();
            } else if (effect.type === "GET_CONTEXT") {
                next = gen.next(contexts.get(effect.payload));
            } else if (effect.type === "SELECT") {
                const queue = queues.get(effect.payload.selector);
                if (!queue || queue.length === 0) {
                    throw new Error("Unexpected SELECT with no queued value");
                }
                next = gen.next(queue.shift());
            } else if (effect.type === "RACE") {
                resetArgs = effect.payload[0].payload.args;
                next = gen.next([RESET_CONVERSATION, undefined]);
            } else if (effect.type === "PUT") {
                puts.push(effect.payload.action);
                next = gen.next();
            } else {
                next = gen.next();
            }
        }
    }

    drive(onThreadClear() as Generator<any, void, unknown>);
    return { resetArgs, puts };
}

const SINGLE_CONVERSATION = {
    enableAiAgenticConversations: true,
    enableAiAgenticMultiConversations: false,
};

describe("onThreadClear", () => {
    it("pins the selected agent on the conversation it creates", () => {
        const { resetArgs, puts } = runOnThreadClear({
            settings: SINGLE_CONVERSATION,
            selects: new Map<unknown, unknown[]>([
                [threadIdSelector, ["conv-old"]],
                [agentSwitchingActiveSelector, [true]],
                [selectedAgentIdSelector, ["agent-a"]],
            ]),
        });

        expect(resetArgs).toEqual([{ agentId: "agent-a" }]);
        expect(puts.map((a) => a.type)).toContain("messages/clearConversationSuccessAction");
    });

    it("leaves the agent to the backend when agent switching is not active", () => {
        const { resetArgs } = runOnThreadClear({
            settings: SINGLE_CONVERSATION,
            isPreview: true,
            selects: new Map<unknown, unknown[]>([
                [threadIdSelector, ["conv-old"]],
                [agentSwitchingActiveSelector, [false]],
            ]),
        });

        expect(resetArgs[0]).toBeUndefined();
    });

    it("leaves the agent to the backend when no agent is selected yet", () => {
        const { resetArgs } = runOnThreadClear({
            settings: SINGLE_CONVERSATION,
            selects: new Map<unknown, unknown[]>([
                [threadIdSelector, ["conv-old"]],
                [agentSwitchingActiveSelector, [true]],
                [selectedAgentIdSelector, [undefined]],
            ]),
        });

        expect(resetArgs[0]).toBeUndefined();
    });
});
