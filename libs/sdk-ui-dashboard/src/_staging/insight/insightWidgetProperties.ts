// (C) 2020-2026 GoodData Corporation

import { mergeWith } from "lodash-es";

import {
    type IInsight,
    type IInsightWidget,
    insightProperties,
    insightSetProperties,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export function mergeInsightWithWidgetProperties(insight: IInsight, widget: IInsightWidget): IInsight {
    const fromWidget = widget.properties;
    if (!fromWidget) {
        return insight;
    }

    const fromWidgetWithZoomingHandled = {
        ...fromWidget,
        controls: {
            ...fromWidget?.["controls"],
            // we need to take the relevant feature flag into account as well
            zoomInsight: !!fromWidget?.["controls"]?.zoomInsight,
        },
    };

    const fromInsight = insightProperties(insight);
    const merged = mergeWith({}, fromInsight, fromWidgetWithZoomingHandled, (currentValue, incomingValue) => {
        /**
         * Replace arrays instead of merging them. This is important for column sizing for example,
         * where widget might provide an empty array to override the custom column sizes defined on the insight level.
         */
        if (Array.isArray(currentValue)) {
            return incomingValue;
        }
        // for other types fall back to the default merging strategy by returning nothing
    });

    return insightSetProperties(insight, merged);
}
