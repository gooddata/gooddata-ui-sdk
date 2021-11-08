// (C) 2021 GoodData Corporation

import { Identifier, idRef } from "@gooddata/sdk-model";
import { createDashboardStore, ReduxedDashboardStore } from "../store/dashboardStore";
import { DashboardState } from "../store/types";
import { DashboardContext, DashboardModelCustomizationFns } from "../types/commonTypes";
import {
    recordedBackend,
    RecordedBackendConfig,
    defaultRecordedBackendCapabilities,
} from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    DashboardEvents,
    DashboardEventType,
    isDashboardCommandStarted,
    isDashboardQueryCompleted,
    isDashboardQueryStarted,
} from "../events";
import { Middleware, PayloadAction } from "@reduxjs/toolkit";
import noop from "lodash/noop";
import {
    DashboardCommands,
    DashboardCommandType,
    InitializeDashboard,
    initializeDashboard,
} from "../commands";
import { IDashboardQuery } from "../queries";
import { queryEnvelopeWithPromise } from "../store/_infra/queryProcessing";
import { IDashboardQueryService } from "../store/_infra/queryService";
import { newRenderingWorker, RenderingWorkerConfiguration } from "../commandHandlers/render/renderingWorker";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";

type MonitoredAction = {
    calls: number;
    promise: Promise<PayloadAction<any>>;
    resolve: (action: PayloadAction<any>) => void;
    reject: (e: any) => void;
};

type DashboardTesterConfig = {
    queryServices?: IDashboardQueryService<any, any>[];
    renderingWorkerConfig?: RenderingWorkerConfiguration;
    customizationFns?: DashboardModelCustomizationFns;
};

export class DashboardTester {
    protected readonly reduxedStore: ReduxedDashboardStore;
    private monitoredActions: Record<string, MonitoredAction> = {};
    private capturedActions: Array<PayloadAction<any>> = [];
    private capturedEvents: Array<DashboardEvents> = [];

    protected constructor(ctx: DashboardContext, config?: DashboardTesterConfig) {
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
            dashboardContext: ctx,
            additionalMiddleware: testerMiddleware,
            eventing: {
                initialEventHandlers: [
                    {
                        eval: () => true,
                        handler: this.eventHandler,
                    },
                ],
            },
            queryServices: config?.queryServices,
            backgroundWorkers: [newRenderingWorker(config?.renderingWorkerConfig)],
            privateContext: config?.customizationFns,
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

    private commandFailedRejectsWaitFor = () => {
        const commandFailed = this.getOrCreateMonitoredAction("GDC.DASH/EVT.COMMAND.FAILED");

        return commandFailed.promise.then((evt) => {
            // eslint-disable-next-line no-console
            console.error(`Command processing failed: ${evt.payload.reason} - ${evt.payload.message}`);

            throw evt.payload.error;
        });
    };

    private commandRejectedEndsWaitFor = () => {
        const commandRejected = this.getOrCreateMonitoredAction("GDC.DASH/EVT.COMMAND.REJECTED");

        return commandRejected.promise.then((evt) => {
            // eslint-disable-next-line no-console
            console.error(
                "Command was rejected because dashboard does not know how to handle it. " +
                    "This is likely because the handler for the rejected command is not registered in the system. See root command handler.",
            );

            throw evt;
        });
    };

    /**
     * Creates an instance of DashboardTester set up to run tests on top of a dashboard with the provided
     * identifier. The dashboard will be loaded from recorded backend, from its reference workspace.
     *
     * You may additionally influence how the different query services behave (typically to stub/mock the service)
     *
     * @param identifier
     * @param testerConfig
     * @param backendConfig
     * @param customCapabilities
     */
    public static forRecording(
        identifier: Identifier,
        testerConfig?: DashboardTesterConfig,
        backendConfig?: RecordedBackendConfig,
        customCapabilities?: Partial<IBackendCapabilities>,
    ): DashboardTester {
        const ctx: DashboardContext = {
            backend: recordedBackend(ReferenceRecordings.Recordings, backendConfig, {
                ...defaultRecordedBackendCapabilities,
                ...customCapabilities,
            }),
            workspace: "reference-workspace",
            dashboardRef: idRef(identifier),
        };

        return new DashboardTester(ctx, testerConfig);
    }

    /**
     * Creates an instance of DashboardTester set up to run tests on top of an empty, freshly initialized dashboard.
     *
     * You may additionally influence how the different query services behave (typically to stub/mock the service)
     *
     * @param testerConfig
     * @param backendConfig
     */
    public static forNewDashboard(
        testerConfig?: DashboardTesterConfig,
        backendConfig?: RecordedBackendConfig,
    ): DashboardTester {
        const ctx: DashboardContext = {
            backend: recordedBackend(ReferenceRecordings.Recordings, backendConfig),
            workspace: "reference-workspace",
        };

        return new DashboardTester(ctx, testerConfig);
    }

    public dispatch(action: DashboardCommands | PayloadAction<any>): void {
        /*
         * Clearing monitored actions is essential to allow sane usage in tests that need fire a command and wait
         * for the same type of event multiple times. Monitored actions is what is used to wait in the `waitFor`
         * method. Without the clearing, the second `waitFor` would bail out immediately and return the very first
         * captured event.
         */
        this.monitoredActions = {};
        this.reduxedStore.store.dispatch(action);
    }

    /**
     * Convenience function that combines both {@link dispatch} and {@link waitFor}.
     *
     * @param action - action (typically a command) to dispatch
     * @param actionType - type of action (typically an event type) to wait for
     * @param timeout - timeout after which the wait fails, default is 1000
     */
    public dispatchAndWaitFor(
        action: DashboardCommands | PayloadAction<any>,
        actionType: DashboardEventType | DashboardCommandType | string,
        timeout: number = 1000,
    ): Promise<any> {
        this.dispatch(action);

        return this.waitFor(actionType, timeout);
    }

    /**
     * Starts a dashboard query.
     *
     * @param action - query action
     */
    public query<TResult>(action: IDashboardQuery<TResult>): Promise<TResult> {
        const { envelope, promise } = queryEnvelopeWithPromise(action);
        this.reduxedStore.store.dispatch(envelope);
        return promise;
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
        const includeErrorHandler = actionType !== "GDC.DASH/EVT.COMMAND.FAILED";

        return Promise.race([
            this.getOrCreateMonitoredAction(actionType).promise,
            ...(includeErrorHandler ? [this.commandFailedRejectsWaitFor()] : []),
            this.commandRejectedEndsWaitFor(),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Wait for action '${actionType}' timed out after ${timeout}ms`));
                }, timeout);
            }),
        ]);
    }

    /**
     * Wait for all of the listed actions to occur. The wait is bounded by a timeout that is 1s by default.
     *
     * This is useful when testing commands that emit multiple events and you need to verify that all of the
     * events happened. This function does not care about the order in which the events occurred. If you then
     * need to verify the order, use {@link emittedEvents} or {@link emittedEventsDigest}.
     *
     * @param actionTypes - action types to wait for
     * @param timeout - timeout after which the wait fails
     */
    public waitForAll(
        actionTypes: ReadonlyArray<DashboardEventType | DashboardCommandType | string>,
        timeout: number = 1000,
    ): Promise<any> {
        return Promise.race([
            Promise.all(actionTypes.map((actionType) => this.getOrCreateMonitoredAction(actionType).promise)),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(
                        new Error(
                            `Wait for all actions '${actionTypes.join(", ")}' timed out after ${timeout}ms`,
                        ),
                    );
                }, timeout);
            }),
        ]);
    }

    /**
     * Wait the specified time.
     *
     * @param timeout - timeout after which the wait will be resolved
     * @returns promise
     */
    public wait(timeout: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
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
            if (isDashboardQueryStarted(evt) || isDashboardQueryCompleted(evt)) {
                return {
                    type: evt.type,
                    correlationId: evt.correlationId,
                    queryType: evt.payload.query.type,
                };
            }

            if (isDashboardCommandStarted(evt)) {
                return {
                    type: evt.type,
                    correlationId: evt.correlationId,
                    commandType: evt.payload.command.type,
                };
            }

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

export type PreloadedTesterOptions = {
    /**
     * Customize the load command.
     *
     * Default is plain command created by `initializeDashboard()`.
     */
    initCommand?: InitializeDashboard;

    /**
     * Customize recorded backend configuration.
     *
     * Default is no customization.
     */
    backendConfig?: RecordedBackendConfig;

    /**
     * Customize implementations of query services to use for the component.
     *
     * Default is no customization, meaning default implementations will be used. Note that with default
     * implementations you may encounter runtime errors as they want to use SPI methods that are not implemented
     * on the recorded analytical backend.
     */
    queryServices?: IDashboardQueryService<any, any>[];
};

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
 * @param options - options influencing how the tester is created
 */
export function preloadedTesterFactory(
    onLoaded: (tester: DashboardTester) => void | Promise<void>,
    identifier?: Identifier,
    options: PreloadedTesterOptions = {},
): (done: jest.DoneCallback) => void {
    const { initCommand = initializeDashboard(), queryServices, backendConfig } = options;

    return (done: jest.DoneCallback): void => {
        const tester = identifier
            ? DashboardTester.forRecording(identifier, { queryServices }, backendConfig)
            : DashboardTester.forNewDashboard({ queryServices }, backendConfig);

        tester.dispatch(initCommand);

        tester
            .waitFor("GDC.DASH/EVT.INITIALIZED")
            .then(() => Promise.resolve(onLoaded(tester)).then(() => tester.resetMonitors()))
            .then(() => done())
            .catch((err) => {
                done.fail(`DashboardTester failed to load dashboard: ${err.message}`);
            });
    };
}
