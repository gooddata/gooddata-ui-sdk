// (C) 2019-2022 GoodData Corporation
/**
 * This package provides low-level functions for communication with GoodData.CN.
 *
 * @remarks
 * The package is used by `@gooddata/sdk-backend-tiger`, which you should use instead of directly using
 * `@gooddata/api-client-tiger` whenever possible.
 * For the similar package for the GoodData platform, see `@gooddata/api-client-bear`.
 *
 * @packageDocumentation
 */
import { tigerClientFactory, ITigerClient } from "./client";
import {
    axios as defaultAxios,
    newAxios,
    setAxiosAuthorizationToken,
    setGlobalAuthorizationToken,
} from "./axios";

export { VisualizationObjectModelV1 } from "./gd-tiger-model/VisualizationObjectModelV1";
export { VisualizationObjectModelV2 } from "./gd-tiger-model/VisualizationObjectModelV2";
export { AnalyticalDashboardModelV1 } from "./gd-tiger-model/AnalyticalDashboardModelV1";
export { AnalyticalDashboardModelV2 } from "./gd-tiger-model/AnalyticalDashboardModelV2";

export {
    isAttributeHeader,
    isAfmObjectIdentifier,
    isResultAttributeHeader,
    isVisualizationObjectsItem,
    isFilterContextData,
    isDashboardPluginsItem,
    ResultDimensionHeader,
} from "./gd-tiger-model/typeGuards";

export { newAxios, setAxiosAuthorizationToken, setGlobalAuthorizationToken };

export {
    AFM,
    AbsoluteDateFilter,
    AbsoluteDateFilterBody,
    AbsoluteDateFilterBodyAllOf,
    AbstractMeasureValueFilter,
    AbstractMeasureValueFilterAllOf,
    AfmExecution,
    AfmExecutionResponse,
    AfmObjectIdentifier,
    AfmValidObjectsQuery,
    AfmValidObjectsQueryTypesEnum,
    AfmValidObjectsResponse,
    ArithmeticMeasureDefinition,
    ArithmeticMeasureDefinitionArithmeticMeasure,
    ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum,
    AttributeExecutionResultHeader,
    AttributeFilter,
    AttributeFilterElements,
    AttributeHeader,
    AttributeHeaderAttributeHeader,
    AttributeHeaderAttributeHeaderGranularityEnum,
    AttributeItem,
    AttributeResultHeader,
    CommonAttributeFilter,
    CommonAttributeFilterAllOf,
    CommonDateFilter,
    CommonDateFilterAllOf,
    CommonFilter,
    CommonMeasureValueFilter,
    CommonMeasureValueFilterAllOf,
    ComparisonMeasureValueFilter,
    ComparisonMeasureValueFilterBody,
    ComparisonMeasureValueFilterBodyOperatorEnum,
    ComparisonMeasureValueFilterBodyAllOf,
    ComparisonMeasureValueFilterBodyAllOfOperatorEnum,
    DateFilter,
    Dimension,
    DimensionHeader,
    Element,
    ElementsRequest,
    ElementsRequestFilterBy,
    ElementsRequestFilterByLabelTypeEnum,
    ElementsRequestSortOrderEnum,
    ElementsResponse,
    ErrorMessage,
    ExecutionLinks,
    ExecutionResponse,
    ExecutionResult,
    ExecutionResultGrandTotal,
    ExecutionResultHeader,
    ExecutionResultPaging,
    ExecutionSettings,
    FilterDefinition,
    FilterDefinitionForSimpleMeasure,
    GrandTotal,
    HeaderGroup,
    Identifier,
    IncludedDimensionProps,
    InlineFilterDefinition,
    InlineFilterDefinitionBody,
    InlineFilterDefinitionBodyAllOf,
    InlineMeasureDefinition,
    InlineMeasureDefinitionInline,
    LocalIdentifier,
    MeasureDefinition,
    MeasureExecutionResultHeader,
    MeasureGroupHeader,
    MeasureHeaderOut,
    MeasureItem,
    MeasureResultHeader,
    MeasureValueFilter,
    NegativeAttributeFilter,
    NegativeAttributeFilterBody,
    NegativeAttributeFilterBodyAllOf,
    ObjectIdentifier,
    Paging,
    PopDataset,
    PopDatasetMeasureDefinition,
    PopDatasetMeasureDefinitionPreviousPeriodMeasure,
    PopDate,
    PopDateMeasureDefinition,
    PopDateMeasureDefinitionOverPeriodMeasure,
    PositiveAttributeFilter,
    PositiveAttributeFilterBody,
    PositiveAttributeFilterBodyAllOf,
    RangeMeasureValueFilter,
    RangeMeasureValueFilterBody,
    RangeMeasureValueFilterBodyOperatorEnum,
    RangeMeasureValueFilterBodyAllOf,
    RangeMeasureValueFilterBodyAllOfOperatorEnum,
    RankingFilter,
    RankingFilterBody,
    RankingFilterBodyOperatorEnum,
    RankingFilterBodyAllOf,
    RankingFilterBodyAllOfOperatorEnum,
    RelativeDateFilter,
    RelativeDateFilterBody,
    RelativeDateFilterBodyGranularityEnum,
    RelativeDateFilterBodyAllOf,
    RelativeDateFilterBodyAllOfGranularityEnum,
    ResultDimension,
    ResultSpec,
    SimpleMeasureDefinition,
    SimpleMeasureDefinitionMeasure,
    SimpleMeasureDefinitionMeasureAggregationEnum,
    SortDirection,
    SortKeyAttribute,
    SortKeyAttributeAttribute,
    SortKeyValue,
    SortKeyValueValue,
    TotalFunction,
    ActionsApiAxiosParamCreator as AfmActionsApiAxiosParamCreator,
    ActionsApiFp as AfmActionsApiFp,
    ActionsApiFactory as AfmActionsApiFactory,
    ActionsApiInterface as AfmActionsApiInterface,
    ActionsApi as AfmActionsApi,
} from "./generated/afm-rest-api/api";
export * from "./generated/metadata-json-api/api";
export * from "./client";

export { jsonApiHeaders, JSON_API_HEADER_VALUE, ValidateRelationsHeader } from "./constants";

export {
    MetadataUtilities,
    MetadataGetEntitiesResult,
    MetadataGetEntitiesFn,
    MetadataGetEntitiesOptions,
    MetadataGetEntitiesParams,
    MetadataGetEntitiesWorkspaceParams,
    MetadataGetEntitiesUserParams,
} from "./metadataUtilities";

export {
    OrganizationUtilities,
    OrganizationGetEntitiesResult,
    OrganizationGetEntitiesFn,
    OrganizationGetEntitiesOptions,
} from "./organizationUtilities";

const defaultTigerClient: ITigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;
