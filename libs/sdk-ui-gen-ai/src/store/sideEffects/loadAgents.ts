// (C) 2026 GoodData Corporation

import type { PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAgent, isIdentifierRef } from "@gooddata/sdk-model";

import { type GenAIAgent } from "../../model.js";
import { agentSwitchingActiveSelector } from "../chatWindow/chatWindowSelectors.js";
import { agentsStateSelector } from "../messages/messagesSelectors.js";
import { setAgentsAction, setAgentsLoadingAction } from "../messages/messagesSlice.js";
import { type RootState } from "../types.js";

/**
 * Load enabled agents from the backend.
 * @internal
 */
export function* loadAgents({ payload: { isOpen } }: PayloadAction<{ isOpen: boolean }>) {
    if (!isOpen) {
        return;
    }

    yield call(loadAgentsInternal);
}

/**
 * Load enabled agents from the backend.
 * @internal
 */
export function* loadAgentsInternal() {
    const agentSwitchingActive: boolean = yield select(agentSwitchingActiveSelector);
    if (!agentSwitchingActive) {
        return;
    }

    const state: RootState["messages"]["agentsState"] = yield select(agentsStateSelector);
    if (state === "loaded" || state === "loading") {
        return;
    }

    try {
        yield put(setAgentsLoadingAction());

        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const query = backend
            .workspace(workspace)
            .agents()
            .getAgentsQuery()
            .withFilter({ isPreview: false })
            .withSorting(["name,asc"]);

        const agents: IAgent[] = yield call([query, "queryAll"]);
        yield put(
            setAgentsAction({
                agents: agents.map(agentToOption).filter((agent) => !!agent.id),
            }),
        );
    } catch (e) {
        console.error("Failed to load agents", e);
        yield put(
            setAgentsAction({
                // Treat load failure as no usable agents so sending is blocked instead of loading forever.
                agents: [],
            }),
        );
    }
}

function agentToOption(agent: IAgent): GenAIAgent {
    const id = isIdentifierRef(agent.ref) ? agent.ref.identifier : "";

    return {
        id,
        title: agent.name || id,
        description: agent.description,
        modifiedAt: agent.modifiedAt,
        lastUsedAt: agent.lastUsedAt,
    };
}
