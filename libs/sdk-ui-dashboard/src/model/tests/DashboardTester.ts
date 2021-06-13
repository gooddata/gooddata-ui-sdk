// (C) 2021 GoodData Corporation

import { Identifier, idRef } from "@gooddata/sdk-model";
import { createDashboardStore, ReduxedDashboardStore } from "../state/dashboardStore";
import { DashboardState } from "../state/types";
import { DashboardContext } from "../types/commonTypes";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DashboardEvents, DashboardEventType } from "../events";
import { Middleware, PayloadAction } from "@reduxjs/toolkit";
import noop from "lodash/noop";
import { DashboardCommandType, LoadDashboard, loadDashboard } from "../commands";

type MonitoredAction = {
    calls: number;
    promise: Promise<PayloadAction<any>>;
    resolve: (action: PayloadAction<any>) => void;
    reject: (e: any) => void;
};

export class DashboardTester {
    protected readonly reduxedStore: ReduxedDashboardStore;
    private monitoredActions: Record<string, MonitoredAction> = {};
    private capturedActions: Array<PayloadAction<any>> = [];
    private capturedEvents: Array<DashboardEvents> = [];

    protected constructor(ctx: DashboardContext) {
        // Middleware to store the actions and create promises
        const testerMiddleware: Middleware = () => (next) => (action) => {
            if (action.type.startsWith("@@redux/")) {
                //
            } else {
                this.onActionCaptured(action);
            }

            return next(action);
        };

        this.reduxedStore = createDashboardStore({
            sagaContext: ctx,
            additionalMiddleware: testerMiddleware,
            initialEventHandlers: [
                {
                    eval: () => true,
                    handler: this.eventHandler,
                },
            ],
        });
    }

    private getOrCreateMonitoredAction = (actionType: string): MonitoredAction => {
        const existingAction: MonitoredAction = this.monitoredActions[actionType];

        if (existingAction) {
            return existingAction;
        }

        const partialAction = {
            calls: 0,
            resolve: noop,
            reject: noop,
        };

        const promise = new Promise<PayloadAction<any>>((resolve, reject) => {
            partialAction.resolve = resolve;
            partialAction.reject = reject;
        });

        const newAction: MonitoredAction = {
            ...partialAction,
            promise,
        };

        this.monitoredActions[actionType] = newAction;

        return newAction;
    };

    private onActionCaptured = (action: PayloadAction<any>): void => {
        this.capturedActions.push(action);

        const monitoredAction = this.getOrCreateMonitoredAction(action.type);
        monitoredAction.calls += 1;
        monitoredAction.resolve(action);
    };

    private eventHandler = (evt: DashboardEvents): void => {
        this.capturedEvents.push(evt);
    };

    public static forRecording(
        identifier: Identifier,
        backendConfig?: RecordedBackendConfig,
    ): DashboardTester {
        const ctx: DashboardContext = {
            backend: recordedBackend(ReferenceRecordings.Recordings, backendConfig),
            workspace: "reference-workspace",
            dashboardRef: idRef(identifier),
        };

        return new DashboardTester(ctx);
    }

    public dispatch(action: PayloadAction<any>): void {
        this.reduxedStore.store.dispatch(action);
    }

    /**
     * Wait for action to occur. The wait is bounded by a timeout that is 1s by default.
     *
     * @param actionType - action type to wait for
     * @param timeout - timeout after which the wait fails, default is 1000
     */
    public waitFor(
        actionType: DashboardEventType | DashboardCommandType | string,
        timeout: number = 1000,
    ): Promise<any> {
        return Promise.race([
            this.getOrCreateMonitoredAction(actionType).promise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Wait for action '${actionType}' timed out after ${timeout}ms`));
                }, timeout);
            }),
        ]);
    }

    /**
     * Returns all actions that were dispatched since the tester was created or since it was last reset.
     */
    public dispatchedActions(): ReadonlyArray<PayloadAction<any>> {
        return this.capturedActions.slice();
    }

    /**
     * Returns all events that were emitted during execution. Events are a sub-type of actions - they are
     * actions that are suitable for external consumption and describe what has happened in the dashboard.
     *
     * The events are accumulated during test run. You may reset them using `resetMonitors`
     */
    public emittedEvents(): ReadonlyArray<DashboardEvents> {
        return this.capturedEvents.slice();
    }

    /**
     * Returns digests of all events that were emitted during execution. Digest contains just the event
     * type and the correlation id of the event. The payload is discarded.
     *
     * This is useful for snapshotting event sequence.
     */
    public emittedEventsDigest(): ReadonlyArray<{ type: string; correlationId?: string }> {
        return this.capturedEvents.map((evt) => {
            return {
                type: evt.type,
                correlationId: evt.correlationId,
            };
        });
    }

    /**
     * Resets internal state of the tester's monitors. The captured actions will be cleared up as part
     * of this.
     */
    public resetMonitors(): void {
        this.capturedActions = [];
        this.capturedEvents = [];
        this.monitoredActions = {};
    }

    /**
     * Returns dashboard state.
     */
    public state(): DashboardState {
        return this.reduxedStore.store.getState();
    }
}

/**
 * This factory will return a function that can be integrated into jest's `beforeAll` or `beforeEach` statements. That returned
 * function will drive initialization of the dashboard tester and will tell jest it's `done` or it will `fail`.
 *
 * When successfully loaded, the returned function will call both the `onLoaded` callback and jest's `done` callback.
 *
 * An example usage:
 *
 * ```
 *    let Tester: DashboardTester;
 *    beforeAll(preloadedTesterFactory((tester) => Tester = tester, SimpleDashboardIdentifier));
 *
 *    it("should do xyz", () => {
 *
 *    })
 * ```
 *
 * Obvious warning: beforeAll creates one instance for all tests and is therefore not safe when some tests do modifications of
 * the dashboard. Use beforeEach in that case.
 *
 * Note: before sending the instance of dashboard tester, the function will ensure all the event monitors are reset so
 * that the captured events related to load do not interfere with the test itself.
 *
 * @param onLoaded - function to call when the dashboard is successfully loaded
 * @param identifier - identifier of the dashboard to load
 * @param loadCommand - optionally customize the load command to use
 * @param backendConfig - optionally customize the recorded backend configuration
 */
export function preloadedTesterFactory(
    onLoaded: (tester: DashboardTester) => void,
    identifier: Identifier,
    loadCommand: LoadDashboard = loadDashboard(),
    backendConfig?: RecordedBackendConfig,
) {
    return (done: jest.DoneCallback): void => {
        const tester = DashboardTester.forRecording(identifier, backendConfig);

        tester.dispatch(loadCommand);

        tester
            .waitFor("GDC.DASH/EVT.LOADED")
            .then(() => {
                tester.resetMonitors();
                onLoaded(tester);
                done();
            })
            .catch((err) => {
                done.fail(`DashboardTester failed to load dashboard: ${err.message}`);
            });
    };
}
