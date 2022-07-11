// (C) 2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError, ILoadingState, IDrillEvent, IExportFunction, ILocale } from "@gooddata/sdk-ui";
import { IInsight } from "@gooddata/sdk-model";
import {
    CustomElementAdapter,
    LOAD_STYLES,
    LOAD_COMPONENT,
    EVENT_HANDLER,
    GET_VISUALIZATION,
} from "./CustomElementAdapter";

type IInsightView = typeof import("@gooddata/sdk-ui-ext/esm/insightView/InsightView").InsightView;

export class Insight extends CustomElementAdapter<IInsightView> {
    static get observedAttributes() {
        return ["workspace", "insight", "locale", "title"];
    }

    async [LOAD_STYLES]() {
        return (
            await Promise.all([
                import("@gooddata/sdk-ui-filters/styles/css/main.css"),
                import("@gooddata/sdk-ui-charts/styles/css/main.css"),
                import("@gooddata/sdk-ui-geo/styles/css/main.css"),
                import("@gooddata/sdk-ui-pivot/styles/css/main.css"),
                import("@gooddata/sdk-ui-kit/styles/css/main.css"),
                import("@gooddata/sdk-ui-ext/styles/css/main.css"),
            ])
        ).map((mod) => mod.default);
    }

    async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-ext/esm/insightView/InsightView")).InsightView;
    }

    [GET_VISUALIZATION](Component: IInsightView, backend: IAnalyticalBackend, workspace: string) {
        // Ensure mandatory property is provided
        const insight = this.getAttribute("insight");
        invariant(insight, '"insight" is a mandatory attribute and it cannot be empty');

        // Collect the rest of the props
        const extraProps: Partial<React.ComponentProps<typeof Component>> = {};

        if (this.hasAttribute("locale")) {
            extraProps.locale = this.getAttribute("locale") as ILocale;
        }

        if (this.hasAttribute("title")) {
            // title can be either string or boolean. We can't accept function in attribute.
            // Empty string means a shortcut attribute = true. Any other notation is taken as a string literal
            //  including <... title="true"> = the title is set to the string "true"
            extraProps.showTitle = this.getAttribute("title") || true;
        }

        return (
            <Component
                backend={backend}
                workspace={workspace}
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
