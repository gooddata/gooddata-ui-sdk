// (C) 2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ILocale } from "@gooddata/sdk-ui";
import {
    CustomElementAdapter,
    EVENT_HANDLER,
    GET_VISUALIZATION,
    LOAD_COMPONENT,
} from "./CustomElementAdapter";

import type { Dashboard as OriginalDashboard } from "@gooddata/sdk-ui-dashboard";
type IDashboard = typeof OriginalDashboard;

export class Dashboard extends CustomElementAdapter<IDashboard> {
    static get observedAttributes() {
        return ["workspace", "dashboard", "locale", "readonly", "mapboxToken"];
    }

    async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-dashboard/esm/presentation/dashboard/Dashboard")).Dashboard;
    }

    [GET_VISUALIZATION](Component: IDashboard, backend: IAnalyticalBackend, workspace: string) {
        const dashboard = this.getAttribute("dashboard");

        // "dashboard" property is mandatory
        invariant(dashboard, '"dashboard" is a mandatory attribute and it cannot be empty');

        // Collect the rest of the props
        const extraProps: Partial<React.ComponentProps<IDashboard>> = { config: {} };

        if (this.hasAttribute("locale")) {
            extraProps.config!.locale = this.getAttribute("locale") as ILocale;
        }

        if (this.hasAttribute("readonly")) {
            extraProps.config!.isReadOnly = true;
        }

        if (this.hasAttribute("mapbox")) {
            extraProps.config!.mapboxToken = this.getAttribute("mapbox") ?? "";
        }
        return (
            <Component
                backend={backend}
                workspace={workspace}
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
