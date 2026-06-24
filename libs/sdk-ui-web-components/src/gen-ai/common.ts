// (C) 2026 GoodData Corporation

import { omit } from "lodash-es";

import { resolveLocale } from "@gooddata/sdk-ui";
import type { ChatEvent, GenAIAssistantProps, LinkHandlerEvent } from "@gooddata/sdk-ui-gen-ai";

import { type CustomElementAdapter, EVENT_BUILDER, EVENT_HANDLER } from "../common/CustomElementAdapter.js";
import { stringToObjectTypes } from "../common/typeGuards/stringToObjectTypes.js";
import { getStore } from "../context.js";
import { findParentWithAttribute } from "../utils.js";

export type CommonProperties = Pick<
    GenAIAssistantProps,
    "locale" | "objectTypes" | "onLinkClick" | "onDispatcher" | "eventHandlers" | "providedStore"
>;

export interface ICommonPropertiesDefinition {
    _dispatch?: (action: any) => void;
    _onDispatcher?: (action: any) => void;
    onLinkClick?: (event: CustomEvent<IGenAIAssistantLinkClick>) => string | undefined;
    onDispatcher?: Required<GenAIAssistantProps>["onDispatcher"];

    // Actions
    startNewConversationAction?: () => void;
}

export interface ICommonPropertiesObjects extends CommonProperties {
    storeId?: string | null;
}

type IGenAIAssistantLinkClick = Omit<LinkHandlerEvent, "preventDefault">;

export function getProperties<T>(
    element: CustomElementAdapter<T> & ICommonPropertiesDefinition,
    name: string,
): ICommonPropertiesObjects {
    const storeId = findParentWithAttribute(element, "store");
    const store = storeId ? getStore(storeId) : undefined;

    // Collect the rest of the props
    const extraProps: Partial<CommonProperties> = {};

    // Process locale
    if (element.hasAttribute("locale")) {
        extraProps.locale = resolveLocale(element.getAttribute("locale"));
    }

    // Process object types
    if (element.hasAttribute("objectTypes")) {
        const stringifiedObjectTypes = element.getAttribute("objectTypes");
        if (stringifiedObjectTypes) {
            try {
                extraProps.objectTypes = stringToObjectTypes(stringifiedObjectTypes);
            } catch (e) {
                console.error(
                    `Invalid format of object types in ${name} component`,
                    e,
                    stringifiedObjectTypes,
                );
            }
        }
    }

    // Emit custom DOM event when link is clicked
    extraProps.onLinkClick = (e): string | undefined => {
        const type = "linkClick";
        const detail = omit(e, ["preventDefault"]) as IGenAIAssistantLinkClick;

        let link: string | undefined = detail.itemUrl;

        element[EVENT_HANDLER](type)(detail);
        if (typeof element.onLinkClick === "function") {
            link = element.onLinkClick(element[EVENT_BUILDER](type, detail));
        }
        // Prevent default behavior of the link click, we created
        // the custom event to handle it in the application
        e.preventDefault();
        return link;
    };

    //Save dispatcher
    extraProps.onDispatcher = (dispatch) => {
        element._dispatch = dispatch;
        element.onDispatcher?.(dispatch);
    };

    return {
        ...extraProps,
        storeId,
        providedStore: store as GenAIAssistantProps["providedStore"],
        eventHandlers: [
            {
                eval: (e): e is ChatEvent => Boolean(e),
                handler: (event) => {
                    element[EVENT_HANDLER](event.type)(event.payload);
                },
            },
        ],
    };
}

export async function setActions(element: HTMLElement & ICommonPropertiesDefinition) {
    const api = await import("@gooddata/sdk-ui-gen-ai");

    element.startNewConversationAction = () => {
        const { startNewConversationAction } = api;
        const dispatcher = element._dispatch;
        if (dispatcher) {
            dispatcher(startNewConversationAction() as any);
        }
    };
}

export async function mimicActions(
    element: HTMLElement & ICommonPropertiesDefinition,
    store: ICommonPropertiesDefinition,
) {
    element.startNewConversationAction = () => {
        store.startNewConversationAction?.();
    };
}
