// (C) 2022-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { invariant } from "ts-invariant";

import { type IInsight } from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    type IDrillEvent,
    type IExportFunction,
    type ILoadingState,
    resolveLocale,
} from "@gooddata/sdk-ui";
import type { InsightView } from "@gooddata/sdk-ui-ext";

import {
    CustomElementAdapter,
    EVENT_HANDLER,
    GET_COMPONENT,
    LOAD_COMPONENT,
} from "../common/CustomElementAdapter.js";
import { stringToFilters } from "../common/typeGuards/stringToFilters.js";
import { type CustomElementContext } from "../context.js";

type IInsightView = typeof InsightView;

function parseFilters(stringifiedFilters: string | null | undefined) {
    if (!stringifiedFilters) {
        return undefined;
    }
    try {
        return stringToFilters(stringifiedFilters);
    } catch (e) {
        console.error("Invalid filters not used in <gd-insight> component", e, stringifiedFilters);
        return undefined;
    }
}

export class Insight extends CustomElementAdapter<IInsightView> {
    static get observedAttributes() {
        return ["workspace", "insight", "locale", "title", "mapbox", "filters"];
    }

    async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-ext")).InsightView;
    }

    [GET_COMPONENT](
        Component: IInsightView,
        { backend, workspaceId, mapboxToken, agGridToken }: CustomElementContext,
    ) {
        // Ensure mandatory property is provided
        const insight = this.getAttribute("insight");
        invariant(insight, '"insight" is a mandatory attribute and it cannot be empty');

        // Collect the rest of the props
        const extraProps: Partial<ComponentProps<typeof Component>> = { config: {} };

        const localeAttr = this.getAttribute("locale");
        if (localeAttr !== null) {
            extraProps.locale = resolveLocale(localeAttr);
        }

        // title can be either string or boolean. We can't accept function in attribute.
        // Empty string means a shortcut attribute = true. Any other notation is taken as a string literal
        //  including <... title="true"> = the title is set to the string "true"
        const titleAttr = this.getAttribute("title");
        if (titleAttr !== null) {
            extraProps.showTitle = titleAttr || true;
        }

        const mapboxAttr = this.getAttribute("mapbox");
        if (mapboxAttr || mapboxToken) {
            extraProps.config!.mapboxToken = (mapboxAttr || mapboxToken) ?? "";
        }

        const agGridAttr = this.getAttribute("agGrid");
        if (agGridAttr || agGridToken) {
            extraProps.config!.agGridToken = (agGridAttr || agGridToken) ?? "";
        }

        const filters = parseFilters(this.getAttribute("filters"));
        if (filters) {
            extraProps.filters = filters;
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
