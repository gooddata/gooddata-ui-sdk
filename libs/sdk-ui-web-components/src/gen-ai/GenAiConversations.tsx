// (C) 2022-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { resolveLocale } from "@gooddata/sdk-ui";
import type {
    ChatEvent,
    GenAIConversationsProps,
    GenAIConversations as OriginalGenAIConversations,
} from "@gooddata/sdk-ui-gen-ai";

import {
    CustomElementAdapter,
    EVENT_HANDLER,
    GET_COMPONENT,
    LOAD_COMPONENT,
} from "../common/CustomElementAdapter.js";
import { stringToObjectTypes } from "../common/typeGuards/stringToObjectTypes.js";
import { type CustomElementContext, getStore } from "../context.js";
import { findParentWithAttribute } from "../utils.js";

type IGenAIConversations = typeof OriginalGenAIConversations;

export class GenAIConversations extends CustomElementAdapter<IGenAIConversations> {
    static get observedAttributes() {
        return ["workspace", "locale", "objectTypes"];
    }

    override async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-gen-ai")).GenAIConversations;
    }

    override [GET_COMPONENT](Component: IGenAIConversations, { backend, workspaceId }: CustomElementContext) {
        const storeId = findParentWithAttribute(this, "store");
        const store = storeId ? getStore(storeId) : undefined;

        const extraProps: Partial<ComponentProps<IGenAIConversations>> = {};

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
                        "Invalid object types not used in <gd-ai-conversations> component",
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
                providedStore={store as GenAIConversationsProps["providedStore"]}
                eventHandlers={[
                    {
                        eval: (e): e is ChatEvent => Boolean(e),
                        handler: (event) => {
                            this[EVENT_HANDLER](event.type)(event.payload);
                        },
                    },
                ]}
                {...extraProps}
            />
        );
    }
}
