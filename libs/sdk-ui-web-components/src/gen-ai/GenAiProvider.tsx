// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import type {
    GenAiStoreProps,
    LinkHandlerEvent,
    GenAiStore as OriginalGenAiStore,
} from "@gooddata/sdk-ui-gen-ai";

import { CustomElementAdapter, GET_COMPONENT, LOAD_COMPONENT } from "../common/CustomElementAdapter.js";
import {
    type CustomElementContext,
    type IPromiseWithResolver,
    getContext,
    getStore,
    setStore,
} from "../context.js";
import { defineCustomElement } from "../utils.js";

import { type ICommonPropertiesDefinition, getProperties, mimicActions, setActions } from "./common.js";

type IGenAiStore = typeof OriginalGenAiStore;
type IGenAIAssistantLinkClick = Omit<LinkHandlerEvent, "preventDefault">;

const STORE = "store";
const componentRandomName = `gd-ai-store-${uuid()}`;

export class GenAiProvider extends HTMLElement implements ICommonPropertiesDefinition {
    private wrapper: HTMLDivElement | null = null;
    private storeEle: GenAiStore | null = null;
    private store: string = Math.random().toString(36).substring(2, 15);

    _onLinkClick?: (event: CustomEvent<IGenAIAssistantLinkClick>) => void;
    _onDispatcher?: Required<GenAiStoreProps>["onDispatcher"];

    set onLinkClick(onLinkClick: ((event: CustomEvent<IGenAIAssistantLinkClick>) => void) | undefined) {
        this._onLinkClick = onLinkClick;
        const store = this.storeEle;
        if (store) {
            store.onLinkClick = onLinkClick;
        }
    }

    get onLinkClick(): ((event: CustomEvent<IGenAIAssistantLinkClick>) => void) | undefined {
        return this._onLinkClick;
    }

    set onDispatcher(onDispatcher: Required<GenAiStoreProps>["onDispatcher"] | undefined) {
        this._onDispatcher = onDispatcher;
        const store = this.storeEle;
        if (store && onDispatcher) {
            store.onDispatcher = onDispatcher;
        }
    }

    get onDispatcher(): Required<GenAiStoreProps>["onDispatcher"] | undefined {
        return this._onDispatcher;
    }

    connectedCallback() {
        this.setAttribute(STORE, this.getAttribute(STORE) ?? this.store);
        this.syncToStore();
    }

    syncToStore() {
        const store = this.getAttribute(STORE) ?? this.store;
        setStore(store, deferredStore());
        this.connectStore();
    }

    connectStore() {
        if (this.wrapper) {
            return;
        }

        getContext().then(() => {
            this.wrapper = document.createElement("div");
            this.prepend(this.wrapper);

            const store = (this.storeEle = document.createElement(componentRandomName) as GenAiStore);
            store.onLinkClick = this.onLinkClick;
            if (this.onDispatcher) {
                store.onDispatcher = this.onDispatcher;
            }

            ["workspace", "locale", "objectTypes"].forEach((attr) => {
                if (this.getAttribute(attr)) {
                    store.setAttribute(attr, this.getAttribute(attr) ?? "");
                }
            });
            this.wrapper.appendChild(store);

            void mimicActions(this, store);
        });
    }
}

function deferredStore<T>() {
    let resolve: (value: T) => void = () => void 0;
    const data = new Promise((r) => {
        resolve = r;
    }) as IPromiseWithResolver<T>;
    data.resolve = resolve;
    return data;
}

class GenAiStore extends CustomElementAdapter<IGenAiStore> {
    //HANDLES: CLICK

    declare onLinkClick?: (event: CustomEvent<IGenAIAssistantLinkClick>) => void;

    //DISPATCHER

    declare _dispatch?: ICommonPropertiesDefinition["_dispatch"];
    declare _onDispatcher?: ICommonPropertiesDefinition["_onDispatcher"];

    set onDispatcher(onDispatcher: (action: any) => void) {
        this._onDispatcher = onDispatcher;
        if (this._dispatch && onDispatcher) {
            onDispatcher(this._dispatch);
        }
    }
    get onDispatcher(): ((action: any) => void) | undefined {
        return this._onDispatcher;
    }

    //COMPONENT

    static get observedAttributes() {
        return ["workspace", "locale", "objectTypes"];
    }

    override getLiveProperties() {
        return ["onLinkClick", "onDispatcher"];
    }

    override connectedCallback() {
        super.connectedCallback();
        void setActions(this);
    }

    override async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-gen-ai")).GenAiStore;
    }

    override [GET_COMPONENT](Component: IGenAiStore, { backend, workspaceId }: CustomElementContext) {
        const props = getProperties(this, "<gd-ai-store>");

        return (
            <Component backend={backend} workspace={workspaceId} {...props} providedStore={undefined}>
                {(s) => {
                    if (props.storeId) {
                        const store = getStore(props.storeId);
                        store?.resolve(s);
                    }
                    return null;
                }}
            </Component>
        );
    }
}

defineCustomElement(componentRandomName, GenAiStore);
