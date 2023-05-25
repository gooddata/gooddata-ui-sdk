// (C) 2022 GoodData Corporation
import React from "react";
import { invariant } from "ts-invariant";

import {
    GoodDataSdkError,
    ILoadingState,
    IDrillEvent,
    IExportFunction,
    resolveLocale,
} from "@gooddata/sdk-ui";
import { IInsight } from "@gooddata/sdk-model";
import {
    CustomElementAdapter,
    LOAD_COMPONENT,
    EVENT_HANDLER,
    GET_VISUALIZATION,
} from "./CustomElementAdapter.js";

import { CustomElementContext } from "../context.js";
import type { InsightView } from "@gooddata/sdk-ui-ext";
type IInsightView = typeof InsightView;

export class Insight extends CustomElementAdapter<IInsightView> {
    static get observedAttributes() {
        return ["workspace", "insight", "locale", "title", "mapbox"];
    }

    async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-ext")).InsightView;
    }

    [GET_VISUALIZATION](
        Component: IInsightView,
        { backend, workspaceId, mapboxToken }: CustomElementContext,
    ) {
        // Ensure mandatory property is provided
        const insight = this.getAttribute("insight");
        invariant(insight, '"insight" is a mandatory attribute and it cannot be empty');

        // Collect the rest of the props
        const extraProps: Partial<React.ComponentProps<typeof Component>> = { config: {} };

        if (this.hasAttribute("locale")) {
            extraProps.locale = resolveLocale(this.getAttribute("locale"));
        }

        if (this.hasAttribute("title")) {
            // title can be either string or boolean. We can't accept function in attribute.
            // Empty string means a shortcut attribute = true. Any other notation is taken as a string literal
            //  including <... title="true"> = the title is set to the string "true"
            extraProps.showTitle = this.getAttribute("title") || true;
        }

        if (this.hasAttribute("mapbox") || mapboxToken) {
            extraProps.config!.mapboxToken = (this.getAttribute("mapbox") || mapboxToken) ?? "";
        }

        return (
            <Component
                backend={backend}
                workspace={workspaceId}
                insight={insight}
                onDrill={this[EVENT_HANDLER]<IDrillEvent>("drill")}
                onError={this[EVENT_HANDLER]<GoodDataSdkError>("error")}
                onExportReady={this[EVENT_HANDLER]<IExportFunction>("exportReady")}
                onLoadingChanged={this[EVENT_HANDLER]<ILoadingState>("loadingChanged")}
                onInsightLoaded={this[EVENT_HANDLER]<IInsight>("insightLoaded")}
                {...extraProps}
            />
        );
    }
}
