// (C) 2022-2023 GoodData Corporation
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { invariant } from "ts-invariant";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { CustomElementContext, getContext } from "../context.js";

// Since JS does not support private properties natively,
// use Symbols to hide them. Otherwise, would be seen on the element instance.
const RENDER = Symbol("render");
const COMPONENT = Symbol("component");
const CONTEXT = Symbol("context");
export const GET_VISUALIZATION = Symbol("getVisualization");
export const EVENT_HANDLER = Symbol("eventHandler");
export const LOAD_COMPONENT = Symbol("loadComponent");

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

    private root: Root | undefined;

    constructor() {
        super();

        // Load the rest of the dependencies needed for React element rendering
        Promise.all([this[LOAD_COMPONENT](), getContext()])
            .then(([Component, context]) => {
                this[COMPONENT] = Component;
                this[CONTEXT] = context;
                this.root = createRoot(this);

                // Trigger rendering once all dependencies are provided
                this[RENDER]();
            })
            .catch((error) => {
                console.error("Failed to load dependencies for the visualization", error);
            });
    }

    attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
        // Custom element API allows setting same value and browser would trigger the callback
        if (oldValue !== newValue && this.isConnected) {
            // Trigger rendering when a tracked attribute changes
            this[RENDER]();
        }
    }

    connectedCallback() {
        // Re-render React, as we unmounted in "disconnectedCallback"
        this[RENDER]();
    }

    disconnectedCallback() {
        // Clean-up React app before custom element is unmounted
        this.root?.unmount();
    }

    /**
     * @remarks
     * This function handles the rendering cycle
     *
     * @internal
     */
    private [RENDER]() {
        // Ensure all dependencies are ready and we are mounted
        if (!this.isConnected || !this[COMPONENT] || !this[CONTEXT]) {
            // Render LoadingComponent instead
            this.root?.render(React.createElement(LoadingComponent));
            return;
        }

        // Get common attributes, e.g. workspace
        const workspace = this.getAttribute("workspace") ?? this[CONTEXT].workspaceId;

        invariant(workspace, "Workspace must be provided either through script URL or directly in HTML.");

        // Get the visualization from implementation
        const reactElement = this[GET_VISUALIZATION](this[COMPONENT], {
            ...this[CONTEXT],
            workspaceId: workspace,
        });

        // Mount / update the React app
        this.root?.render(reactElement);
    }

    /**
     * @remarks
     * A helper for easier custom event dispatching.
     * We can afford passing a new function with every update, as it's optimized for this
     * at React component level down the stream (with React.Ref)
     *
     * @internal
     */
    protected [EVENT_HANDLER]<P>(eventName: string) {
        return (payload: P) =>
            this.dispatchEvent(
                new CustomEvent(eventName, {
                    detail: payload,
                    cancelable: false,
                    bubbles: false,
                }),
            );
    }

    /**
     * @remarks
     * An implementation will receive loaded Component, backend instance and a workspace ID and should
     *  return a valid ReactElement.
     * NOTE. You can't use hooks/lifecycle callbacks in the implementation. It's not a React realm yet.
     *  If you have to - write a thin wrapper around the actual visualization Component.
     *
     * @internal
     * @returns A ReactElement to be mounted into the Shadow DOM for this visualization
     */
    abstract [GET_VISUALIZATION](Component: C, context: CustomElementContext): React.ReactElement;

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
    abstract [LOAD_COMPONENT](): Promise<C>;
}
