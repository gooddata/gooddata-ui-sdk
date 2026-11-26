// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWorkspacePermissions, uriRef } from "@gooddata/sdk-model";

import { getVisualizationObjectForSave } from "../services/report_service.js";
import { dialogsInitialState } from "../store/dialogs/dialogs_state.js";
import { type IFilterBarState } from "../store/filter_bar/filter_bar_state.js";
import { initialMetricEditorState } from "../store/metric_editor/metric_editor_reducer.js";
import { type IAppState } from "../store/types.js";
import { tableVisualizationClass } from "../tests/constants.test.helpers.js";
import { withMdObjectMeta } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import {
    withAppState,
    withData,
    withReport,
    withRoot,
    withShortcut,
} from "../tests/state_builder.test.helpers.js";

import {
    confirmUnsavedChangesDialogSelector,
    isReportChanging,
} from "./confirm_unsaved_changes_dialog_selector.js";

describe("confirm unsaved changed selector", () => {
    const state = withReport(
        withReport(
            withReport(
                withReport(
                    withReport(
                        withReport(
                            withReport(
                                withData(
                                    withData(
                                        withData(getInitializedState(), {
                                            visualizationClass: tableVisualizationClass,
                                        }),
                                        {
                                            itemCache: {
                                                "attr.corona.continent": {
                                                    identifier: "attr.corona.continent",
                                                    title: "Continent",
                                                    uri: "/gdc/md/pid1/obj/89",
                                                    type: "attribute",
                                                    dfUri: "/gdc/md/pid1/obj/90",
                                                    dfIdentifier: "label.corona.continent",
                                                    ref: uriRef("/gdc/md/pid1/obj/89"),
                                                    dfRef: uriRef("/gdc/md/pid1/obj/90"),
                                                    expression: "",
                                                },
                                            },
                                        },
                                    ),
                                    {
                                        filterBar: {
                                            items: [
                                                {
                                                    type: "attribute",
                                                    localIdentifier: "3eda35149efd4c0facffc9b5b231bf95",
                                                    cacheItemIdentifier: "attr.corona.continent",
                                                    displayFormRef: uriRef("corona/displayForm/uri"),
                                                    filterConfig: {
                                                        selectedElements: [],
                                                        totalElementsCount: 0,
                                                        isInverted: true,
                                                    },
                                                },
                                            ],
                                        } as unknown as IFilterBarState,
                                    },
                                ),
                                {
                                    execution: {
                                        ...withData(
                                            withData(
                                                withData(getInitializedState(), {
                                                    visualizationClass: tableVisualizationClass,
                                                }),
                                                {
                                                    itemCache: {
                                                        "attr.corona.continent": {
                                                            identifier: "attr.corona.continent",
                                                            title: "Continent",
                                                            uri: "/gdc/md/pid1/obj/89",
                                                            type: "attribute",
                                                            dfUri: "/gdc/md/pid1/obj/90",
                                                            dfIdentifier: "label.corona.continent",
                                                            ref: uriRef("/gdc/md/pid1/obj/89"),
                                                            dfRef: uriRef("/gdc/md/pid1/obj/90"),
                                                            expression: "",
                                                        },
                                                    },
                                                },
                                            ),
                                            {
                                                filterBar: {
                                                    items: [
                                                        {
                                                            type: "attribute",
                                                            localIdentifier:
                                                                "3eda35149efd4c0facffc9b5b231bf95",
                                                            cacheItemIdentifier: "attr.corona.continent",
                                                            displayFormRef: uriRef("corona/displayForm/uri"),
                                                            filterConfig: {
                                                                selectedElements: [],
                                                                totalElementsCount: 0,
                                                                isInverted: true,
                                                            },
                                                        },
                                                    ],
                                                } as unknown as IFilterBarState,
                                            },
                                        ).report.execution,
                                        id: "25b15d69",
                                    },
                                },
                            ),
                            {
                                execution: {
                                    ...withReport(
                                        withData(
                                            withData(
                                                withData(getInitializedState(), {
                                                    visualizationClass: tableVisualizationClass,
                                                }),
                                                {
                                                    itemCache: {
                                                        "attr.corona.continent": {
                                                            identifier: "attr.corona.continent",
                                                            title: "Continent",
                                                            uri: "/gdc/md/pid1/obj/89",
                                                            type: "attribute",
                                                            dfUri: "/gdc/md/pid1/obj/90",
                                                            dfIdentifier: "label.corona.continent",
                                                            ref: uriRef("/gdc/md/pid1/obj/89"),
                                                            dfRef: uriRef("/gdc/md/pid1/obj/90"),
                                                            expression: "",
                                                        },
                                                    },
                                                },
                                            ),
                                            {
                                                filterBar: {
                                                    items: [
                                                        {
                                                            type: "attribute",
                                                            localIdentifier:
                                                                "3eda35149efd4c0facffc9b5b231bf95",
                                                            cacheItemIdentifier: "attr.corona.continent",
                                                            displayFormRef: uriRef("corona/displayForm/uri"),
                                                            filterConfig: {
                                                                selectedElements: [],
                                                                totalElementsCount: 0,
                                                                isInverted: true,
                                                            },
                                                        },
                                                    ],
                                                } as unknown as IFilterBarState,
                                            },
                                        ),
                                        {
                                            execution: {
                                                ...withData(
                                                    withData(
                                                        withData(getInitializedState(), {
                                                            visualizationClass: tableVisualizationClass,
                                                        }),
                                                        {
                                                            itemCache: {
                                                                "attr.corona.continent": {
                                                                    identifier: "attr.corona.continent",
                                                                    title: "Continent",
                                                                    uri: "/gdc/md/pid1/obj/89",
                                                                    type: "attribute",
                                                                    dfUri: "/gdc/md/pid1/obj/90",
                                                                    dfIdentifier: "label.corona.continent",
                                                                    ref: uriRef("/gdc/md/pid1/obj/89"),
                                                                    dfRef: uriRef("/gdc/md/pid1/obj/90"),
                                                                    expression: "",
                                                                },
                                                            },
                                                        },
                                                    ),
                                                    {
                                                        filterBar: {
                                                            items: [
                                                                {
                                                                    type: "attribute",
                                                                    localIdentifier:
                                                                        "3eda35149efd4c0facffc9b5b231bf95",
                                                                    cacheItemIdentifier:
                                                                        "attr.corona.continent",
                                                                    displayFormRef:
                                                                        uriRef("corona/displayForm/uri"),
                                                                    filterConfig: {
                                                                        selectedElements: [],
                                                                        totalElementsCount: 0,
                                                                        isInverted: true,
                                                                    },
                                                                },
                                                            ],
                                                        } as unknown as IFilterBarState,
                                                    },
                                                ).report.execution,
                                                id: "25b15d69",
                                            },
                                        },
                                    ).report.execution,
                                    hasData: true,
                                },
                            },
                        ),
                        {
                            execution: {
                                ...withReport(
                                    withReport(
                                        withData(
                                            withData(
                                                withData(getInitializedState(), {
                                                    visualizationClass: tableVisualizationClass,
                                                }),
                                                {
                                                    itemCache: {
                                                        "attr.corona.continent": {
                                                            identifier: "attr.corona.continent",
                                                            title: "Continent",
                                                            uri: "/gdc/md/pid1/obj/89",
                                                            type: "attribute",
                                                            dfUri: "/gdc/md/pid1/obj/90",
                                                            dfIdentifier: "label.corona.continent",
                                                            ref: uriRef("/gdc/md/pid1/obj/89"),
                                                            dfRef: uriRef("/gdc/md/pid1/obj/90"),
                                                            expression: "",
                                                        },
                                                    },
                                                },
                                            ),
                                            {
                                                filterBar: {
                                                    items: [
                                                        {
                                                            type: "attribute",
                                                            localIdentifier:
                                                                "3eda35149efd4c0facffc9b5b231bf95",
                                                            cacheItemIdentifier: "attr.corona.continent",
                                                            displayFormRef: uriRef("corona/displayForm/uri"),
                                                            filterConfig: {
                                                                selectedElements: [],
                                                                totalElementsCount: 0,
                                                                isInverted: true,
                                                            },
                                                        },
                                                    ],
                                                } as unknown as IFilterBarState,
                                            },
                                        ),
                                        {
                                            execution: {
                                                ...withData(
                                                    withData(
                                                        withData(getInitializedState(), {
                                                            visualizationClass: tableVisualizationClass,
                                                        }),
                                                        {
                                                            itemCache: {
                                                                "attr.corona.continent": {
                                                                    identifier: "attr.corona.continent",
                                                                    title: "Continent",
                                                                    uri: "/gdc/md/pid1/obj/89",
                                                                    type: "attribute",
                                                                    dfUri: "/gdc/md/pid1/obj/90",
                                                                    dfIdentifier: "label.corona.continent",
                                                                    ref: uriRef("/gdc/md/pid1/obj/89"),
                                                                    dfRef: uriRef("/gdc/md/pid1/obj/90"),
                                                                    expression: "",
                                                                },
                                                            },
                                                        },
                                                    ),
                                                    {
                                                        filterBar: {
                                                            items: [
                                                                {
                                                                    type: "attribute",
                                                                    localIdentifier:
                                                                        "3eda35149efd4c0facffc9b5b231bf95",
                                                                    cacheItemIdentifier:
                                                                        "attr.corona.continent",
                                                                    displayFormRef:
                                                                        uriRef("corona/displayForm/uri"),
                                                                    filterConfig: {
                                                                        selectedElements: [],
                                                                        totalElementsCount: 0,
                                                                        isInverted: true,
                                                                    },
                                                                },
                                                            ],
                                                        } as unknown as IFilterBarState,
                                                    },
                                                ).report.execution,
                                                id: "25b15d69",
                                            },
                                        },
                                    ),
                                    {
                                        execution: {
                                            ...withReport(
                                                withData(
                                                    withData(
                                                        withData(getInitializedState(), {
                                                            visualizationClass: tableVisualizationClass,
                                                        }),
                                                        {
                                                            itemCache: {
                                                                "attr.corona.continent": {
                                                                    identifier: "attr.corona.continent",
                                                                    title: "Continent",
                                                                    uri: "/gdc/md/pid1/obj/89",
                                                                    type: "attribute",
                                                                    dfUri: "/gdc/md/pid1/obj/90",
                                                                    dfIdentifier: "label.corona.continent",
                                                                    ref: uriRef("/gdc/md/pid1/obj/89"),
                                                                    dfRef: uriRef("/gdc/md/pid1/obj/90"),
                                                                    expression: "",
                                                                },
                                                            },
                                                        },
                                                    ),
                                                    {
                                                        filterBar: {
                                                            items: [
                                                                {
                                                                    type: "attribute",
                                                                    localIdentifier:
                                                                        "3eda35149efd4c0facffc9b5b231bf95",
                                                                    cacheItemIdentifier:
                                                                        "attr.corona.continent",
                                                                    displayFormRef:
                                                                        uriRef("corona/displayForm/uri"),
                                                                    filterConfig: {
                                                                        selectedElements: [],
                                                                        totalElementsCount: 0,
                                                                        isInverted: true,
                                                                    },
                                                                },
                                                            ],
                                                        } as unknown as IFilterBarState,
                                                    },
                                                ),
                                                {
                                                    execution: {
                                                        ...withData(
                                                            withData(
                                                                withData(getInitializedState(), {
                                                                    visualizationClass:
                                                                        tableVisualizationClass,
                                                                }),
                                                                {
                                                                    itemCache: {
                                                                        "attr.corona.continent": {
                                                                            identifier:
                                                                                "attr.corona.continent",
                                                                            title: "Continent",
                                                                            uri: "/gdc/md/pid1/obj/89",
                                                                            type: "attribute",
                                                                            dfUri: "/gdc/md/pid1/obj/90",
                                                                            dfIdentifier:
                                                                                "label.corona.continent",
                                                                            ref: uriRef(
                                                                                "/gdc/md/pid1/obj/89",
                                                                            ),
                                                                            dfRef: uriRef(
                                                                                "/gdc/md/pid1/obj/90",
                                                                            ),
                                                                            expression: "",
                                                                        },
                                                                    },
                                                                },
                                                            ),
                                                            {
                                                                filterBar: {
                                                                    items: [
                                                                        {
                                                                            type: "attribute",
                                                                            localIdentifier:
                                                                                "3eda35149efd4c0facffc9b5b231bf95",
                                                                            cacheItemIdentifier:
                                                                                "attr.corona.continent",
                                                                            displayFormRef:
                                                                                uriRef(
                                                                                    "corona/displayForm/uri",
                                                                                ),
                                                                            filterConfig: {
                                                                                selectedElements: [],
                                                                                totalElementsCount: 0,
                                                                                isInverted: true,
                                                                            },
                                                                        },
                                                                    ],
                                                                } as unknown as IFilterBarState,
                                                            },
                                                        ).report.execution,
                                                        id: "25b15d69",
                                                    },
                                                },
                                            ).report.execution,
                                            hasData: true,
                                        },
                                    },
                                ).report.execution,
                                running: false,
                            },
                        },
                    ),
                    { saving: false },
                ),
                { savingAsNew: false },
            ),
            { opening: false },
        ),
        { nowOpen: false },
    );

    it.each([
        [true, true],
        [false, false],
    ])(
        "should isReportChanging return %s when report exection has data is %s",
        (value: boolean, expected: boolean) => {
            const isReportChangingSelector = isReportChanging(
                withReport(state, { execution: { ...state.report.execution, hasData: value } }),
            );

            expect(isReportChangingSelector).toBe(expected);
        },
    );

    it.each([
        [true, true, (s: IAppState, v: unknown) => withShortcut(s, { shortcutDroppedItem: v as never })],
        [false, false, (s: IAppState, v: unknown) => withShortcut(s, { shortcutDroppedItem: v as never })],
        [
            true,
            true,
            (s: IAppState, v: unknown) =>
                withReport(s, { execution: { ...s.report.execution, running: v as boolean } }),
        ],
        [
            false,
            false,
            (s: IAppState, v: unknown) =>
                withReport(s, { execution: { ...s.report.execution, running: v as boolean } }),
        ],
    ])(
        "should isReportChanging return %s when report has compute shortcut item is %s",
        (value: boolean, expected: boolean, patch: (s: IAppState, v: unknown) => IAppState) => {
            const isReportChangingSelector = isReportChanging(
                withReport(patch(state, value), {
                    execution: { ...patch(state, value).report.execution, hasData: false },
                }),
            );

            expect(isReportChangingSelector).toBe(expected);
        },
    );

    describe("saved visualization that is still computing", () => {
        // the state of a saved visualization right after it opens: the first execution is running,
        // there is no data yet, and the current content is what was last saved
        const computing = withReport(state, {
            execution: { ...state.report.execution, running: true, hasData: false },
        });
        const unchangedSaved = withReport(computing, {
            lastSavedObject: {
                visualizationObject: {
                    ...getVisualizationObjectForSave(computing).visualizationObject,
                    meta: {
                        uri: "/gdc/md/pid1/obj/1",
                        title: computing.report.lastSavedObject?.visualizationObject?.meta?.title,
                        summary: computing.report.lastSavedObject?.visualizationObject?.meta?.summary,
                    },
                },
            } as never,
        });

        it("should not report changes while an unchanged visualization is still computing", () => {
            expect(isReportChanging(unchangedSaved)).toBe(false);
        });

        it("should not report changes for the same unchanged visualization once it stopped computing", () => {
            const done = withReport(unchangedSaved, {
                execution: { ...unchangedSaved.report.execution, running: false },
            });

            expect(isReportChanging(done)).toBe(false);
        });

        it("should report changes while a changed visualization is recomputing", () => {
            const changed = withReport(unchangedSaved, {
                lastSavedObject: withMdObjectMeta(unchangedSaved.report.lastSavedObject, {
                    title: "A title that is not the current one",
                }),
            });

            expect(isReportChanging(changed)).toBe(true);
        });
    });

    it("should confirmUnsavedChangesDialogSelector return correct value", () => {
        // saving a saved visualization in place needs the ANALYZE role
        const analyst = { canAnalyzeWorkspace: true } as IWorkspacePermissions;
        const confirmUnsavedChangesSelector = confirmUnsavedChangesDialogSelector(
            withRoot(
                withData(
                    withReport(
                        withReport(
                            withAppState(state, {
                                dialogs: {
                                    ...dialogsInitialState,
                                    confirmUnsavedChanges: {
                                        active: true,
                                        data: { goToPage: "#/dashboard" },
                                    },
                                },
                            }),
                            {
                                lastSavedObject: withMdObjectMeta(
                                    withAppState(state, {
                                        dialogs: {
                                            ...dialogsInitialState,
                                            confirmUnsavedChanges: {
                                                active: true,
                                                data: { goToPage: "#/dashboard" },
                                            },
                                        },
                                    }).report.lastSavedObject,
                                    {
                                        uri: { goToPage: "/report1" } as unknown as string,
                                    },
                                ),
                            },
                        ),
                        {
                            execution: { ...state.report.execution, hasData: true },
                        },
                    ),
                    { metricEditor: initialMetricEditorState },
                ),
                { workspacePermissions: analyst },
            ),
        );

        expect(confirmUnsavedChangesSelector).toEqual({
            visible: true,
            data: { goToPage: "#/dashboard" },
            isSavedReport: true,
            isSaveDisabled: false,
            canSaveReport: true,
            isMetricEditorUnsaved: false,
        });
    });
});
