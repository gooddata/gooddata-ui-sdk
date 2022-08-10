// (C) 2019-2022 GoodData Corporation
/**
 * This package provides low-level functions for communication with GoodData Cloud and GoodData.CN.
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
    isResultMeasureHeader,
    isResultTotalHeader,
    isVisualizationObjectsItem,
    isFilterContextData,
    isDashboardPluginsItem,
} from "./gd-tiger-model/typeGuards";

export { newAxios, setAxiosAuthorizationToken, setGlobalAuthorizationToken };

export {
    AFM,
    AfmIdentifier,
    AfmLocalIdentifier,
    AfmObjectIdentifierAttributeIdentifier,
    AfmObjectIdentifierAttributeIdentifierTypeEnum,
    AfmObjectIdentifierCore,
    AfmObjectIdentifierCoreIdentifier,
    AfmObjectIdentifierCoreIdentifierTypeEnum,
    AfmObjectIdentifierDataset,
    AfmObjectIdentifierDatasetIdentifier,
    AfmObjectIdentifierDatasetIdentifierTypeEnum,
    AfmObjectIdentifierIdentifier,
    AfmObjectIdentifierIdentifierTypeEnum,
    AfmObjectIdentifierLabel,
    AfmObjectIdentifierAttribute,
    AfmObjectIdentifierLabelIdentifier,
    AfmObjectIdentifierLabelIdentifierTypeEnum,
    AbsoluteDateFilter,
    AbsoluteDateFilterAbsoluteDateFilter,
    AbstractMeasureValueFilter,
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
    AttributeHeaderOut,
    AttributeHeaderOutAttributeHeader,
    AttributeHeaderOutAttributeHeaderGranularityEnum,
    AttributeItem,
    AttributeResultHeader,
    ComparisonMeasureValueFilter,
    ComparisonMeasureValueFilterComparisonMeasureValueFilter,
    ComparisonMeasureValueFilterComparisonMeasureValueFilterOperatorEnum,
    DataColumnLocator,
    DataColumnLocators,
    DateFilter,
    Dimension,
    DimensionHeader,
    Element,
    ElementsRequest,
    FilterBy,
    FilterByLabelTypeEnum,
    ElementsRequestSortOrderEnum,
    ElementsResponse,
    Problem,
    ExecutionLinks,
    ExecutionResponse,
    ExecutionResult,
    ExecutionResultGrandTotal,
    ExecutionResultHeader,
    ExecutionResultPaging,
    ExecutionSettings,
    FilterDefinition,
    FilterDefinitionForSimpleMeasure,
    HeaderGroup,
    InlineFilterDefinition,
    InlineFilterDefinitionInline,
    InlineMeasureDefinition,
    InlineMeasureDefinitionInline,
    MeasureDefinition,
    MeasureExecutionResultHeader,
    MeasureGroupHeaders,
    MeasureHeaderOut,
    MeasureItem,
    MeasureResultHeader,
    MeasureValueFilter,
    NegativeAttributeFilter,
    NegativeAttributeFilterNegativeAttributeFilter,
    Paging,
    PopDataset,
    PopMeasureDefinition,
    PopDatasetMeasureDefinition,
    PopDatasetMeasureDefinitionPreviousPeriodMeasure,
    PopDate,
    PopDateMeasureDefinition,
    PopDateMeasureDefinitionOverPeriodMeasure,
    PositiveAttributeFilter,
    PositiveAttributeFilterPositiveAttributeFilter,
    RangeMeasureValueFilter,
    RangeMeasureValueFilterRangeMeasureValueFilter,
    RangeMeasureValueFilterRangeMeasureValueFilterOperatorEnum,
    RankingFilter,
    RankingFilterRankingFilter,
    RankingFilterRankingFilterOperatorEnum,
    RelativeDateFilter,
    RelativeDateFilterRelativeDateFilter,
    RelativeDateFilterRelativeDateFilterGranularityEnum,
    ResultCacheMetadata,
    ResultDimension,
    ResultDimensionHeader,
    ResultSpec,
    SimpleMeasureDefinition,
    SimpleMeasureDefinitionMeasure,
    SimpleMeasureDefinitionMeasureAggregationEnum,
    SortKey,
    SortKeyAttribute,
    SortKeyAttributeAttribute,
    SortKeyTotal,
    SortKeyTotalTotal,
    SortKeyTotalTotalDirectionEnum,
    SortKeyValue,
    SortKeyValueValue,
    SortKeyValueValueDirectionEnum,
    SortKeyAttributeAttributeDirectionEnum,
    SortKeyAttributeAttributeSortTypeEnum,
    TotalExecutionResultHeader,
    TotalResultHeader,
    ActionsApiAxiosParamCreator as AfmActionsApiAxiosParamCreator,
    ActionsApiFp as AfmActionsApiFp,
    ActionsApiFactory as AfmActionsApiFactory,
    ActionsApiInterface as AfmActionsApiInterface,
    ActionsApi as AfmActionsApi,
    ActionsApiComputeLabelElementsPostRequest,
    ActionsApiComputeReportRequest,
    ActionsApiComputeValidObjectsRequest,
    ActionsApiExplainAFMRequest,
    ActionsApiRetrieveResultRequest,
    ActionsApiRetrieveExecutionMetadataRequest,
    RestApiIdentifier,
    StatusType,
    Total,
    TotalDimension,
    TotalFunctionEnum,
} from "./generated/afm-rest-api/api";
export * from "./generated/metadata-json-api/api";
export {
    ActionsApiGetDataSourceSchemataRequest,
    ActionsApiScanDataSourceRequest,
    ActionsApiTestDataSourceDefinitionRequest,
    ActionsApiTestDataSourceRequest,
    DataSourceSchemata,
    DeclarativeColumn as ScanModelDeclarativeColumn,
    DeclarativeColumnDataTypeEnum as ScanModelDeclarativeColumnDataTypeEnum,
    DeclarativeTable as ScanModelDeclarativeTable,
    DeclarativeTables as ScanModelDeclarativeTables,
    ScanRequest,
    ScanResultPdm,
    TableWarning,
    TestDefinitionRequest,
    TestDefinitionRequestTypeEnum,
    TestResponse,
    ColumnWarning,
} from "./generated/scan-json-api/api";
export * from "./client";

export { jsonApiHeaders, JSON_API_HEADER_VALUE, ValidateRelationsHeader } from "./constants";

export {
    MetadataUtilities,
    MetadataGetEntitiesResult,
    MetadataGetEntitiesFn,
    MetadataGetEntitiesOptions,
    MetadataGetEntitiesParams,
    MetadataGetEntitiesThemeParams,
    MetadataGetEntitiesColorPaletteParams,
    MetadataGetEntitiesWorkspaceParams,
    MetadataGetEntitiesUserParams,
} from "./metadataUtilities";

export {
    OrganizationUtilities,
    OrganizationGetEntitiesResult,
    OrganizationGetEntitiesSupportingIncludedResult,
    OrganizationGetEntitiesFn,
    OrganizationGetEntitiesParams,
} from "./organizationUtilities";

const defaultTigerClient: ITigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;
