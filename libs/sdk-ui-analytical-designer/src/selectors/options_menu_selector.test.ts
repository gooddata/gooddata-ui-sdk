// (C) 2007-2026 GoodData Corporation

import { type IntlShape } from "react-intl";
import { describe, expect, it } from "vitest";

import { PluggableVisualizationErrorCodes } from "@gooddata/sdk-ui-ext/internal";

import { MEASURES, STACK, VIEW } from "../constants/bucket.js";
import { type IAppState } from "../store/types.js";
import { withExportConfigUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { withExecutionError } from "../tests/report_builder.test.helpers.js";
import { withRouteQuery } from "../tests/route.test.helpers.js";
import { withData, withMeta, withReport, withRoot } from "../tests/state_builder.test.helpers.js";
import { createFakeTestIntl } from "../utils/translations.js";

import {
    getExportBubbleTextProvider,
    getExportVisible,
    getIsExportCSVDisabled,
    getIsExportXLSXDisabled,
} from "./options_menu_selector.js";
import { Permissions } from "./permissions_selector.js";
import {
    bucketsAddItem,
    createStateWithMeasureDateDatasets,
    setErrorReportNegativeValue,
} from "./test_helpers.js";

describe.todo("optionsMenuSelector", () => {
    const fakeIntl: IntlShape = createFakeTestIntl();

    function setPermission(state: IAppState, key: string, enabled: boolean) {
        const permissions = state.workspacePermissions;
        return withRoot(state, { workspacePermissions: { ...permissions, [key]: enabled } });
    }

    function setOpeningReport(state: IAppState) {
        return withReport(state, { opening: true });
    }

    function setSavingReport(state: IAppState) {
        return withReport(state, { saving: true });
    }

    function setEmptyReport(state: IAppState) {
        return withData(state, {
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
                {
                    localIdentifier: STACK,
                    items: [],
                },
            ],
        });
    }

    function setErrorReport(state: IAppState) {
        return withReport(state, {
            execution: withExecutionError(state.report.execution, {
                status: PluggableVisualizationErrorCodes.INVALID_BUCKETS,
            }),
        });
    }

    function setExportConfigSupported(state: IAppState, value: boolean) {
        return withData(state, {
            extendedReferencePoint: withExportConfigUiConfig(state.data.extendedReferencePoint, {
                supported: value,
            }),
        });
    }

    function createInitialState() {
        let state = createStateWithMeasureDateDatasets();

        state = setExportConfigSupported(state, true);
        state = setPermission(state, Permissions.CAN_CREATE_REPORT, true);
        state = setPermission(state, Permissions.CAN_EXECUTE_RAW, true);
        state = setPermission(state, Permissions.CAN_EXPORT_REPORT, true);

        state = setEmptyReport(state);
        state = bucketsAddItem(state, MEASURES, {
            attribute: "sample.attribute.foo",
            type: "metric",
        });
        state = bucketsAddItem(state, STACK, {
            attribute: "sample.attribute.bar",
            type: "attribute",
        });

        return state;
    }

    describe("getExportBubbleTextProvider", () => {
        it.each([
            ["canExportReport", Permissions.CAN_EXPORT_REPORT],
            ["canExecuteRaw", Permissions.CAN_EXECUTE_RAW],
        ])("should be export_unsupported.loading when %s is false", (_name, permissionName) => {
            let state = createInitialState();
            state = setPermission(state, permissionName, false);

            const exportBubbleTextProvider = getExportBubbleTextProvider(state);

            const fakeBubbleText = exportBubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.loading)");
        });

        it.each([
            ["isEmpty", setEmptyReport],
            ["isOpening", setOpeningReport],
            ["isSaving", setSavingReport],
        ])(
            "should be export_unsupported.loading when status is %s",
            (_status: string, setUpFunction: (state: IAppState) => IAppState) => {
                let state = createInitialState();
                state = setUpFunction(state);

                const exportBubbleTextProvider = getExportBubbleTextProvider(state);

                const fakeBubbleText = exportBubbleTextProvider(fakeIntl);
                expect(fakeBubbleText).toEqual("(translated export_unsupported.loading)");
            },
        );

        it("should be export_unsupported.disabled when visualization does not support export function", () => {
            let state = createInitialState();
            state = setExportConfigSupported(state, false);

            const exportBubbleTextProvider = getExportBubbleTextProvider(state);

            const fakeBubbleText = exportBubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.disabled)");
        });

        describe("visualization has error", () => {
            it("should be export_unsupported.loading when visualization contain negative error", () => {
                let state = createInitialState();
                state = setErrorReportNegativeValue(state);

                const exportBubbleTextProvider = getExportBubbleTextProvider(state);

                const fakeBubbleText = exportBubbleTextProvider(fakeIntl);
                expect(fakeBubbleText).toEqual("(translated export_unsupported.loading)");
            });

            it("should be export_unsupported.error when visualization not contain negative error", () => {
                let state = createInitialState();
                state = setErrorReport(state);

                const exportBubbleTextProvider = getExportBubbleTextProvider(state);

                const fakeBubbleText = exportBubbleTextProvider(fakeIntl);
                expect(fakeBubbleText).toEqual("(translated export_unsupported.error)");
            });
        });
    });

    describe("getIsExportCSVDisabled", () => {
        it("should be false when everything is ok", () => {
            const state = createInitialState();
            const isExportCSVDisabled = getIsExportCSVDisabled(state);

            expect(isExportCSVDisabled).toBeFalsy();
        });

        it.each([
            ["canExportReport", Permissions.CAN_EXPORT_REPORT],
            ["canExecuteRaw", Permissions.CAN_EXECUTE_RAW],
        ])("should be true when %s is false", (_name, permissionName) => {
            let state = createInitialState();
            state = setPermission(state, permissionName, false);

            const isExportCSVDisabled = getIsExportCSVDisabled(state);

            expect(isExportCSVDisabled).toBe(true);
        });

        it.each([
            ["isEmpty", setEmptyReport],
            ["isOpening", setOpeningReport],
            ["isSaving", setSavingReport],
        ])(
            "should be true when status is %s",
            (_status: string, setUpFunction: (state: IAppState) => IAppState) => {
                let state = createInitialState();
                state = setUpFunction(state);

                const isExportCSVDisabled = getIsExportCSVDisabled(state);
                expect(isExportCSVDisabled).toBe(true);
            },
        );

        it("should be true when visualization does not support export function", () => {
            let state = createInitialState();
            state = setExportConfigSupported(state, false);

            const isExportCSVDisabled = getIsExportCSVDisabled(state);
            expect(isExportCSVDisabled).toEqual(true);
        });

        describe("visualization has error", () => {
            it("should be false when visualization contain negative error", () => {
                let state = createInitialState();
                state = setErrorReportNegativeValue(state);

                const isExportCSVDisabled = getIsExportCSVDisabled(state);

                expect(isExportCSVDisabled).toBeFalsy();
            });

            it("should be true when visualization not contain negative error", () => {
                let state = createInitialState();
                state = setErrorReport(state);

                const isExportCSVDisabled = getIsExportCSVDisabled(state);

                expect(isExportCSVDisabled).toBe(true);
            });
        });
    });

    describe("getIsExportXLSXDisabled", () => {
        it("should be false when everything is ok", () => {
            const state = createInitialState();
            const isExportXLSXDisabled = getIsExportXLSXDisabled(state);

            expect(isExportXLSXDisabled).toBeFalsy();
        });

        it("should be true when canExportReport is false", () => {
            let state = createInitialState();
            state = setPermission(state, Permissions.CAN_EXPORT_REPORT, false);

            const isExportXLSXDisabled = getIsExportXLSXDisabled(state);

            expect(isExportXLSXDisabled).toBe(true);
        });

        it.each([
            ["isEmpty", setEmptyReport],
            ["isOpening", setOpeningReport],
            ["isSaving", setSavingReport],
        ])(
            "should be true when status is %s",
            (_status: string, setUpFunction: (state: IAppState) => IAppState) => {
                let state = createInitialState();
                state = setUpFunction(state);

                const isExportXLSXDisabled = getIsExportXLSXDisabled(state);
                expect(isExportXLSXDisabled).toBe(true);
            },
        );

        it("should be true when visualization does not support export function", () => {
            let state = createInitialState();
            state = setExportConfigSupported(state, false);

            const isExportXLSXDisabled = getIsExportXLSXDisabled(state);
            expect(isExportXLSXDisabled).toBe(true);
        });

        describe("visualization has error", () => {
            it("should be false when visualization contain negative error", () => {
                let state = createInitialState();
                state = setErrorReportNegativeValue(state);

                const isExportXLSXDisabled = getIsExportXLSXDisabled(state);

                expect(isExportXLSXDisabled).toBeFalsy();
            });

            it("should be true when visualization not contain negative error", () => {
                let state = createInitialState();
                state = setErrorReport(state);

                const isExportXLSXDisabled = getIsExportXLSXDisabled(state);

                expect(isExportXLSXDisabled).toBe(true);
            });
        });
    });

    describe("getExportVisible", () => {
        it("should return false if hideAction include export", () => {
            const state = withMeta(withRouteQuery(createInitialState(), { hideAction: "[export]" }), {
                isEmbedded: true,
            });
            expect(getExportVisible(state)).toBe(false);
        });

        it("should return true if not in embedded mode", () => {
            const state = withMeta(createInitialState(), { isEmbedded: false });
            expect(getExportVisible(state)).toBe(true);
        });

        it("should return true if hideAction don't include export", () => {
            const state = withRouteQuery(createInitialState(), { hideAction: "[clear]" });
            expect(getExportVisible(state)).toBe(true);
        });
    });
});
