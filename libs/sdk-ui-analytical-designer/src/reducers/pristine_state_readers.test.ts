// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { resetForPluggableMount } from "../actions/reset_for_pluggable_mount_actions.js";
import { currentReportMDObject, getStoredLayers } from "../selectors/buckets_selector.js";
import { optionalStackingSelector } from "../selectors/optional_stacking_selector.js";
import {
    getExecutionErrorResponseData,
    getExecutionLimitBreaks,
    getLastSavedReportTitle,
    getLastSavedReportUri,
    getReportSummary,
    getReportTags,
    hasDataSelector,
    hasReportLoadingError,
    isExecutionRunningSelector,
    isReportEmptySelector,
    isReportLockedSelector,
    isReportSavedSelector,
    isReportTooLargeSelector,
} from "../selectors/report_selector.js";
import { currentReportTitle, hasDefinedTitle } from "../selectors/report_title_selector.js";
import { isDefaultVisualizationClass } from "../selectors/reset_button_selector.js";
import { hasDescriptionChanged, hasTitleChanged } from "../selectors/save_report_selector.js";
import { VisualizationPropertiesSelectors } from "../selectors/visualization_properties_selector.js";
import { bucketsWereChanged } from "../services/buckets_service.js";
import { getNewReportMDObject, isReportTitleEmpty } from "../services/report_service.js";
import { getLocalVisualizationClass } from "../services/visualization_class_service.js";
import {
    applicationCleared,
    buildApplicationResetCarrier,
} from "../store/app_context/application_reset_events.js";
import { getAvailableDateDatasets } from "../store/date_datasets/date_datasets_selectors.js";
import { getExecutionState } from "../store/execution/execution_selectors.js";
import {
    getInsightLayers,
    getInsightLayersOwner,
    getInsightSummary,
    getInsightTags,
    getInsightTitle,
} from "../store/insight/insight_selectors.js";
import { getVisualizationPropertiesSortItems } from "../store/properties/properties_selectors.js";
import {
    getReportLoadingError as getReportLoadingErrorAccessor,
    isReportNowOpen,
    isReportOpening,
    isReportSaving,
} from "../store/report/report_selectors.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";

import { initialState } from "./initial_state.js";
import { rootReducer } from "./root_reducer.js";

/**
 * The pristine post-reset state SELF-INITIALIZES every slice-owned subtree —
 * RESET_FOR_PLUGGABLE_MOUNT short-circuits to a fresh reducer build, so no subtree is ever absent
 * until the next dispatch. This suite pins that the domain accessors serve their real values on it.
 *
 * `resetForPluggableMount` is public API (src/index.ts), so a host can dispatch it while the tree is
 * still subscribed.
 */
describe("readers on the pristine post-reset state", () => {
    const pristine = rootReducer(initialState, resetForPluggableMount());

    it("self-initializes data.visualizationClasses / data.dateDatasets with the slice initials", () => {
        expect(pristine?.data?.visualizationClasses).toBeDefined();
        expect(pristine?.data?.dateDatasets).toBeDefined();
    });

    it("the shortcut selectors' visualization-class and date-dataset reads do not throw", () => {
        // NOT the composed displayMetricOverTimeSelector: it also reads data.dragAndDrop, which has
        // never been seeded and whose selector has no fallback — a pre-existing gap in that domain,
        // unrelated to this suite. These are the two slice-owned reads.
        expect(getAvailableDateDatasets(pristine).length).toBe(0);
        expect(getVisualizationClassesState(pristine).length).toBe(0);
    });

    it("getLocalVisualizationClass does not throw", () => {
        expect(() => getLocalVisualizationClass(pristine, "column")).not.toThrow();
        expect(getLocalVisualizationClass(pristine, "column")).toBeUndefined();
    });

    it("currentReportMDObject does not throw with no visualization class selected", () => {
        expect(() => currentReportMDObject(pristine)).not.toThrow();
    });

    it("isDefaultVisualizationClass reports 'nothing to reset' when no class is available", () => {
        // With an empty class list the stored leaf is null (the slice cannot store undefined for a
        // non-draftable state) while the computed default is undefined. The selector normalizes both
        // sides, so both paths agree: no class to select means nothing to reset.
        expect(isDefaultVisualizationClass(pristine)).toBe(true);
        expect(
            isDefaultVisualizationClass(
                rootReducer(pristine, applicationCleared({ reset: buildApplicationResetCarrier([]) })),
            ),
        ).toBe(true);
    });

    it("the empty class list yields no default class", () => {
        // the slice initial is null — it cannot store undefined for a non-draftable state
        expect(pristine?.data?.visualizationClass).toBeNull();
    });

    describe("properties", () => {
        it("self-initializes both properties subtrees with the slice initials", () => {
            expect(pristine?.data?.visualizationProperties).toBeDefined();
            expect(pristine?.data?.propertiesMeta).toEqual({});
        });

        it("the domain accessors answer with the slices' initial state", () => {
            expect(VisualizationPropertiesSelectors.getProperties(pristine)).toEqual({
                controls: {},
                sortItems: [],
            });
            expect(VisualizationPropertiesSelectors.getPropertiesMeta(pristine)).toEqual({});
            expect(getVisualizationPropertiesSortItems(pristine)?.length ?? 0).toBe(0);
        });

        it("the raw-path readers that are left all carry a default", () => {
            // optional stacking, the recommendation flags and the dual-axis reads all fall back to
            // a default, which is what makes them safe on the absent subtree.
            expect(optionalStackingSelector(pristine)).toMatchObject({
                isStackMeasuresChecked: false,
                isStackToPercentChecked: false,
                isStackToPercentDisabledByNegativeValues: false,
            });
        });

        it("bucketsWereChanged does not invent sort items on the pristine state", () => {
            // It copies data.visualizationProperties.sortItems into the reference point, and the
            // slice's own fallback is what guarantees an empty list there.
            const sortItems = bucketsWereChanged(pristine)?.data?.referencePoint?.properties?.sortItems;

            expect(sortItems?.length ?? 0).toBe(0);
        });
    });

    describe("execution", () => {
        it("self-initializes report.execution with the slice initial", () => {
            expect(pristine?.report?.execution).toEqual({
                id: null,
                running: false,
                hasData: false,
            });
        });

        it("the domain accessor answers with the slice's initial state", () => {
            expect(getExecutionState(pristine)).toEqual({
                id: null,
                running: false,
                hasData: false,
            });
        });

        /**
         * These readers all render on the pristine state: the error screens and the export/save
         * gating ask "is something wrong / is there data" before anything has executed.
         */
        it("the execution readers answer without throwing", () => {
            // NOT isReportNotFoundSelector: it also composes displayBlockSelector, which reads the
            // never-seeded data.dragAndDrop through a fallback-less accessor — the same pre-existing
            // gap the visualization-class case above sidesteps.
            expect(isExecutionRunningSelector(pristine)).toBe(false);
            expect(hasDataSelector(pristine)).toBe(false);
            expect(isReportTooLargeSelector(pristine)).toBe(false);
            expect(isReportEmptySelector(pristine)).toBe(false);
            expect(getExecutionErrorResponseData(pristine)).toEqual({});
            expect(getExecutionLimitBreaks(pristine)).toEqual([]);
        });
    });

    describe("report", () => {
        it("self-initializes the report leaves with the slice initials", () => {
            expect(pristine?.report?.saving).toBe(false);
            expect(pristine?.report?.savingAsNew).toBe(false);
            expect(pristine?.report?.opening).toBe(false);
            expect(pristine?.report?.nowOpen).toBe(false);
            expect(pristine?.report?.lastSavedObject).toBeDefined();
        });

        /**
         * These readers run on the pristine state: the header renders the save/save-as buttons
         * (saving flags + the last-saved comparison), the export dialogs ask for the saving/
         * opening flags, and the error routing asks for the loading error before anything has
         * been opened.
         */
        it("the flag and loading-error readers answer with the seed values", () => {
            expect(isReportSaving(pristine)).toBe(false);
            expect(isReportOpening(pristine)).toBe(false);
            expect(isReportNowOpen(pristine)).toBe(false);
            expect(getReportLoadingErrorAccessor(pristine)).toBeUndefined();
            expect(hasReportLoadingError(pristine)).toBe(false);
        });

        it("the last-saved readers answer the seed's child values", () => {
            expect(getLastSavedReportTitle(pristine)).toEqual("");
            expect(getLastSavedReportUri(pristine)).toBeUndefined();
            expect(isReportSavedSelector(pristine)).toBe(false);
            expect(isReportLockedSelector(pristine)).toBe(false);
            expect(hasTitleChanged(pristine)).toBe(false);
            expect(hasDescriptionChanged(pristine)).toBe(false);
        });

        it("getNewReportMDObject grafts into the initial last-saved object without throwing", () => {
            // it spreads the accessor's return value — a raw getIn would answer undefined
            // here and the graft would crash the export/save flow
            expect(() => getNewReportMDObject(pristine)).not.toThrow();
            expect(getNewReportMDObject(pristine).visualizationObject.meta.title).toEqual("");
        });
    });

    describe("insight", () => {
        it("self-initializes the insight leaves with the slice initials", () => {
            expect(pristine?.data?.title).toBe("");
            expect(pristine?.data?.tags).toEqual([]);
            expect(pristine?.data?.summary).toBe("");
            expect(pristine?.data?.layers).toEqual([]);
            expect(pristine?.data?.layersOwner).toBeNull();
        });

        it("the domain accessors answer with the slices' initial values", () => {
            expect(getInsightTitle(pristine)).toEqual("");
            expect(getInsightTags(pristine)).toEqual([]);
            expect(getInsightSummary(pristine)).toEqual("");
            expect(getInsightLayers(pristine)).toEqual([]);
            expect(getInsightLayersOwner(pristine)).toEqual(null);
        });

        /**
         * These readers run on the pristine state: the editor header renders the title input,
         * the reset button asks whether the report has a name, and the save gating compares the
         * (absent) current meta with the last saved one. The "" fallbacks matter — with a raw
         * `state.getIn` the title would read undefined, and `isReportTitleEmpty` (undefined ===
         * "") would flip from true to false.
         */
        it("the title/summary readers answer with the empty values", () => {
            expect(currentReportTitle(pristine)).toEqual("");
            expect(hasDefinedTitle(pristine)).toBe(false);
            expect(isReportTitleEmpty(pristine)).toBe(true);
            expect(getReportTags(pristine)).toEqual([]);
            expect(getReportSummary(pristine)).toEqual("");
        });

        it("getStoredLayers answers the empty list without throwing on the spread", () => {
            expect(getStoredLayers(pristine)).toEqual([]);
        });
    });
});
