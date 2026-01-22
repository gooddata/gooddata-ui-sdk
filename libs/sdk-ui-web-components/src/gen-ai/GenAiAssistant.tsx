// (C) 2022-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { omit } from "lodash-es";

import { resolveLocale } from "@gooddata/sdk-ui";
import type {
    ChatEvent,
    LinkHandlerEvent,
    GenAIAssistant as OriginalGenAIAssistant,
} from "@gooddata/sdk-ui-gen-ai";

import {
    CustomElementAdapter,
    EVENT_BUILDER,
    EVENT_HANDLER,
    GET_COMPONENT,
    LOAD_COMPONENT,
} from "../common/CustomElementAdapter.js";
import { stringToObjectTypes } from "../common/typeGuards/stringToObjectTypes.js";
import { type CustomElementContext } from "../context.js";

type IGenAIAssistant = typeof OriginalGenAIAssistant;
type IGenAIAssistantLinkClick = Omit<LinkHandlerEvent, "preventDefault">;

export class GenAIAssistant extends CustomElementAdapter<IGenAIAssistant> {
    static get observedAttributes() {
        return ["workspace", "locale", "objectTypes"];
    }

    async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-gen-ai")).GenAIAssistant;
    }

    onLinkClick?: (event: CustomEvent<IGenAIAssistantLinkClick>) => void;

    [GET_COMPONENT](Component: IGenAIAssistant, { backend, workspaceId }: CustomElementContext) {
        // Collect the rest of the props
        const extraProps: Partial<ComponentProps<IGenAIAssistant>> = {};

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
                        "Invalid object types not used in <gd-ai-assistant> component",
                        e,
                        stringifiedObjectTypes,
                    );
                }
            }
        }

        // Emit custom DOM event when link is clicked
        extraProps.onLinkClick = (e) => {
            const type = "linkClick";
            const detail = omit(e, ["preventDefault"]) as IGenAIAssistantLinkClick;

            this[EVENT_HANDLER](type)(detail);
            if (typeof this.onLinkClick === "function") {
                this.onLinkClick(this[EVENT_BUILDER](type, detail));
            }
            // Prevent default behavior of the link click, we created
            // the custom event to handle it in the application
            e.preventDefault();
        };

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
            />
        );
    }
}
