// (C) 2007-2026 GoodData Corporation

import invariant from "invariant";
import { cloneDeep, isEmpty, negate, omit, pick, pickBy } from "lodash-es";

import {
    type AllTimeGranularity,
    type EmptyValues,
    type IActiveCalendars,
    type IAttributeFilterConfigs,
    type IInsightParameterValue,
    type IMeasure,
    type IdentifierRef,
    type ObjRef,
    areObjRefsEqual,
    isComputedAttributeRef,
    isIdentifierRef,
    isUriRef,
    measureFormat,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    type OverTimeComparisonType,
    OverTimeComparisonTypes,
    fillMissingFormat,
} from "@gooddata/sdk-ui";
import { Axis } from "@gooddata/sdk-ui-ext/internal";

import { ATTRIBUTE, COMPUTED_ATTRIBUTE, DATE, GEO_ATTRIBUTE, METRIC } from "../constants/bucket.js";
import { ALL_TIME } from "../constants/presets.js";
import { isElementUrisSupported } from "../selectors/backend_capabilities_selector.js";
import {
    type EmptyDateValuesFilterMode,
    FilterBar,
    type IAttributeElement,
    type IAttributeFilter,
    type IAttributeFilterConfig,
    type IDateFilter,
    type IDateFilterConfig,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    type TextModeFilterData,
    isTextFilterAll,
} from "../store/filter_bar/filter_bar_types.js";
import { type IParameterFilter } from "../store/filter_bar/parameter_filter_types.js";
import {
    type IVisualizationObjectAbsoluteDateFilter,
    type IVisualizationObjectArbitraryAttributeFilter,
    type IVisualizationObjectAttribute,
    type VisualizationObjectAttributeFilter as IVisualizationObjectAttributeFilter,
    type IBucket as IVisualizationObjectBucket,
    type BucketItem as IVisualizationObjectBucketItem,
    type IVisualizationObjectContent,
    type VisualizationObjectDateFilter as IVisualizationObjectDateFilter,
    type VisualizationObjectFilter as IVisualizationObjectFilter,
    type IVisualizationObjectMeasure,
    type IVisualizationObjectMeasureDefinition,
    type IVisualizationObjectMeasureValueFilter,
    type IVisualizationObjectRankingFilter,
    type IVisualizationObjectRelativeDateFilter,
    type ObjQualifier,
    type VisualizationObjectExtendedFilter,
    isVisualizationObjectAbsoluteDateFilter,
    isVisualizationObjectArbitraryAttributeFilter,
    isVisualizationObjectArithmeticMeasureDefinition,
    isVisualizationObjectAttribute,
    isVisualizationObjectAttributeFilter,
    isVisualizationObjectDateFilter,
    isLocalIdentifierQualifier as isVisualizationObjectLocalIdentifierQualifier,
    isVisualizationObjectMatchAttributeFilter,
    isVisualizationObjectMeasure,
    isVisualizationObjectMeasureValueFilter,
    isVisualizationObjectNegativeAttributeFilter,
    isVisualizationObjectPoPMeasureDefinition as isVisualizationObjectPopMeasureDefinition,
    isVisualizationObjectPositiveAttributeFilter,
    isVisualizationObjectPreviousPeriodMeasureDefinition,
    isVisualizationObjectRankingFilter,
    isVisualizationObjectRelativeDateFilter,
} from "../typings/bear/bearTypes.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
    type IRawBucketItem,
    type IRawBuckets,
} from "../typings/buckets.js";
import { type IDateDatasets, type IUsedDateDatasets } from "../typings/datasets.js";
import {
    type IDecoratedMetricFilter,
    type IDecoratedMetricFilters,
    isDecoratedDateFilter,
} from "../typings/measure_filters.js";
import { type IBucketItem } from "../typings/metadata.js";
import { type IStoredVisualizationProperties } from "../typings/properties.js";
import { type ILoadedReportItems } from "../typings/report.js";
import {
    type ICacheItemDisplayForm,
    type ICatalogEntries,
    type ICatalogEntry,
} from "../typings/state_objects.js";
import {
    extractVisualizationObjectAttributeFilterElements,
    isSingleEmptyStringElement,
} from "../utils/date_filter.js";
import { fromSdkModelDimensionality, toSdkModelDimensionality } from "../utils/dimensionality.js";
import { typedObject } from "../utils/object.js";

import {
    bucketItemBase,
    getDefaultArithmeticMeasureFormat,
    getLocalIdentifier,
    getMasterLocalIdentifier,
    getOperandLocalIdentifiers,
    getOperator,
    isValidArithmeticMeasure,
} from "./bucket_item.js";
import {
    generateBucketItemIdentifier,
    generateDerivedMeasureLocalIdentifier,
} from "./bucket_item_identifier.js";
import { DATE_DATASET_ATTRIBUTE } from "./date_item.js";
import { isSupportedDisplayFormType } from "./display_form.js";
import { GRANULARITY, type Granularity, isFiscalGranularity } from "./granularity.js";
import { PRESETS } from "./preset_item.js";

const isDefined = negate((v) => v === undefined);
const isValid = (value: unknown) => !(value === undefined) && !(value === null);

export function pickValid<T extends object>(object: T): Partial<T> {
    return pickBy(object, isValid) as Partial<T>;
}

function pickDefined<T extends object>(object: T): Partial<T> {
    return pickBy(object, isDefined) as Partial<T>;
}

// buckets -> MD

/** An IDecoratedBucket whose items were replaced with transformed MD bucket items (transformBucketItems). */
type ITransformedBucket = Omit<IDecoratedBucket, "items"> & { items: IVisualizationObjectBucketItem[] };

function reduceBuckets(decoratedBuckets: ITransformedBucket[]): IVisualizationObjectBucket[] {
    return decoratedBuckets
        .map((decoratedBucket) => {
            const bucketTotals = decoratedBucket.totals;
            const totals = bucketTotals && bucketTotals.length > 0 ? { totals: bucketTotals } : {};

            return {
                localIdentifier: decoratedBucket.localIdentifier,
                items: decoratedBucket.items,
                ...totals,
            };
        })
        .filter((mdBucket) => (mdBucket.items?.length ?? 0) > 0);
}

function numberOrUndefined(value: string | number | undefined): number | undefined {
    return value === undefined ? undefined : parseInt(String(value), 10);
}

/** The granularity of a stored All time date filter, which the sdk-model types as a literal. */
const ALL_TIME_GRANULARITY: AllTimeGranularity = "ALL_TIME_GRANULARITY";

/**
 * The `emptyValueHandling` a metric date filter stores for the empty date values mode. Like the filter
 * bar's `""` attribute filter, only exclude and only are stored: include is the backend default for All
 * time and the picker does not offer it with a period.
 */
export function emptyValueHandlingToMd(emptyDateValuesFilter: EmptyDateValuesFilterMode | undefined): {
    emptyValueHandling?: EmptyValues;
} {
    return emptyDateValuesFilter === "exclude" || emptyDateValuesFilter === "only"
        ? { emptyValueHandling: emptyDateValuesFilter }
        : {};
}

function measureFilterToMd(filter: IDecoratedMetricFilter): IVisualizationObjectFilter | null {
    if (isDecoratedDateFilter(filter)) {
        const dataSet = filter.dateDataset?.ref;

        if (!dataSet) {
            // if there is no dataSet, the filter makes no sense
            return null;
        }

        const from = filter.interval?.interval?.[0];
        const to = filter.interval?.interval?.[1];
        const emptyValueHandlingProp = emptyValueHandlingToMd(filter.original?.emptyDateValuesFilter);
        const absoluteDateFilter = filter.interval?.isStatic ?? false;
        if (absoluteDateFilter) {
            // a static (absolute) preset interval is the [string, string] side of the tuple union
            return {
                absoluteDateFilter: {
                    dataSet,
                    from: from as string,
                    to: to as string,
                    ...emptyValueHandlingProp,
                },
            };
        }
        const granularity = filter.interval?.granularity;
        const boundedFilter = filter.interval?.boundedFilter;
        const relativeFrom = numberOrUndefined(from);
        const relativeTo = numberOrUndefined(to);
        // All time is stored without bounds, a no-op the execution drops; to carry the empty date values
        // mode it has to be the real All time filter, the one the execution sends (as on the filter bar)
        if ((relativeFrom === undefined || relativeTo === undefined) && !isEmpty(emptyValueHandlingProp)) {
            return {
                relativeDateFilter: {
                    dataSet,
                    granularity: ALL_TIME_GRANULARITY,
                    from: 0,
                    to: 0,
                    ...emptyValueHandlingProp,
                },
            };
        }
        // undefined-valued keys are DROPPED, not kept: key presence matters to the deep-equality
        // save comparison
        return {
            relativeDateFilter: {
                dataSet,
                granularity: granularity || GRANULARITY.YEAR,
                ...(relativeFrom === undefined ? {} : { from: relativeFrom }),
                ...(relativeTo === undefined ? {} : { to: relativeTo }),
                ...(boundedFilter ? { boundedFilter } : {}),
                ...emptyValueHandlingProp,
            },
        };
    }
    const displayForm = filter.original?.displayFormRef;
    const localIdentifier = filter.original?.localIdentifier;
    const localIdentifierProp = localIdentifier === undefined ? {} : { localIdentifier };

    const textModeFilter = filter.textModeFilter;
    if (textModeFilter) {
        if (textModeFilter.mode === "arbitrary") {
            // "All" condition (empty values + negative selection) is a no-op — exclude from execution
            if (isTextFilterAll(textModeFilter)) {
                return null;
            }
            return {
                arbitraryAttributeFilter: {
                    ...localIdentifierProp,
                    displayForm,
                    values: textModeFilter.values,
                    ...(textModeFilter.negativeSelection === undefined
                        ? {}
                        : { negativeSelection: textModeFilter.negativeSelection }),
                },
            } as IVisualizationObjectArbitraryAttributeFilter;
        }
        if (textModeFilter.mode === "match") {
            return {
                matchAttributeFilter: {
                    ...localIdentifierProp,
                    displayForm,
                    operator: textModeFilter.operator,
                    literal: textModeFilter.literal,
                    ...(textModeFilter.caseSensitive === undefined
                        ? {}
                        : { caseSensitive: textModeFilter.caseSensitive }),
                    ...(textModeFilter.negativeSelection === undefined
                        ? {}
                        : { negativeSelection: textModeFilter.negativeSelection }),
                },
            };
        }
    }

    const attributePrimaryDisplayForm = (filter.attribute?.displayForms ?? []).find((df) => df.isPrimary);
    const isUsingPrimaryDf =
        !attributePrimaryDisplayForm || areObjRefsEqual(displayForm, attributePrimaryDisplayForm.ref);
    const elements = filter.selectedElements.map((element) =>
        isUsingPrimaryDf ? element.uri : element.title,
    );
    if (filter.isInverted) {
        return {
            negativeAttributeFilter: {
                ...localIdentifierProp,
                displayForm,
                notIn: elements,
            },
        };
    }

    return {
        positiveAttributeFilter: {
            ...localIdentifierProp,
            displayForm,
            in: elements,
        },
    };
}

function dateFilterToMd({
    filterConfig,
    dateDatasetRef,
}: IDateFilter): IVisualizationObjectAbsoluteDateFilter | IVisualizationObjectRelativeDateFilter {
    const [from, to] = filterConfig?.interval || [undefined, undefined];

    if (filterConfig?.type === "absolute") {
        return {
            absoluteDateFilter: {
                dataSet: dateDatasetRef,
                from: from as string | undefined,
                to: to as string | undefined,
            },
        };
    }

    const granularity = filterConfig?.granularity || GRANULARITY.YEAR;
    return {
        relativeDateFilter: pickDefined({
            dataSet: dateDatasetRef,
            granularity,
            from: numberOrUndefined(from),
            to: numberOrUndefined(to),
            ...(filterConfig?.boundedFilter ? { boundedFilter: filterConfig.boundedFilter } : {}),
        }) as IVisualizationObjectRelativeDateFilter["relativeDateFilter"],
    };
}

function attributeFilterToMd(filter: IAttributeFilter, attributeFilterConfigs: IAttributeFilterConfigs = {}) {
    const { filterConfig, localIdentifier } = filter;

    if (filter.textModeFilter) {
        const { textModeFilter } = filter;
        if (textModeFilter.mode === "arbitrary") {
            return {
                arbitraryAttributeFilter: {
                    localIdentifier,
                    displayForm: filter.displayFormRef,
                    values: textModeFilter.values,
                    negativeSelection: textModeFilter.negativeSelection,
                },
            };
        }
        if (textModeFilter.mode === "match") {
            return {
                matchAttributeFilter: {
                    localIdentifier,
                    displayForm: filter.displayFormRef,
                    operator: textModeFilter.operator,
                    literal: textModeFilter.literal,
                    ...(textModeFilter.caseSensitive === undefined
                        ? {}
                        : { caseSensitive: textModeFilter.caseSensitive }),
                    ...(textModeFilter.negativeSelection === undefined
                        ? {}
                        : {
                              negativeSelection: textModeFilter.negativeSelection,
                          }),
                },
            };
        }
    }

    const selectedElements = filterConfig?.selectedElements || [];

    const attributeFilterConfig = attributeFilterConfigs[localIdentifier];

    // for tiger, we must decide whether to use values or uris (= primary label values)
    // If attributeFilterConfig.displayAsLabel is defined, then in filter itself there is primaryLabel and uris need to be used
    const elements =
        isElementUrisSupported() || attributeFilterConfig?.displayAsLabel
            ? selectedElements.map((element) => element.uri)
            : selectedElements.map((element) => element.title);

    if (filterConfig?.isInverted) {
        return {
            negativeAttributeFilter: {
                localIdentifier,
                displayForm: filter.displayFormRef,
                notIn: elements,
            },
        };
    }

    return {
        positiveAttributeFilter: {
            localIdentifier,
            displayForm: filter.displayFormRef,
            in: elements,
        },
    };
}

function measureValueFilterToMd(filter: IMeasureValueFilter): IVisualizationObjectMeasureValueFilter {
    const { measureLocalIdentifier, measureRef, conditions, dimensionality, applyOnResult } = filter;
    const measure = FilterBar.isCatalogMeasureValueFilter(filter)
        ? { measure: measureRef }
        : { measure: { localIdentifier: measureLocalIdentifier } };

    // Bear MD schema supports a single condition; if multiple are present in the app state, use the first one.

    const condition = conditions?.[0];
    const conditionProp = conditions?.length === 1 ? { condition } : { conditions };

    const dimensionalityProp = dimensionality
        ? { dimensionality: toSdkModelDimensionality(dimensionality) }
        : {};

    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };

    return {
        measureValueFilter: {
            ...measure,
            ...conditionProp,
            ...dimensionalityProp,
            ...applyOnResultProp,
        },
    };
}

function rankingFilterToMd(filter: IRankingFilter): IVisualizationObjectRankingFilter {
    const {
        measureLocalIdentifier,
        measureRef,
        attributes,
        operator,
        value,
        applyOnResult,
        strictLimitOfRows,
    } = filter;
    // Catalog measures are referenced by ObjRef, bucket measures by localIdentifier.
    const measures = {
        measures: [
            FilterBar.isCatalogRankingFilter(filter)
                ? measureRef
                : {
                      localIdentifier: measureLocalIdentifier,
                  },
        ],
    };
    // Bucket attributes become local-identifier qualifiers and catalog attributes stay ObjRefs, via the same
    // dimensionality converter the measure value filter uses (mirrors the dimensionality round-trip below).
    const attributesProp = attributes?.length ? { attributes: toSdkModelDimensionality(attributes) } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };

    return {
        rankingFilter: {
            ...measures,
            ...attributesProp,
            operator,
            value,
            ...strictLimitOfRowsProp,
            ...applyOnResultProp,
        },
    };
}

function filterToMd(
    filter: IFilter,
    attributeFilterConfigs: IAttributeFilterConfigs,
): VisualizationObjectExtendedFilter {
    if (FilterBar.isDateFilter(filter)) {
        return dateFilterToMd(filter);
    } else if (FilterBar.isAttributeFilter(filter)) {
        return attributeFilterToMd(filter, attributeFilterConfigs);
    } else if (FilterBar.isMeasureValueFilter(filter)) {
        return measureValueFilterToMd(filter);
    } else if (FilterBar.isRankingFilter(filter)) {
        return rankingFilterToMd(filter);
    }

    throw new Error("Unsupported filter type");
}

function transformMeasureFiltersToMD(filters: IDecoratedMetricFilters) {
    return filters.map(measureFilterToMd).filter(Boolean);
}

function transformBucketItemToSimpleMeasure(bucketItem: IDecoratedBucketItem) {
    const aggregation = bucketItem.aggregation;
    const filters = transformMeasureFiltersToMD(bucketItem.filters ?? []);

    const filtersProp = filters.length === 0 ? {} : { filters };
    return typedObject(
        "measure",
        pickValid({
            localIdentifier: bucketItem.localIdentifier,
            definition: typedObject(
                "measureDefinition",
                pickValid({
                    item: bucketItem.attribute?.ref ?? bucketItem.original?.ref,
                    aggregation,
                    ...filtersProp,
                    computeRatio: bucketItem.showInPercent,
                }),
            ),
            title: bucketItem.measureAxisLabel,
            alias: bucketItem.alias,
            format: bucketItem.format,
        }),
    );
}

/**
 * IBucketsToMetadataAdditionalData as it flows through the buckets → MD transform: enriched with the
 * decorated buckets themselves (transformBucketItems) and per-bucket context (the map inside it).
 */
interface IBucketItemTransformContext extends IBucketsToMetadataAdditionalData {
    decoratedBuckets?: IDecoratedBuckets;
    doesAllowLocationDisplayForm?: boolean;
    bucketLocalIdentifier?: string | null;
}

const getSelectedDateDataSetRef = (additionalData: IBucketItemTransformContext): ObjRef => {
    const selectedDateDataSetRef = additionalData?.dateFilterDateDatasetRef;

    invariant(
        selectedDateDataSetRef,
        "No date data set is selected or additional data parameter is invalid!",
    );
    return selectedDateDataSetRef;
};

function usesFiscalGranularity(decoratedBuckets: IDecoratedBuckets | undefined): boolean {
    if (!decoratedBuckets) {
        return false;
    }

    return decoratedBuckets.some((bucket) =>
        (bucket.items ?? []).some((item) => item.isDate && isFiscalGranularity(item.original?.granularity)),
    );
}

function dateDatasetYearRef(
    additionalData: IBucketItemTransformContext,
    decoratedBuckets?: IDecoratedBuckets,
): ObjRef {
    const selectedDateDataSetRef = getSelectedDateDataSetRef(additionalData);
    const dateDatasets = (additionalData?.dateDatasets?.available ?? []).concat(
        additionalData?.usedDateDatasets?.used ?? [],
    );
    const dateDataset = dateDatasets.find((availableDateDataset) => {
        return areObjRefsEqual(availableDateDataset.ref, selectedDateDataSetRef);
    });

    const dateAttributes = dateDataset?.attributes || [];

    const activeCalendars = additionalData?.activeCalendars;
    const isFiscalCalendarActive = activeCalendars?.fiscal === true;
    const isStandardCalendarActive = activeCalendars?.standard !== false;

    // Prefer fiscal year when: (1) fiscal is exclusively active, OR (2) both calendars active and buckets use fiscal
    const preferFiscalYear =
        isFiscalCalendarActive && (!isStandardCalendarActive || usesFiscalGranularity(decoratedBuckets));

    const dateAttribute =
        (preferFiscalYear && dateAttributes.find((attr) => attr.dateType === GRANULARITY.FISCAL_YEAR)) ||
        dateAttributes.find((attr) => attr.dateType === GRANULARITY.YEAR);

    return dateAttribute?.ref;
}

function createDerivedMeasureLocalIdentifier(bucketItem: IDecoratedBucketItem): string {
    const originalMeasure = bucketItem.original as IRawBucketItem;
    const overTimeComparisonType = bucketItem.original?.overTimeComparisonType as OverTimeComparisonType;
    const defaultLocalIdentifier = generateDerivedMeasureLocalIdentifier(
        getLocalIdentifier(originalMeasure),
        overTimeComparisonType,
    );
    return getLocalIdentifier(originalMeasure, defaultLocalIdentifier);
}

function buildDerivedMeasureAliasProperty(bucketItem: IDecoratedBucketItem) {
    const alias = bucketItem.original?.alias;
    return alias === undefined ? {} : { alias };
}

function getDerivedMeasureComparisonOverTimeType(bucketItem: IDecoratedBucketItem): OverTimeComparisonType {
    return bucketItem.original?.overTimeComparisonType as OverTimeComparisonType;
}

function transformBucketItemToPoPMeasure(
    bucketItem: IDecoratedBucketItem,
    additionalData: IBucketItemTransformContext,
) {
    const alias = buildDerivedMeasureAliasProperty(bucketItem);
    const decoratedBuckets = additionalData?.decoratedBuckets;

    return typedObject(
        "measure",
        pickValid({
            localIdentifier: createDerivedMeasureLocalIdentifier(bucketItem),
            definition: typedObject(
                "popMeasureDefinition",
                pickDefined({
                    measureIdentifier: getMasterLocalIdentifier(bucketItem.original),
                    popAttribute: dateDatasetYearRef(additionalData, decoratedBuckets),
                }),
            ),
            ...alias,
        }),
    );
}

function transformBucketItemToPreviousPeriodMeasure(
    bucketItem: IDecoratedBucketItem,
    additionalData: IBucketItemTransformContext,
) {
    const alias = buildDerivedMeasureAliasProperty(bucketItem);

    const selectedDateDataSetRef = getSelectedDateDataSetRef(additionalData);

    return typedObject(
        "measure",
        pickValid({
            localIdentifier: createDerivedMeasureLocalIdentifier(bucketItem),
            definition: typedObject(
                "previousPeriodMeasure",
                pickDefined({
                    measureIdentifier: getMasterLocalIdentifier(bucketItem.original),
                    dateDataSets: [
                        {
                            dataSet: selectedDateDataSetRef,
                            periodsAgo: 1,
                        },
                    ],
                }),
            ),
            ...alias,
        }),
    );
}

function transformBucketItemToAttribute(
    bucketItem: IDecoratedBucketItem,
    additionalData: IBucketItemTransformContext,
) {
    const doesAllowLocationDisplayForm = additionalData?.doesAllowLocationDisplayForm;
    const isLocationIconVisible = bucketItem.attribute?.isLocationIconVisible;
    const bucketLocalIdentifier = additionalData?.bucketLocalIdentifier;
    const isSupportLocationDisplayForm =
        bucketLocalIdentifier === BucketNames.LOCATION &&
        isLocationIconVisible &&
        doesAllowLocationDisplayForm;
    const isGeoAreaBucket = bucketLocalIdentifier === BucketNames.AREA;
    const areaDisplayFormRef = bucketItem.attribute?.areaDisplayFormRef;

    // displayForm/dfRef are not decorated-item fields — the explicit user choice lives on the raw
    // item
    const explicitDisplayForm = bucketItem.original?.displayForm;
    const explicitDfRef = bucketItem.original?.dfRef;
    const storedDf = bucketItem.attribute?.displayForm;

    const selectedAttributeDfRef =
        isGeoAreaBucket && areaDisplayFormRef
            ? areaDisplayFormRef
            : (explicitDisplayForm ??
              explicitDfRef ??
              (isSupportLocationDisplayForm
                  ? bucketItem.attribute?.locationDisplayFormRef // if supported and not explicitly selected, use location display form
                  : (storedDf ?? bucketItem.attribute?.dfRef))); // otherwise use stored/default display form

    const isDate = bucketItem.isDate;
    const displayFormRef = isDate ? bucketItem.granularity?.dfRef : selectedAttributeDfRef;

    return typedObject(
        "visualizationAttribute",
        pickValid({
            localIdentifier: bucketItem.localIdentifier,
            displayForm: displayFormRef,
            alias: bucketItem.alias,
            showAllValues: bucketItem.showAllValues,
        }),
    );
}

function transformBucketItemToMeasure(
    bucketItem: IDecoratedBucketItem,
    additionalData: IBucketItemTransformContext,
) {
    if (bucketItem.isArithmeticMeasure) {
        return transformBucketItemToArithmeticMeasure(bucketItem);
    } else if (bucketItem.isDerived) {
        return transformBucketItemToDerivedMeasure(bucketItem, additionalData);
    } else {
        return transformBucketItemToSimpleMeasure(bucketItem);
    }
}

function transformBucketItemToDerivedMeasure(
    bucketItem: IDecoratedBucketItem,
    additionalData: IBucketItemTransformContext,
) {
    const overTimeComparisonType = getDerivedMeasureComparisonOverTimeType(bucketItem);
    switch (overTimeComparisonType) {
        case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
            return transformBucketItemToPoPMeasure(bucketItem, additionalData);
        case OverTimeComparisonTypes.PREVIOUS_PERIOD:
            return transformBucketItemToPreviousPeriodMeasure(bucketItem, additionalData);
        default:
            throw Error(`The derived measure type '${overTimeComparisonType}' is not supported!`);
    }
}

function transformBucketItemToArithmeticMeasure(bucketItem: IDecoratedBucketItem) {
    const originalBucketItem = bucketItem.original as IRawBucketItem;

    if (!isValidArithmeticMeasure(originalBucketItem)) {
        return null;
    }

    const operandLocalIdentifiers = getOperandLocalIdentifiers(originalBucketItem);
    const operator = getOperator(originalBucketItem);

    return typedObject(
        "measure",
        pickValid({
            localIdentifier: bucketItem.localIdentifier,
            definition: typedObject("arithmeticMeasure", {
                measureIdentifiers: operandLocalIdentifiers,
                operator,
            }),
            alias: bucketItem.alias,
            format: bucketItem.format,
        }),
    );
}

function transformBucketItem(
    itemsList: IVisualizationObjectBucketItem[],
    bucketItem: IDecoratedBucketItem,
    additionalData: IBucketItemTransformContext,
): IVisualizationObjectBucketItem[] {
    const transformedItem = bucketItem.isMeasure
        ? transformBucketItemToMeasure(bucketItem, additionalData)
        : transformBucketItemToAttribute(bucketItem, additionalData);

    return transformedItem === null
        ? itemsList
        : [...itemsList, transformedItem as IVisualizationObjectBucketItem];
}

function transformBucketItems(
    decoratedBuckets: IDecoratedBuckets,
    additionalData: IBucketsToMetadataAdditionalData | undefined,
): ITransformedBucket[] {
    const additionalDataWithBuckets: IBucketItemTransformContext = {
        ...additionalData,
        decoratedBuckets,
    };

    return decoratedBuckets.map((decoratedBucket) => {
        const doesAllowLocationDisplayForm = (decoratedBucket.accepts ?? []).includes(GEO_ATTRIBUTE);
        const bucketAdditionalData: IBucketItemTransformContext = {
            doesAllowLocationDisplayForm,
            bucketLocalIdentifier: decoratedBucket.localIdentifier,
            ...additionalDataWithBuckets,
        };

        return {
            ...decoratedBucket,
            items: decoratedBucket.items.reduce(
                (itemsList: IVisualizationObjectBucketItem[], bucketItem) =>
                    transformBucketItem(itemsList, bucketItem, bucketAdditionalData),
                [],
            ),
        };
    });
}

/** The additional data `constructVisualizationMDObj` threads into the buckets → MD transform. */
export interface IBucketsToMetadataAdditionalData {
    dateDatasets?: IDateDatasets;
    usedDateDatasets?: IUsedDateDatasets;
    dateFilterDateDatasetRef?: ObjRef;
    activeCalendars?: IActiveCalendars;
}

export function bucketsToMetadata(
    decoratedBuckets: IDecoratedBuckets,
    additionalData?: IBucketsToMetadataAdditionalData,
): IVisualizationObjectBucket[] {
    return reduceBuckets(transformBucketItems(decoratedBuckets, additionalData));
}

/**
 * Finds the display form reference for a date attribute with the specified granularity from a date dataset.
 * @param dateDatasetRef - Reference to the date dataset
 * @param dateDatasets - Available date datasets
 * @param granularity - The date granularity to match (e.g., "GDC.time.year", "GDC.time.date")
 */
function findDateAttributeDfRef(
    dateDatasetRef: ObjRef,
    dateDatasets: IDateDatasets | undefined,
    granularity: Granularity,
): ObjRef | undefined {
    if (!dateDatasets?.available) {
        return undefined;
    }

    const dateDataset = dateDatasets.available.find((ds) => areObjRefsEqual(ds.ref, dateDatasetRef));
    if (!dateDataset?.attributes) {
        return undefined;
    }

    const dateAttribute = dateDataset.attributes.find((attr) => attr.dateType === granularity);
    // If exact granularity not found, try to find any date attribute as fallback
    // This is useful for additional date filters where granularity might be undefined/defaulted to YEAR
    // but the dataset might not have YEAR (e.g. only DATE)
    if (!dateAttribute && dateDataset.attributes.length > 0) {
        return dateDataset.attributes[0].dfRef;
    }

    return dateAttribute?.dfRef;
}

/**
 * Creates an attribute filter for empty date values based on the emptyDateValuesFilter mode.
 * The filter uses the same granularity as the date filter to ensure consistency.
 * Returns undefined if no filter should be created (e.g., for "include" mode).
 */
function createEmptyDateValuesAttributeFilter(
    dateFilter: IDateFilter,
    dateDatasets: IDateDatasets | undefined,
): IVisualizationObjectAttributeFilter | undefined {
    const { emptyDateValuesFilter, dateDatasetRef, filterConfig } = dateFilter;

    // No filter needed for "include" or undefined
    if (!emptyDateValuesFilter || emptyDateValuesFilter === "include") {
        return undefined;
    }

    // Use the date filter's granularity, defaulting to year if not specified
    const granularity = filterConfig?.granularity || GRANULARITY.YEAR;
    const dfRef = findDateAttributeDfRef(dateDatasetRef, dateDatasets, granularity);
    if (!dfRef) {
        return undefined;
    }

    // Empty string represents null/empty values
    if (emptyDateValuesFilter === "only") {
        return {
            positiveAttributeFilter: {
                displayForm: dfRef,
                in: [""],
            },
        };
    }

    if (emptyDateValuesFilter === "exclude") {
        return {
            negativeAttributeFilter: {
                displayForm: dfRef,
                notIn: [""],
            },
        };
    }

    return undefined;
}

export function filtersToMetadata(
    filters: ReadonlyArray<IFilter>,
    attributeFilterConfigs: IAttributeFilterConfigs = {},
    dateDatasets?: IDateDatasets,
) {
    const result: VisualizationObjectExtendedFilter[] = [];

    filters.forEach((filter) => {
        result.push(filterToMd(filter, attributeFilterConfigs));

        // Add empty date values attribute filter if applicable
        if (FilterBar.isDateFilter(filter)) {
            const emptyValuesFilter = createEmptyDateValuesAttributeFilter(filter, dateDatasets);
            if (emptyValuesFilter) {
                result.push(emptyValuesFilter);
            }
        }
    });
    return result;
}

/**
 * Converts parameter filters from AD state into insight parameter values.
 * Filters out values that equal the workspace default (smart persistence) so that
 * the saved insight stays in sync with future default changes.
 */
export function parametersToMetadata(
    parameterFilters: ReadonlyArray<IParameterFilter>,
): IInsightParameterValue[] {
    const values: IInsightParameterValue[] = [];
    parameterFilters.forEach((filter) => {
        if (!isIdentifierRef(filter.parameterRef)) {
            throw new Error("Parameter filter must reference parameter by identifier");
        }
        if (filter.value === filter.definition.defaultValue) {
            return;
        }
        values.push({
            ref: filter.parameterRef,
            value: filter.value,
        });
    });
    return values;
}

// MD -> buckets

export interface IAdditionalData {
    itemCache: ILoadedReportItems["itemCache"];
    filterItems: ILoadedReportItems["filterItems"];
    dateDatasets: IDateDatasets;
    properties: IStoredVisualizationProperties;
}

/** IAdditionalData enriched with the master measures as it flows through the MD → state transform. */
interface IMdTransformContext extends IAdditionalData {
    masterMeasures?: IVisualizationObjectMeasure[];
}

// Bear refs come as {uri} / {identifier} unions and the MD → state readers probe both sides.
const refUri = (ref: ObjQualifier | ObjRef | undefined): string | undefined =>
    isUriRef(ref) ? ref.uri : undefined;
const refIdentifier = (ref: ObjQualifier | ObjRef | undefined): string | undefined =>
    isIdentifierRef(ref) ? ref.identifier : undefined;

function findDimensionIdentifier(
    filterItem: IVisualizationObjectDateFilter,
    data: IDateDatasets | undefined,
) {
    const relativeDataSet = isVisualizationObjectRelativeDateFilter(filterItem)
        ? filterItem.relativeDateFilter.dataSet
        : undefined;
    const absoluteDataSet = isVisualizationObjectAbsoluteDateFilter(filterItem)
        ? filterItem.absoluteDateFilter.dataSet
        : undefined;

    const dimensionUri = refUri(relativeDataSet) || refUri(absoluteDataSet);

    const dimensionId = refIdentifier(relativeDataSet) || refIdentifier(absoluteDataSet);

    const itemDimension = (data?.available ?? []).find(
        (dimension) => dimension.uri === dimensionUri || dimension.identifier === dimensionId,
    );
    return itemDimension?.identifier; // dateDataset may not be available
}

function findItemInDateDatasets(ref: ObjRef, dateDatasets: IDateDatasets | undefined) {
    const availableDateDatasets = dateDatasets?.available ?? [];
    // the date-dataset items may be immer-frozen, so every derived item is a fresh object and
    // nothing is written in place
    const modifiedAvailableDateDatasets = availableDateDatasets.flatMap((dateDataset) =>
        (dateDataset.attributes ?? []).map((attribute) => ({
            ...attribute,
            dateDatasetRef: dateDataset.ref,
        })),
    );
    const foundAvailableDateDatasetsItem = modifiedAvailableDateDatasets.find((dateDataset) =>
        (dateDataset.displayForms ?? []).some((displayForm) => areObjRefsEqual(displayForm.ref, ref)),
    );

    if (!foundAvailableDateDatasetsItem) {
        return null;
    }

    const selectedDisplayForm: ICacheItemDisplayForm = foundAvailableDateDatasetsItem.displayForms.find(
        (displayForm) => areObjRefsEqual(displayForm.ref, ref),
    );

    // override default display form to selected one
    return {
        ...foundAvailableDateDatasetsItem,
        identifier: DATE_DATASET_ATTRIBUTE,
        dfIdentifier: selectedDisplayForm.id,
        dfUri: selectedDisplayForm.uri,
        dfRef: selectedDisplayForm.ref,
    };
}

export function findItemInCache(
    uriOrId: string,
    cache: ICatalogEntries | undefined,
    /**
     * The display form ref the lookup came from, when the caller has it. Its object type is the
     * ONLY thing that tells a computed attribute apart from a regular attribute sharing the
     * identifier, so pass it wherever it is at hand.
     */
    ref?: ObjRef,
): ICatalogEntry | undefined {
    // A computed attribute is addressed as `attribute.<id>` by everything that resolves a saved
    // display form ref (it becomes an attribute bucket item), but it is cached in its own
    // namespace, so both have to be searched. Which one is searched FIRST is what decides a
    // collision: with a computed-attribute ref the computed namespace wins, and with no ref (a
    // caller that genuinely only has an identifier) a real attribute keeps winning as before.
    const preferComputedAttributes = isComputedAttributeRef(ref);

    return (
        findItemInCacheByType(uriOrId, cache, preferComputedAttributes) ??
        findItemInCacheByType(uriOrId, cache, !preferComputedAttributes)
    );
}

function findItemInCacheByType(
    uriOrId: string,
    cache: ICatalogEntries | undefined,
    matchComputedAttributes: boolean,
): ICatalogEntry | undefined {
    return Object.values<ICatalogEntry>(cache ?? {}).find((cacheItem) => {
        const isComputedAttribute = cacheItem.type === COMPUTED_ATTRIBUTE;
        if (isComputedAttribute !== matchComputedAttributes) {
            return false;
        }
        // Also consider date cache items as attribute type (additional filters are stored as attribute filters); fallback to metric for everything else (metric, fact)
        // A computed attribute is likewise addressed as an attribute.
        const cacheItemType =
            cacheItem.type === "attribute" || isComputedAttribute || cacheItem.dateType !== undefined
                ? "attribute"
                : cacheItem.type;
        // first try all the different URIs
        return (
            cacheItem.uri === uriOrId ||
            cacheItem.dfUri === uriOrId ||
            (cacheItem.dfUris ?? []).includes(uriOrId) ||
            cacheItem.locationDisplayFormUri === uriOrId ||
            cacheItem.areaDisplayFormUri === uriOrId ||
            // then the same for identifiers
            `${cacheItemType}.${cacheItem.identifier}` === uriOrId ||
            `${cacheItemType}.${cacheItem.dfIdentifier}` === uriOrId ||
            (cacheItem.dfIdentifiers ?? [])
                .map((dfIdentifier) => `${cacheItemType}.${dfIdentifier}`)
                .includes(uriOrId) ||
            cacheItem.locationDisplayFormIdentifier === uriOrId ||
            cacheItem.areaDisplayFormIdentifier === uriOrId
        );
    });
}

function checkIsPrimaryDisplayForm(attribute: ICatalogEntry | undefined, displayFormKey: string): boolean {
    const primaryDf = (attribute?.displayForms ?? []).find((df) => df.isPrimary);
    return primaryDf?.id === displayFormKey;
}

function getAttributeFromDisplayForm(displayForm: ObjQualifier, itemCache: ICatalogEntries | undefined) {
    const displayFormRef = displayForm;
    const displayFormUri = refUri(displayFormRef);
    const displayFormIdentifier = refIdentifier(displayFormRef);
    const displayFormKey = displayFormUri || displayFormIdentifier;
    const uriOrId = displayFormUri || `attribute.${displayFormIdentifier}`;
    const attribute = findItemInCache(uriOrId, itemCache, displayFormRef);

    if (!attribute) {
        throw new Error(`Cache item not found for display form: ${uriOrId}`);
    }

    return { attribute, displayFormRef, displayFormUri, displayFormIdentifier, displayFormKey };
}

function processVisualizationAttributeFilter(
    filterItem: IVisualizationObjectAttributeFilter,
    data: IMdTransformContext,
): IBucketItemMetricFilter {
    if (isVisualizationObjectArbitraryAttributeFilter(filterItem)) {
        const { localIdentifier, displayForm, values, negativeSelection } =
            filterItem.arbitraryAttributeFilter;
        const { attribute, displayFormRef } = getAttributeFromDisplayForm(displayForm, data?.itemCache);

        return {
            localIdentifier: localIdentifier ?? generateBucketItemIdentifier(),
            allElements: [],
            selectedElements: [],
            isInverted: negativeSelection,
            attribute: attribute?.identifier,
            displayFormRef,
            totalElementsCount: 0,
            textModeFilter: {
                mode: "arbitrary",
                values,
                negativeSelection,
            },
        };
    }

    if (isVisualizationObjectMatchAttributeFilter(filterItem)) {
        const { localIdentifier, displayForm, operator, literal, caseSensitive, negativeSelection } =
            filterItem.matchAttributeFilter;
        const { attribute, displayFormRef } = getAttributeFromDisplayForm(displayForm, data?.itemCache);

        return {
            localIdentifier: localIdentifier ?? generateBucketItemIdentifier(),
            allElements: [],
            selectedElements: [],
            isInverted: negativeSelection,
            attribute: attribute?.identifier,
            displayFormRef,
            totalElementsCount: 0,
            textModeFilter: {
                mode: "match",
                operator,
                literal,
                caseSensitive,
                negativeSelection,
            },
        };
    }
    const positiveFilter = isVisualizationObjectPositiveAttributeFilter(filterItem)
        ? filterItem.positiveAttributeFilter
        : undefined;
    const negativeFilter = isVisualizationObjectNegativeAttributeFilter(filterItem)
        ? filterItem.negativeAttributeFilter
        : undefined;

    const isInverted = !!negativeFilter;

    const localIdentifier =
        positiveFilter?.localIdentifier || negativeFilter?.localIdentifier || generateBucketItemIdentifier();

    const displayFormRef = positiveFilter?.displayForm || negativeFilter?.displayForm;

    const displayFormUri = refUri(displayFormRef);

    const displayFormIdentifier = refIdentifier(displayFormRef);

    const displayFormKey = displayFormUri || displayFormIdentifier;

    const attributeElements = data?.filterItems?.[displayFormKey]?.items ?? [];
    const attributeElementsCount = data?.filterItems?.[displayFormKey]?.total;

    const selectedUris = positiveFilter?.in || negativeFilter?.notIn || [];

    const uriOrId = displayFormUri || `attribute.${displayFormIdentifier}`;
    const attribute = findItemInCache(uriOrId, data?.itemCache, displayFormRef);

    const isPrimaryDisplayForm = checkIsPrimaryDisplayForm(attribute, displayFormKey);

    return {
        ...(localIdentifier ? { localIdentifier } : {}),
        allElements: attributeElements,
        selectedElements: selectedUris.map(
            (uri) =>
                attributeElements.find((element) =>
                    isPrimaryDisplayForm ? element.uri === uri : element.title === uri,
                ) || { uri, title: uri, available: false },
        ),
        isInverted,
        attribute: attribute?.identifier,
        displayFormRef,
        totalElementsCount: attributeElementsCount,
    };
}

function processVisualizationDateFilter(
    filterItem: IVisualizationObjectDateFilter,
    data: IMdTransformContext,
    overTimeComparisonType: OverTimeComparisonType,
): IBucketItemMetricFilter {
    const dimension = findDimensionIdentifier(filterItem, data?.dateDatasets);

    const relativeFilter = isVisualizationObjectRelativeDateFilter(filterItem)
        ? filterItem.relativeDateFilter
        : undefined;
    const absoluteFilter = isVisualizationObjectAbsoluteDateFilter(filterItem)
        ? filterItem.absoluteDateFilter
        : undefined;

    let interval: Record<string, unknown> = { name: ALL_TIME };
    let from: string | number | undefined;
    let to: string | number | undefined;

    if (relativeFilter) {
        from = relativeFilter.from;
        to = relativeFilter.to;
    } else {
        from = absoluteFilter?.from;
        to = absoluteFilter?.to;
    }

    // the real All time filter (stored so when it carries the empty date values mode) is All time too
    const isAllTime = relativeFilter?.granularity === ALL_TIME_GRANULARITY;
    const emptyDateValuesFilter = getDateFilterEmptyValueHandling(filterItem);

    if (from !== undefined && to !== undefined && !isAllTime) {
        const granularity = relativeFilter?.granularity;
        const granularityProps = granularity ? { granularity } : {};
        // the "to date" bound (YTD, QTD, ...) has to survive the load, or the preset reads as the whole period
        const boundedFilter = relativeFilter?.boundedFilter;

        interval = {
            ...granularityProps,
            type: relativeFilter ? "relative" : "absolute",
            interval: [from, to],
            ...(boundedFilter ? { boundedFilter } : {}),
        };
    }

    return {
        attribute: DATE_DATASET_ATTRIBUTE,
        allElements: [],
        selectedElements: [],
        isInverted: true,
        totalElementsCount: 0,
        dimension,
        interval,
        overTimeComparisonType,
        ...(emptyDateValuesFilter ? { emptyDateValuesFilter } : {}),
    };
}

function transformVisualizationFilter(
    filter: IVisualizationObjectFilter,
    data: IMdTransformContext,
    overTimeComparisonType: OverTimeComparisonType,
): IBucketItemMetricFilter {
    if (isVisualizationObjectDateFilter(filter)) {
        return processVisualizationDateFilter(filter, data, overTimeComparisonType);
    }

    return processVisualizationAttributeFilter(filter, data);
}

function transformToDateFilterConfig(visualizationFilter: IVisualizationObjectDateFilter): IDateFilterConfig {
    if (isVisualizationObjectRelativeDateFilter(visualizationFilter)) {
        const { granularity, from, to, boundedFilter } = visualizationFilter.relativeDateFilter;

        if (from === undefined || to === undefined) {
            return undefined;
        }

        const selectedPresetItem = PRESETS.find(
            (presetItem) =>
                presetItem.granularity === granularity &&
                presetItem.interval?.[0] === from &&
                presetItem.interval?.[1] === to,
        );

        return {
            granularity: granularity as Granularity,
            interval: [from, to],
            name: selectedPresetItem?.name,
            ...(boundedFilter ? { boundedFilter } : {}),
        };
    } else if (isVisualizationObjectAbsoluteDateFilter(visualizationFilter)) {
        const { from, to } = visualizationFilter.absoluteDateFilter;

        return {
            granularity: GRANULARITY.DATE,
            interval: [from, to],
            type: "absolute",
        };
    }

    throw new Error("Unsupported visualization date filter type");
}

function transformVisualizationDateFilter(
    visualizationFilter: IVisualizationObjectDateFilter,
    overTimeComparisonType: OverTimeComparisonType,
    ignoreOverTimeComparisonType: boolean,
): IDateFilter {
    let datasetRef = isVisualizationObjectRelativeDateFilter(visualizationFilter)
        ? visualizationFilter.relativeDateFilter.dataSet
        : visualizationFilter.absoluteDateFilter.dataSet;

    /**
     * convertor from SDK returns ref without type
     */

    datasetRef = {
        ...datasetRef,
        type: "dataSet",
    } as IdentifierRef;

    return {
        type: "date",
        localIdentifier: generateBucketItemIdentifier(),
        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
        ...(ignoreOverTimeComparisonType
            ? { overTimeComparisonType: "nothing" }
            : { overTimeComparisonType }),
        filterConfig: transformToDateFilterConfig(visualizationFilter),
        dateDatasetRef: datasetRef,
    };
}

/** The empty date values mode a stored date filter carries as `emptyValueHandling`, if any. */
function getDateFilterEmptyValueHandling(
    visualizationFilter: IVisualizationObjectDateFilter,
): EmptyDateValuesFilterMode | undefined {
    return isVisualizationObjectRelativeDateFilter(visualizationFilter)
        ? visualizationFilter.relativeDateFilter.emptyValueHandling
        : visualizationFilter.absoluteDateFilter.emptyValueHandling;
}

function getAttributeDisplayFormRef(attributeFilter: IVisualizationObjectAttributeFilter): ObjRef {
    if (isVisualizationObjectPositiveAttributeFilter(attributeFilter)) {
        return attributeFilter.positiveAttributeFilter.displayForm;
    } else if (isVisualizationObjectNegativeAttributeFilter(attributeFilter)) {
        return attributeFilter.negativeAttributeFilter.displayForm;
    } else if (isVisualizationObjectArbitraryAttributeFilter(attributeFilter)) {
        return attributeFilter.arbitraryAttributeFilter.displayForm;
    } else if (isVisualizationObjectMatchAttributeFilter(attributeFilter)) {
        return attributeFilter.matchAttributeFilter.displayForm;
    }
    throw new Error("Unsupported attribute filter type");
}

const transformAttributeElement = (
    item: string,
    attributeElementItems: IAttributeElement[],
    isPrimaryDisplayForm: boolean,
) =>
    attributeElementItems.find((element: IAttributeElement) =>
        isPrimaryDisplayForm
            ? item === element.uri
            : item === element.title || item === element.formattedTitle,
    ) || {
        uri: item,
        title: item,
        available: false,
    };

function transformToAttributeFilterConfig(
    attributeFilter: IVisualizationObjectAttributeFilter,
    attributeElements: ILoadedReportItems["filterItems"][string],
    isPrimaryDisplayForm: boolean,
): IAttributeFilterConfig {
    let attributeFilterElements: string[];
    if (isVisualizationObjectPositiveAttributeFilter(attributeFilter)) {
        attributeFilterElements = attributeFilter.positiveAttributeFilter.in;
    } else if (isVisualizationObjectNegativeAttributeFilter(attributeFilter)) {
        attributeFilterElements = attributeFilter.negativeAttributeFilter.notIn;
    } else if (isVisualizationObjectArbitraryAttributeFilter(attributeFilter)) {
        attributeFilterElements = attributeFilter.arbitraryAttributeFilter.values;
    } else if (isVisualizationObjectMatchAttributeFilter(attributeFilter)) {
        attributeFilterElements = [attributeFilter.matchAttributeFilter.literal];
    } else {
        throw new Error("Unsupported attribute filter type");
    }

    const selectedElements = attributeFilterElements.map((item: string) =>
        transformAttributeElement(item, attributeElements.items, isPrimaryDisplayForm),
    );

    return {
        isInverted: !isVisualizationObjectPositiveAttributeFilter(attributeFilter),
        selectedElements,
        totalElementsCount: attributeElements.total,
    };
}

function getTextModeFilterData(
    attributeFilter: IVisualizationObjectAttributeFilter,
): TextModeFilterData | undefined {
    if (isVisualizationObjectArbitraryAttributeFilter(attributeFilter)) {
        const { values, negativeSelection } = attributeFilter.arbitraryAttributeFilter;
        return {
            mode: "arbitrary",
            values,
            ...(negativeSelection === undefined ? {} : { negativeSelection }),
        };
    }
    if (isVisualizationObjectMatchAttributeFilter(attributeFilter)) {
        const { operator, literal, caseSensitive, negativeSelection } = attributeFilter.matchAttributeFilter;
        return {
            mode: "match",
            operator,
            literal,
            ...(caseSensitive === undefined ? {} : { caseSensitive }),
            ...(negativeSelection === undefined ? {} : { negativeSelection }),
        };
    }
    return undefined;
}

function transformVisualizationAttributeFilter(
    attributeFilter: IVisualizationObjectAttributeFilter,
    itemCache: ICatalogEntries | undefined,
    filterItems: ILoadedReportItems["filterItems"] | undefined,
): IAttributeFilter {
    const displayFormRef = getAttributeDisplayFormRef(attributeFilter);
    const displayFormUriOrId = objRefToString(displayFormRef);
    const uriOrId = isUriRef(displayFormRef) ? displayFormUriOrId : `attribute.${displayFormUriOrId}`;
    const cacheItem = findItemInCache(uriOrId, itemCache, displayFormRef);
    const attributeElements = filterItems?.[displayFormUriOrId] ?? {
        items: [],
        total: 0,
    };
    const localIdentifier = isVisualizationObjectPositiveAttributeFilter(attributeFilter)
        ? attributeFilter.positiveAttributeFilter.localIdentifier
        : isVisualizationObjectNegativeAttributeFilter(attributeFilter)
          ? attributeFilter.negativeAttributeFilter.localIdentifier
          : isVisualizationObjectArbitraryAttributeFilter(attributeFilter)
            ? attributeFilter.arbitraryAttributeFilter.localIdentifier
            : attributeFilter.matchAttributeFilter.localIdentifier;

    const isPrimaryDisplayForm = checkIsPrimaryDisplayForm(cacheItem, displayFormUriOrId);
    const textModeFilter = getTextModeFilterData(attributeFilter);

    return {
        type: "attribute",
        localIdentifier: localIdentifier ?? generateBucketItemIdentifier(),
        cacheItemIdentifier: cacheItem?.identifier,
        displayFormRef,
        filterConfig: transformToAttributeFilterConfig(
            attributeFilter,
            attributeElements,
            isPrimaryDisplayForm,
        ),
        ...(textModeFilter ? { textModeFilter } : {}),
    };
}

function transformVisualizationMeasureValueFilter(
    visualizationFilter: IVisualizationObjectMeasureValueFilter,
): IMeasureValueFilter {
    // Bear MD historically supported a single `condition`, but our save path can now write `conditions` array.
    // When reopening/synchronizing, preserve all conditions if present.
    const measureValueFilter = visualizationFilter.measureValueFilter;
    const { measure, dimensionality, applyOnResult } = measureValueFilter;
    const { condition, conditions } = measureValueFilter;

    let normalizedConditions:
        | NonNullable<IVisualizationObjectMeasureValueFilter["measureValueFilter"]["conditions"]>
        | undefined;
    if (Array.isArray(conditions) && conditions.length) {
        normalizedConditions = conditions;
    } else if (isEmpty(condition)) {
        normalizedConditions = undefined;
    } else {
        normalizedConditions = [condition];
    }

    const conditionsProps = normalizedConditions ? { conditions: normalizedConditions } : {};

    const measureProp = isVisualizationObjectLocalIdentifierQualifier(measure)
        ? { measureLocalIdentifier: measure.localIdentifier }
        : { measureRef: measure };

    const dimensionalityProps = dimensionality
        ? { dimensionality: fromSdkModelDimensionality(dimensionality) }
        : {};

    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };

    return {
        type: "measure",
        localIdentifier: generateBucketItemIdentifier(),
        ...measureProp,
        ...conditionsProps,
        ...dimensionalityProps,
        ...applyOnResultProp,
    };
}

function transformVisualizationRankingFilter({
    rankingFilter: { measures, attributes, operator, value, applyOnResult, strictLimitOfRows },
}: IVisualizationObjectRankingFilter): IRankingFilter {
    // Local-identifier qualifiers map back to bucket attribute local ids (strings); any other qualifier
    // (uri/identifier) is a catalog attribute kept as an ObjRef. Uses the same dimensionality converter as
    // the measure value filter, preserving the qualifier shape (incl. the ref type) without an unsafe cast.
    const attributesProps = isEmpty(attributes) ? {} : { attributes: fromSdkModelDimensionality(attributes) };

    // A local identifier qualifier means the ranked measure is in the buckets; any other qualifier
    // (uri/identifier) means it is a catalog measure referenced by ObjRef.
    const measure = measures[0];
    const measureProp = isVisualizationObjectLocalIdentifierQualifier(measure)
        ? { measureLocalIdentifier: measure.localIdentifier }
        : { measureRef: measure };

    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };

    return {
        type: "ranking",
        localIdentifier: generateBucketItemIdentifier(),
        ...measureProp,
        ...attributesProps,
        operator,
        value,
        ...strictLimitOfRowsProp,
        ...applyOnResultProp,
    };
}

/**
 * Determines the empty date values filter mode from an attribute filter.
 * Returns "only" for positive filter with empty string, "exclude" for negative filter with empty string,
 * or undefined if it's not an empty values filter.
 */
function getEmptyDateValuesMode(
    attributeFilter: IVisualizationObjectAttributeFilter,
): "only" | "exclude" | undefined {
    if (
        isVisualizationObjectArbitraryAttributeFilter(attributeFilter) ||
        isVisualizationObjectMatchAttributeFilter(attributeFilter)
    ) {
        return undefined;
    }
    if (!isSingleEmptyStringElement(extractVisualizationObjectAttributeFilterElements(attributeFilter))) {
        return undefined;
    }

    return isVisualizationObjectPositiveAttributeFilter(attributeFilter) ? "only" : "exclude";
}

/**
 * Checks if an attribute filter represents an empty date values filter.
 * Returns the mode ("only" for positive filter with empty, "exclude" for negative filter with empty)
 * or undefined if it's not an empty date values filter.
 * The filter is detected if it targets any date attribute (any granularity) with empty string or null values.
 */
function detectEmptyDateValuesAttributeFilter(
    attributeFilter: IVisualizationObjectAttributeFilter,
    dateDatasets: IDateDatasets | undefined,
): { mode: "only" | "exclude"; dateDatasetRef: ObjRef } | undefined {
    if (!dateDatasets?.available) {
        return undefined;
    }

    const displayFormRef = getAttributeDisplayFormRef(attributeFilter);

    // Check if this display form belongs to any date attribute in any date dataset
    for (const dateDataset of dateDatasets.available) {
        if (!dateDataset.attributes) continue;

        const matchingAttribute = dateDataset.attributes.find(
            (attr) => attr.dfRef && areObjRefsEqual(attr.dfRef, displayFormRef),
        );
        if (!matchingAttribute) continue;

        const mode = getEmptyDateValuesMode(attributeFilter);
        if (mode) {
            return { mode, dateDatasetRef: dateDataset.ref };
        }
    }

    return undefined;
}

function transformVisualizationFilters(
    metadataObject: IVisualizationObjectContent,
    overTimeComparisonType: OverTimeComparisonType,
    additionalData: IMdTransformContext,
) {
    const visualizationFilters = metadataObject.filters || [];
    const dateDatasets = additionalData?.dateDatasets || undefined;

    // First pass: identify empty date values attribute filters
    const emptyDateValuesFilters: Record<string, { mode: "only" | "exclude"; dateDatasetRef: ObjRef }> = {};
    const emptyDateValuesFilterIndices = new globalThis.Set<number>();

    visualizationFilters.forEach((filter, index) => {
        if (isVisualizationObjectAttributeFilter(filter)) {
            const detected = detectEmptyDateValuesAttributeFilter(filter, dateDatasets);
            if (detected) {
                // Key by date dataset ref string for lookup
                const key = objRefToString(detected.dateDatasetRef);
                emptyDateValuesFilters[key] = detected;
                emptyDateValuesFilterIndices.add(index);
            }
        }
    });

    // Second pass: transform filters, setting emptyDateValuesFilter on date filters
    let firstDateFilterTransformed = false;
    const result: IFilter[] = [];

    visualizationFilters.forEach((visualizationFilter: VisualizationObjectExtendedFilter, index: number) => {
        // Skip empty date values attribute filters (they'll be represented on the date filter)
        if (emptyDateValuesFilterIndices.has(index)) {
            return;
        }

        if (isVisualizationObjectAttributeFilter(visualizationFilter)) {
            const itemCache = additionalData?.itemCache;
            const filterItems = additionalData?.filterItems;
            result.push(transformVisualizationAttributeFilter(visualizationFilter, itemCache, filterItems));
        } else if (isVisualizationObjectDateFilter(visualizationFilter)) {
            let df = transformVisualizationDateFilter(
                visualizationFilter,
                overTimeComparisonType,
                firstDateFilterTransformed,
            );

            // Check if there's a matching empty date values filter
            const dateDatasetRef = df.dateDatasetRef;
            const key = objRefToString(dateDatasetRef);
            const emptyValuesInfo = emptyDateValuesFilters[key];
            if (emptyValuesInfo) {
                df = { ...df, emptyDateValuesFilter: emptyValuesInfo.mode };
            }

            firstDateFilterTransformed = true;
            result.push(df);
        } else if (isVisualizationObjectMeasureValueFilter(visualizationFilter)) {
            result.push(transformVisualizationMeasureValueFilter(visualizationFilter));
        } else if (isVisualizationObjectRankingFilter(visualizationFilter)) {
            result.push(transformVisualizationRankingFilter(visualizationFilter));
        } else {
            throw new Error("Unsupported visualization filter type");
        }
    });

    return result;
}

function transformMeasureFilters(filters: IVisualizationObjectFilter[], data: IMdTransformContext) {
    return filters.map((filter) => transformVisualizationFilter(filter, data, null));
}

function isMeasure(
    item: IVisualizationObjectBucketItem | null | undefined,
): item is IVisualizationObjectMeasure {
    return !!(item as Partial<IVisualizationObjectMeasure> | null | undefined)?.measure;
}

function isArithmeticMeasure(measureBucketItem: IVisualizationObjectMeasure) {
    return isVisualizationObjectArithmeticMeasureDefinition(measureBucketItem.measure.definition);
}

function isDerivedMeasure(measureBucketItem: IVisualizationObjectMeasure) {
    return (
        isVisualizationObjectPopMeasureDefinition(measureBucketItem.measure.definition) ||
        isVisualizationObjectPreviousPeriodMeasureDefinition(measureBucketItem.measure.definition)
    );
}

export function isMeasureShowOnSecondaryAxis(
    item: IVisualizationObjectMeasure,
    properties: IStoredVisualizationProperties | undefined,
) {
    // declared-type extractions from the open controls bag
    const measures =
        (properties?.controls?.[Axis.AXIS_NAME.SECONDARY_Y] as { measures?: string[] } | undefined)
            ?.measures ||
        (properties?.controls?.[Axis.AXIS_NAME.SECONDARY_X] as { measures?: string[] } | undefined)?.measures;
    const localIdentifiers = measures || [];

    return localIdentifiers.includes(item.measure?.localIdentifier);
}

export function isATotalMeasure(
    item: IVisualizationObjectMeasure,
    properties: IStoredVisualizationProperties | undefined,
) {
    const measures = (properties?.controls?.["total"] as { measures?: string[] } | undefined)?.measures || [];

    return measures.includes(item.measure?.localIdentifier);
}

export function isThresholdMeasure(
    item: IVisualizationObjectMeasure,
    properties: IStoredVisualizationProperties | undefined,
) {
    const measures = (properties?.controls?.["thresholdMeasures"] as string[] | undefined) || [];
    return measures.includes(item.measure?.localIdentifier);
}

export function isKdaDisabled(item: IVisualizationObjectMeasure) {
    return item.measure?.hiddenFromKda ?? false;
}

/** The simple-definition content when the measure carries one — probed the way the readers below need it. */
function simpleDefinitionOf(
    measure: IVisualizationObjectMeasure | undefined,
): IVisualizationObjectMeasureDefinition["measureDefinition"] | undefined {
    const definition = measure?.measure?.definition;
    return definition && "measureDefinition" in definition ? definition.measureDefinition : undefined;
}

function getMeasureBase(
    bucketItem: IVisualizationObjectMeasure,
    measureDefinition: IVisualizationObjectMeasureDefinition["measureDefinition"] | undefined,
    properties: IStoredVisualizationProperties | undefined,
): IBucketItem {
    const format = bucketItem?.measure?.format || null;
    const aggregation = measureDefinition?.aggregation || null;
    const showInPercent = !!measureDefinition?.computeRatio;

    return {
        ...bucketItemBase,
        type: METRIC,
        alias: bucketItem?.measure?.alias || null,
        localIdentifier: bucketItem?.measure?.localIdentifier,
        aggregation,
        granularity: null,
        filters: [],
        showInPercent,
        showOnSecondaryAxis: isMeasureShowOnSecondaryAxis(bucketItem, properties),
        isTotalMeasure: isATotalMeasure(bucketItem, properties),
        isThresholdMeasure: isThresholdMeasure(bucketItem, properties),
        isKdaDisabled: isKdaDisabled(bucketItem),
        format,
    };
}

/**
 * The cache entry a saved measure was built from - an attribute for a COUNT, a fact for the other
 * aggregations, a metric otherwise. The reference is passed along so a COUNT over a computed
 * attribute resolves only in the computed attribute namespace even when a regular attribute shares
 * the identifier.
 */
function getMeasureItemFromCache(
    measureDefinition: IVisualizationObjectMeasureDefinition["measureDefinition"] | undefined,
    additionalData: IMdTransformContext,
): ICatalogEntry | undefined {
    const measureRef = measureDefinition?.item;
    const measureUri = refUri(measureRef);
    const measureId = refIdentifier(measureRef);
    const itemCache = additionalData?.itemCache;
    const aggregation = measureDefinition?.aggregation;
    const isAttribute = aggregation === "count" || aggregation === "approximate_count";
    const type = aggregation ? (isAttribute ? "attribute" : "fact") : "metric";
    const uriOrId = measureUri || `${type}.${measureId}`;
    if (isComputedAttributeRef(measureRef)) {
        // An unavailable computed attribute must not resolve to a regular attribute with the same ID.
        return findItemInCacheByType(uriOrId, itemCache, true);
    }
    return findItemInCache(uriOrId, itemCache, measureRef);
}

/**
 * The computed attribute flag a rebuilt measure item has to carry: reopening a saved insight
 * restores it from the cache entry's own type, exactly as `transformAttribute` does, so the item
 * cache lookups keep pointing at the computed attribute namespace.
 */
function computedAttributeFlagOf(cacheItem: ICatalogEntry | undefined) {
    return cacheItem?.type === COMPUTED_ATTRIBUTE ? { isComputedAttribute: true } : {};
}

function transformArithmeticMeasure(
    bucketItem: IVisualizationObjectMeasure,
    additionalData: IMdTransformContext,
): IBucketItem {
    const measureDefinition = bucketItem?.measure?.definition;
    const arithmeticMeasure = isVisualizationObjectArithmeticMeasureDefinition(measureDefinition)
        ? measureDefinition.arithmeticMeasure
        : undefined;
    const operandLocalIdentifiers = arithmeticMeasure?.measureIdentifiers;
    const operator = arithmeticMeasure?.operator;
    const properties = additionalData?.properties;

    let format = bucketItem?.measure?.format || null;
    if (!format) {
        format = getDefaultArithmeticMeasureFormat(operator);
    }

    return {
        // an arithmetic definition carries none of the simple-definition fields the base probes for
        ...getMeasureBase(bucketItem, undefined, properties),
        attribute: null,
        operandLocalIdentifiers,
        operator,
        format,
    };
}

function transformDerivedMeasure(
    bucketItem: IVisualizationObjectMeasure,
    additionalData: IMdTransformContext,
): IBucketItem {
    // callers guarantee a derived (pop / previous-period) definition, so the identifier probe below
    // is exactly the by-first-key read the untyped code did
    const masterLocalIdentifier = getDerivedMeasureIdentifier(bucketItem);
    const masterMeasures = additionalData?.masterMeasures ?? [];
    const masterMeasure = masterMeasures.find(
        (measure) => measure?.measure?.localIdentifier === masterLocalIdentifier,
    );
    const masterMeasureDefinition = simpleDefinitionOf(masterMeasure);
    const overTimeComparisonType = getOverTimeComparisonType(bucketItem);
    const masterCacheItem = isArithmeticMeasure(masterMeasure)
        ? undefined
        : getMeasureItemFromCache(masterMeasureDefinition, additionalData);
    const properties = additionalData?.properties;

    return {
        ...getMeasureBase(bucketItem, masterMeasureDefinition, properties),
        attribute: masterCacheItem?.identifier ?? null,
        ...computedAttributeFlagOf(masterCacheItem),
        masterLocalIdentifier,
        overTimeComparisonType,
    };
}

function transformSimpleMeasure(
    bucketItem: IVisualizationObjectMeasure,
    additionalData: IMdTransformContext,
): IBucketItem {
    const simpleMeasureDefinition = simpleDefinitionOf(bucketItem);
    const cacheItem = getMeasureItemFromCache(simpleMeasureDefinition, additionalData);
    const properties = additionalData?.properties;
    const savedRef = simpleMeasureDefinition?.item;
    const aggregation = simpleMeasureDefinition?.aggregation;
    const isAttribute = aggregation === "count" || aggregation === "approximate_count";
    const ref: ObjRef | undefined = isIdentifierRef(savedRef)
        ? {
              ...savedRef,
              type: savedRef.type ?? (aggregation ? (isAttribute ? "attribute" : "fact") : "measure"),
          }
        : savedRef;
    // the bear vis-obj measure is structurally close enough for the format fill; the sdk-model
    // measure type it declares differs in the filter shapes we never touch here
    const item = fillMissingFormat(bucketItem as unknown as IMeasure);

    return {
        ...getMeasureBase(bucketItem, simpleMeasureDefinition, properties),
        attribute: cacheItem?.identifier,
        // Invalid or restricted items can be absent from the catalog. Restore the reference type
        // stripped by the AD representation so execution and saving still use the original object.
        ...(cacheItem ? {} : { ref }),
        ...computedAttributeFlagOf(cacheItem),
        filters: transformMeasureFilters(simpleMeasureDefinition?.filters ?? [], additionalData),
        format: measureFormat(item as IMeasure) || null,
    };
}

function transformMeasure(bucketItem: IVisualizationObjectMeasure, additionalData: IMdTransformContext) {
    if (isArithmeticMeasure(bucketItem)) {
        return transformArithmeticMeasure(bucketItem, additionalData);
    } else if (isDerivedMeasure(bucketItem)) {
        return transformDerivedMeasure(bucketItem, additionalData);
    }

    return transformSimpleMeasure(bucketItem, additionalData);
}

function transformAttribute(bucketItem: IVisualizationObjectAttribute, data: IMdTransformContext) {
    const visualizationAttribute = bucketItem?.visualizationAttribute;
    const displayFormRef: ObjRef = visualizationAttribute?.displayForm;

    const inDateDatasets = findItemInDateDatasets(displayFormRef, data?.dateDatasets);
    if (inDateDatasets) {
        return {
            ...bucketItemBase,
            ...visualizationAttribute,
            ...inDateDatasets,
            type: DATE,
            attribute: DATE_DATASET_ATTRIBUTE,
            granularity: inDateDatasets.dateType,
        };
    }

    let isDate = false;
    const cacheKey = objRefToString(displayFormRef);
    const uriOrId = isUriRef(displayFormRef) ? cacheKey : `attribute.${cacheKey}`;
    const inCache = findItemInCache(uriOrId, data?.itemCache, displayFormRef);
    if (inCache) {
        isDate = inCache.dateType !== undefined;
        return {
            ...bucketItemBase,
            ...visualizationAttribute,
            ...setSelectedDisplayFormFromVisualizationObject(inCache, displayFormRef),
            type: isDate ? DATE : ATTRIBUTE,
            attribute: isDate ? DATE_DATASET_ATTRIBUTE : inCache.identifier,
            // reopening a saved insight rebuilds the bucket item from the cache entry, so the
            // computed attribute flag has to be restored from the entry's own type
            ...computedAttributeFlagOf(inCache),
        };
    }

    invariant(inCache || inDateDatasets, `Attribute with DF '${cacheKey}' was not found in the cache`);
    return null;
}

const isExistingSupportedDisplayForm = (displayForm: ICacheItemDisplayForm) =>
    displayForm && isSupportedDisplayFormType(displayForm);

function setSelectedDisplayFormFromVisualizationObject(
    cachedAttribute: ICatalogEntry,
    displayFormRef: ObjRef,
) {
    // the itemCache entry is immer-frozen slice state, so the overrides build a fresh object and
    // never write the cache entry in place
    const vizObjAttrDisplayForm = (cachedAttribute.displayForms ?? []).find((displayForm) =>
        areObjRefsEqual(displayForm.ref, displayFormRef),
    );
    if (!isExistingSupportedDisplayForm(vizObjAttrDisplayForm)) {
        return {
            ...cachedAttribute,
            // override "displayForm" of visualizationAttribute merged into the resulting bucket item
            displayForm: cachedAttribute.dfRef,
        };
    }
    return {
        ...cachedAttribute,
        dfRef: vizObjAttrDisplayForm.ref,
        dfUri: vizObjAttrDisplayForm.uri,
        dfIdentifier: vizObjAttrDisplayForm.id,
        displayForm: vizObjAttrDisplayForm.ref,
    };
}

export interface IVisualizationObjectContentForAvailability {
    buckets: IVisualizationObjectBucket[];
    filters?: VisualizationObjectExtendedFilter[];
}

const getBucketItems = (metadataObject: IVisualizationObjectContent) =>
    metadataObject.buckets.flatMap((bucket) => bucket.items);

export function omitIrrelevantPropertiesForAvailability(
    mdObject: IVisualizationObjectContent,
): IVisualizationObjectContentForAvailability {
    // pickRelevantFromReportMDObj narrows the object part-way through, so the steps are spelled out
    // rather than folded over one accumulator type
    const withoutTotals = omitTotalsFromReportMDObj(cloneDeep(mdObject));
    const withoutAlias = omitAliasFromReportMDObj(withoutTotals);
    const withoutArithmeticMeasures = omitArithmeticMeasuresMDObj(withoutAlias);

    return omitMeasureFormatFromReportMDObj(pickRelevantFromReportMDObj(withoutArithmeticMeasures));
}

export function pickRelevantFromReportMDObj(
    metadataObject: IVisualizationObjectContent,
): IVisualizationObjectContentForAvailability {
    return pick(metadataObject, ["buckets", "filters"]);
}

const omitMeasureFormat = (bucketItem: IVisualizationObjectMeasure): IVisualizationObjectMeasure =>
    omit(bucketItem, ["measure.format"]) as IVisualizationObjectMeasure;

function omitMeasureFormatFromReportMDObj(
    metadataObject: IVisualizationObjectContentForAvailability,
): IVisualizationObjectContentForAvailability {
    return {
        ...metadataObject,
        buckets: metadataObject.buckets.map((bucket) => ({
            ...bucket,
            items: bucket.items.map((item) =>
                isVisualizationObjectMeasure(item) ? omitMeasureFormat(item) : item,
            ),
        })),
    };
}

function removeTotalsFromBucket(bucket: IVisualizationObjectBucket): IVisualizationObjectBucket {
    return omit(bucket, ["totals"]) as IVisualizationObjectBucket;
}

export function omitTotalsFromReportMDObj(
    metadataObject: IVisualizationObjectContent,
): IVisualizationObjectContent {
    return {
        ...metadataObject,
        buckets: metadataObject.buckets.map(removeTotalsFromBucket),
    };
}

function removeAliasFromMeasure(bucketItem: IVisualizationObjectMeasure): IVisualizationObjectMeasure {
    if (bucketItem.measure.alias) {
        const newItem: IVisualizationObjectMeasure = {
            ...bucketItem,
        };
        delete newItem.measure.alias;
        return newItem;
    }
    return bucketItem;
}

function removeAliasFromAttribute(bucketItem: IVisualizationObjectAttribute): IVisualizationObjectAttribute {
    if (bucketItem.visualizationAttribute.alias) {
        const newItem: IVisualizationObjectAttribute = {
            ...bucketItem,
        };
        delete newItem.visualizationAttribute.alias;
        return newItem;
    }
    return bucketItem;
}

export function omitAliasFromReportMDObj(
    metadataObject: IVisualizationObjectContent,
): IVisualizationObjectContent {
    return {
        ...metadataObject,
        buckets: metadataObject.buckets.map((bucket) => ({
            ...bucket,
            items: bucket.items.map((item) => {
                if (isVisualizationObjectMeasure(item)) {
                    return removeAliasFromMeasure(item);
                }

                if (isVisualizationObjectAttribute(item)) {
                    return removeAliasFromAttribute(item);
                }

                return item;
            }),
        })),
    };
}

function getDerivedMeasureIdentifier(measureBucketItem: IVisualizationObjectMeasure): string | null {
    const measureDefinition = measureBucketItem.measure.definition;

    if (isVisualizationObjectPopMeasureDefinition(measureDefinition)) {
        return measureDefinition.popMeasureDefinition.measureIdentifier;
    } else if (isVisualizationObjectPreviousPeriodMeasureDefinition(measureDefinition)) {
        return measureDefinition.previousPeriodMeasure.measureIdentifier;
    }

    return null;
}

function isDerivedFromArithmeticMeasure(
    measureBucketItem: IVisualizationObjectMeasure,
    bucketItems: IVisualizationObjectBucketItem[],
): boolean {
    if (!isDerivedMeasure(measureBucketItem)) {
        return false;
    }

    const masterMeasureLocalIdentifier = getDerivedMeasureIdentifier(measureBucketItem);

    const masterMeasure: IVisualizationObjectMeasure = bucketItems
        .filter(isVisualizationObjectMeasure)
        .find((bucketItem) => bucketItem.measure.localIdentifier === masterMeasureLocalIdentifier);

    return isArithmeticMeasure(masterMeasure);
}

export function omitArithmeticMeasuresMDObj(
    metadataObject: IVisualizationObjectContent,
): IVisualizationObjectContent {
    return {
        ...metadataObject,
        buckets: metadataObject.buckets.map((bucket) => ({
            ...bucket,
            items: bucket.items.filter((item) => {
                if (isVisualizationObjectMeasure(item)) {
                    return (
                        !isArithmeticMeasure(item) &&
                        !isDerivedFromArithmeticMeasure(item, getBucketItems(metadataObject))
                    );
                }
                return true;
            }),
        })),
    };
}

function transformMDBucketItem(item: IVisualizationObjectBucketItem, additionalData: IMdTransformContext) {
    if (isMeasure(item)) {
        return transformMeasure(item, additionalData);
    }

    return transformAttribute(item, additionalData);
}

function transformBucket(bucket: IVisualizationObjectBucket, additionalData: IMdTransformContext) {
    return {
        ...bucket,
        items: (bucket.items ?? [])
            .map((item) => transformMDBucketItem(item, additionalData))
            .filter((item) => item),
    };
}

function transformBucketsToObjects(
    metadataObject: IVisualizationObjectContent | null | undefined,
    additionalData: IMdTransformContext,
) {
    const buckets = metadataObject?.buckets ?? [];

    return buckets.map((bucket) => {
        return transformBucket(bucket, additionalData);
    });
}

function getSeparatedMasterAndDerivedMeasures(
    metadataObject: IVisualizationObjectContent | null | undefined,
) {
    const masterMeasures: IVisualizationObjectMeasure[] = [];
    const derivedMeasures: IVisualizationObjectMeasure[] = [];

    (metadataObject?.buckets ?? []).forEach((bucket) => {
        (bucket.items ?? []).forEach((item) => {
            if (isMeasure(item)) {
                if (isDerivedMeasure(item)) {
                    derivedMeasures.push(item);
                } else {
                    masterMeasures.push(item);
                }
            }
        });
    });

    return { masterMeasures, derivedMeasures };
}

function transformBucketsAndFilters({
    metadataObject,
    additionalData,
}: {
    metadataObject: IVisualizationObjectContent;
    additionalData: IAdditionalData;
}) {
    const { masterMeasures, derivedMeasures } = getSeparatedMasterAndDerivedMeasures(metadataObject);
    const overTimeComparisonType = derivedMeasures.length
        ? getOverTimeComparisonType(derivedMeasures[0])
        : undefined;

    return {
        buckets: transformBucketsToObjects(metadataObject, { ...additionalData, masterMeasures }),
        filters: transformVisualizationFilters(metadataObject, overTimeComparisonType, additionalData),
        additionalData,
    };
}

export function getOverTimeComparisonType(
    derivedMeasure: IVisualizationObjectMeasure | undefined,
): OverTimeComparisonType {
    const measureDefinition = derivedMeasure?.measure?.definition;

    if (isVisualizationObjectPopMeasureDefinition(measureDefinition)) {
        return OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR;
    }
    if (isVisualizationObjectPreviousPeriodMeasureDefinition(measureDefinition)) {
        return OverTimeComparisonTypes.PREVIOUS_PERIOD;
    }
    return OverTimeComparisonTypes.NOTHING;
}

/** The MD → state transform's output: state-shaped buckets plus the filter-bar filters. */
export interface IMetadataToBucketsResult {
    buckets: IRawBuckets;
    filters: IFilter[];
    additionalData: IAdditionalData;
}

export const metadataToBuckets = (params: {
    metadataObject: IVisualizationObjectContent;
    additionalData: IAdditionalData;
}): IMetadataToBucketsResult => transformBucketsAndFilters(params);
