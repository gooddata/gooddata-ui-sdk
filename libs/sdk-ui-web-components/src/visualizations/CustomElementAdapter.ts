// (C) 2022 GoodData Corporation
import React from "react";
import ReactDom from "react-dom";
import invariant from "ts-invariant";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { LoadingComponent } from "@gooddata/sdk-ui/esm/base/react/LoadingComponent";

import { CustomElementContext, getContext } from "../context";
import componentStyles from "./components.css";
import componentShadowStyles from "./componentsShadow.css";

componentStyles.use();

// Since JS does not support private properties natively,
// use Symbols to hide them. Otherwise, would be seen on the element instance.
const MOUNT_POINT = Symbol("mountPoint");
const RENDER = Symbol("render");
const COMPONENT = Symbol("component");
const CONTEXT = Symbol("context");
export const GET_VISUALIZATION = Symbol("getVisualization");
export const EVENT_HANDLER = Symbol("eventHandler");
export const LOAD_STYLES = Symbol("loadStyles");
export const LOAD_COMPONENT = Symbol("loadComponent");

export abstract class CustomElementAdapter<C> extends HTMLElement {
    /**
     * @remarks
     * A mounting point for the React visualization
     *
     * @internal
     */
    private [MOUNT_POINT]: HTMLDivElement;

    /**
     * @remarks
     * A React Component to be used to render the visualization
     *
     * @internal
     */
    private [COMPONENT]: C;

    /**
     * @remarks
     * The context for the visualization rendering (backend, workspace etc.)
     *
     * @internal
     */
    private [CONTEXT]: CustomElementContext;

    constructor() {
        super();

        // Attach Shadow DOM
        const shadowRoot = this.attachShadow({ mode: "closed" });

        // Inject styles to the node, async
        componentShadowStyles.use({ target: shadowRoot });
        this[LOAD_STYLES]()
            .then((styles) => {
                // According to MDN, browsers optimize styles by de-duping the ones with same content
                // cross different Shadow DOM roots. However, this could be a point for performance optimization
                // if we see some lagging. This would involve separating styles into individual css files during
                // Webpack build and using <link> to inject them - a bit more complex setup.
                styles.forEach((style) => style.use({ target: shadowRoot }));
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error("Failed to load styles for the visualization", error);
            });

        // Attach a mounting point for React
        this[MOUNT_POINT] = document.createElement("div");
        this[MOUNT_POINT].classList.add("mount-point");
        shadowRoot.appendChild(this[MOUNT_POINT]);

        // Load the rest of the dependencies needed for React element rendering
        Promise.all([this[LOAD_COMPONENT](), getContext()])
            .then(([Component, context]) => {
                this[COMPONENT] = Component;
                this[CONTEXT] = context;

                // Trigger rendering once all dependencies are provided
                this[RENDER]();
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
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
        ReactDom.unmountComponentAtNode(this[MOUNT_POINT]);
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
            ReactDom.render(React.createElement(LoadingComponent), this[MOUNT_POINT]);
            return;
        }

        // Get common attributes, e.g. workspace
        const workspace = this.getAttribute("workspace") ?? this[CONTEXT].workspaceId;

        invariant(workspace, "Workspace must be provided either through script URL or directly in HTML.");

        // Get the visualization from implementation
        const reactElement = this[GET_VISUALIZATION](this[COMPONENT], this[CONTEXT].backend, workspace);

        // Mount / update the React app
        ReactDom.render(reactElement, this[MOUNT_POINT]);
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
    abstract [GET_VISUALIZATION](
        Component: C,
        backend: IAnalyticalBackend,
        workspace: string,
    ): React.ReactElement;

    /**
     * @remarks
     * An implementation is expected to return a promise of an array of style modules, generated by
     *  the Webpack's style-loader.
     * We are using this to separate styles into separate chunk(s) to keep the initial entry point slim.
     *  This also allows us to put style elements into isolated Shadow DOM, so the styles do not leak.
     *
     * @internal
     * @returns Style modules to be injected to the Shadow DOM
     */
    abstract async [LOAD_STYLES](): Promise<Array<{ use: (opts: { target: ShadowRoot }) => void }>>;

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
    abstract async [LOAD_COMPONENT](): Promise<C>;
}
