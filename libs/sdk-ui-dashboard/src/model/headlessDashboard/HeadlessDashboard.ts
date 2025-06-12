// (C) 2022 GoodData Corporation

import { Middleware, PayloadAction } from "@reduxjs/toolkit";
import { DashboardState } from "../store/index.js";
import { DashboardEvents, DashboardEventType } from "../events/index.js";
import { DashboardContext, DashboardModelCustomizationFns } from "../types/commonTypes.js";
import noop from "lodash/noop.js";
import { DashboardCommands, DashboardCommandType } from "../commands/index.js";
import { IDashboardQuery } from "../queries/index.js";
import { SagaIterator } from "redux-saga";
import { IDashboardQueryService } from "../store/_infra/queryService.js";
import { createDashboardStore, ReduxedDashboardStore } from "../store/dashboardStore.js";
import { queryEnvelopeWithPromise } from "../store/_infra/queryProcessing.js";

/**
 * @internal
 */
export interface MonitoredAction {
    calls: number;
    promise: Promise<PayloadAction<any>>;
    resolve: (action: PayloadAction<any>) => void;
    reject: (e: any) => void;
}

/**
 * @internal
 */
export interface HeadlessDashboardConfig {
    queryServices?: IDashboardQueryService<any, any>[];
    backgroundWorkers?: ((context: DashboardContext) => SagaIterator<void>)[];
    customizationFns?: DashboardModelCustomizationFns;
}

/**
 * @internal
 */
export class HeadlessDashboard {
    private readonly reduxedStore: ReduxedDashboardStore;
    protected monitoredActions: Record<string, MonitoredAction> = {};
    protected capturedActions: Array<PayloadAction<any>> = [];
    protected capturedEvents: Array<DashboardEvents> = [];

    constructor(ctx: DashboardContext, config?: HeadlessDashboardConfig) {
        // Middleware to store the actions and create promises
        const actionsMiddleware: Middleware = () => (next) => (action) => {
            if (action.type.startsWith("@@redux/")) {
                //
            } else {
                this.onActionCaptured(action);
            }

            return next(action);
        };

        this.reduxedStore = createDashboardStore({
            dashboardContext: ctx,
            additionalMiddleware: actionsMiddleware,
            eventing: {
                initialEventHandlers: [
                    {
                        eval: () => true,
                        handler: this.eventHandler,
                    },
                ],
            },

            queryServices: config?.queryServices,
            backgroundWorkers: config?.backgroundWorkers || [],
            privateContext: config?.customizationFns,
            initialRenderMode: "view",
        });
    }

    protected getOrCreateMonitoredAction = (actionType: string): MonitoredAction => {
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
     * Convenience function that combines both {@link HeadlessDashboard.dispatch} and {@link HeadlessDashboard.waitFor}.
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

    private commandFailedRejectsWaitFor = () => {
        const commandFailed = this.getOrCreateMonitoredAction("GDC.DASH/EVT.COMMAND.FAILED");

        return commandFailed.promise.then((evt) => {
            console.error(`Command processing failed: ${evt.payload.reason} - ${evt.payload.message}`);

            throw evt.payload.error;
        });
    };

    private commandRejectedEndsWaitFor = () => {
        const commandRejected = this.getOrCreateMonitoredAction("GDC.DASH/EVT.COMMAND.REJECTED");

        return commandRejected.promise.then((evt) => {
            console.error(
                "Command was rejected because dashboard does not know how to handle it. " +
                    "This is likely because the handler for the rejected command is not registered in the system. See root command handler.",
            );

            throw evt;
        });
    };

    /**
     * Starts a dashboard query.
     *
     * @param action - query action
     */
    public query<TQueryResult>(action: IDashboardQuery): Promise<TQueryResult> {
        const { envelope, promise } = queryEnvelopeWithPromise<any, TQueryResult>(action);
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
     * select data from the state
     */
    select<TSelectorFactory extends (...args: any[]) => any>(selectorFactory: TSelectorFactory) {
        return selectorFactory(this.state()) as ReturnType<TSelectorFactory>;
    }

    /**
     * Returns dashboard state.
     */
    protected state(): DashboardState {
        return this.reduxedStore.store.getState();
    }
}
