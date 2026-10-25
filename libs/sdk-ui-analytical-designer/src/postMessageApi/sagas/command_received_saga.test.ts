// (C) 2007-2026 GoodData Corporation

import { type Action } from "redux";
import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import {
    type AdCommandBody,
    type AdCommandData,
    type AdRequestCancellationCommandData,
    type AdSaveInsightCommandData,
    type AdSetTimezoneCommandData,
    GdcAdCommandType,
    GdcAdEventType,
    GdcProductName,
    type IGdcAdMessageEnvelope,
} from "@gooddata/sdk-embedding";

import { displayConfirmUnsavedChangesDialogWithPostMessageAction } from "../../actions/confirm_unsaved_changes_actions.js";
import { conversionInit } from "../../actions/drillable_items_actions.js";
import { setTimezoneOverride } from "../../actions/timezone_override_actions.js";
import { XLSX } from "../../constants/export_types.js";
import { initialState } from "../../reducers/initial_state.js";
import { getOrganizationId } from "../../selectors/bootstrap_selector.js";
import { isReportChanging } from "../../selectors/confirm_unsaved_changes_dialog_selector.js";
import {
    isEmbeddingWriteCommandsEnabled,
    isEnableTimezoneChange,
} from "../../selectors/feature_flag_selector.js";
import { isExploreFromKD } from "../../selectors/route_selector.js";
import { type IFeatureFlagsState } from "../../store/feature_flags/feature_flags_state.js";
import { hasMetricEditorUnsavedChanges } from "../../store/metric_editor/metric_editor_selector.js";
import { withRoot } from "../../tests/state_builder.test.helpers.js";
import { clearInsightRequested } from "../actions/clear_insight_actions.js";
import { clearInsightContentRequested } from "../actions/clear_insight_content_actions.js";
import { hostVerificationFailed, insecureCommandFailed } from "../actions/command_error_actions.js";
import { commandReceived } from "../actions/command_received_actions.js";
import {
    removeFilterContextRequested,
    setFilterContextRequested,
} from "../actions/control_filtering_actions.js";
import { exportInsightRequested } from "../actions/export_insight_actions.js";
import { openInsightRequested } from "../actions/open_insight_actions.js";
import { redoRequested } from "../actions/redo_actions.js";
import { saveAsInsightRequested } from "../actions/save_as_insight_actions.js";
import { saveInsightRequested } from "../actions/save_insight_actions.js";
import { undoRequested } from "../actions/undo_actions.js";
import { postInvalidCommandArgument } from "../outgoing/invalid_command_events.js";
import { adPostEvent } from "../outgoing/post_event_helper.js";
import { WRITE_COMMANDS } from "../outgoing/supported_commands_events.js";

import { validateHostDomain, watchCommandReceived } from "./command_received_saga.js";

describe("command received saga", () => {
    const contextId = "contextId";
    const filterItems = [
        {
            negativeAttributeFilter: {
                displayForm: {
                    identifier: "label.activity",
                },
                notIn: ["/gdc/md/projectId/obj/1251/elements?id=169663"],
            },
        },
    ];
    function command<T extends GdcAdCommandType>(
        name: T,
        data: AdCommandBody<T>,
    ): IGdcAdMessageEnvelope<T, AdCommandBody<T>> {
        return {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: { name, data, contextId },
            },
        };
    }

    // a row of the "should handle" table: the command, its envelope and the action the saga must put for it
    function handled<T extends GdcAdCommandType>(
        name: T,
        data: AdCommandBody<T>,
        expected: (envelope: IGdcAdMessageEnvelope<T, AdCommandBody<T>>) => Action,
    ): [T, IGdcAdMessageEnvelope<T, AdCommandBody<T>>, Action] {
        const envelope = command(name, data);
        return [name, envelope, expected(envelope)];
    }

    const writeCommands: Array<[GdcAdCommandType, AdCommandData]> = [
        [GdcAdCommandType.Save, command(GdcAdCommandType.Save, { title: "test save" })],
        [GdcAdCommandType.SaveAs, command(GdcAdCommandType.SaveAs, { title: "test save_as" })],
        [
            GdcAdCommandType.Export,
            command(GdcAdCommandType.Export, { config: { title: "test export", format: XLSX } }),
        ],
    ];

    it("covers every command the gate holds back", () => {
        expect(writeCommands.map(([commandType]) => commandType).sort()).toEqual([...WRITE_COMMANDS].sort());
    });

    it.each(writeCommands)(
        "should not handle %s command when write commands are disabled",
        async (commandType, envelope) => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), false],
                ])
                .dispatch(commandReceived(envelope, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([put(insecureCommandFailed(commandType, contextId))]);
        },
    );

    const writeCommandsHandled: Array<[GdcAdCommandType, AdCommandData, Action]> = [
        handled(GdcAdCommandType.Save, { title: "test save" }, saveInsightRequested),
        handled(GdcAdCommandType.SaveAs, { title: "test save_as" }, saveAsInsightRequested),
        handled(
            GdcAdCommandType.Export,
            { config: { title: "test export", format: XLSX } },
            exportInsightRequested,
        ),
    ];

    /** Runs the watcher against a real feature flag bag; only origin validation is stubbed. */
    function runWithFeatureFlags(
        featureFlags: IFeatureFlagsState,
        envelope: AdCommandData,
    ): Promise<RunResult> {
        return expectSaga(watchCommandReceived)
            .withState(withRoot(initialState, { featureFlags }))
            .provide([
                [select(getOrganizationId), "default"],
                [call(validateHostDomain, "default", "origin"), true],
            ])
            .dispatch(commandReceived(envelope, "origin"))
            .silentRun();
    }

    /**
     * The cases above stub the flag selector. These drive the real selector against a real feature
     * flag bag, which is the state that actually ships: FeatureHub does not carry the feature yet,
     * so `loadFeature` contributes nothing and the key never reaches the bag at all.
     */
    it.each(writeCommands)(
        "should not handle %s command when the feature flag bag does not carry the flag",
        async (commandType, envelope) => {
            const saga = await runWithFeatureFlags({}, envelope);

            expect(saga.effects.put).toEqual([put(insecureCommandFailed(commandType, contextId))]);
        },
    );

    it.each(writeCommands)(
        "should not handle %s command when the bag carries other keys but not this one",
        async (commandType, envelope) => {
            const saga = await runWithFeatureFlags({ platformEdition: "enterprise" }, envelope);

            expect(saga.effects.put).toEqual([put(insecureCommandFailed(commandType, contextId))]);
        },
    );

    it.each(writeCommandsHandled)(
        "should handle %s command once the feature flag bag carries the flag",
        async (_commandType, envelope, expected) => {
            const saga = await runWithFeatureFlags({ enableEmbeddingWriteCommands: true }, envelope);

            expect(saga.effects.put).toEqual([put(expected)]);
        },
    );

    const handledCommands: Array<[GdcAdCommandType, AdCommandData, Action]> = [
        handled(GdcAdCommandType.Save, { title: "test save" }, saveInsightRequested),
        handled(GdcAdCommandType.SaveAs, { title: "test save_as" }, saveAsInsightRequested),
        handled(
            GdcAdCommandType.Export,
            { config: { title: "test export", format: XLSX } },
            exportInsightRequested,
        ),
        handled(GdcAdCommandType.Clear, undefined, clearInsightRequested),
        handled(GdcAdCommandType.ClearInsight, undefined, clearInsightContentRequested),
        handled(GdcAdCommandType.OpenInsight, { projectId: "", insightId: "" }, openInsightRequested),
        handled(GdcAdCommandType.DrillableItems, { uris: [] }, (envelope) =>
            conversionInit(envelope.gdc.event.data),
        ),
        handled(GdcAdCommandType.Undo, undefined, undoRequested),
        handled(GdcAdCommandType.Redo, undefined, redoRequested),
        handled(GdcAdCommandType.SetFilterContext, { filters: filterItems }, setFilterContextRequested),
        handled(
            GdcAdCommandType.RemoveFilterContext,
            { filters: [{ displayForm: { identifier: "label.activity" } }] },
            removeFilterContextRequested,
        ),
    ];

    it.each(handledCommands)("should handle %s command", async (_commandType, envelope, expected) => {
        const saga: RunResult = await expectSaga(watchCommandReceived)
            .provide([
                [select(getOrganizationId), "default"],
                [call(validateHostDomain, "default", "origin"), true],
                [select(isEmbeddingWriteCommandsEnabled), true],
            ])
            .dispatch(commandReceived(envelope, "origin"))
            .silentRun();

        expect(saga.effects.put).toEqual([put(expected)]);
    });

    describe(`${GdcAdCommandType.RequestCancellation} command`, () => {
        const command: AdRequestCancellationCommandData = {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: {
                    name: GdcAdCommandType.RequestCancellation,
                    contextId,
                },
            },
        };

        it("should put an action when insight is modified and AD is not explored from KD", async () => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isReportChanging), true],
                    [select(isExploreFromKD), false],
                    [select(hasMetricEditorUnsavedChanges), false],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([
                put(displayConfirmUnsavedChangesDialogWithPostMessageAction()),
            ]);
        });

        it("should put an action when the metric editor has unsaved changes even though AD is explored from KD", async () => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isReportChanging), false],
                    [select(isExploreFromKD), true],
                    [select(hasMetricEditorUnsavedChanges), true],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([
                put(displayConfirmUnsavedChangesDialogWithPostMessageAction()),
            ]);
            expect(saga.effects.call).not.toContainEqual(
                call(adPostEvent, GdcAdEventType.InsightEditingCancelled, null),
            );
        });

        it("should not put an action when insight is modified but AD is explored from KD", async () => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isReportChanging), true],
                    [select(isExploreFromKD), true],
                    [select(hasMetricEditorUnsavedChanges), false],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.call).toContainEqual(
                call(adPostEvent, GdcAdEventType.InsightEditingCancelled, null),
            );
        });

        it("should not put an action when insight in not modified", async () => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isReportChanging), false],
                    [select(isExploreFromKD), false],
                    [select(hasMetricEditorUnsavedChanges), false],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.call).toContainEqual(
                call(adPostEvent, GdcAdEventType.InsightEditingCancelled, null),
            );
        });
    });

    describe(`${GdcAdCommandType.SetTimezone} command`, () => {
        it("should set the timezone override when the feature is enabled", async () => {
            const command: AdSetTimezoneCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.SetTimezone,
                        data: { timezoneId: "Europe/Prague" },
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isEnableTimezoneChange), true],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([put(setTimezoneOverride("Europe/Prague"))]);
        });

        it("should clear the override when timezoneId is omitted", async () => {
            const command: AdSetTimezoneCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.SetTimezone,
                        data: {},
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isEnableTimezoneChange), true],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([put(setTimezoneOverride(undefined))]);
        });

        it("should clear the override when timezoneId is an empty string", async () => {
            const command: AdSetTimezoneCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.SetTimezone,
                        data: { timezoneId: "" },
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isEnableTimezoneChange), true],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([put(setTimezoneOverride(undefined))]);
        });

        it("should reject when the feature flag is disabled", async () => {
            const command: AdSetTimezoneCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.SetTimezone,
                        data: { timezoneId: "Europe/Prague" },
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isEnableTimezoneChange), false],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toBeUndefined();
            expect(saga.effects.call).toContainEqual(
                call(
                    postInvalidCommandArgument,
                    "Cannot set the timezone override: the dashboard timezone feature is disabled.",
                    contextId,
                ),
            );
        });

        it("should reject a timezone ID that differs in case from a canonical IANA ID", async () => {
            const command: AdSetTimezoneCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.SetTimezone,
                        data: { timezoneId: "america/new_york" },
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isEnableTimezoneChange), true],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toBeUndefined();
            expect(saga.effects.call).toContainEqual(
                call(
                    postInvalidCommandArgument,
                    'The provided timezone override "america/new_york" is not a valid IANA timezone ID.',
                    contextId,
                ),
            );
        });

        it("should reject an invalid IANA timezone ID", async () => {
            const command: AdSetTimezoneCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.SetTimezone,
                        data: { timezoneId: "Not/ARealZone" },
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), true],
                    [select(isEmbeddingWriteCommandsEnabled), true],
                    [select(isEnableTimezoneChange), true],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toBeUndefined();
            expect(saga.effects.call).toContainEqual(
                call(
                    postInvalidCommandArgument,
                    'The provided timezone override "Not/ARealZone" is not a valid IANA timezone ID.',
                    contextId,
                ),
            );
        });
    });

    describe("origin validation", () => {
        const command: AdSaveInsightCommandData = {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: {
                    name: GdcAdCommandType.Save,
                    data: { title: "test save" },
                    contextId,
                },
            },
        };

        it("should put action when origin was not verified", async () => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), false],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([put(hostVerificationFailed(contextId))]);
        });

        it("should put action when origin validation throws", async () => {
            const saga: RunResult = await expectSaga(watchCommandReceived)
                .provide([
                    [select(getOrganizationId), "default"],
                    [call(validateHostDomain, "default", "origin"), throwError(new Error("backend error"))],
                ])
                .dispatch(commandReceived(command, "origin"))
                .silentRun();

            expect(saga.effects.put).toEqual([put(hostVerificationFailed(contextId))]);
        });
    });
});
