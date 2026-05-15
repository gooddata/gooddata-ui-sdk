// (C) 2022-2026 GoodData Corporation

import { type ReactElement, createElement } from "react";

import { type Root, createRoot } from "react-dom/client";

import { LoadingComponent } from "@gooddata/sdk-ui";

import { type CustomElementContext, getContext, getContextSnapshot } from "../context.js";

// Since JS does not support private properties natively,
// use Symbols to hide them. Otherwise, would be seen on the element instance.
const RENDER = Symbol("render");
const COMPONENT = Symbol("component");
const CONTEXT = Symbol("context");
const ROOT = Symbol("root");
const RENDER_SCHEDULED = Symbol("renderScheduled");
const READY_DISPATCHED = Symbol("readyDispatched");
const PROPERTY_VALUES = Symbol("propertyValues");
const LOCKED_IDENTITIES = Symbol("lockedIdentities");
export const EVENT_HANDLER = Symbol("eventHandler");
export const EVENT_BUILDER = Symbol("eventBuilder");
export const GET_COMPONENT = Symbol("getComponent");
export const LOAD_COMPONENT = Symbol("loadComponent");

type GdErrorPhase = "init" | "update" | "invalidUsage";

export abstract class CustomElementAdapter<C> extends HTMLElement {
    /**
     * @remarks
     * A React Component to be used to render the visualization
     *
     * @internal
     */
    private [COMPONENT]!: C;

    /**
     * @remarks
     * The context for the visualization rendering (backend, workspace etc.)
     *
     * @internal
     */
    private [CONTEXT]!: CustomElementContext;

    private [ROOT]: Root | undefined;

    private [RENDER_SCHEDULED] = false;

    private [READY_DISPATCHED] = false;

    private [PROPERTY_VALUES] = new Map<string, unknown>();

    private [LOCKED_IDENTITIES] = new Map<string, unknown>();

    constructor() {
        super();

        this.initializeLiveProperties();
        this[CONTEXT] = getContextSnapshot() as CustomElementContext;

        void this[LOAD_COMPONENT]()
            .then((Component) => {
                this[COMPONENT] = Component;
                this.scheduleRender();
            })
            .catch((error) => {
                this.dispatchError("init", error, {
                    message: "Failed to load dependencies for the component",
                });
            });

        void getContext()
            .then((context) => {
                this[CONTEXT] = context;
                this.scheduleRender();
            })
            .catch((error) => {
                this.dispatchError("init", error, {
                    message: "Failed to resolve the default context for the component",
                });
            });
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        // Custom element API allows setting same value and browser would trigger the callback
        if (oldValue !== newValue && this.isConnected) {
            if (this.isLockedIdentityChange(name, newValue ?? undefined)) {
                this.dispatchError("invalidUsage", new Error(`"${name}" cannot change after first render.`));
                return;
            }

            if (this.shouldRerenderOnAttributeChange(name)) {
                this.scheduleRender();
            }
        }
    }

    connectedCallback() {
        this.scheduleRender();
    }

    disconnectedCallback() {
        // Clean-up React app before custom element is unmounted
        this.clearRenderRoot();
    }

    /**
     * @remarks
     * This function handles the rendering cycle
     *
     * @internal
     */
    private [RENDER]() {
        if (!this.isConnected) {
            return;
        }

        this[ROOT] ??= createRoot(this);

        const context = this.getResolvedContext();
        if (!this[COMPONENT] || !context) {
            this[ROOT].render(createElement(LoadingComponent));
            return;
        }

        try {
            const reactElement = this[GET_COMPONENT](this[COMPONENT], context);

            this[ROOT].render(reactElement);

            if (!this[READY_DISPATCHED]) {
                this.lockIdentityValues();
                this[READY_DISPATCHED] = true;
                this.dispatchEvent(this[EVENT_BUILDER]("gd-ready", undefined));
            }
        } catch (error) {
            this.dispatchError(this[READY_DISPATCHED] ? "update" : "init", error);
        }
    }

    /**
     * @remarks
     * A helper for easier custom event creation.
     *
     * @internal
     */
    protected [EVENT_BUILDER]<P>(eventName: string, detail: P) {
        return new CustomEvent(eventName, {
            detail,
            cancelable: false,
            bubbles: false,
        });
    }

    /**
     * @remarks
     * A helper for easier custom event dispatching.
     * We can afford passing a new function with every update, as it's optimized for this
     * at React component level down the stream (with Ref)
     *
     * @internal
     */
    protected [EVENT_HANDLER]<P>(eventName: string) {
        return (payload: P) => this.dispatchEvent(this[EVENT_BUILDER](eventName, payload));
    }

    /**
     * @remarks
     * Return the names of host-facing live properties that should trigger rerender on assignment.
     *
     * @internal
     */
    protected getLiveProperties(): string[] {
        return [];
    }

    /**
     * @remarks
     * Return the names of inputs that represent immutable identity after first successful render.
     *
     * @internal
     */
    protected getIdentityProperties(): string[] {
        return [];
    }

    /**
     * @remarks
     * Allows subclasses to opt out from rerendering on some attribute changes.
     *
     * @internal
     */
    protected shouldRerenderOnAttributeChange(_name: string): boolean {
        return true;
    }

    /**
     * @remarks
     * Provides access to the latest default context snapshot known by the shell.
     *
     * @internal
     */
    protected getDefaultContextSnapshot(): CustomElementContext | undefined {
        return this[CONTEXT];
    }

    /**
     * @remarks
     * Allows subclasses to derive render context from default context plus live properties.
     *
     * @internal
     */
    protected getResolvedContext(): CustomElementContext | undefined {
        const context = this.getDefaultContextSnapshot();
        if (!context) {
            return undefined;
        }

        return {
            ...context,
            workspaceId: this.getAttribute("workspace") ?? context.workspaceId,
        };
    }

    /**
     * @remarks
     * Returns a property value if it was assigned by the host, including `undefined`.
     *
     * @internal
     */
    protected getLivePropertyValue<T>(name: string): T | undefined {
        return this[PROPERTY_VALUES].get(name) as T | undefined;
    }

    /**
     * @remarks
     * Returns whether a live property has ever been assigned by the host.
     *
     * @internal
     */
    protected hasLivePropertyValue(name: string): boolean {
        return this[PROPERTY_VALUES].has(name);
    }

    /**
     * @remarks
     * Resolves a host input with property-over-attribute precedence and identity locking.
     *
     * @internal
     */
    protected getResolvedInputValue<T>(
        propertyName: string,
        attributeName: string = propertyName,
    ): T | string | undefined {
        if (this[LOCKED_IDENTITIES].has(propertyName)) {
            return this[LOCKED_IDENTITIES].get(propertyName) as T | string | undefined;
        }

        if (this.hasLivePropertyValue(propertyName)) {
            return this.getLivePropertyValue<T>(propertyName);
        }

        const attributeValue = this.getAttribute(attributeName);
        return attributeValue ?? undefined;
    }

    /**
     * @remarks
     * Request a rerender using the shared microtask scheduler.
     *
     * @internal
     */
    protected requestRender() {
        this.scheduleRender();
    }

    /**
     * @remarks
     * Forces the next render to recreate the React root from scratch.
     *
     * @internal
     */
    protected resetRenderRoot() {
        this.clearRenderRoot();
    }

    private clearRenderRoot() {
        this[ROOT]?.unmount();
        this[ROOT] = undefined;
        this[RENDER_SCHEDULED] = false;
    }

    private initializeLiveProperties() {
        const prototype = Object.getPrototypeOf(this) as Record<string, unknown>;

        for (const propertyName of this.getLiveProperties()) {
            const existingDescriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);

            if (!existingDescriptor?.get && !existingDescriptor?.set) {
                Object.defineProperty(prototype, propertyName, {
                    configurable: true,
                    enumerable: true,
                    get(this: CustomElementAdapter<C>) {
                        return this.getLivePropertyValue(propertyName);
                    },
                    set(this: CustomElementAdapter<C>, value: unknown) {
                        if (this.isLockedIdentityChange(propertyName, value)) {
                            this.dispatchError(
                                "invalidUsage",
                                new Error(`"${propertyName}" cannot change after first render.`),
                            );
                            return;
                        }

                        this[PROPERTY_VALUES].set(propertyName, value);
                        this.scheduleRender();
                    },
                });
            }

            this.upgradeLiveProperty(propertyName);
        }
    }

    private upgradeLiveProperty(propertyName: string) {
        if (!Object.prototype.hasOwnProperty.call(this, propertyName)) {
            return;
        }

        const value = (this as Record<string, unknown>)[propertyName];
        delete (this as Record<string, unknown>)[propertyName];
        (this as Record<string, unknown>)[propertyName] = value;
    }

    private scheduleRender() {
        if (this[RENDER_SCHEDULED]) {
            return;
        }

        this[RENDER_SCHEDULED] = true;
        queueMicrotask(() => {
            this[RENDER_SCHEDULED] = false;
            this[RENDER]();
        });
    }

    private isLockedIdentityChange(name: string, nextValue: unknown): boolean {
        if (!this[READY_DISPATCHED] || !this.getIdentityProperties().includes(name)) {
            return false;
        }

        return !Object.is(this[LOCKED_IDENTITIES].get(name), nextValue);
    }

    private lockIdentityValues() {
        for (const name of this.getIdentityProperties()) {
            this[LOCKED_IDENTITIES].set(name, this.getResolvedInputValue(name));
        }
    }

    private dispatchError(
        phase: GdErrorPhase,
        cause: unknown,
        extraDetail?: {
            message?: string;
            command?: string;
            dashboard?: unknown;
            insight?: unknown;
        },
    ) {
        const detail = {
            phase,
            message:
                extraDetail?.message ??
                (cause instanceof Error
                    ? cause.message
                    : typeof cause === "string"
                      ? cause
                      : "Unknown error"),
            cause,
            ...extraDetail,
        };

        this.dispatchEvent(this[EVENT_BUILDER]("gd-error", detail));
    }

    /**
     * @remarks
     * An implementation will receive loaded Component, backend instance and a workspace ID and should
     *  return a valid ReactElement.
     * NOTE. You can't use hooks/lifecycle callbacks in the implementation. It's not a React realm yet.
     *  If you have to - write a thin wrapper around the actual visualization Component.
     *
     * @internal
     * @returns A ReactElement to be mounted into the Shadow DOM for this component
     */
    [GET_COMPONENT](_Component: C, _context: CustomElementContext): ReactElement {
        throw new Error("Custom element component mapping is not implemented.");
    }

    /**
     * @remarks
     * We are loading the React Component asynchronously purely to keep the entry point slim.
     * CustomElementAdapter does not need to know that this is actually a ReactComponent, so if
     *  we'll get more of such async dependencies, we might change this function to be something more
     *  generic, like LOAD_ASYNC_DEPS.
     *
     * @internal
     * @returns A React Component needed for the visualization rendering
     */
    [LOAD_COMPONENT](): Promise<C> {
        return Promise.reject(new Error("Custom element component loading is not implemented."));
    }
}
