// (C) 2021-2022 GoodData Corporation

import {
    IInsight,
    insightRef,
    serializeObjRef,
    IDashboardObjectIdentity,
    AnalyticalWidgetType,
    isKpiWidget,
    isInsightWidget,
    IDashboardLayout,
    IDashboardWidget,
    IDashboardLayoutItem,
    isDashboardLayout,
    ISettings,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";
import keyBy from "lodash/keyBy.js";
import { invariant, InvariantError } from "ts-invariant";
import { validateDashboardLayoutWidgetSize } from "../../presentation/layout/DefaultDashboardLayoutRenderer/utils/sizing.js";
import { ObjRefMap } from "../metadata/objRefMap.js";
import { MeasurableWidgetContent } from "../layout/sizing.js";

function extractContentFromWidget(
    widget: IDashboardWidget,
    insightsById: Record<string, IInsight>,
): { type: AnalyticalWidgetType; content?: MeasurableWidgetContent } {
    if (isInsightWidget(widget)) {
        const insightRef = widget.insight;

        return {
            type: "insight",
            content: insightsById[serializeObjRef(insightRef)],
        };
    } else if (isKpiWidget(widget)) {
        return {
            type: "kpi",
            content: widget.kpi,
        };
    }

    throw new InvariantError(`trying to extract content from unknown widget type ${widget.type}`);
}

/**
 * Sanitizes item. At this moment this function will ensure that Insight and KPI widgets conform to the sizing prescriptions.
 *
 * @param item - item in layout section
 * @param insightsById - list of insights available; insight widgets will be resolved using this
 * @param settings - settings that may impact the sizing
 */
function dashboardLayoutItemSanitize<T = IDashboardWidget>(
    item: IDashboardLayoutItem<T>,
    insightsById: Record<string, IInsight>,
    settings: ISettings,
): IDashboardLayoutItem<T> | undefined {
    const {
        widget,
        size: { xl },
    } = item;

    // ignore items that point to no widget; this is model-level version of the fix to RAIL-3669
    if (!widget) {
        // eslint-disable-next-line no-console
        console.log(`Found item ${item} that does not contain any widget. Removing from layout.`);

        return undefined;
    }

    // only sanitize known widget types
    if (!isInsightWidget(widget) || !isKpiWidget(widget)) {
        return item;
    }

    const { type, content } = extractContentFromWidget(widget, insightsById);

    // if the dashboard is inconsistent (can ultimately happen on tiger), then return no item => it will be removed
    if (!content) {
        return;
    }

    const { validWidth, validHeight } = validateDashboardLayoutWidgetSize(
        xl.gridWidth,
        xl.gridHeight,
        type,
        content,
        settings,
    );

    return {
        ...item,
        size: {
            xl: {
                ...xl,
                gridWidth: validWidth,
                gridHeight: validHeight,
            },
        },
    };
}

/**
 * This function sanitizes dashboard layout. It will:
 *
 * 1.  Ensure insight widgets have correct sizes - matching what the visualization used by the insight needs
 *     (this is essential as the insight visualization may change since the last time dashboard was created)
 * 2.  Ensure insight widgets reference existing insights.
 *
 * @param layout - layout
 * @param insights - existing insights that are referenced by the layout's widgets
 * @param settings - current settings; these may influence sizing of the widgets
 */
export function dashboardLayoutSanitize<T = IDashboardWidget>(
    layout: IDashboardLayout<T>,
    insights: IInsight[],
    settings: ISettings,
): IDashboardLayout<T> {
    const insightsById: Record<string, IInsight> = keyBy(insights, (insight) =>
        serializeObjRef(insightRef(insight)),
    );
    const sanitizedSections = layout.sections.map((section) => {
        const sanitizedItems = compact(
            section.items.map((item) => dashboardLayoutItemSanitize(item, insightsById, settings)),
        );

        return {
            ...section,
            items: sanitizedItems,
        };
    });

    return {
        ...layout,
        sections: sanitizedSections,
    };
}

/**
 * Mapping between dashboard object identities. This is typically used to map between temporary identity assigned
 * to a dashboard object as it is added onto a dashboard and the persistent identity of the object once it
 * it saved by the backend.
 */
export type IdentityMapping = {
    original: IDashboardObjectIdentity;
    updated: IDashboardObjectIdentity;
};

/**
 * Creates {@link ObjRefMap} containing identity mapping..
 */
function newIdentityMapping(items: ReadonlyArray<IdentityMapping>): ObjRefMap<IdentityMapping> {
    const map = new ObjRefMap<IdentityMapping>({
        type: "insight",
        strictTypeCheck: false,
        idExtract: (e) => e.original.identifier,
        uriExtract: (e) => e.original.uri,
        refExtract: (e) => e.original.ref,
    });

    return map.fromItems(items);
}

function getWidgetIdentity(widget: any | undefined): IDashboardObjectIdentity | undefined {
    const { ref, uri, identifier } = widget ?? {};

    if (!ref || !uri || !identifier) {
        return;
    }

    return {
        ref,
        uri,
        identifier,
    };
}

function getIdentityMapping<T extends IDashboardWidget>(
    original: IDashboardLayout<T>,
    updated: IDashboardLayout<T>,
): IdentityMapping[] {
    const result: IdentityMapping[] = [];

    original.sections.forEach((section, sectionIdx) => {
        const updatedSection = updated.sections[sectionIdx];
        invariant(updatedSection);

        section.items.forEach((item, itemIdx) => {
            const updatedItem = updatedSection.items[itemIdx];
            invariant(updatedItem);

            if (isDashboardLayout(item.widget)) {
                invariant(isDashboardLayout(updatedItem.widget));

                result.push(...getIdentityMapping(item.widget, updatedItem.widget));
            } else {
                const originalIdentity = getWidgetIdentity(item.widget);
                const updatedIdentity = getWidgetIdentity(updatedItem.widget);

                invariant(originalIdentity && updatedIdentity);

                result.push({
                    original: originalIdentity,
                    updated: updatedIdentity,
                });
            }
        });
    });

    return result;
}

/**
 * Given two layouts, this function construct mapping between widget identities between the original and the
 * updated layout.
 *
 * Note that this function does not really verify that the layouts are effectively the same and differ just
 * in the widget identities. It checks that for each item in the original layout, there is item at the same
 * position in the updated layout. It can happen that two different layouts will be processed by this
 * function without errors.
 *
 * @param original - original layout, the original widget identities will be picked from here
 * @param updated - updated layout, the updated widget identities will be picked from here
 * @returns map between original widget identity and updated widget identity
 */
export function dashboardLayoutWidgetIdentityMap<T extends IDashboardWidget>(
    original: IDashboardLayout<T>,
    updated: IDashboardLayout<T>,
): ObjRefMap<IdentityMapping> {
    const result: IdentityMapping[] = getIdentityMapping(original, updated);

    return newIdentityMapping(result);
}

export type DashboardObjectIdentityPredicate = (identity: IDashboardObjectIdentity) => boolean;

/**
 * Given a layout, this function will go through all of it's item's widgets and remove widget's identity if
 * the provided predicate function evaluates true for the identity.
 *
 * A new layout with updated widgets will be returned.
 *
 * @param layout - layout to process
 * @param identityPredicate - function to evaluate for each widget identity; if this function returns true, the
 *  widget's identity will be removed
 */
export function dashboardLayoutRemoveIdentity<T extends IDashboardWidget>(
    layout: IDashboardLayout<T>,
    identityPredicate: DashboardObjectIdentityPredicate,
): IDashboardLayout {
    const updatedSections = layout.sections.map((section) => {
        const updatedItems: IDashboardLayoutItem[] = section.items.map((item) => {
            if (isDashboardLayout(item.widget)) {
                return {
                    ...item,
                    widget: dashboardLayoutRemoveIdentity(layout, identityPredicate),
                };
            } else {
                const identity = getWidgetIdentity(item.widget);

                if (!identity || !identityPredicate(identity)) {
                    return item;
                }

                return {
                    ...item,
                    widget: {
                        ...item.widget,
                        ref: undefined,
                        uri: undefined,
                        identifier: undefined,
                    },
                } as any;
            }
        });

        return {
            ...section,
            items: updatedItems,
        };
    });

    return {
        ...layout,
        sections: updatedSections,
    };
}
