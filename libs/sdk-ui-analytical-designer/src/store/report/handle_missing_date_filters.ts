// (C) 2026 GoodData Corporation

import {
    type IFilter,
    type IInsight,
    type ObjRef,
    areObjRefsEqual,
    filterObjRef,
    insightFilters,
    insightMeasures,
    isAllTimeDateFilter,
    isAttributeFilter,
    isIdentifierRef,
    isRelativeDateFilter,
    isSimpleMeasure,
    measureFilters,
} from "@gooddata/sdk-model";

import { type IDateDatasetsMeta } from "../../models/date_datasets_meta.js";
import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { type IMissingDateFilterItem } from "../../typings/report.js";

/**
 * Tells the granularity of a date attribute's label from its identifier alone. How labels are named is
 * a backend rule, so the caller supplies it.
 */
export type LabelGranularityResolver = (labelIdentifier: string) => string | undefined;

/**
 * Thrown by the open-report sagas when the insight's filters reference items the workspace no
 * longer has. The sagas' failure handler turns it into the "not found" open failure that names
 * the missing items.
 */
export class MissingInsightItemsError extends Error {
    public readonly missingItems: ReadonlyArray<IMissingDateFilterItem>;

    constructor(missingItems: ReadonlyArray<IMissingDateFilterItem>) {
        super(`Insight references missing items: ${missingItems.map((item) => item.identifier).join(", ")}`);
        this.name = "MissingInsightItemsError";
        this.missingItems = missingItems;
    }
}

export function isMissingInsightItemsError(error: unknown): error is MissingInsightItemsError {
    return error instanceof MissingInsightItemsError;
}

const refIdentifier = (ref: ObjRef | undefined): string | undefined =>
    isIdentifierRef(ref) ? ref.identifier : undefined;

/**
 * A date attribute, its default label and every other label of it share the date dataset's
 * identifier as a prefix (`estimated_delivery_date.minuteOfHour`), which is the one thing that
 * survives the granularity being disabled. The longest matching dataset wins, so a dataset whose
 * identifier is itself a prefix of another one cannot claim the other's labels.
 */
function findOwningDateDataset(
    displayFormIdentifier: string,
    dateDatasets: ReadonlyArray<IDateDatasetsMetaItem>,
): IDateDatasetsMetaItem | undefined {
    return dateDatasets
        .filter((dataset) => displayFormIdentifier.startsWith(`${dataset.identifier}.`))
        .sort((a, b) => b.identifier.length - a.identifier.length)[0];
}

/** The attribute ref of a date attribute equals its label ref, so one identifier compare covers both. */
function dateDatasetHasDisplayForm(dataset: IDateDatasetsMetaItem, displayFormIdentifier: string): boolean {
    return (dataset.attributes ?? []).some(
        (attribute) =>
            refIdentifier(attribute.ref) === displayFormIdentifier ||
            refIdentifier(attribute.dfRef) === displayFormIdentifier ||
            attribute.dfIdentifier === displayFormIdentifier ||
            (attribute.displayForms ?? []).some(
                (displayForm) =>
                    displayForm.id === displayFormIdentifier ||
                    refIdentifier(displayForm.ref) === displayFormIdentifier,
            ),
    );
}

/**
 * An additional date filter: an attribute filter on a date attribute's label that no longer exists.
 * Only identifier refs can be checked: the dataset identifier prefix of the label is the one thing
 * that ties a label to its date dataset once the attribute is gone, and a uri ref has no such
 * prefix, so it cannot be told apart from a regular attribute's label.
 */
function findMissingDateAttributeLabel(
    filter: IFilter,
    dateDatasets: ReadonlyArray<IDateDatasetsMetaItem>,
    resolveLabelGranularity: LabelGranularityResolver,
): IMissingDateFilterItem | undefined {
    const displayFormIdentifier = refIdentifier(filterObjRef(filter));
    if (!displayFormIdentifier) {
        return undefined;
    }
    const dataset = findOwningDateDataset(displayFormIdentifier, dateDatasets);
    if (!dataset || dateDatasetHasDisplayForm(dataset, displayFormIdentifier)) {
        return undefined;
    }
    const granularity = resolveLabelGranularity(displayFormIdentifier);
    return {
        datasetTitle: dataset.title,
        identifier: displayFormIdentifier,
        ...(granularity ? { granularity } : {}),
    };
}

/**
 * A relative date filter whose granularity the date dataset no longer has. A meta attribute's
 * `dateType` IS the granularity the date filters are expressed in (`GDC.time.*`). All time is no
 * attribute of the dataset, so it can never go missing; it is stored as a relative date filter
 * when it carries empty values handling.
 */
function findMissingDateGranularity(
    filter: IFilter,
    dateDatasets: ReadonlyArray<IDateDatasetsMetaItem>,
): IMissingDateFilterItem | undefined {
    if (!isRelativeDateFilter(filter) || isAllTimeDateFilter(filter)) {
        return undefined;
    }
    const datasetRef = filterObjRef(filter);
    if (!datasetRef) {
        return undefined;
    }
    const dataset = dateDatasets.find((candidate) => areObjRefsEqual(candidate.ref, datasetRef));
    const { granularity } = filter.relativeDateFilter;
    if (!dataset || (dataset.attributes ?? []).some((attribute) => attribute.dateType === granularity)) {
        return undefined;
    }
    return { datasetTitle: dataset.title, identifier: dataset.identifier, granularity };
}

function findMissingItem(
    filter: IFilter,
    dateDatasets: ReadonlyArray<IDateDatasetsMetaItem>,
    resolveLabelGranularity: LabelGranularityResolver,
): IMissingDateFilterItem | undefined {
    return isAttributeFilter(filter)
        ? findMissingDateAttributeLabel(filter, dateDatasets, resolveLabelGranularity)
        : findMissingDateGranularity(filter, dateDatasets);
}

/** Two references to the same missing granularity of the same dataset are one item. */
const itemKey = (item: IMissingDateFilterItem): string =>
    `${item.datasetTitle}|${item.granularity ?? item.identifier}`;

/**
 * Collects the items the insight's date-related filters reference but the workspace no longer has,
 * because a granularity was disabled in the logical data model after the insight was saved:
 *
 * - an additional date filter (an attribute filter on a date attribute's label) whose attribute the
 *   date dataset no longer has; its granularity is told from the label identifier by `resolveLabelGranularity`,
 * - a relative date filter whose granularity the date dataset no longer has.
 *
 * Both the insight's own filters and every measure's filters are inspected. Regular attribute
 * filters, absolute date filters and date datasets the meta does not list are never reported. Each
 * item is reported once, in the order it is first met.
 *
 * Pure over the insight and the date datasets meta: the meta lists every date dataset with the
 * attributes it currently has, which is exactly what those filters reference.
 */
export function findMissingDateFilterItems(
    insight: IInsight,
    dateDatasetsMeta: IDateDatasetsMeta | undefined,
    resolveLabelGranularity: LabelGranularityResolver,
): IMissingDateFilterItem[] {
    const dateDatasets = dateDatasetsMeta?.items ?? [];
    if (!dateDatasets.length) {
        return [];
    }

    const measureLevelFilters = insightMeasures(insight)
        .filter(isSimpleMeasure)
        .flatMap((measure) => measureFilters(measure) ?? []);
    const filters: IFilter[] = [...insightFilters(insight), ...measureLevelFilters];

    const missing = filters
        .map((filter) => findMissingItem(filter, dateDatasets, resolveLabelGranularity))
        .filter((item): item is IMissingDateFilterItem => item !== undefined);

    const unique = new Map(missing.map((item) => [itemKey(item), item] as const));
    return [...unique.values()];
}
