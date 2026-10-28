// (C) 2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    type AdClearCommandData,
    GdcAdCommandType,
    GdcProductName,
    type IAdAvailableCommands,
} from "@gooddata/sdk-embedding";
import { messagingUtils } from "@gooddata/sdk-embedding/internal";
import { type IDrillEvent } from "@gooddata/sdk-ui";

import { clearInsightRequested } from "../postMessageApi/actions/clear_insight_actions.js";
import { hostVerificationFailed } from "../postMessageApi/actions/command_error_actions.js";
import { commandReceived } from "../postMessageApi/actions/command_received_actions.js";
import { drillPerformed } from "../postMessageApi/outgoing/drill_events.js";
import { adPostEvent } from "../postMessageApi/outgoing/post_event_helper.js";
import { validateHostDomain, watchCommandReceived } from "../postMessageApi/sagas/command_received_saga.js";
import { getOrganizationId } from "../selectors/bootstrap_selector.js";
import { isEmbeddingWriteCommandsEnabled } from "../selectors/feature_flag_selector.js";

import { HOST_ADAPTER_ORIGIN, installHostAdapter } from "./hostBridge.js";

describe("host adapter", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("adPostEvent transport seam", () => {
        const availableCommands: IAdAvailableCommands = { availableCommands: [GdcAdCommandType.Undo] };

        it("should postMessage byte-for-byte as before when no adapter is installed", () => {
            const postEvent = vi.spyOn(messagingUtils, "postEvent").mockImplementation(() => {});

            adPostEvent("undoFinished", availableCommands, "ctx-1");

            expect(postEvent).toHaveBeenCalledWith(
                GdcProductName.ANALYTICAL_DESIGNER,
                "undoFinished",
                availableCommands,
                "ctx-1",
            );
        });

        it("should reset the default contextId to undefined with and without an adapter", () => {
            const postEvent = vi.spyOn(messagingUtils, "postEvent").mockImplementation(() => {});
            adPostEvent("undoFinished", availableCommands, "DEFAULT_POST_MESSAGE_CONTEXT_ID");
            expect(postEvent).toHaveBeenCalledWith(
                GdcProductName.ANALYTICAL_DESIGNER,
                "undoFinished",
                availableCommands,
                undefined,
            );

            const onEvent = vi.fn();
            const uninstall = installHostAdapter({ onEvent });
            adPostEvent("undoFinished", availableCommands, "DEFAULT_POST_MESSAGE_CONTEXT_ID");
            uninstall();
            expect(onEvent).toHaveBeenCalledWith({
                type: "undoFinished",
                data: availableCommands,
                contextId: undefined,
            });
        });

        it("should deliver events to the adapter INSTEAD of postMessage while installed", () => {
            const postEvent = vi.spyOn(messagingUtils, "postEvent").mockImplementation(() => {});
            const onEvent = vi.fn();
            const uninstall = installHostAdapter({ onEvent });

            adPostEvent("redoFinished", availableCommands, "ctx-2");

            expect(onEvent).toHaveBeenCalledWith({
                type: "redoFinished",
                data: availableCommands,
                contextId: "ctx-2",
            });
            expect(postEvent).not.toHaveBeenCalled();

            uninstall();
            adPostEvent("redoFinished", availableCommands, "ctx-3");
            expect(postEvent).toHaveBeenCalledTimes(1);
        });

        it("should deliver the drill event of sdk-ui to the adapter as is", () => {
            const postEvent = vi.spyOn(messagingUtils, "postEvent").mockImplementation(() => {});
            const onEvent = vi.fn();
            const uninstall = installHostAdapter({ onEvent });
            const drillEvent = { drillContext: { type: "table" } } as IDrillEvent;

            drillPerformed(drillEvent);
            uninstall();

            expect(onEvent).toHaveBeenCalledWith({ type: "drill", data: drillEvent, contextId: undefined });
            expect(postEvent).not.toHaveBeenCalled();
        });
    });

    describe("command sentinel origin", () => {
        const clearCommand: AdClearCommandData = {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: {
                    name: GdcAdCommandType.Clear,
                    data: null,
                    contextId: "ctx-clear",
                },
            },
        };

        it("should route host-injected commands without backend host-domain validation", async () => {
            const uninstall = installHostAdapter({ onEvent: vi.fn() });

            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([[select(isEmbeddingWriteCommandsEnabled), false]])
                .dispatch(commandReceived(clearCommand, HOST_ADAPTER_ORIGIN))
                .not.call.fn(validateHostDomain)
                .silentRun();
            uninstall();

            expect(saga.effects.put).toEqual([put(clearInsightRequested(clearCommand))]);
        });

        it("should reject the sentinel origin when no adapter is installed", async () => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", HOST_ADAPTER_ORIGIN), false],
                ])
                .dispatch(commandReceived(clearCommand, HOST_ADAPTER_ORIGIN))
                .silentRun();

            expect(saga.effects.put).toEqual([put(hostVerificationFailed("ctx-clear"))]);
        });
    });
});
