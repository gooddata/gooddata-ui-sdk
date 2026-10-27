// (C) 2026 GoodData Corporation

import { type IMeasureValueFilter as IEmbeddingMeasureValueFilter } from "@gooddata/sdk-embedding";
import {
    type IDashboardMeasureValueFilter,
    type IInsight,
    type IInsightWidget,
    type ObjRef,
    type ObjRefInScope,
    areObjRefsEqual,
    dashboardFilterObjRef,
    insightFilters,
    insightMeasures,
    isDashboardMeasureValueFilterReference,
    isIdentifierRef,
    isLocalIdRef,
    isMeasureValueFilter,
    measureItem,
    measureLocalId,
    measureValueFilterMeasure,
    objRefToString,
} from "@gooddata/sdk-model";

/**
 * Resolves the metric ObjRef behind an insight MVF's measure reference. Insight MVFs reference
 * their target measure either directly (`ObjRef`) or via a bucket-local id (`LocalIdRef`); the
 * latter must be looked up in the insight's measures and mapped to the catalog `ObjRef` carried
 * on the simple measure definition. Returns `undefined` when the local id does not resolve or
 * the matched measure is non-simple (arithmetic, previous-period, …) and therefore has no LDM
 * item to compare against.
 */
function resolveInsightMvfMetric(ref: ObjRefInScope, insight: IInsight): ObjRef | undefined {
    if (!isLocalIdRef(ref)) {
        return ref;
    }
    const matched = insightMeasures(insight).find((m) => measureLocalId(m) === ref.localIdentifier);
    return matched ? measureItem(matched) : undefined;
}

/**
 * Drops dashboard MVFs the widget is configured to ignore (mirrors `resolveDashboardMeasureValueFilters`
 * in `queryWidgetFilters`) and emits a `console.warn` when the insight already has its own MVF on the
 * same metric. The dashboard MVF is still emitted in the overlap case — both filters apply via logical
 * AND at execution and warning keeps parity with that runtime behavior so the embedding caller can
 * observe the clash without changing semantics.
 */
export function filterDashboardMvfsForWidget(
    widget: IInsightWidget,
    dashboardMvfs: IDashboardMeasureValueFilter[],
    insight: IInsight | undefined,
): IDashboardMeasureValueFilter[] {
    const ignoredRefs = widget.ignoreDashboardFilters?.filter(isDashboardMeasureValueFilterReference) ?? [];
    const widgetEffective =
        ignoredRefs.length === 0
            ? dashboardMvfs
            : dashboardMvfs.filter(
                  (mvf) =>
                      !ignoredRefs.some((ref) => areObjRefsEqual(ref.measure, dashboardFilterObjRef(mvf))),
              );

    // Insight MVFs may reference their measure by LocalIdRef (bucket-local) — resolve those to the
    // catalog ObjRef via the insight's measures so we can compare against dashboard MVFs (which
    // always reference the catalog metric directly).
    const insightMvfMetrics: ObjRef[] = insight
        ? insightFilters(insight)
              .filter(isMeasureValueFilter)
              .map((f) => resolveInsightMvfMetric(measureValueFilterMeasure(f), insight))
              .filter((ref): ref is ObjRef => ref !== undefined)
        : [];

    if (insightMvfMetrics.length > 0) {
        widgetEffective.forEach((mvf) => {
            const dashMeasure = dashboardFilterObjRef(mvf);
            if (insightMvfMetrics.some((m) => areObjRefsEqual(m, dashMeasure))) {
                console.warn(
                    `Dashboard MVF on metric ${objRefToString(dashMeasure!)} overlaps with an insight-level MVF on the same metric; both will be transferred to AD and applied together.`,
                );
            }
        });
    }

    return widgetEffective;
}

/**
 * Converts dashboard measure value filters to the embedding {@link IEmbeddingMeasureValueFilter}
 * format used by the AD `SetFilterContext` command. The target measure is forwarded as the
 * catalog identifier (Tiger; URI refs are unsupported and such MVFs are skipped). Each filter
 * carries its dashboard `localIdentifier` so AD can disambiguate individual filter instances
 * (currently the dashboard model permits at most one MVF per metric, but `localIdentifier`
 * is part of the contract in preparation for multi-MVF-per-metric support).
 */
export function toMeasureValueFilterItems(
    dashboardMvfs: IDashboardMeasureValueFilter[],
): IEmbeddingMeasureValueFilter[] {
    if (!dashboardMvfs.length) {
        return [];
    }
    return dashboardMvfs.flatMap((mvf) => {
        const { measure, localIdentifier, conditions } = mvf.dashboardMeasureValueFilter;
        if (!isIdentifierRef(measure)) {
            return [];
        }
        return [
            {
                measureValueFilter: {
                    measure: { identifier: measure.identifier },
                    localIdentifier,
                    ...(conditions && conditions.length > 0 ? { conditions } : {}),
                },
            },
        ];
    });
}
