// (C) 2026 GoodData Corporation

import { uniqBy } from "lodash-es";

import { walkLayout } from "@gooddata/sdk-backend-spi";
import {
    type IDashboard,
    type IDashboardWidget,
    type IInsight,
    type IdentifierRef,
    isIdentifierRef,
    isInsightWidget,
    isRichTextWidget,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { collectReferences } from "@gooddata/sdk-ui-kit";

import { insightWidgetDescription } from "../../../_staging/insight/insightWidgetDescription.js";
import { newInsightMap } from "../../../_staging/metadata/objRefMap.js";
import { collectFilterParameterRoots } from "../../store/tabs/parameters/parametersHelpers.js";

import { insightRoots } from "./loadParameterDependencies.js";

/**
 * Every dependency root the dashboard needs parameters for: its insights, text references, and
 * dashboard filters across all tabs. Collected at initialization so one references call covers the
 * whole dashboard.
 *
 * A widget whose insight did not load keeps its own description, which is what it renders.
 *
 * @internal
 */
export function collectDashboardParameterRoots(
    dashboard: IDashboard | undefined,
    insights: IInsight[],
): IdentifierRef[] {
    const insightMap = newInsightMap(insights);
    const roots: IdentifierRef[] = insightRoots(insights);

    function textRoots(content: string | undefined): IdentifierRef[] {
        return content ? collectTextReferenceRoots(content) : [];
    }

    function widgetText(widget: IDashboardWidget): string | undefined {
        if (isRichTextWidget(widget)) {
            return widget.content;
        }
        return isInsightWidget(widget)
            ? insightWidgetDescription(widget, insightMap.get(widget.insight))
            : undefined;
    }

    for (const layout of [dashboard?.layout, ...(dashboard?.tabs ?? []).map((tab) => tab.layout)]) {
        if (layout) {
            walkLayout(layout, {
                sectionCallback: (section) => roots.push(...textRoots(section.header?.description)),
                widgetCallback: (widget) => roots.push(...textRoots(widgetText(widget))),
            });
        }
    }
    const filters = [
        ...(dashboard?.tabs ?? []).flatMap((tab) => tab.filterContext?.filters ?? []),
        ...(dashboard?.filterContext?.filters ?? []),
    ];
    roots.push(...collectFilterParameterRoots(filters));
    return uniqBy(roots, serializeObjRef);
}

/**
 * The dependency roots of a text: the metrics and computed attributes it references, which the
 * text executes and whose parameters therefore apply to it. Labels resolve through their own
 * display form and parameters are never executed, so neither is a root.
 *
 * @internal
 */
export function collectTextReferenceRoots(content: string): IdentifierRef[] {
    const roots = Object.values(collectReferences(content))
        .filter(({ type }) => type === "measure" || type === "computedAttribute")
        .map(({ ref }) => ref)
        .filter(isIdentifierRef);
    return uniqBy(roots, serializeObjRef);
}
