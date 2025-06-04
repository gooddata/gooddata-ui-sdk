// (C) 2022-2025 GoodData Corporation
import React from "react";
import omit from "lodash/omit.js";

import { resolveLocale } from "@gooddata/sdk-ui";
import type { ChatEvent, GenAIChat as OriginalGenAIChat, LinkHandlerEvent } from "@gooddata/sdk-ui-gen-ai";

import {
    CustomElementAdapter,
    EVENT_BUILDER,
    EVENT_HANDLER,
    GET_COMPONENT,
    LOAD_COMPONENT,
} from "../common/index.js";
import { CustomElementContext } from "../context.js";

type IGenAIChat = typeof OriginalGenAIChat;
type IGenAIChatLinkClick = Omit<LinkHandlerEvent, "preventDefault">;

export class GenAIChat extends CustomElementAdapter<IGenAIChat> {
    static get observedAttributes() {
        return ["workspace", "locale"];
    }

    async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-gen-ai")).GenAIChat;
    }

    onLinkClick?: (event: CustomEvent<IGenAIChatLinkClick>) => void;

    [GET_COMPONENT](Component: IGenAIChat, { backend, workspaceId }: CustomElementContext) {
        // Collect the rest of the props
        const extraProps: Partial<React.ComponentProps<IGenAIChat>> = {};

        if (this.hasAttribute("locale")) {
            extraProps.locale = resolveLocale(this.getAttribute("locale"));
        }

        // Emit custom DOM event when link is clicked
        extraProps.onLinkClick = (e) => {
            const type = "linkClick";
            const detail = omit(e, ["preventDefault"]) as IGenAIChatLinkClick;

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
