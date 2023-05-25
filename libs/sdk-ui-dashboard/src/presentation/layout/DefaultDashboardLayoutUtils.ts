// (C) 2020-2023 GoodData Corporation
import {
    ObjRef,
    IInsight,
    insightId,
    insightUri,
    isWidget,
    widgetUri,
    widgetId,
    isInsightWidget,
    IDashboardWidget,
    IDashboardLayoutItem,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { LRUCache } from "lru-cache";
import stringify from "json-stable-stringify";
import flow from "lodash/flow.js";

import {
    DashboardLayoutItemModifications,
    IDashboardLayoutItemBuilder,
    validateDashboardLayoutWidgetSize,
} from "./DefaultDashboardLayoutRenderer/index.js";

/**
 * We need to aggressively memoize the widget sanitization results in order to prevent expensive re-renders
 * down the line - we need to keep the widgets referentially equal whenever they are not changed.
 */
export const getMemoizedWidgetSanitizer =
    <TWidget>(cache: LRUCache<string, IDashboardLayoutItem<TWidget>>) =>
    (
        getInsightByRef: (insightRef: ObjRef) => IInsight | undefined,
        enableKDWidgetCustomHeight: boolean,
    ): DashboardLayoutItemModifications<TWidget> => {
        return (item) => {
            const widget = item.facade().widget();
            const insightAvailable = isInsightWidget(widget) && !!getInsightByRef(widget.insight);
            // we need to check if the result was made with insight available or not, it might change the result
            // of polluteWidgetRefsWithBothIdAndUri which touches the insight as well
            const cacheKey = `${stringify(item.facade().raw(), { space: 0 })}__${insightAvailable}`;

            if (!cache.has(cacheKey)) {
                const resultBuilder: IDashboardLayoutItemBuilder<TWidget> = flow(
                    polluteWidgetRefsWithBothIdAndUri(getInsightByRef),
                    validateItemsSize(getInsightByRef, enableKDWidgetCustomHeight),
                )(item);
                cache.set(cacheKey, resultBuilder.build());
            }

            return item.setItem(cache.get(cacheKey)!);
        };
    };

/**
 * Ensure that areObjRefsEqual() and other predicates will be working with uncontrolled user ref inputs
 * in custom layout transformation and/or custom widget/item renderers.
 *
 * @internal
 */
export function polluteWidgetRefsWithBothIdAndUri<TWidget = IDashboardWidget>(
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined,
): DashboardLayoutItemModifications<TWidget> {
    return (item) =>
        item.widget((c) => {
            let updatedContent = c;
            if (isWidget(updatedContent)) {
                updatedContent = {
                    ...updatedContent,
                    ref: {
                        ...updatedContent.ref,
                        uri: widgetUri(updatedContent),
                        identifier: widgetId(updatedContent),
                    },
                };
            }
            if (isInsightWidget(updatedContent)) {
                const insight = getInsightByRef(updatedContent.insight);
                // sometimes this seems to be called sooner than insights are loaded leading to invariant errors
                // since the behavior is nearly impossible to replicate reliably, let's be defensive here
                if (insight) {
                    updatedContent = {
                        ...updatedContent,
                        insight: {
                            ...updatedContent.insight,
                            uri: insightUri(insight),
                            identifier: insightId(insight),
                        },
                    };
                }
            }

            return updatedContent;
        });
}

/**
 * Ensure the insight widgets conform to their allowed sizes.
 *
 * @internal
 */
export function validateItemsSize<TWidget = IDashboardWidget>(
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined,
    enableKDWidgetCustomHeight: boolean,
): DashboardLayoutItemModifications<TWidget> {
    return (item) => {
        const widget = item.facade().widget();
        if (isInsightWidget(widget)) {
            const insight = getInsightByRef(widget.insight);
            invariant(insight, "Inconsistent insight store");
            const currentSize = item.facade().size().xl;
            const { gridWidth: currentWidth, gridHeight: currentHeight } = currentSize;
            const { validWidth, validHeight } = validateDashboardLayoutWidgetSize(
                currentWidth,
                currentHeight,
                "insight",
                insight,
                { enableKDWidgetCustomHeight },
            );
            if (currentWidth !== validWidth || currentHeight !== validHeight) {
                const gridWidthProp = currentWidth !== validWidth ? { gridWidth: validWidth } : {};
                const gridHeightProp = currentHeight !== validHeight ? { gridHeight: validHeight } : {};
                return item.size({
                    xl: {
                        ...currentSize,
                        ...gridWidthProp,
                        ...gridHeightProp,
                    },
                });
            }
        }
        return item;
    };
}
