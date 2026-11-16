// (C) 2026 GoodData Corporation

import { type Action } from "redux";
import { runSaga, stdChannel } from "redux-saga";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type AdOpenInsightCommandData, GdcAdCommandType, GdcProductName } from "@gooddata/sdk-embedding";

import { adoptHostBackend, resetBackend } from "../../backend.js";
import { initialState } from "../../reducers/initial_state.js";
import { withRoot } from "../../tests/state_builder.test.helpers.js";
import { commandReceived } from "../actions/command_received_actions.js";
import { openInsightRequested } from "../actions/open_insight_actions.js";

import { watchCommandReceived } from "./command_received_saga.js";

const isUrlValid = vi.fn();

// The tests run with `isolate: false`: another test file can load backend.js before this one, so a
// `vi.mock` of it does not apply. Adopt a fake backend instead.
function adoptFakeBackend() {
    adoptHostBackend({
        instance: {
            organization: () => ({ securitySettings: () => ({ isUrlValid }) }),
        } as unknown as IAnalyticalBackend,
    });
}

const ORIGIN = "https://embedder.example.com";

function openInsightCommand(insightId: string): AdOpenInsightCommandData {
    return {
        gdc: {
            product: GdcProductName.ANALYTICAL_DESIGNER,
            event: {
                name: GdcAdCommandType.OpenInsight,
                data: { projectId: "", insightId },
                contextId: "ctx-1",
            },
        },
    };
}

const state = withRoot(initialState, { featureFlags: { enableEmbeddingOriginValidation: true } });

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Runs the real receiver saga, because redux-saga-test-plan keeps every dispatched action until the
 * saga takes it and so cannot show the order in which the saga handles the commands.
 */
describe("watchCommandReceived command queue", () => {
    beforeEach(() => {
        adoptFakeBackend();
    });

    afterEach(() => {
        resetBackend();
        vi.clearAllMocks();
    });

    it("handles the commands one by one in the order they arrived", async () => {
        const resolveOriginChecks: Array<(valid: boolean) => void> = [];
        isUrlValid.mockImplementation(
            () =>
                new Promise<boolean>((resolve) => {
                    resolveOriginChecks.push(resolve);
                }),
        );

        const channel = stdChannel();
        const dispatched: Action[] = [];
        const task = runSaga(
            {
                channel,
                dispatch: (action: Action) => {
                    dispatched.push(action);
                    channel.put(action);
                },
                getState: () => state,
            },
            watchCommandReceived,
        );

        const firstCommand = openInsightCommand("first");
        const secondCommand = openInsightCommand("second");
        channel.put(commandReceived(firstCommand, ORIGIN));
        channel.put(commandReceived(secondCommand, ORIGIN));
        await flushPromises();

        // The second origin check does not start before the first command is handled.
        expect(resolveOriginChecks).toHaveLength(1);

        resolveOriginChecks[0](true);
        await flushPromises();
        expect(resolveOriginChecks).toHaveLength(2);

        resolveOriginChecks[1](true);
        await flushPromises();

        expect(dispatched).toEqual([openInsightRequested(firstCommand), openInsightRequested(secondCommand)]);
        task.cancel();
    });
});
