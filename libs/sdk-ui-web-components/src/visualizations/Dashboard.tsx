// (C) 2022 GoodData Corporation
import React from "react";
import { invariant } from "ts-invariant";

import { resolveLocale } from "@gooddata/sdk-ui";
import {
    CustomElementAdapter,
    EVENT_HANDLER,
    GET_VISUALIZATION,
    LOAD_COMPONENT,
} from "./CustomElementAdapter.js";

import { CustomElementContext } from "../context.js";
import type { Dashboard as OriginalDashboard } from "@gooddata/sdk-ui-dashboard";
type IDashboard = typeof OriginalDashboard;

export class Dashboard extends CustomElementAdapter<IDashboard> {
    static get observedAttributes() {
        return ["workspace", "dashboard", "locale", "readonly", "mapbox"];
    }

    async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-dashboard")).Dashboard;
    }

    [GET_VISUALIZATION](Component: IDashboard, { backend, workspaceId, mapboxToken }: CustomElementContext) {
        const dashboard = this.getAttribute("dashboard");

        // "dashboard" property is mandatory
        invariant(dashboard, '"dashboard" is a mandatory attribute and it cannot be empty');

        // Collect the rest of the props
        const extraProps: Partial<React.ComponentProps<IDashboard>> = { config: {} };

        if (this.hasAttribute("locale")) {
            extraProps.config!.locale = resolveLocale(this.getAttribute("locale"));
        }

        if (this.hasAttribute("readonly")) {
            extraProps.config!.isReadOnly = true;
        }

        if (this.hasAttribute("mapbox") || mapboxToken) {
            extraProps.config!.mapboxToken = (this.getAttribute("mapbox") || mapboxToken) ?? "";
        }

        return (
            <Component
                backend={backend}
                workspace={workspaceId}
                dashboard={dashboard}
                eventHandlers={[
                    {
                        eval: () => true,
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
