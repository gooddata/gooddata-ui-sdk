// (C) 2019-2022 GoodData Corporation
/**
 * This package provides domain models for GoodData.UI.
 *
 * @remarks
 * These domain models are backend-agnostic. This makes them reusable across different Analytical Backend implementations.
 * The package includes TypeScript type definitions, factory functions, functions to get or set certain
 * properties of the objects in an immutable way, and more.
 * These are used in both the `@gooddata/sdk-backend-*` and `@gooddata/sdk-ui*` packages.
 *
 * @packageDocumentation
 */
export { DateAttributeGranularity, DateGranularity, AllTimeGranularity } from "./base/dateGranularities";
export { IAuditable, IAuditableDates, IAuditableUsers } from "./base/metadata";
export { ComparatorDirection, IComparator } from "./base/comparators";

export {
    IAttribute,
    IAttributeBody,
    isAttribute,
    attributeLocalId,
    AttributePredicate,
    anyAttribute,
    idMatchAttribute,
    attributesFind,
    attributeUri,
    attributeIdentifier,
    attributeAlias,
    attributeDisplayFormRef,
} from "./execution/attribute";

export {
    newAttribute,
    modifyAttribute,
    AttributeBuilder,
    AttributeModifications,
    AttributeBuilderInput,
} from "./execution/attribute/factory";

export {
    ObjectType,
    Identifier,
    Uri,
    UriRef,
    IdentifierRef,
    LocalIdRef,
    ObjRef,
    ObjRefInScope,
    isUriRef,
    isIdentifierRef,
    objRefToString,
    isLocalIdRef,
    areObjRefsEqual,
    isObjRef,
    serializeObjRef,
    deserializeObjRef,
} from "./objRef";

export {
    IDimension,
    isDimension,
    dimensionTotals,
    DimensionItem,
    newTwoDimensional,
    newDimension,
    MeasureGroupIdentifier,
    dimensionSetTotals,
    dimensionsFindItem,
    ItemInDimension,
} from "./execution/base/dimension";

export { idRef, uriRef, localIdRef } from "./objRef/factory";

export { TotalType, ITotal, isTotal, newTotal, totalIsNative } from "./execution/base/totals";

export {
    SortDirection,
    ISortDirection,
    IAttributeSortItem,
    IAttributeSortTarget,
    IAttributeSortType,
    ISortItem,
    IMeasureSortItem,
    IMeasureSortTarget,
    ILocatorItem,
    IAttributeLocatorItem,
    IAttributeLocatorItemBody,
    IMeasureLocatorItem,
    IMeasureLocatorItemBody,
    isMeasureLocator,
    isAttributeLocator,
    isMeasureSort,
    isAttributeSort,
    isAttributeAreaSort,
    isAttributeValueSort,
    newMeasureSort,
    newMeasureSortFromLocators,
    newAttributeSort,
    newAttributeAreaSort,
    newAttributeLocator,
    SortEntityIds,
    sortEntityIds,
    sortDirection,
    sortMeasureLocators,
    attributeLocatorElement,
    attributeLocatorIdentifier,
    measureLocatorIdentifier,
} from "./execution/base/sort";

export {
    IAttributeElementsByRef,
    IAttributeElementsByValue,
    IAttributeElements,
    IPositiveAttributeFilter,
    IPositiveAttributeFilterBody,
    INegativeAttributeFilter,
    INegativeAttributeFilterBody,
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IMeasureValueFilter,
    IMeasureValueFilterBody,
    IRankingFilter,
    IRankingFilterBody,
    RankingFilterOperator,
    isRankingFilter,
    IFilter,
    INullableFilter,
    IMeasureFilter,
    IDateFilter,
    IAttributeFilter,
    isAbsoluteDateFilter,
    isRelativeDateFilter,
    isAllTimeDateFilter,
    attributeElementsIsEmpty,
    attributeElementsCount,
    isPositiveAttributeFilter,
    isNegativeAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    ComparisonConditionOperator,
    IComparisonCondition,
    IComparisonConditionBody,
    IRangeCondition,
    IRangeConditionBody,
    MeasureValueFilterCondition,
    RangeConditionOperator,
    isAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isComparisonCondition,
    isComparisonConditionOperator,
    isFilter,
    isRangeCondition,
    isRangeConditionOperator,
    filterIsEmpty,
    filterAttributeElements,
    filterMeasureRef,
    filterObjRef,
    IAbsoluteDateFilterValues,
    IRelativeDateFilterValues,
    absoluteDateFilterValues,
    relativeDateFilterValues,
    measureValueFilterCondition,
    measureValueFilterMeasure,
    measureValueFilterOperator,
} from "./execution/filter";

export {
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    newAllTimeFilter,
    newMeasureValueFilter,
    newRankingFilter,
} from "./execution/filter/factory";

export { mergeFilters } from "./execution/filter/filterMerge";

export {
    IMeasureTitle,
    IMeasureTitleBody,
    IMeasureDefinitionType,
    IMeasureDefinition,
    IMeasureDefinitionBody,
    ArithmeticMeasureOperator,
    IArithmeticMeasureDefinition,
    IPoPMeasureDefinition,
    IPoPMeasureDefinitionBody,
    IMeasure,
    IMeasureBody,
    MeasureAggregation,
    IPreviousPeriodMeasureDefinition,
    IPreviousPeriodMeasureDefinitionBody,
    IPreviousPeriodDateDataSet,
    isMeasure,
    isSimpleMeasure,
    isAdhocMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isArithmeticMeasure,
    isMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    isArithmeticMeasureDefinition,
    measureLocalId,
    MeasurePredicate,
    anyMeasure,
    idMatchMeasure,
    measureDoesComputeRatio,
    measureItem,
    measureUri,
    measureIdentifier,
    measureMasterIdentifier,
    measureArithmeticOperands,
    measureAlias,
    measureTitle,
    measureArithmeticOperator,
    measureFormat,
    isMeasureFormatInPercent,
    measureAggregation,
    measureFilters,
    measurePopAttribute,
    measurePreviousPeriodDateDataSets,
    MeasureOrLocalId,
} from "./execution/measure";

export {
    IPreviousPeriodDateDataSetSimple,
    ArithmeticMeasureBuilder,
    MeasureBuilder,
    MeasureModifications,
    PoPMeasureBuilder,
    PreviousPeriodMeasureBuilder,
    MeasureBuilderBase,
    newMeasure,
    modifyMeasure,
    modifySimpleMeasure,
    modifyPopMeasure,
    modifyPreviousPeriodMeasure,
    newArithmeticMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    MeasureEnvelope,
    ArithmeticMeasureBuilderInput,
    PoPMeasureBuilderInput,
    PreviousPeriodMeasureBuilderInput,
} from "./execution/measure/factory";

export {
    IAttributeOrMeasure,
    IBucket,
    isBucket,
    idMatchBucket,
    anyBucket,
    MeasureInBucket,
    AttributeInBucket,
    newBucket,
    bucketIsEmpty,
    bucketAttributes,
    bucketAttribute,
    bucketAttributeIndex,
    bucketMeasure,
    bucketMeasureIndex,
    bucketMeasures,
    bucketTotals,
    bucketSetTotals,
    bucketItems,
    BucketPredicate,
    applyRatioRule,
    ComputeRatioRule,
    disableComputeRatio,
    BucketItemModifications,
    BucketItemReducer,
    bucketModifyItems,
    bucketItemReduce,
} from "./execution/buckets";

export {
    bucketsFind,
    bucketsMeasures,
    bucketsIsEmpty,
    bucketsAttributes,
    bucketsFindMeasure,
    bucketsById,
    bucketsFindAttribute,
    bucketsItems,
    bucketsTotals,
    bucketsModifyItem,
    bucketsReduceItem,
} from "./execution/buckets/bucketArray";

export { bucketItemLocalId } from "./execution/buckets/bucketItem";

export {
    IExecutionDefinition,
    IExecutionConfig,
    DimensionGenerator,
    defWithFilters,
    defFingerprint,
    defSetDimensions,
    defSetSorts,
    defTotals,
    defSetExecConfig,
    IPostProcessing,
    defSetPostProcessing,
} from "./execution/executionDefinition";

export {
    newDefForItems,
    newDefForBuckets,
    newDefForInsight,
    defWithDimensions,
    defWithSorting,
    defWithPostProcessing,
    defWithDateFormat,
    defWithExecConfig,
    defaultDimensionsGenerator,
    emptyDef,
} from "./execution/executionDefinition/factory";

export {
    GuidType,
    RgbType,
    IRgbColorValue,
    IColor,
    IColorPalette,
    IColorPaletteItem,
    IColorFromPalette,
    IRgbColor,
    isColorFromPalette,
    isRgbColor,
    colorPaletteItemToRgb,
    colorPaletteToColors,
} from "./colors";

export {
    IInsight,
    IInsightDefinition,
    IVisualizationClass,
    IVisualizationClassBody,
    VisualizationProperties,
    IColorMappingItem,
    isInsight,
    isColorMappingItem,
    insightRef,
    insightId,
    insightItems,
    insightMeasures,
    insightHasMeasures,
    insightAttributes,
    insightHasAttributes,
    insightHasDataDefined,
    insightProperties,
    insightBuckets,
    insightSorts,
    insightBucket,
    insightTags,
    insightSummary,
    insightTitle,
    insightUri,
    insightIsLocked,
    insightCreated,
    insightCreatedBy,
    insightUpdated,
    insightUpdatedBy,
    insightTotals,
    insightFilters,
    insightVisualizationUrl,
    insightSetFilters,
    insightSetBuckets,
    insightSetProperties,
    insightSetSorts,
    insightModifyItems,
    insightReduceItems,
    InsightDisplayFormUsage,
    insightDisplayFormUsage,
    visClassUrl,
    visClassId,
    visClassUri,
} from "./insight";

export { IUser, userFullName } from "./user";

export {
    insightCreatedComparator,
    insightCreatedByComparator,
    insightTitleComparator,
    insightUpdatedComparator,
    insightUpdatedByComparator,
} from "./insight/comparators";

export { newInsightDefinition, InsightDefinitionBuilder, InsightModifications } from "./insight/factory";

export { insightSanitize } from "./insight/sanitization";

export { factoryNotationFor } from "./execution/objectFactoryNotation";
