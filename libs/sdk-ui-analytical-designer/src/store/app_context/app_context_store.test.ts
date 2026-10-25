// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IColorPalette } from "@gooddata/sdk-model";

import {
    type IBootstrapData,
    appFinishedLoading,
    appStartedLoading,
    bootstrapData,
    bootstrapError,
} from "../../actions/app_context_actions.js";
import { NOT_AUTHENTICATED_ERROR, NOT_AUTHORIZED_ERROR } from "../../constants/errors.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { updateChartSortConfig } from "../../sagas/chart_sort/chart_sort_ui_actions.js";
import { attributeSortConfig } from "../../tests/chart_sort.test.helpers.js";
import { createAnalyticalDashboard, tableVisualizationClass } from "../../tests/constants.test.helpers.js";
import { DATE_FILTER_DATASET_REF } from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withAppState, withData, withReport } from "../../tests/state_builder.test.helpers.js";
import { setRemovedItems } from "../bucket_notifications/bucket_notifications_actions.js";
import { getRemovedItems } from "../bucket_notifications/bucket_notifications_selector.js";
import { getSortConfig } from "../chart_sort/chart_sort_selector.js";
import { getExecutionState } from "../execution/execution_selectors.js";
import { getFilterBarState } from "../filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../filter_bar/filter_bar_service.js";
import { defaultFilterBarState } from "../filter_bar/filter_bar_state.js";
import {
    type IInsightLayersState,
    insightLayersInitialState,
    insightLayersOwnerInitialState,
    insightTitleInitialState,
} from "../insight/insight_state.js";
import { type IInsightUsage } from "../insight_usage/insight_usage_state.js";
import { propertiesInitialState } from "../properties/properties_state.js";
import { lastSavedObjectInitialState, reportOpeningInitialState } from "../report/report_state.js";
import { type IAppState } from "../types.js";
import { getVisualizationClassesState } from "../visualization_classes/visualization_classes_selectors.js";

import {
    applicationCleared,
    buildApplicationResetCarrier,
    buildInsightContentResetCarrier,
    insightContentCleared,
} from "./application_reset_events.js";

/**
 * The reset scopes are SEMANTIC EVENTS honored by the owning slices
 * (store/app_context/application_reset_events.ts); the RESET_APPLICATION / CLEAR_INSIGHT_CONTENT
 * triggers write nothing and `sagas/reset_sagas.ts` translates each into its event. These helpers
 * dispatch the events the way production does, carrier included, through the real root reducer.
 */
const applyApplicationCleared = (state: IAppState): IAppState =>
    rootReducer(
        state,
        applicationCleared({ reset: buildApplicationResetCarrier(getVisualizationClassesState(state)) }),
    );

const applyInsightContentCleared = (state: IAppState): IAppState =>
    rootReducer(state, insightContentCleared({ reset: buildInsightContentResetCarrier() }));

describe("app context reducers", () => {
    describe("bootstrap", () => {
        const prepareBootstrapResponse = (
            options: { language?: string; colorPalette?: IColorPalette } = {},
        ): { data: IBootstrapData; windowInfo: Window } => {
            const { language, colorPalette } = options;
            return {
                data: {
                    project: {
                        uri: "/gdc/md/food/",
                        title: "title",
                    },
                    user: {
                        language,
                    },
                    colorPalette,
                } as IBootstrapData,
                windowInfo: {} as Window,
            };
        };

        // The bootstrap locale tests moved with the intl slice:
        // store/intl/test/intl_store.test.ts + reducers/test/app_context_characterization.test.ts

        it("should parse color palette if provided", () => {
            const colorPalette = [
                {
                    guid: "01",
                    fill: {
                        r: 255,
                        g: 0,
                        b: 0,
                    },
                },
            ];
            const { data } = prepareBootstrapResponse({
                colorPalette,
            });
            const result = rootReducer(initialState, bootstrapData(data));

            expect(result.colorPalette).toEqual(colorPalette);
        });

        it("should clear error when there is bootstrap data", () => {
            const state = rootReducer(
                getInitializedState(),
                bootstrapError("foo", { type: NOT_AUTHORIZED_ERROR }),
            );

            const { data } = prepareBootstrapResponse();
            const result = rootReducer(state, bootstrapData(data));

            expect(state.appState.errors).toEqual([{ type: NOT_AUTHORIZED_ERROR }]);
            expect(result.appState.errors).toEqual([]);
        });
    });

    describe("changeAppReadiness", () => {
        it("should flip app readiness", () => {
            const getAppReady = (state: IAppState) => state.appState.appReady;

            // the appReady mini-slice self-initializes (no literal seed)
            expect(getAppReady(getInitializedState())).toEqual(false);

            const appReadyState = rootReducer(initialState, appFinishedLoading());
            expect(getAppReady(appReadyState)).toEqual(true);

            const appNotReadyState = rootReducer(appReadyState, appStartedLoading());
            expect(getAppReady(appNotReadyState)).toEqual(false);
        });
    });

    describe("bootstrap errors", () => {
        it("should set errors in state", () => {
            const error = { type: NOT_AUTHENTICATED_ERROR };

            const action = bootstrapError("foo", error);
            const changedState = rootReducer(initialState, action);
            expect(changedState.appState.errors).toEqual([error]);
            expect(changedState.projectId).toEqual("foo");
        });
    });

    describe("resetApplication", () => {
        it("should reset execution has data flag", () => {
            // through the domain accessor, because the execution subtree is slice-owned:
            // the slice self-initializes
            const getReportExecutionHasData = (state: IAppState) => getExecutionState(state).hasData;

            expect(getReportExecutionHasData(initialState)).toEqual(false);

            const changedState = withReport(initialState, {
                execution: { ...initialState.report.execution, hasData: true },
            });
            expect(getReportExecutionHasData(changedState)).toEqual(true);

            const resettedState = applyApplicationCleared(changedState);
            expect(getReportExecutionHasData(resettedState)).toEqual(false);
        });

        it("should select visualization properties", () => {
            const changedState = withData(initialState, { visualizationProperties: { foo: "bar" } });

            const resettedState = applyApplicationCleared(changedState);

            // the subtree is slice-owned — the transformer writes the
            // domain's own initial state instead
            expect(resettedState.data.visualizationProperties).toBe(propertiesInitialState);
        });

        it("should reset report title", () => {
            const changedState = withData(initialState, { title: "new title" });

            const resettedState = applyApplicationCleared(changedState);

            // the leaf is slice-owned — the transformer writes the insight
            // domain's own initial value instead
            expect(resettedState.data.title).toEqual(insightTitleInitialState);
        });

        it("should reset last saved object", () => {
            const changedState = withReport(initialState, {
                lastSavedObject: {
                    visualizationObject: {
                        meta: {
                            title: "last saved",
                        },
                        content: {} as never,
                    },
                },
            });

            const resettedState = applyApplicationCleared(changedState);

            // the report domain's own initial value replaces the deleted seed —
            expect(resettedState.report.lastSavedObject).toEqual(lastSavedObjectInitialState);
        });

        it("should reset new open flag", () => {
            const changedState = withReport(initialState, { nowOpen: true });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.report.nowOpen).toEqual(false);
        });

        it("should reset buckets meta", () => {
            const changedState = withData(initialState, {
                bucketsMeta: { ...initialState.data.bucketsMeta },
            });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.data.bucketsMeta).toEqual(initialState.data.bucketsMeta);
        });

        it("should reset reference point", () => {
            const changedState = withData(initialState, {
                referencePoint: { ...initialState.data.referencePoint },
            });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.data.referencePoint).toEqual(initialState.data.referencePoint);
        });

        it("should reset reference point extended", () => {
            const changedState = withData(initialState, { extendedReferencePoint: {} });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.data.extendedReferencePoint).toEqual(
                initialState.data.extendedReferencePoint,
            );
        });

        it("should reset removed items", () => {
            const setRemovedItemsAction = setRemovedItems({
                measures: 1,
                measureValueFilters: 42,
                rankingFilter: true,
            });
            const changedState = combinedRootReducer(initialState, setRemovedItemsAction);
            const resetState = applyApplicationCleared(changedState);
            expect(getRemovedItems(resetState)).toBeNull();
        });

        it("should reset filter bar state", () => {
            const initialState = getInitializedState();
            const stateWithFilters = FilterBarService.setFilterBarState(initialState, {
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "date",
                        localIdentifier: "localIdentifier",
                        cacheItemIdentifier: "date.identifier",
                        overTimeComparisonType: "nothing",
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                ],
                isMultiline: true,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });

            const resultState = applyApplicationCleared(stateWithFilters);

            expect(getFilterBarState(resultState)).toEqual(defaultFilterBarState);
        });

        it("should reset app session ID", () => {
            const changedState = withAppState(initialState, { sessionId: "123-abc" });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.appState.sessionId).not.toEqual(changedState.appState.sessionId);
        });

        it("should reset visualization class", () => {
            const changedState = withData(initialState, { visualizationClass: tableVisualizationClass });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.data.visualizationClass).not.toEqual(changedState.data.visualizationClass);
        });

        it("should reset report opening flag", () => {
            const changedState = withReport(initialState, {
                opening: tableVisualizationClass as unknown as boolean,
            });

            const resettedState = applyApplicationCleared(changedState);

            // the report domain's own initial value replaces the deleted seed
            expect(resettedState.report.opening).toEqual(reportOpeningInitialState);
        });

        it("should clear insight layers", () => {
            const changedState = withData(initialState, {
                layers: [{ id: "layer" } as unknown as IInsightLayersState[number]],
            });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.data.layers).toEqual(insightLayersInitialState);
        });

        it("should clear insight layers owner", () => {
            const changedState = withData(initialState, { layersOwner: "owner" });

            const resettedState = applyApplicationCleared(changedState);

            expect(resettedState.data.layersOwner).toEqual(insightLayersOwnerInitialState);
        });

        it("should reset usages of dashboard", () => {
            const changedState = withData(initialState, {
                insightUsagesOnDashboards: {
                    referencedDashboards: [createAnalyticalDashboard("name", "identifier", 123)],
                    allUserDashboards: [],
                },
            });

            const resettedState = applyApplicationCleared(changedState);

            // the subtree is slice-owned, so the reset writes the domain's null
            // default instead of deleting the key (equivalent for every reader)
            expect(resettedState.data.insightUsagesOnDashboards).toBeNull();
        });
    });

    describe("clearInsightContent", () => {
        it("should reset execution has data flag", () => {
            // through the domain accessor, because the execution subtree is slice-owned:
            // the slice self-initializes
            const getReportExecutionHasData = (state: IAppState) => getExecutionState(state).hasData;

            expect(getReportExecutionHasData(initialState)).toEqual(false);

            const changedState = withReport(initialState, {
                execution: { ...initialState.report.execution, hasData: true },
            });
            expect(getReportExecutionHasData(changedState)).toEqual(true);

            const resettedState = applyInsightContentCleared(changedState);
            expect(getReportExecutionHasData(resettedState)).toEqual(false);
        });

        it("should clear insight layers", () => {
            const changedState = withData(initialState, {
                layers: [{ id: "layer" } as unknown as IInsightLayersState[number]],
            });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.layers).toEqual(insightLayersInitialState);
        });

        it("should clear insight layers owner", () => {
            const changedState = withData(initialState, { layersOwner: "owner" });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.layersOwner).toEqual(insightLayersOwnerInitialState);
        });

        it("should select visualization properties", () => {
            const changedState = withData(initialState, { visualizationProperties: { foo: "bar" } });

            const resettedState = applyInsightContentCleared(changedState);

            // the subtree is slice-owned — the transformer writes the
            // domain's own initial state instead
            expect(resettedState.data.visualizationProperties).toBe(propertiesInitialState);
        });

        it("should not reset report title", () => {
            const changedState = withData(initialState, { title: "new title" });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.title).toEqual(changedState.data.title);
        });

        it("should not reset last saved object", () => {
            const changedState = withReport(initialState, {
                lastSavedObject: {
                    visualizationObject: {
                        meta: {
                            title: "last saved",
                        },
                        content: {} as never,
                    },
                },
            });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.report.lastSavedObject).toEqual(changedState.report.lastSavedObject);
        });

        it("should not reset new open flag", () => {
            const changedState = withReport(initialState, { nowOpen: true });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.report.nowOpen).toEqual(true);
        });

        it("should reset buckets meta", () => {
            const changedState = withData(initialState, {
                bucketsMeta: { ...initialState.data.bucketsMeta },
            });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.bucketsMeta).toEqual(initialState.data.bucketsMeta);
        });

        it("should reset reference point", () => {
            const changedState = withData(initialState, {
                referencePoint: { ...initialState.data.referencePoint },
            });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.referencePoint).toEqual(initialState.data.referencePoint);
        });

        it("should reset reference point extended", () => {
            const changedState = withData(initialState, { extendedReferencePoint: {} });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.extendedReferencePoint).toEqual(
                initialState.data.extendedReferencePoint,
            );
        });

        it("should reset removed items", () => {
            const setRemovedItemsAction = setRemovedItems({
                measures: 1,
                measureValueFilters: 42,
                rankingFilter: true,
            });
            const changedState = combinedRootReducer(initialState, setRemovedItemsAction);
            const resetState = applyInsightContentCleared(changedState);
            expect(getRemovedItems(resetState)).toBeNull();
        });

        it("should reset filter bar state", () => {
            const initialState = getInitializedState();
            const stateWithFilters = FilterBarService.setFilterBarState(initialState, {
                attributeFilterConfigs: {},
                items: [
                    {
                        type: "date",
                        localIdentifier: "localIdentifier",
                        cacheItemIdentifier: "date.identifier",
                        overTimeComparisonType: "nothing",
                        dateDatasetRef: DATE_FILTER_DATASET_REF,
                    },
                ],
                isMultiline: true,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });

            const resultState = applyInsightContentCleared(stateWithFilters);

            expect(getFilterBarState(resultState)).toEqual(defaultFilterBarState);
        });

        it("should reset app session ID", () => {
            const changedState = withAppState(initialState, { sessionId: "123-abc" });

            const migratedState = applyInsightContentCleared(changedState);

            expect(migratedState.appState.sessionId).not.toEqual(changedState.appState.sessionId);
        });

        it("should not reset visualization class", () => {
            const changedState = withData(initialState, { visualizationClass: tableVisualizationClass });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.visualizationClass).toEqual(changedState.data.visualizationClass);
        });

        it("should not reset report opening flag", () => {
            const changedState = withReport(initialState, {
                opening: tableVisualizationClass as unknown as boolean,
            });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.report.opening).toEqual(changedState.report.opening);
        });

        it("should not reset usages of dashboard", () => {
            const changedState = withData(initialState, {
                insightUsagesOnDashboards: [
                    createAnalyticalDashboard("name", "identifier", 123),
                ] as unknown as IInsightUsage,
            });

            const resettedState = applyInsightContentCleared(changedState);

            expect(resettedState.data.insightUsagesOnDashboards).toEqual(
                changedState.data.insightUsagesOnDashboards,
            );
        });

        it("should reset chart sort", () => {
            const action = updateChartSortConfig(attributeSortConfig);
            const stateWithChartSort = rootReducer(getInitializedState(), action);
            const resetState = applyInsightContentCleared(stateWithChartSort);
            const result = getSortConfig(resetState);
            expect(result).toMatchSnapshot();
        });
    });
});
