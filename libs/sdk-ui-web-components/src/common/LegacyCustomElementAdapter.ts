// (C) 2022-2026 GoodData Corporation

import { type ReactElement, createElement } from "react";

import { type Root, createRoot } from "react-dom/client";
import { invariant } from "ts-invariant";

import { LoadingComponent } from "@gooddata/sdk-ui";

import { type CustomElementContext, getContext } from "../context.js";

const RENDER = Symbol("render");
const COMPONENT = Symbol("component");
const CONTEXT = Symbol("context");

export const LEGACY_EVENT_HANDLER = Symbol("legacyEventHandler");
export const LEGACY_EVENT_BUILDER = Symbol("legacyEventBuilder");
export const LEGACY_GET_COMPONENT = Symbol("legacyGetComponent");
export const LEGACY_LOAD_COMPONENT = Symbol("legacyLoadComponent");

export abstract class LegacyCustomElementAdapter<C> extends HTMLElement {
    private [COMPONENT]!: C;

    private [CONTEXT]!: CustomElementContext;

    private root: Root | undefined;

    constructor() {
        super();

        void Promise.all([this[LEGACY_LOAD_COMPONENT](), getContext()])
            .then(([Component, context]) => {
                this[COMPONENT] = Component;
                this[CONTEXT] = context;
                this.root = createRoot(this);

                this[RENDER]();
            })
            .catch((error) => {
                console.error("Failed to load dependencies for the component", error);
            });
    }

    attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
        if (oldValue !== newValue && this.isConnected) {
            this[RENDER]();
        }
    }

    connectedCallback() {
        this[RENDER]();
    }

    disconnectedCallback() {
        this.root?.unmount();
    }

    private [RENDER]() {
        if (!this.isConnected || !this[COMPONENT] || !this[CONTEXT]) {
            this.root?.render(createElement(LoadingComponent));
            return;
        }

        const workspace = this.getAttribute("workspace") ?? this[CONTEXT].workspaceId;

        invariant(workspace, "Workspace must be provided either through script URL or directly in HTML.");

        const reactElement = this[LEGACY_GET_COMPONENT](this[COMPONENT], {
            ...this[CONTEXT],
            workspaceId: workspace,
        });

        this.root?.render(reactElement);
    }

    protected [LEGACY_EVENT_BUILDER]<P>(eventName: string, detail: P) {
        return new CustomEvent(eventName, {
            detail,
            cancelable: false,
            bubbles: false,
        });
    }

    protected [LEGACY_EVENT_HANDLER]<P>(eventName: string) {
        return (payload: P) => this.dispatchEvent(this[LEGACY_EVENT_BUILDER](eventName, payload));
    }

    abstract [LEGACY_GET_COMPONENT](Component: C, context: CustomElementContext): ReactElement;

    abstract [LEGACY_LOAD_COMPONENT](): Promise<C>;
}
