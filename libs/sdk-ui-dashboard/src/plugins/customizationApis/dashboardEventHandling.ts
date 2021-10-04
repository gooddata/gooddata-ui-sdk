// (C) 2021 GoodData Corporation

import { DashboardStateChangeCallback, IDashboardEventHandling } from "../customizer";
import {
    DashboardEventHandler,
    DashboardEventHandlerFn,
    DashboardEvents,
    DashboardEventType,
    ICustomDashboardEvent,
} from "../../model";
import { IDashboardEventing } from "../../presentation";
import findIndex from "lodash/findIndex";

/**
 * Factory for predicates that compare event handlers. The comparison is somewhat more aggressive to prevent
 * double-registration of same handler code. First, the two DashboardEventHandler objects are compared for
 * reference equality. If different, the handler function and eval functions are compared for equality - if
 * they are same, the entire event handler is declared same.
 */
const sameHandlerPredicateFactory = (other: DashboardEventHandler) => {
    return (handler: DashboardEventHandler) => {
        return handler === other || (handler.handler === other.handler && handler.eval === other.eval);
    };
};

// TODO: move this type to common location
type EvalFn = (event: DashboardEvents | ICustomDashboardEvent) => boolean;
type EvalFnCache = Map<DashboardEventType | string | "*", EvalFn>;

function createEvalFn(eventType: DashboardEventType | string | "*"): EvalFn {
    if (eventType === "*") {
        return () => true;
    }

    return (evt) => {
        return evt.type === eventType;
    };
}

/**
 * @internal
 */
export class DefaultDashboardEventHandling implements IDashboardEventHandling {
    private registeredHandlers: DashboardEventHandler[] = [];
    private stateChangesChain: DashboardStateChangeCallback[] = [];
    private evalCache: EvalFnCache = new Map();

    private readonly rootStateChangesCallback: DashboardStateChangeCallback = (state, dispatch) => {
        this.stateChangesChain.forEach((cb) => {
            try {
                cb(state, dispatch);
            } catch (e: any) {
                // eslint-disable-next-line no-console
                console.warn(`OnStateChange callback ${cb} threw an exception.`, e);
            }
        });
    };

    /**
     * This callback will be included in the resulting IDashboardEventing instance returned by {@link getDashboardEventing}. It will thus
     * make its way into the dashboard store initializer. Once the store initializes and the event emitter is up, the ad hoc event
     * registration/unregistration functions will be passed to here.
     *
     * From then on, the methods that add/remove handlers or custom handlers can add handlers directly into active dashboard component.
     */
    private readonly onEventingInitialized = (
        register: (handler: DashboardEventHandler) => void,
        unregister: (handler: DashboardEventHandler) => void,
    ) => {
        this.registerHandler = register;
        this.unregisterHandler = unregister;
    };

    /*
     * Dashboard component's event handler registration function. This will be undefined until the dashboard component initializes.
     */
    private registerHandler: undefined | ((handler: DashboardEventHandler) => void);

    /*
     * Dashboard component's event handler unregistration function. This will be undefined until the dashboard component initializes.
     */
    private unregisterHandler: undefined | ((handler: DashboardEventHandler) => void);

    private getOrCreateEvalFn = (eventType: DashboardEventType | string | "*"): EvalFn => {
        const evalFn = this.evalCache.get(eventType);

        if (evalFn !== undefined) {
            return evalFn;
        }

        const newEvalFn: EvalFn = createEvalFn(eventType);
        this.evalCache.set(eventType, newEvalFn);

        return newEvalFn;
    };

    public addEventHandler = <TEvents extends DashboardEvents | ICustomDashboardEvent>(
        eventType: DashboardEventType | string | "*",
        callback: DashboardEventHandlerFn<TEvents>,
    ): IDashboardEventHandling => {
        const newHandler: DashboardEventHandler = {
            eval: this.getOrCreateEvalFn(eventType),
            handler: callback,
        };

        return this.addCustomEventHandler(newHandler);
    };

    public removeEventHandler = <TEvents extends DashboardEvents | ICustomDashboardEvent>(
        eventType: DashboardEventType | string | "*",
        callback: DashboardEventHandlerFn<TEvents>,
    ): IDashboardEventHandling => {
        const handler: DashboardEventHandler = {
            eval: this.getOrCreateEvalFn(eventType),
            handler: callback,
        };

        return this.removeEventCustomHandler(handler);
    };

    public addCustomEventHandler = (handler: DashboardEventHandler): IDashboardEventHandling => {
        if (findIndex(this.registeredHandlers, sameHandlerPredicateFactory(handler)) > -1) {
            // eslint-disable-next-line no-console
            console.warn(`Attempting double-registration of the same handler ${handler}. Ignoring.`);

            return this;
        }

        // keep track of registered handlers locally
        this.registeredHandlers.push(handler);
        // and if the dashboard is already initialized
        this.registerHandler?.(handler);

        return this;
    };

    public removeEventCustomHandler = (handler: DashboardEventHandler): IDashboardEventHandling => {
        const idx = findIndex(this.registeredHandlers, sameHandlerPredicateFactory(handler));

        if (idx === -1) {
            // eslint-disable-next-line no-console
            console.warn(`Attempting remove non-existing handler ${handler}. Ignoring.`);

            return this;
        }

        // get the handler that was originally registered and is effectivelly the same as the handler
        // to remove
        const actuallyRegistered = this.registeredHandlers[idx];
        // remove the handler from list of registered handlers; this is all that is needed if the
        // dashboard is not yet initialized
        this.registeredHandlers.splice(idx, 1);
        // and if the dashboard is already initialized, also unregister the handler from the dashboard component
        // itself
        this.unregisterHandler?.(actuallyRegistered);

        return this;
    };

    public subscribeToStateChanges = (callback: DashboardStateChangeCallback): IDashboardEventHandling => {
        if (findIndex(this.stateChangesChain, (fn) => fn === callback) > -1) {
            // eslint-disable-next-line no-console
            console.warn(
                `Attempting double-subscription of the same state change callback ${callback}. Ignoring.`,
            );

            return this;
        }

        this.stateChangesChain.push(callback);

        return this;
    };

    public unsubscribeFromStateChanges = (
        callback: DashboardStateChangeCallback,
    ): IDashboardEventHandling => {
        const idx = findIndex(this.stateChangesChain, (fn) => fn === callback);

        if (idx === -1) {
            return this;
        }

        this.stateChangesChain.splice(idx, 1);
        return this;
    };

    public getDashboardEventing(): Required<IDashboardEventing> {
        return {
            eventHandlers: [...this.registeredHandlers],
            onStateChange: this.rootStateChangesCallback,
            onEventingInitialized: this.onEventingInitialized,
        };
    }
}
