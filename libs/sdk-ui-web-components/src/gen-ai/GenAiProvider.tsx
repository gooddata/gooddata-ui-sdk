// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import { resolveLocale } from "@gooddata/sdk-ui";
import type { ChatEvent, LinkHandlerEvent, GenAiStore as OriginalGenAiStore } from "@gooddata/sdk-ui-gen-ai";

import {
    CustomElementAdapter,
    EVENT_HANDLER,
    GET_COMPONENT,
    LOAD_COMPONENT,
} from "../common/CustomElementAdapter.js";
import { stringToObjectTypes } from "../common/typeGuards/stringToObjectTypes.js";
import {
    type CustomElementContext,
    type IPromiseWithResolver,
    getContext,
    getStore,
    setStore,
} from "../context.js";
import { defineCustomElement, findParentWithAttribute } from "../utils.js";

type IGenAiStore = typeof OriginalGenAiStore;

const STORE = "store";
const componentRandomName = `gd-ai-store-${uuid()}`;

export class GenAiProvider extends HTMLElement {
    private wrapper: HTMLDivElement | null = null;
    private store: string = Math.random().toString(36).substring(2, 15);

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

            const store = document.createElement(componentRandomName);

            ["workspace", "locale", "objectTypes"].forEach((attr) => {
                if (this.getAttribute(attr)) {
                    store.setAttribute(attr, this.getAttribute(attr) ?? "");
                }
            });
            this.wrapper.appendChild(store);
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

type IGenAIAssistantConversationsLinkClick = Omit<LinkHandlerEvent, "preventDefault">;

class GenAiStore extends CustomElementAdapter<IGenAiStore> {
    static get observedAttributes() {
        return ["workspace", "locale", "objectTypes"];
    }

    override async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-gen-ai")).GenAiStore;
    }

    onLinkClick?: (event: CustomEvent<IGenAIAssistantConversationsLinkClick>) => void;

    override [GET_COMPONENT](Component: IGenAiStore, { backend, workspaceId }: CustomElementContext) {
        const storeId = findParentWithAttribute(this, "store");
        const extraProps: {
            locale?: string;
            objectTypes?: ReturnType<typeof stringToObjectTypes>;
        } = {};

        if (this.hasAttribute("locale")) {
            extraProps.locale = resolveLocale(this.getAttribute("locale"));
        }

        if (this.hasAttribute("objectTypes")) {
            const stringifiedObjectTypes = this.getAttribute("objectTypes");
            if (stringifiedObjectTypes) {
                try {
                    extraProps.objectTypes = stringToObjectTypes(stringifiedObjectTypes);
                } catch (e) {
                    console.error(
                        "Invalid object types not used in <gd-ai-store> component",
                        e,
                        stringifiedObjectTypes,
                    );
                }
            }
        }

        return (
            <Component
                backend={backend}
                workspace={workspaceId}
                eventHandlers={[
                    {
                        eval: (e): e is ChatEvent => Boolean(e),
                        handler: (event) => {
                            this[EVENT_HANDLER](event.type)(event.payload);
                        },
                    },
                ]}
                {...extraProps}
            >
                {(s) => {
                    if (storeId) {
                        const store = getStore(storeId);
                        store?.resolve(s);
                    }
                    return null;
                }}
            </Component>
        );
    }
}

defineCustomElement(componentRandomName, GenAiStore);
