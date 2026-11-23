// (C) 2026 GoodData Corporation

import {
    type CatalogItem,
    type IDashboardAttributeFilter,
    type IFilter,
    type IInsight,
} from "@gooddata/sdk-model";
import { type IDrillEvent, type IHeaderPredicate } from "@gooddata/sdk-ui";
import {
    type IDashboardKeyDriverCombinationItem,
    type IKdaDefinition,
    getKdaKeyDriverCombinations,
} from "@gooddata/sdk-ui-dashboard";

import {
    createKdaDefinitionFromDrill as createDefinition,
    getDashboardAttributeFilter,
} from "../components/messages/conversationContents/useKdaDefinition.js";
import { changeAnalysisDrills } from "../components/messages/conversationContents/utils/changeAnalysisDrills.js";
import {
    convertIntersectionToAttributeFilters,
    mergeFilters,
} from "../components/utils/intersectionUtils.js";

/**
 * Options for building a Key Driver Analysis definition from a custom chart drill.
 *
 * @internal
 */
export interface ICreateKdaDefinitionFromDrillOptions {
    /** Catalog items used to resolve the analyzed measure's title. */
    catalogItems: CatalogItem[];
    /** Fallback locale when the date attribute does not specify one. */
    locale: string;
    /** Comparison selected from {@link getKdaDrillCombinations}. */
    comparison: IDashboardKeyDriverCombinationItem;
    /** Original chart drill event. */
    event: IDrillEvent;
    /**
     * Effective chart filters, including any filters supplied to the renderer.
     * Only attribute filters are used; the comparison determines the date range.
     */
    filters?: IFilter[];
}

/**
 * Builds a Key Driver Analysis definition for a selected drill comparison.
 *
 * @remarks
 * Non-date attribute selections from the clicked point override chart filters on the same display form.
 * Date filters and measure filters are not copied; this matches the AI Assistant chart drill behavior.
 *
 * @param options - Chart context and the comparison selected by the user.
 * @returns A definition, or undefined if the measure or normalized comparison dates are missing.
 * @internal
 */
export function createKdaDefinitionFromDrill({
    catalogItems,
    locale,
    comparison,
    event,
    filters = [],
}: ICreateKdaDefinitionFromDrillOptions): IKdaDefinition | undefined {
    const attributeFilters = filters
        .map(getDashboardAttributeFilter)
        .filter((filter): filter is IDashboardAttributeFilter => filter !== null);

    return createDefinition(
        catalogItems,
        locale,
        comparison,
        event,
        mergeFilters(
            convertIntersectionToAttributeFilters(event.drillContext.intersection ?? []),
            attributeFilters,
        ),
    );
}

/**
 * Resolves the Key Driver Analysis comparisons available for a chart drill.
 *
 * @remarks
 * Present all returned comparisons to the user rather than implicitly selecting the first one.
 * An empty result means the drilled point has no supported comparison.
 *
 * @param event - Original chart drill event.
 * @param enableSecondGranularities - Whether to allow second-level date granularities. Defaults to false.
 * @returns Comparisons against neighboring periods and, when available, the previous year.
 * @internal
 */
export function getKdaDrillCombinations(
    event: IDrillEvent,
    enableSecondGranularities = false,
): IDashboardKeyDriverCombinationItem[] {
    return getKdaKeyDriverCombinations(
        {
            type: "keyDriveAnalysis",
            transition: "in-place",
            origin: { type: "drillFromMeasure", measure: { localIdentifier: "" } },
        },
        event,
        enableSecondGranularities,
    );
}

/**
 * Creates measure drill predicates for Key Driver Analysis on a custom insight renderer.
 *
 * @remarks
 * Respects the insight's per-measure `disableKeyDriveAnalysisOn` controls. These predicates only
 * enable chart drilling; use {@link getKdaDrillCombinations} to check the clicked point's eligibility.
 * Call this only when Key Driver Analysis is enabled for your application and user.
 *
 * @param insight - Insight rendered by the custom chart.
 * @param enabled - Whether to enable Key Driver Analysis drilling. Defaults to true.
 * @returns Drillable measure predicates, or an empty array when disabled.
 * @internal
 */
export function getKdaDrillableItems(insight: IInsight, enabled = true): IHeaderPredicate[] {
    return changeAnalysisDrills({ insight: insight.insight }, enabled, enabled);
}
