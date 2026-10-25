// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { rootReducer } from "../reducers/root_reducer.js";
import {
    applicationCleared,
    buildApplicationResetCarrier,
} from "../store/app_context/application_reset_events.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { withMdObjectMeta } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withReport } from "../tests/state_builder.test.helpers.js";

import {
    canSaveReport,
    displayedActions,
    hiddenActions,
    isEditorHeaderResetDisabled,
    isOptionsMenuEnabled,
    isRedoDisabled,
    isSaveAsVisible,
    isSaveVisible,
    isUndoDisabled,
} from "./editor_header_selector.js";
import { isReportSavedSelector } from "./report_selector.js";

describe("Editor header selector test", () => {
    describe("isUndoDisabled", () => {
        it.each([
            [true, false, false],
            [true, false, true],
            [false, true, false],
            [true, true, true],
        ])(
            "should return %s when undoPossible is %s and reportSaving is %s",
            (expectedResult, undoPossible, reportSaving) => {
                expect(isUndoDisabled.resultFunc(undoPossible, reportSaving)).toBe(expectedResult);
            },
        );
    });

    describe("isRedoDisabled", () => {
        it.each([
            [true, false, false],
            [true, false, true],
            [false, true, false],
            [true, true, true],
        ])(
            "should return %s when redoPossible is %s and reportSaving is %s",
            (expectedResult, redoPossible, reportSaving) => {
                expect(isRedoDisabled.resultFunc(redoPossible, reportSaving)).toBe(expectedResult);
            },
        );
    });

    describe("hiddenActions", () => {
        it.each([
            [[], true, ""],
            [[], false, "[export]"],
            [["export"], true, "[export]"],
            [[], true, "unmatchingString"],
        ])(
            "should return %s when isEmbedded is %s and state hidden actions are %s",
            (expectedResult: string[], isEmbedded: boolean, hideActionRawValues: string) => {
                expect(hiddenActions.resultFunc(isEmbedded, hideActionRawValues)).toEqual(expectedResult);
            },
        );
    });

    describe("displayedActions", () => {
        it.each([
            [[], true, ""],
            [[], false, "[cancel]"],
            [["cancel"], true, "[cancel]"],
            [[], true, "unmatchingString"],
        ])(
            "should return %s when isEmbedded is %s and state displayed actions are %s",
            (expectedResult: string[], isEmbedded: boolean, displayedActionsString: string) => {
                expect(displayedActions.resultFunc(isEmbedded, displayedActionsString)).toEqual(
                    expectedResult,
                );
            },
        );
    });

    describe("isOptionsMenuEnabled", () => {
        it.each`
            isEmbedded | hasCsvSupport | hasXlsxSupport | canCreateReport | hiddenActions | isEditFromKD | isEnableTimezoneChange | expected | test
            ${false}   | ${true}       | ${false}       | ${false}        | ${[]}         | ${false}     | ${false}               | ${true}  | ${"hasCsvSupport is true"}
            ${false}   | ${false}      | ${true}        | ${false}        | ${[]}         | ${false}     | ${false}               | ${true}  | ${"hasXlsxSupport is true"}
            ${false}   | ${true}       | ${false}       | ${false}        | ${["export"]} | ${false}     | ${false}               | ${false} | ${"hiddenActions includes export"}
            ${false}   | ${false}      | ${false}       | ${true}         | ${[]}         | ${false}     | ${false}               | ${true}  | ${"canCreateReport is true"}
            ${true}    | ${false}      | ${false}       | ${true}         | ${[]}         | ${false}     | ${false}               | ${false} | ${"isEmbedded is true"}
            ${true}    | ${false}      | ${false}       | ${false}        | ${[]}         | ${false}     | ${true}                | ${true}  | ${"timezone change is allowed"}
            ${false}   | ${false}      | ${false}       | ${false}        | ${[]}         | ${false}     | ${true}                | ${true}  | ${"timezone change alone enables options menu"}
        `(
            "should return $expected when $test",
            ({
                isEmbedded,
                hasCsvSupport,
                hasXlsxSupport,
                canCreateReport,
                hiddenActions,
                isEditFromKD,
                isEnableTimezoneChange,
                expected,
            }) => {
                expect(
                    isOptionsMenuEnabled.resultFunc(
                        isEmbedded,
                        hasCsvSupport,
                        hasXlsxSupport,
                        canCreateReport,
                        hiddenActions,
                        isEditFromKD,
                        isEnableTimezoneChange,
                    ),
                ).toBe(expected);
            },
        );
    });

    describe("canSaveReport", () => {
        const analyst = { canAnalyzeWorkspace: true, canManageProject: false } as IWorkspacePermissions;
        const viewer = { canAnalyzeWorkspace: false, canManageProject: false } as IWorkspacePermissions;
        const admin = { canAnalyzeWorkspace: true, canManageProject: true } as IWorkspacePermissions;

        it("is refused by the lock alone", () => {
            expect(canSaveReport.resultFunc(true, true, ["EDIT"], admin, true, true)).toBe(false);
            expect(canSaveReport.resultFunc(true, false, undefined, admin, true, true)).toBe(false);
        });

        it("needs the create right for an unsaved visualization, whoever the user is", () => {
            expect(canSaveReport.resultFunc(false, false, undefined, viewer, true, true)).toBe(true);
            expect(canSaveReport.resultFunc(false, false, undefined, viewer, false, true)).toBe(true);
            expect(canSaveReport.resultFunc(false, false, undefined, admin, true, false)).toBe(false);
        });

        it("follows the workspace role for a saved visualization while the flag is off", () => {
            expect(canSaveReport.resultFunc(false, true, undefined, analyst, false, false)).toBe(true);
            expect(canSaveReport.resultFunc(false, true, ["EDIT"], viewer, false, false)).toBe(false);
        });

        it("follows the visualization's own EDIT for a saved visualization once the flag is on", () => {
            expect(canSaveReport.resultFunc(false, true, ["EDIT"], viewer, true, false)).toBe(true);
            expect(canSaveReport.resultFunc(false, true, ["VIEW"], analyst, true, true)).toBe(false);
            expect(canSaveReport.resultFunc(false, true, undefined, analyst, true, true)).toBe(false);
            expect(canSaveReport.resultFunc(false, true, undefined, admin, true, true)).toBe(true);
        });

        it("waits for the workspace permissions", () => {
            expect(canSaveReport.resultFunc(false, true, ["EDIT"], null, true, true)).toBe(false);
        });
    });

    describe("isSaveVisible", () => {
        it.each([
            [false, ["open"], false, false, false],
            // an explore draft the user may not persist offers no Save either
            [false, ["open"], false, true, false],
            [true, ["open"], true, false, false],
            [false, ["open"], true, false, true],
            [true, ["open", "save"], true, true, false],
            // hidden by the host, and no explore draft to override it
            [false, ["open", "save"], true, false, false],
        ])(
            "should return %s when hiddenActions is %s, canSaveReport is %s, isExploreFromKD is %s and isReadOnlyMode is %s",
            (
                expectedResult,
                hiddenActions: string[],
                canSaveReport: boolean,
                isExploreFromKD: boolean,
                isReadOnlyMode: boolean,
            ) => {
                expect(
                    isSaveVisible.resultFunc(hiddenActions, canSaveReport, isExploreFromKD, isReadOnlyMode),
                ).toBe(expectedResult);
            },
        );

        it("is reachable: the host's clear turns an opened visualization into an unsaved one", () => {
            const opened = withReport(getInitializedState(), {
                lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                    uri: "/gdc/md/p1/obj/1",
                    permissions: ["EDIT", "VIEW"],
                }),
            });
            expect(isReportSavedSelector(opened)).toBe(true);

            const cleared = rootReducer(
                opened,
                applicationCleared({
                    reset: buildApplicationResetCarrier(getVisualizationClassesState(opened)),
                }),
            );
            expect(isReportSavedSelector(cleared)).toBe(false);
        });
    });

    describe("isSaveAsVisible", () => {
        it.each([
            [false, ["open"], false, true, false],
            [true, ["open"], true, true, false],
            [false, ["open"], true, true, true],
            [false, ["open"], true, false, false],
            [false, ["open", "saveAs"], true, true, false],
        ])(
            "should return %s when hiddenActions is %s, canCreateNewVisualization is %s, isReportSaved is %s and isReadOnlyMode is %s",
            (
                expectedResult,
                hiddenActions: string[],
                canCreateNewVisualization: boolean,
                isReportSaved: boolean,
                isReadOnlyMode: boolean,
            ) => {
                expect(
                    isSaveAsVisible.resultFunc(
                        hiddenActions,
                        canCreateNewVisualization,
                        isReportSaved,
                        isReadOnlyMode,
                    ),
                ).toBe(expectedResult);
            },
        );
    });

    describe("isEditorHeaderResetDisabled", () => {
        it.each([
            [false, false, false],
            [true, false, true],
            [true, true, false],
            [true, true, true],
        ])(
            "should return %s when isResetDisabled is %s and isReportSaving is %s",
            (expectedResult, isResetDisabled, isReportSaving) => {
                expect(isEditorHeaderResetDisabled.resultFunc(isResetDisabled, isReportSaving)).toBe(
                    expectedResult,
                );
            },
        );
    });
});
