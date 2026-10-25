// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { clearInsightContent, resetApplication } from "../../actions/app_context_actions.js";
import { deleteReportFinished } from "../../actions/delete_actions.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { tableVisualizationClass } from "../../tests/constants.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { type IApplicationResetCarrier } from "../../typings/application_reset.js";
import { buildOpenReportFailed } from "../../utils/open_report_actions.js";
import { captureSnapshot } from "../_infra/time_travel.js";
import { type IAppState } from "../types.js";

import {
    applicationCleared,
    insightContentCleared,
    wholeApplicationReset,
} from "./application_reset_events.js";

/**
 * THE RESET INVENTORY. A slice that silently acquires or loses a reset case would drop a user value
 * (or wipe one that must survive), so the EXACT key set every reset scope touches is pinned here —
 * dirtied first, so a lazily-preserved key cannot pass by accident.
 */

const INSIGHT_CONTENT_KEYS = [
    "appState.sessionId",
    "data.attributeElements",
    "data.bucketNotifications",
    "data.buckets",
    "data.bucketsMeta",
    "data.chartSort",
    "data.configurationPanel",
    "data.extendedReferencePoint",
    "data.filterBar",
    "data.layers",
    "data.layersOwner",
    "data.propertiesMeta",
    "data.referencePoint",
    "data.visualizationProperties",
    "report.execution",
];

const APPLICATION_RESET_KEYS = [
    ...INSIGHT_CONTENT_KEYS,
    "data.insightUsagesOnDashboards",
    "data.summary",
    "data.tags",
    "data.title",
    "data.visualizationClass",
    "report.lastSavedObject",
    "report.nowOpen",
    "report.opening",
];

const testCarrier: IApplicationResetCarrier = {
    sessionId: "fresh-session",
    defaultVisualizationClass: tableVisualizationClass,
};

/** Every reset-scope key holds a non-initial value; several PRESERVED keys are dirtied too. */
function dirtiedState(): IAppState {
    const pristine = getInitializedState();
    // ONE typed literal: every key below is checked against the branch it belongs to
    const state: IAppState = {
        ...pristine,
        appState: {
            ...pristine.appState,
            sessionId: "dirty-session",
        },
        data: {
            ...pristine.data,
            attributeElements: { query: {}, items: [null], isLoading: true } as never,
            visualizationProperties: { controls: { legend: true } } as never,
            buckets: [{ localIdentifier: "measures", items: [{ localIdentifier: "m1" }] }] as never,
            bucketsMeta: { modified: { m1: true } } as never,
            layers: [{ id: "layer" }] as never,
            layersOwner: "owner" as never,
            filterBar: { items: [{ localIdentifier: "f1" }], parameterItems: [] } as never,
            chartSort: { appliedSort: [{ some: "sort" }], sortConfig: {} } as never,
            referencePoint: { buckets: [{ localIdentifier: "measures", items: [] }] } as never,
            extendedReferencePoint: { buckets: [] },
            configurationPanel: { ...pristine.data.configurationPanel, collapsed: false },
            propertiesMeta: { undoApplied: true },
            bucketNotifications: { removedItems: { measures: 1 } } as never,
            title: "dirty title",
            tags: ["t1"],
            summary: "dirty summary",
            visualizationClass: { visualizationClass: { url: "local:pie" } } as never,
            insightUsagesOnDashboards: { referencedDashboards: [] } as never,
            dateDatasets: { available: [{ id: "d1" }], loaded: true } as never,
            // deliberately PRESERVED values, dirtied so preservation is meaningful
            itemCache: { "metric.m1": { identifier: "metric.m1" } } as never,
            postponedAction: { type: "SOME_PARKED_ACTION" } as never,
        },
        report: {
            ...pristine.report,
            execution: { ...pristine.report.execution, hasData: true },
            lastSavedObject: { visualizationObject: { meta: { uri: "/gdc/md/1" } } } as never,
            opening: true,
            nowOpen: true,
            saving: true,
            loadingError: "someError" as never,
        },
    };
    // a non-empty undo history — cleared ONLY by the whole-application reset (and, as the
    // characterization pins, by the two trigger actions time travel keys on)
    return {
        ...state,
        timeTravel: { past: [{ state: captureSnapshot(state), actionType: "EDIT" }], future: [] },
    };
}

/** The child keys of the three branches (plus the root scalars) whose IDENTITY changed. */
function changedKeys(before: IAppState, after: IAppState): string[] {
    const changes: string[] = [];
    const branchNames = new Set(["appState", "data", "report"]);
    const rootKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const rootKey of rootKeys) {
        const b = before[rootKey as keyof IAppState] as Record<string, unknown>;
        const a = after[rootKey as keyof IAppState] as Record<string, unknown>;
        if (branchNames.has(rootKey)) {
            const childKeys = new Set([...Object.keys(b ?? {}), ...Object.keys(a ?? {})]);
            for (const childKey of childKeys) {
                if (!Object.is(b?.[childKey], a?.[childKey])) {
                    changes.push(`${rootKey}.${childKey}`);
                }
            }
        } else if (!Object.is(b, a)) {
            changes.push(rootKey);
        }
    }
    return changes.sort();
}

describe("the application-reset inventory", () => {
    it("insightContentCleared touches EXACTLY the insight-content keys", () => {
        const before = dirtiedState();
        const after = rootReducer(before, insightContentCleared({ reset: { sessionId: "fresh-session" } }));

        expect(changedKeys(before, after)).toEqual([...INSIGHT_CONTENT_KEYS].sort());
        expect(after.appState.sessionId).toBe("fresh-session");
    });

    it("applicationCleared touches EXACTLY the application-reset keys", () => {
        const before = dirtiedState();
        const after = rootReducer(before, applicationCleared({ reset: testCarrier }));

        expect(changedKeys(before, after)).toEqual([...APPLICATION_RESET_KEYS].sort());
        // the two RECOMPUTED values come off the carrier
        expect(after.appState.sessionId).toBe("fresh-session");
        expect(after.data.visualizationClass).toBe(tableVisualizationClass);
    });

    it("wholeApplicationReset adds the date datasets and the undo history", () => {
        const before = dirtiedState();
        const after = rootReducer(before, wholeApplicationReset({ reset: testCarrier }));

        expect(changedKeys(before, after)).toEqual(
            [...APPLICATION_RESET_KEYS, "data.dateDatasets", "timeTravel"].sort(),
        );
    });

    it("OPEN_REPORT_FAILED performs the application reset and leaves the loading error to its own case", () => {
        const before = dirtiedState();
        const after = rootReducer(before, buildOpenReportFailed(before));

        expect(changedKeys(before, after)).toEqual([...APPLICATION_RESET_KEYS].sort());
        expect(after?.report?.loadingError).toBe("someError");
    });

    it("DELETE_REPORT_FINISHED resets exactly when it carries the reset", () => {
        const before = dirtiedState();

        const withReset = rootReducer(before, deleteReportFinished(0, "/gdc/md/1", testCarrier));
        expect(changedKeys(before, withReset)).toEqual(
            // the success toast is the delete's own write, reset or not
            [...APPLICATION_RESET_KEYS, "appState.messages"].sort(),
        );

        const withoutReset = rootReducer(before, deleteReportFinished(0, "/gdc/md/other"));
        expect(changedKeys(before, withoutReset)).toEqual(["appState.messages"]);
    });

    it("these triggers write NOTHING except the history clear time travel keys on", () => {
        // RESET_APPLICATION / CLEAR_INSIGHT_CONTENT are pure intent —
        // sagas/reset_sagas.ts translates each into its event. Time travel keeps clearing on
        // the triggers too (belt and suspenders: the characterization suite pins them, and a
        // bare-store dispatch must keep clearing).
        const before = dirtiedState();

        expect(changedKeys(before, rootReducer(before, resetApplication()))).toEqual(["timeTravel"]);
        expect(changedKeys(before, rootReducer(before, clearInsightContent()))).toEqual(["timeTravel"]);
    });
});
