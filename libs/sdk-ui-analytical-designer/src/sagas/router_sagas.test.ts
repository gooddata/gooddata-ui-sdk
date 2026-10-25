// (C) 2007-2026 GoodData Corporation

import { expectSaga, testSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import { ActionTypeKeys } from "../constants/actions.js";
import { buildInitialState } from "../reducers/initial_state.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import {
    getDataSet,
    getReportId,
    isForceReload,
    isFullReloadNeeded,
    isLocationChangeLocked,
    reportIdParamChanged,
} from "../selectors/route_selector.js";
import { applicationCleared, wholeApplicationReset } from "../store/app_context/application_reset_events.js";
import {
    locationChanged as locationChangedAction,
    openInAnalyticalDesignerAction,
    reportIdChanged,
    routeChanged,
    routeParamsChanged,
} from "../store/router/router_actions.js";
import { buildNextRoute } from "../store/router/router_helpers.js";
import { type IAppState } from "../store/types.js";
import { withRoot } from "../tests/state_builder.test.helpers.js";
import { type ICustomRouteParams } from "../typings/location.js";
import { getRouteParams, getRouteUri, setLocation } from "../utils/location.js";

import { bootstrap } from "./bootstrap_sagas.js";
import { loadAttributeHierarchies } from "./catalog/catalog_saga.js";
import { updateSelectedDataset } from "./datasets_sagas.js";
import { fetchReport } from "./open_report_sagas.js";
import {
    invokeFullReload,
    locationChanged,
    setDatasetRouteParam,
    updateReport,
    watchRouter,
} from "./router_sagas.js";

describe("routerSagas", () => {
    describe("locationChanged", () => {
        // the LOCATION_CHANGED trigger writes nothing — the worker's synchronous
        // prefix computes the route pair, commits it with ONE `routeChanged` event and decides
        // the whole-application reset, all before any cancellable effect
        // the hash carries no workspace prefix (the host owns it); a bare hash means the default report
        const hash = "#/";

        it("commits the route pair and the whole-application reset BEFORE the redirect-lock check", async () => {
            const mockedState: IAppState = buildInitialState();
            const expectedRoute = buildNextRoute(hash, undefined);

            const saga = await expectSaga(locationChanged, locationChangedAction(hash))
                .withState(mockedState)
                .provide([[call(isLocationChangeLocked, mockedState), true]])
                .silentRun(0);

            const putActions = saga.effects.put.map((effect) => effect.payload.action);
            // the first navigation has no previous route and the default report id — reset
            expect(putActions[0]).toEqual(routeChanged(expectedRoute, undefined));
            expect(putActions[1].type).toEqual(wholeApplicationReset.type);
        });

        it("does NOT reset when the navigation stays on the same report", async () => {
            const currentRoute = { params: { projectId: "proj", reportId: "report1" } };
            const mockedState: IAppState = withRoot(buildInitialState(), {
                route: currentRoute,
            }) as IAppState;

            const saga = await expectSaga(locationChanged, locationChangedAction("#/report1/edit"))
                .withState(mockedState)
                .provide([[call(isLocationChangeLocked, mockedState), true]])
                .silentRun(0);

            const putTypes = saga.effects.put.map((effect) => effect.payload.action.type);
            expect(putTypes).not.toContain(wholeApplicationReset.type);
            expect(putTypes).not.toContain(applicationCleared.type);
        });

        it("should do nothing more if 'isLocationChangeLocked' returns true", async () => {
            const mockedState: IAppState = buildInitialState();

            const { effects } = await expectSaga(locationChanged, locationChangedAction(hash))
                .withState(mockedState)
                .provide([[call(isLocationChangeLocked, mockedState), true]])
                .silentRun(0);

            expect(effects.call).toEqual([
                call(buildNextRoute, hash, undefined),
                call(isLocationChangeLocked, mockedState),
            ]);
        });

        it("should call 'invokeFullReload' saga if 'isFullReloadNeeded' returns true", async () => {
            const mockedState: IAppState = buildInitialState();

            await expectSaga(locationChanged, locationChangedAction(hash))
                .withState(mockedState)
                .provide([
                    [call(isLocationChangeLocked, mockedState), false],
                    [call(isFullReloadNeeded, mockedState), true],
                    [call(invokeFullReload, mockedState), undefined],
                ])
                .call(invokeFullReload, mockedState)
                .silentRun(0);
        });

        it("should fire report id changed action if 'isLocationChangeLocked' and 'isFullReloadNeeded' returns false and id changed", async () => {
            const mockedState: IAppState = buildInitialState();

            await expectSaga(locationChanged, locationChangedAction(hash))
                .withState(mockedState)
                .provide([
                    [call(isLocationChangeLocked, mockedState), false],
                    [call(isFullReloadNeeded, mockedState), false],
                    [call(reportIdParamChanged, mockedState), true],
                    [call(getReportId, mockedState), "newId"],
                    [call(loadAttributeHierarchies), undefined],
                ])
                .put(reportIdChanged("newId"))
                .silentRun(0);
        });

        it("should fire routeParamsChanged action when full reload is not needed", async () => {
            const mockedState: IAppState = buildInitialState();

            await expectSaga(locationChanged, locationChangedAction(hash))
                .withState(mockedState)
                .provide([
                    [call(isLocationChangeLocked, mockedState), false],
                    [call(isFullReloadNeeded, mockedState), false],
                    [call(reportIdParamChanged, mockedState), false],
                    [call(loadAttributeHierarchies), undefined],
                ])
                .put(routeParamsChanged())
                .silentRun(0);
        });
    });

    describe("setDatasetRouteParam", () => {
        it("should do nothing if dataset not changed", () => {
            const dataset = "old";

            testSaga(setDatasetRouteParam, {
                type: ActionTypeKeys.UI_CHANGE_DATASET,
                payload: { dataset },
            })
                .next()
                .select(getDataSet)
                .next(dataset)
                .isDone();
        });

        it("should redirect if dataset changed", () => {
            const originalDataset = "old";
            const dataset = "changed";

            const state: IAppState = buildInitialState();
            const options: ICustomRouteParams = {
                dataset,
            };
            const uri = "/what";

            testSaga(setDatasetRouteParam, {
                type: ActionTypeKeys.UI_CHANGE_DATASET,
                payload: { dataset },
            })
                .next()
                .select(getDataSet)
                .next(originalDataset)
                .select()
                .next(state)
                .call(getRouteUri, state, options)
                .next(uri)
                .call(setLocation, uri)
                .next()
                .isDone();
        });
    });

    describe("invokeFullReload", () => {
        it("should invoke default bootstrap and dataset update without forced reload", async () => {
            const mockedState: IAppState = buildInitialState();
            const uriParams: ICustomRouteParams = {};

            const { effects } = await expectSaga(invokeFullReload, mockedState)
                .provide([
                    [call(getRouteParams, mockedState), uriParams],
                    [call(updateSelectedDataset, true), undefined],
                    [call(bootstrap, uriParams), undefined],
                    [call(isForceReload, mockedState), false],
                ])
                .call(updateSelectedDataset, true)
                .call(bootstrap, uriParams)
                .silentRun(0);

            expect(effects.put).toBeUndefined();
        });

        it("should call setLocation with new URI if 'isForceReload' returns true", async () => {
            const mockedState: IAppState = buildInitialState();
            const uriParams: ICustomRouteParams = {};
            const newUri = "/new/uri/";

            await expectSaga(invokeFullReload, mockedState)
                .provide([
                    [call(getRouteParams, mockedState), uriParams],
                    [call(updateSelectedDataset, true), undefined],
                    [call(bootstrap, uriParams), undefined],
                    [call(isForceReload, mockedState), true],
                    [call(getRouteUri, mockedState), newUri],
                    // stubbed out: the real saga navigates the test window, and the mutated location
                    // then leaks into every test file that runs later (the suite is non-isolated)
                    [call(setLocation, newUri), undefined],
                ])
                .call(updateSelectedDataset, true)
                .call(bootstrap, uriParams)
                .call(setLocation, newUri)
                .silentRun(0);
        });
    });

    describe("updateReport", () => {
        it("should call 'fetchReport' saga", async () => {
            const projectId = "projectId";
            const reportId = "reportId";
            const action = reportIdChanged(reportId);
            // the saga needs a real root: its unprovided `select`s now read the state by
            // PROPERTY, so `undefined` would crash
            await expectSaga(updateReport, action)
                .withState(buildInitialState())
                .provide([[select(getProjectId), projectId]])
                .call(fetchReport, projectId, reportId)
                .silentRun(0);
        });
    });

    describe("openCurrentInsightInNewTab", () => {
        it("should open current insight in new tab", async () => {
            window.open = vi.fn();
            const appState: IAppState = buildInitialState();
            await expectSaga(watchRouter)
                .provide([
                    [select(), appState],
                    [
                        call(getRouteParams, appState),
                        {
                            projectId: "projectId",
                            reportId: "insightId",
                            hideAction: "[save,open]",
                        },
                    ],
                ])
                .dispatch(openInAnalyticalDesignerAction())
                .silentRun();

            const expectUrl = "/workspace/projectId/analyze/#/insightId/edit";
            expect(window.open).toBeCalledWith(expectUrl, "_blank");

            vi.clearAllMocks();
        });
    });
});
