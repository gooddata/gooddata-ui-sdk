# (C) 2026 GoodData Corporation
# schema-hash: 52db43276615e2f90fac570c9c8b308d512ff91dac93d08876a5d9e0b5843960

from __future__ import annotations

from enum import Enum, IntEnum
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    PositiveFloat,
    RootModel,
    confloat,
    conint,
    constr,
)

import re as _re
import pydantic as _pydantic

_pydantic_version_match = _re.match(r'(\d+)\.(\d+)\.(\d+)', _pydantic.VERSION)
if not _pydantic_version_match or tuple(int(g) for g in _pydantic_version_match.groups()) < (2, 11, 0):
    raise ImportError(
        f'gooddata_code_convertors.pydantic_models requires pydantic>=2.11.0 '
        f'(RootModel classes here need model_config regex_engine="python-re" to validate negative-lookahead patterns, silently broken on some earlier/2.10.x releases — see pydantic#11042/#11184), but pydantic {_pydantic.VERSION} is installed.'
    )

__all__ = [
    "Absolute",
    "AggregatedAs",
    "AggregatedFact",
    "Aggregation",
    "Aggregation1",
    "Aggregation10",
    "Aggregation11",
    "Aggregation12",
    "Aggregation13",
    "Aggregation14",
    "Aggregation2",
    "Aggregation3",
    "Aggregation6",
    "Aggregation7",
    "Aggregation8",
    "Aggregation9",
    "AnomalyDetectionSensitivity",
    "AnomalyDetectionSize",
    "Attribute",
    "AttributeHierarchy",
    "AttributeHierarchy1",
    "AttributeIdentifier",
    "Axis",
    "BackgroundFit",
    "BucketEmptyItem",
    "BucketGeoAreaItem",
    "BucketItem",
    "BucketItem1",
    "BucketLocationItem",
    "BucketPushpinLocationItem",
    "CellImageSizing",
    "CellTextWrapping",
    "CellVerticalAlign",
    "ChartFill",
    "Collection",
    "ColorDefinition",
    "ColorItems",
    "ColumnOverride",
    "Columns",
    "ComplexColorItem",
    "ComputedAttribute",
    "ComputedAttribute1",
    "ComputedAttributeIdentifier",
    "Condition",
    "Condition1",
    "Condition2",
    "Condition3",
    "Condition4",
    "Condition5",
    "Condition6",
    "Condition7",
    "Condition8",
    "Condition9",
    "ConditionalFormatting",
    "Config",
    "Constraints",
    "Constraints1",
    "Context",
    "CustomTooltip",
    "Dashboard",
    "Dashboard1",
    "DashboardAbsoluteDateFilter",
    "DashboardAttributeFilter",
    "DashboardAttributeFilter1",
    "DashboardAttributeFilter2",
    "DashboardFilterGroup",
    "DashboardFilters",
    "DashboardFiltersNoGroups",
    "DashboardMetricValueFilter",
    "DashboardRelativeDateFilter",
    "DashboardStateMultiselect",
    "DashboardStateMultiselect1",
    "DashboardStateMultiselect2",
    "DashboardStateSelect",
    "DashboardTextFilter",
    "DashboardTextFilter1",
    "DashboardTextFilter2",
    "DataLabels",
    "DataLabelsStyle",
    "DataPoints",
    "DataType",
    "Dataset",
    "Dataset1",
    "Dataset2",
    "Dataset3",
    "Dataset4",
    "Dataset5",
    "Dataset6",
    "Dataset7",
    "DatasetType",
    "DatasetType2",
    "DatasetType3",
    "DatasetType5",
    "DateDataset",
    "DateDataset1",
    "DateFilterGranularity",
    "Description",
    "Description1",
    "Description2",
    "Description3",
    "Direction",
    "DisplayAs",
    "DisplayAsLabelIdentifier",
    "DistinctPointShapes",
    "EmptyValues",
    "Fact",
    "FactIdentifier",
    "Fields",
    "Fit",
    "FontStyle",
    "Format",
    "Function",
    "GeoAreaConfig",
    "GrandTotalsPosition",
    "Granularity",
    "Granularity1",
    "Granularity2",
    "Granularity3",
    "Granularity4",
    "GridLineShape",
    "Gridlines",
    "HeadingSlot",
    "HorizontalAlign",
    "Identifier",
    "IgnoredDrillDown",
    "IgnoredDrillDown1",
    "IgnoredDrillDown2",
    "IgnoredDrillDownsIntersection",
    "ImageSlot",
    "Interaction",
    "InteractionClickOn",
    "InteractionFilters",
    "InteractionFiltersExclude",
    "InteractionFiltersInclude",
    "InteractionIgnoredDashboardFilters",
    "InteractionIgnoredIntersectionAttributes",
    "InteractionIncludedSourceInsightFilters",
    "InteractionIncludedSourceMeasureFilters",
    "InteractionOpenDashboard",
    "InteractionOpenParamUrl",
    "InteractionOpenPlainUrl",
    "InteractionOpenVisualization",
    "Kind",
    "Label",
    "LabelIdentifier",
    "LabelTranslation",
    "LayerItem",
    "LayerItem1",
    "LayerItem2",
    "LayerItemBase",
    "LayoutColumn",
    "LayoutDirection",
    "LayoutRow",
    "Legend",
    "Level",
    "LineShape",
    "LineStyleMapping",
    "LineStyleMapping1",
    "Locale",
    "MatchType",
    "MaxSize",
    "Metadata",
    "Metric",
    "Metric1",
    "MetricIdentifier",
    "MetricType",
    "Metrics",
    "MinSize",
    "Mode",
    "Mode2",
    "Mode6",
    "MvfCondition",
    "MvfCondition1",
    "MvfCondition2",
    "MvfCondition3",
    "Name",
    "NumberParameterDefinition",
    "OpenUrl",
    "Operator",
    "Operator1",
    "Operator10",
    "Operator11",
    "Operator12",
    "Operator13",
    "Operator14",
    "Operator2",
    "Operator3",
    "Operator4",
    "Operator5",
    "Operator6",
    "Operator7",
    "ParagraphSlot",
    "Parameter",
    "Parameter1",
    "ParameterAllowedValue",
    "ParameterDefinition",
    "Parents",
    "PatternNameMapping",
    "Permission",
    "Permissions",
    "Placement",
    "Plugin",
    "Plugin1",
    "Plugins",
    "PointShapeMapping",
    "Position",
    "Position1",
    "PublisherAxisDisplayV2",
    "PublisherBorderLineStyleV2",
    "PublisherChartStyleV2",
    "PublisherColorValueV2",
    "PublisherContainerStyleV2",
    "PublisherContainerV2",
    "PublisherDocumentContentV2",
    "PublisherDocumentDefaultsV2",
    "PublisherDocumentPageV2",
    "PublisherDocumentStyleV2",
    "PublisherDocumentTemplateV2",
    "PublisherDocumentTemplateV21",
    "PublisherDocumentV2",
    "PublisherDocumentV21",
    "PublisherEntityDescriptionV2",
    "PublisherEntityTagsV2",
    "PublisherEntityTagsV2Item",
    "PublisherEntityTitleV2",
    "PublisherGapValueV2",
    "PublisherGapValueV21",
    "PublisherHeadingWidgetV2",
    "PublisherHeadlineStyleV2",
    "PublisherHorizontalAlignV2",
    "PublisherImageSourceV2",
    "PublisherImageWidgetStyleV2",
    "PublisherImageWidgetV2",
    "PublisherLayoutNodeV2",
    "PublisherOpacityV2",
    "PublisherPaddingValueV2",
    "PublisherPaddingValueV21",
    "PublisherPageBodyV2",
    "PublisherPageNodeIdV2",
    "PublisherPageProportionV2",
    "PublisherPageSizeV2",
    "PublisherPageStyleV2",
    "PublisherPageTemplateV2",
    "PublisherPageTemplateV21",
    "PublisherPeriodV2",
    "PublisherPeriodV21",
    "PublisherPeriodV22",
    "PublisherPxV2",
    "PublisherRadiusValueV2",
    "PublisherRadiusValueV21",
    "PublisherSectionV2",
    "PublisherShadowValueV2",
    "PublisherTableStyleV2",
    "PublisherTakeawayGenerationV2",
    "PublisherTakeawayWidgetV2",
    "PublisherTextStyleNameV2",
    "PublisherTextStyleV2",
    "PublisherTextWidgetStyleV2",
    "PublisherTextWidgetV2",
    "PublisherTitleWidgetV2",
    "PublisherVerticalAlignV2",
    "PublisherVisualizationDisplayV2",
    "PublisherVisualizationStyleV2",
    "PublisherVisualizationWidgetV2",
    "PublisherWidgetPlaceholderV2",
    "PublisherWidgetTitleV2",
    "Query",
    "QueryAttributeFilter",
    "QueryAttributeSort",
    "QueryDateFilter",
    "QueryDateFilter1",
    "QueryDateFilter2",
    "QueryField",
    "QueryField1",
    "QueryField10",
    "QueryField11",
    "QueryField12",
    "QueryField13",
    "QueryField14",
    "QueryField2",
    "QueryField3",
    "QueryField4",
    "QueryField5",
    "QueryField6",
    "QueryField7",
    "QueryField8",
    "QueryField9",
    "QueryFields",
    "QueryFilter",
    "QueryFilters",
    "QueryMetricSort",
    "QueryMetricValueFilter",
    "QueryMetricValueFilter1",
    "QueryMetricValueFilter2",
    "QueryMetricValueFilter3",
    "QueryMetricValueFilter4",
    "QueryRankingFilter",
    "QueryRankingFilter1",
    "QueryRankingFilter2",
    "QuerySort",
    "QuerySorts",
    "QueryTextFilter",
    "QueryTextFilter1",
    "QueryTextFilter2",
    "Reference",
    "Relative",
    "RenderAs",
    "Report",
    "Report1",
    "ReportAlignment",
    "ReportBackground",
    "ReportBackground1",
    "ReportBackgroundImage",
    "ReportBackgroundImage1",
    "ReportBackgroundImage2",
    "ReportBoxStyle",
    "ReportImage",
    "ReportImage1",
    "ReportImageStyle",
    "ReportLayoutNode",
    "ReportPageBody",
    "ReportPageFormat",
    "ReportPageKind",
    "ReportPageLayout",
    "ReportPageLayout1",
    "ReportPeriod",
    "ReportPlaceholder",
    "ReportPlaceholder1",
    "ReportSlotId",
    "ReportTemplate",
    "ReportTemplate1",
    "ReportText",
    "ReportText1",
    "ReportTextStyle",
    "ReportTextStyle1",
    "ReportTextType",
    "ReportVariable",
    "ReportWeight",
    "RowHeight",
    "Rule",
    "Scope",
    "Section",
    "Section1",
    "SelectionType",
    "ShapeType",
    "SimpleColorItem",
    "SortDirection",
    "Source",
    "SourceColumn",
    "State",
    "StringParameterDefinition",
    "Style",
    "SuppressedTargets",
    "SuppressedTargets1",
    "Tab",
    "Tags",
    "Takeaway",
    "Target",
    "Target1",
    "Template",
    "TextOverflow",
    "TextTransform",
    "TextWrapping",
    "TimezoneConfig",
    "TimezoneId",
    "Title",
    "Title1",
    "Title2",
    "TotalItem",
    "Type",
    "Type1",
    "Type100",
    "Type101",
    "Type102",
    "Type103",
    "Type104",
    "Type11",
    "Type12",
    "Type14",
    "Type18",
    "Type20",
    "Type21",
    "Type22",
    "Type25",
    "Type26",
    "Type27",
    "Type28",
    "Type29",
    "Type3",
    "Type30",
    "Type31",
    "Type32",
    "Type33",
    "Type34",
    "Type35",
    "Type36",
    "Type37",
    "Type38",
    "Type39",
    "Type40",
    "Type41",
    "Type42",
    "Type43",
    "Type44",
    "Type45",
    "Type46",
    "Type47",
    "Type48",
    "Type49",
    "Type5",
    "Type50",
    "Type51",
    "Type52",
    "Type53",
    "Type54",
    "Type55",
    "Type56",
    "Type57",
    "Type58",
    "Type59",
    "Type60",
    "Type61",
    "Type62",
    "Type63",
    "Type64",
    "Type65",
    "Type66",
    "Type67",
    "Type68",
    "Type69",
    "Type7",
    "Type72",
    "Type73",
    "Type74",
    "Type75",
    "Type76",
    "Type77",
    "Type78",
    "Type79",
    "Type8",
    "Type80",
    "Type81",
    "Type82",
    "Type83",
    "Type84",
    "Type85",
    "Type86",
    "Type87",
    "Type88",
    "Type89",
    "Type9",
    "Type90",
    "Type91",
    "Type92",
    "Type93",
    "Type94",
    "Type95",
    "Type96",
    "Type97",
    "Type98",
    "Type99",
    "Using",
    "Using1",
    "Using2",
    "Value",
    "Value1",
    "Value2",
    "ValueType",
    "ValueType1",
    "ValueType2",
    "Values",
    "Version",
    "Version1",
    "Version4",
    "Version5",
    "Viewport",
    "Visible",
    "Visualisation",
    "Visualisation1",
    "Visualisation10",
    "Visualisation11",
    "Visualisation12",
    "Visualisation13",
    "Visualisation14",
    "Visualisation15",
    "Visualisation16",
    "Visualisation17",
    "Visualisation18",
    "Visualisation19",
    "Visualisation2",
    "Visualisation20",
    "Visualisation21",
    "Visualisation22",
    "Visualisation23",
    "Visualisation3",
    "Visualisation4",
    "Visualisation5",
    "Visualisation6",
    "Visualisation7",
    "Visualisation8",
    "Visualisation9",
    "VisualizationSlot",
    "VisualizationWidget",
    "Widget",
    "Widget1",
    "Widget2",
    "Widget3",
    "Width",
    "WidthItem",
    "WorkspaceDataFilter",
    "YaxisPrimaryType",
    "YaxisSecondaryType",
]



class Type(Enum):
    attribute_hierarchy = 'attribute_hierarchy'


class Identifier(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(..., title='Id')


class Title1(RootModel[constr(max_length=255)]):
    root: constr(max_length=255)


class Description1(RootModel[constr(max_length=10000)]):
    root: constr(max_length=10000)


class Tags(RootModel[list[str]]):
    root: list[str]


class AttributeIdentifier(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^attribute/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A attribute identifier in the form of attribute/{id}.',
        title='Attribute Identifier',
    )


class LabelIdentifier(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A label identifier in the form of label/{id}.',
        title='Label Identifier',
    )


class ComputedAttributeIdentifier(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^computed_attribute/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A computed attribute identifier in the form of computed_attribute/{id}.',
        title='Computed Attribute Identifier',
    )


class DisplayAsLabelIdentifier(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )


class FactIdentifier(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^fact/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A fact identifier in the form of fact/{id}.',
        title='Fact Identifier',
    )


class MetricIdentifier(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^metric/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A metric identifier in the form of metric/{id}.',
        title='Metric Identifier',
    )


class Permission(BaseModel):
    all: bool | None = None
    users: list[str] | None = None
    user_groups: list[str] | None = None


class Type1(Enum):
    date_filter = 'date_filter'


class Mode(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'


class EmptyValues(Enum):
    only = 'only'
    include = 'include'
    exclude = 'exclude'


class Type3(Enum):
    attribute_filter = 'attribute_filter'
    attribute_filter_1 = 'attribute_filter'


class Mode2(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'
    readonly_1 = 'readonly'
    hidden_1 = 'hidden'
    active_1 = 'active'


class SelectionType(Enum):
    list = 'list'
    text = 'text'
    listOrText = 'listOrText'
    list_1 = 'list'
    text_1 = 'text'
    listOrText_1 = 'listOrText'


class Parents(BaseModel):
    using: str = Field(..., description='Local date filter to use as parent')
    common: bool = Field(
        ..., description='Whether the parent filter is common date or special date'
    )
    date: str | None = Field(
        None,
        description='Date dataset the common date filter is applied through. Only valid when common is true; ignored and stripped on both import and export when common is false.',
    )


class Type5(Enum):
    text_filter = 'text_filter'


class Condition(Enum):
    is_ = 'is'
    isNot = 'isNot'


class DashboardTextFilter1(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    title: str | None = Field(None, description='Optional title of the filter')
    using: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    case_sensitive: bool | None = None
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    mode: Mode2 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType | None = Field(
        None,
        description="Controls which filter presentation types are available to the user in View mode. 'list' means only elements/list selection, 'text' means only text-based filtering, 'listOrText' means both types are available.",
    )
    parents: list[str | Parents] | None = Field(
        None, description='An ids of the parent local attribute, text, or date filter'
    )
    metric_filters: list[str] | None = Field(
        None,
        description='An id of the attributes, labels, facts or metrics to validate the filter by',
    )
    type: Type5
    condition: Condition
    values: list[str | None]


class Condition1(Enum):
    contains = 'contains'
    doesNotContain = 'doesNotContain'
    startsWith = 'startsWith'
    doesNotStartWith = 'doesNotStartWith'
    endsWith = 'endsWith'
    doesNotEndWith = 'doesNotEndWith'


class DashboardTextFilter2(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    title: str | None = Field(None, description='Optional title of the filter')
    using: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    case_sensitive: bool | None = None
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    mode: Mode2 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType | None = Field(
        None,
        description="Controls which filter presentation types are available to the user in View mode. 'list' means only elements/list selection, 'text' means only text-based filtering, 'listOrText' means both types are available.",
    )
    parents: list[str | Parents] | None = Field(
        None, description='An ids of the parent local attribute, text, or date filter'
    )
    metric_filters: list[str] | None = Field(
        None,
        description='An id of the attributes, labels, facts or metrics to validate the filter by',
    )
    type: Type5
    condition: Condition1
    value: str


class DashboardTextFilter(RootModel[DashboardTextFilter1 | DashboardTextFilter2]):
    root: DashboardTextFilter1 | DashboardTextFilter2 = Field(
        ..., description='A dashboard text filter', title='Dashboard text filter'
    )


class Type7(Enum):
    metric_value_filter = 'metric_value_filter'


class Mode6(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'


class Type8(Enum):
    filter_group = 'filter_group'


class DateFilterGranularity(Enum):
    SECOND = 'SECOND'
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK = 'WEEK'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    FISCAL_YEAR = 'FISCAL_YEAR'
    FISCAL_QUARTER = 'FISCAL_QUARTER'
    FISCAL_MONTH = 'FISCAL_MONTH'


class DashboardStateSelect(BaseModel):
    include: list[str] = Field(..., max_length=1)


class DashboardStateMultiselect1(BaseModel):
    include: list[str]


class DashboardStateMultiselect2(BaseModel):
    exclude: list[str]


class DashboardStateMultiselect(
    RootModel[DashboardStateMultiselect1 | DashboardStateMultiselect2]
):
    root: DashboardStateMultiselect1 | DashboardStateMultiselect2 = Field(
        ..., description='State of the multiselect'
    )


class Condition2(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'


class MvfCondition1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    condition: Condition2 | None = Field(
        None,
        description='Condition to use for this filter. If omitted, the condition represents ALL (no filtering).',
    )


class Condition3(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'


class MvfCondition2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    condition: Condition3
    value: float = Field(..., description='Value to use in condition for this filter.')


class Condition4(Enum):
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'


class MvfCondition3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    condition: Condition4
    from_: float = Field(
        ..., alias='from', description='From value to use in condition for this filter.'
    )
    to: float = Field(..., description='To value to use in condition for this filter.')


class MvfCondition(RootModel[MvfCondition1 | MvfCondition2 | MvfCondition3]):
    root: MvfCondition1 | MvfCondition2 | MvfCondition3 = Field(
        ..., title='Metric Value Filter Condition'
    )


class Type9(Enum):
    date_filter = 'date_filter'


class Granularity(Enum):
    SECOND = 'SECOND'
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK = 'WEEK'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    SECOND_OF_MINUTE = 'SECOND_OF_MINUTE'
    SECOND_OF_DAY = 'SECOND_OF_DAY'
    MINUTE_OF_HOUR = 'MINUTE_OF_HOUR'
    MINUTE_OF_DAY = 'MINUTE_OF_DAY'
    HOUR_OF_DAY = 'HOUR_OF_DAY'
    DAY_OF_WEEK = 'DAY_OF_WEEK'
    DAY_OF_MONTH = 'DAY_OF_MONTH'
    DAY_OF_YEAR = 'DAY_OF_YEAR'
    WEEK_OF_YEAR = 'WEEK_OF_YEAR'
    MONTH_OF_YEAR = 'MONTH_OF_YEAR'
    QUARTER_OF_YEAR = 'QUARTER_OF_YEAR'
    FISCAL_YEAR = 'FISCAL_YEAR'
    FISCAL_QUARTER = 'FISCAL_QUARTER'
    FISCAL_MONTH = 'FISCAL_MONTH'


class Type11(Enum):
    attribute_filter = 'attribute_filter'


class State(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    include: list[str | float | bool] | None = None
    exclude: list[str | float | bool] | None = None


class QueryAttributeFilter(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type11
    using: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    state: State | None = Field(None, title='State')


class Type12(Enum):
    text_filter = 'text_filter'
    text_filter_1 = 'text_filter'


class Condition5(Enum):
    is_ = 'is'
    isNot = 'isNot'


class QueryTextFilter1(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type12
    using: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    case_sensitive: bool | None = None
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    condition: Condition5
    values: list[str | None]


class Condition6(Enum):
    contains = 'contains'
    doesNotContain = 'doesNotContain'
    startsWith = 'startsWith'
    doesNotStartWith = 'doesNotStartWith'
    endsWith = 'endsWith'
    doesNotEndWith = 'doesNotEndWith'


class QueryTextFilter2(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type12
    using: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    case_sensitive: bool | None = None
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    condition: Condition6
    value: str


class QueryTextFilter(RootModel[QueryTextFilter1 | QueryTextFilter2]):
    root: QueryTextFilter1 | QueryTextFilter2 = Field(..., title='Text Filter')


class Type14(Enum):
    metric_value_filter = 'metric_value_filter'


class QueryMetricValueFilter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type14
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
    )
    conditions: list[MvfCondition] = Field(..., min_length=1)
    null_values_as_zero: bool | None = Field(
        None, description='Null values will be treated as zero.'
    )
    dimensionality: list[LabelIdentifier | ComputedAttributeIdentifier | str] | None = (
        Field(
            None,
            description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
        )
    )


class Condition7(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'


class QueryMetricValueFilter2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type14
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
    )
    condition: Condition7 = Field(..., description='Condition to use for this filter.')
    value: float = Field(..., description='Value to use in condition for this filter.')
    null_values_as_zero: bool | None = Field(
        None, description='Null values will be treated as zero.'
    )
    dimensionality: list[LabelIdentifier | ComputedAttributeIdentifier | str] | None = (
        Field(
            None,
            description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
        )
    )


class Condition8(Enum):
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'


class QueryMetricValueFilter3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type14
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
    )
    condition: Condition8 = Field(..., description='Condition to use for this filter.')
    from_: float = Field(
        ..., alias='from', description='From value to use in condition for this filter.'
    )
    to: float = Field(..., description='To value to use in condition for this filter.')
    null_values_as_zero: bool | None = Field(
        None, description='Null values will be treated as zero.'
    )
    dimensionality: list[LabelIdentifier | ComputedAttributeIdentifier | str] | None = (
        Field(
            None,
            description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
        )
    )


class QueryMetricValueFilter4(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type14
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
    )
    conditions: list[MvfCondition] | None = Field(
        None,
        description='Optional list of conditions for this filter. Conditions are applied as AND during execution.',
    )
    dimensionality: list[LabelIdentifier | ComputedAttributeIdentifier | str] | None = (
        Field(
            None,
            description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
        )
    )


class QueryMetricValueFilter(
    RootModel[
        QueryMetricValueFilter1
        | QueryMetricValueFilter2
        | QueryMetricValueFilter3
        | QueryMetricValueFilter4
    ]
):
    root: (
        QueryMetricValueFilter1
        | QueryMetricValueFilter2
        | QueryMetricValueFilter3
        | QueryMetricValueFilter4
    ) = Field(..., title='Metric Value Filter')


class Type18(Enum):
    ranking_filter = 'ranking_filter'
    ranking_filter_1 = 'ranking_filter'


class QueryRankingFilter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type18
    using: MetricIdentifier | str = Field(
        ..., description='Metric identifier to use for this filter.'
    )
    attribute: LabelIdentifier | ComputedAttributeIdentifier | str | None = Field(
        None, description='Label reference or local identifier to use for this filter.'
    )
    bottom: float = Field(
        ..., description='Number of bottom N values to use in this filter.'
    )
    top: float | None = Field(
        None, description='Number of top N values to use in this filter.'
    )
    strict_limit_of_rows: bool | None = Field(
        None,
        description='When true, the filter returns exactly N rows, excluding additional rows that share the same value (ties). Default is false.',
    )


class QueryRankingFilter2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type18
    using: MetricIdentifier | str = Field(
        ..., description='Metric identifier to use for this filter.'
    )
    attribute: LabelIdentifier | ComputedAttributeIdentifier | str | None = Field(
        None, description='Label reference or local identifier to use for this filter.'
    )
    bottom: float | None = Field(
        None, description='Number of bottom N values to use in this filter.'
    )
    top: float = Field(..., description='Number of top N values to use in this filter.')
    strict_limit_of_rows: bool | None = Field(
        None,
        description='When true, the filter returns exactly N rows, excluding additional rows that share the same value (ties). Default is false.',
    )


class QueryRankingFilter(RootModel[QueryRankingFilter1 | QueryRankingFilter2]):
    root: QueryRankingFilter1 | QueryRankingFilter2 = Field(..., title='Ranking Filter')


class Type20(Enum):
    computed_attribute = 'computed_attribute'


class MetricType(Enum):
    UNSPECIFIED = 'UNSPECIFIED'
    CURRENCY = 'CURRENCY'


class DataType(Enum):
    INT = 'INT'
    STRING = 'STRING'
    DATE = 'DATE'
    NUMERIC = 'NUMERIC'
    TIMESTAMP = 'TIMESTAMP'
    TIMESTAMP_TZ = 'TIMESTAMP_TZ'
    BOOLEAN = 'BOOLEAN'
    HLL = 'HLL'


class ValueType(Enum):
    TEXT = 'TEXT'
    HYPERLINK = 'HYPERLINK'
    GEO = 'GEO'
    GEO_LONGITUDE = 'GEO_LONGITUDE'
    GEO_LATITUDE = 'GEO_LATITUDE'
    GEO_AREA = 'GEO_AREA'
    GEO_ICON = 'GEO_ICON'
    IMAGE = 'IMAGE'
    HYPERLOGLOG = 'HYPERLOGLOG'


class Using(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    SUM: str | None = None
    AVG: str | None = None
    MAX: str | None = None
    MIN: str | None = None
    MED: str | None = None
    NAT: str | None = None


class WidthItem(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    value: float | Literal['auto'] | None = Field(None, title='Width value or auto')
    allowGrowToFit: bool | None = Field(None, title='Allow grow to fit')
    using: list[str | dict[str, str] | Using] | None = None


class SimpleColorItem(
    RootModel[
        float
        | constr(
            pattern=r'rgb\( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *\)'
        )
    ]
):
    root: float | constr(
        pattern=r'rgb\( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *\)'
    ) = Field(..., title='Color')


class Style(Enum):
    solid = 'solid'
    dashed = 'dashed'
    dotted = 'dotted'


class Width(IntEnum):
    integer_1 = 1
    integer_2 = 2
    integer_3 = 3
    integer_4 = 4


class LineStyleMapping1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    style: Style | None = Field(None, description='Line stroke style for this series.')
    width: Width | None = Field(
        None, description='Line stroke width in pixels for this series.'
    )


class LineStyleMapping(RootModel[dict[str, LineStyleMapping1]]):
    root: dict[str, LineStyleMapping1]


class ComplexColorItem(
    RootModel[
        float
        | constr(
            pattern=r'rgb\( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *\)'
        )
    ]
):
    root: float | constr(
        pattern=r'rgb\( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *\)'
    ) = Field(..., title='Color')


class Type21(Enum):
    dashboard = 'dashboard'


class Version(Enum):
    field_2 = '2'
    field_3 = '3'


class TimezoneId(
    RootModel[
        Literal['$browserDetected']
        | constr(pattern=r'^[A-Za-z][A-Za-z0-9_+.-]*(?:/[A-Za-z0-9_+.-]+)*$')
    ]
):
    root: Literal['$browserDetected'] | constr(
        pattern=r'^[A-Za-z][A-Za-z0-9_+.-]*(?:/[A-Za-z0-9_+.-]+)*$'
    ) = Field(
        ...,
        description='An IANA timezone ID (for example, Europe/Prague or UTC) or $browserDetected to use the viewer browser timezone.',
    )


class Columns(Enum):
    number_1 = 1
    number_2 = 2
    number_3 = 3
    number_4 = 4
    number_5 = 5
    number_6 = 6
    number_7 = 7
    number_8 = 8
    number_9 = 9
    number_10 = 10
    number_11 = 11
    number_12 = 12


class LayoutDirection(Enum):
    row = 'row'
    column = 'column'


class IgnoredDrillDown1(BaseModel):
    hierarchy: str = Field(
        ..., description='An id of the attribute hierarchy to be ignored'
    )
    on: str = Field(..., description='An id of the drill down to be ignored')


class Template(Enum):
    default = 'default'


class IgnoredDrillDown2(BaseModel):
    template: Template = Field(
        ..., description='An id of the date attribute hierarchy template to be ignored'
    )
    on: str = Field(..., description='An id of the drill down to be ignored')


class IgnoredDrillDown(RootModel[IgnoredDrillDown1 | IgnoredDrillDown2]):
    root: IgnoredDrillDown1 | IgnoredDrillDown2 = Field(
        ..., description='An ignored drill down item', title='Ignored Drill Down'
    )


class IgnoredDrillDownsIntersection(BaseModel):
    attributes: list[str] = Field(..., description='An attributes list to be ignored')
    hierarchy: IgnoredDrillDown = Field(
        ...,
        description='An attribute hierarchy that is related to attributes that will be ignored',
    )


class Title2(Enum):
    boolean_False = False


class Description2(Enum):
    boolean_False = False


class Description3(Enum):
    inherit = 'inherit'


class InteractionIgnoredIntersectionAttributes(RootModel[list[str]]):
    root: list[str] = Field(
        ..., description='Attribute local IDs to ignore in the drill intersection'
    )


class InteractionIgnoredDashboardFilters(RootModel[list[str]]):
    root: list[str] = Field(
        ...,
        description='Dashboard filter local IDs to exclude when drilling to this visualization',
    )


class InteractionIncludedSourceInsightFilters(RootModel[list[str]]):
    root: list[str] = Field(
        ...,
        description='Source insight filter IDs to include when drilling to this visualization',
    )


class InteractionIncludedSourceMeasureFilters(RootModel[list[str]]):
    root: list[str] = Field(
        ...,
        description='Source measure-level filter IDs to include when drilling to this visualization',
    )


class InteractionFiltersExclude(BaseModel):
    drilled_datapoint: InteractionIgnoredIntersectionAttributes | None = None
    dashboard_filters: InteractionIgnoredDashboardFilters | None = None


class InteractionFiltersInclude(BaseModel):
    visualization_filters: InteractionIncludedSourceInsightFilters | None = None
    metric_filters: InteractionIncludedSourceMeasureFilters | None = None


class InteractionClickOn(RootModel[str]):
    root: str = Field(
        ...,
        description='An id of the metric or attribute that will trigger the interaction',
    )


class InteractionFilters(BaseModel):
    exclude: InteractionFiltersExclude | None = None
    include: InteractionFiltersInclude | None = None


class Type22(Enum):
    dataset = 'dataset'
    dataset_1 = 'dataset'


class DatasetType(Enum):
    standard = 'standard'
    auxiliary = 'auxiliary'
    standard_1 = 'standard'
    auxiliary_1 = 'auxiliary'


class DatasetType2(Enum):
    standard = 'standard'
    auxiliary = 'auxiliary'


class Type25(Enum):
    date = 'date'


class Granularity1(Enum):
    SECOND = 'SECOND'
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK = 'WEEK'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    SECOND_OF_MINUTE = 'SECOND_OF_MINUTE'
    SECOND_OF_DAY = 'SECOND_OF_DAY'
    MINUTE_OF_HOUR = 'MINUTE_OF_HOUR'
    MINUTE_OF_DAY = 'MINUTE_OF_DAY'
    HOUR_OF_DAY = 'HOUR_OF_DAY'
    DAY_OF_WEEK = 'DAY_OF_WEEK'
    DAY_OF_WEEK_EU = 'DAY_OF_WEEK_EU'
    DAY_OF_MONTH = 'DAY_OF_MONTH'
    DAY_OF_YEAR = 'DAY_OF_YEAR'
    DAY_OF_QUARTER = 'DAY_OF_QUARTER'
    WEEK_OF_YEAR = 'WEEK_OF_YEAR'
    WEEK_OF_YEAR_EU = 'WEEK_OF_YEAR_EU'
    WEEK_OF_QUARTER_EU = 'WEEK_OF_QUARTER_EU'
    WEEK_OF_QUARTER = 'WEEK_OF_QUARTER'
    MONTH_OF_YEAR = 'MONTH_OF_YEAR'
    MONTH_OF_QUARTER = 'MONTH_OF_QUARTER'
    QUARTER_OF_YEAR = 'QUARTER_OF_YEAR'
    FISCAL_YEAR = 'FISCAL_YEAR'
    FISCAL_QUARTER = 'FISCAL_QUARTER'
    FISCAL_MONTH = 'FISCAL_MONTH'


class Type26(Enum):
    attribute = 'attribute'


class SortDirection(Enum):
    ASC = 'ASC'
    DESC = 'DESC'


class Type27(Enum):
    fact = 'fact'


class Type28(Enum):
    aggregated_fact = 'aggregated_fact'


class AggregatedAs(Enum):
    MIN = 'MIN'
    MAX = 'MAX'
    SUM = 'SUM'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'


class SourceColumn(RootModel[constr(max_length=255)]):
    root: constr(max_length=255)


class ValueType1(Enum):
    TEXT = 'TEXT'
    HYPERLINK = 'HYPERLINK'
    GEO = 'GEO'
    GEO_LONGITUDE = 'GEO_LONGITUDE'
    GEO_LATITUDE = 'GEO_LATITUDE'
    GEO_ICON = 'GEO_ICON'
    IMAGE = 'IMAGE'
    GEO_AREA = 'GEO_AREA'


class Collection(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str = Field(
        ..., description='Identifier of a GEO collection describing valid areas.'
    )


class GeoAreaConfig(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    collection: Collection


class Source(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    source_column: SourceColumn
    data_type: DataType = Field(
        ..., description='A column data type in the physical database.'
    )
    target: str = Field(..., description='A target dataset one of primary key or date.')
    is_nullable: bool | None = Field(
        None,
        description='Optional flag to indicate if the reference source can contain null values.',
    )
    null_value_join_replacement: str | None = Field(
        None,
        description='Optional value which can be used as replacement for NULL in join conditions.',
    )


class Type29(Enum):
    document = 'document'


class Version1(Enum):
    field_2 = '2'


class Type30(Enum):
    document_template = 'document_template'


class Type31(Enum):
    metric = 'metric'


class Position(Enum):
    low = 'low'
    middle = 'middle'
    high = 'high'


class Name(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | None = None
    position: Position | None = None


class Values(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | None = None
    rotation: confloat(ge=-90.0, le=90.0) | None = None


class PublisherAxisDisplayV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | None = None
    name: Name | None = Field(None, title='Publisher Axis Name Display V2')
    values: Values | None = Field(None, title='Publisher Axis Values Display V2')
    min: float | None = None
    max: float | None = None


class Position1(Enum):
    auto = 'auto'
    top = 'top'
    bottom = 'bottom'
    left = 'left'
    right = 'right'


class Legend(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | None = None
    position: Position1 | None = None


class Gridlines(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | None = None


class Visible(Enum):
    auto = 'auto'


class DataLabels(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | Visible | None = None


class DataPoints(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | Visible | None = None


class PublisherVisualizationDisplayV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    legend: Legend | None = Field(None, title='Publisher Legend Display V2')
    x_axis: PublisherAxisDisplayV2 | None = None
    y_axis: PublisherAxisDisplayV2 | None = None
    secondary_y_axis: PublisherAxisDisplayV2 | None = None
    gridlines: Gridlines | None = Field(None, title='Publisher Visibility V2')
    data_labels: DataLabels | None = Field(None, title='Publisher Auto Visibility V2')
    data_points: DataPoints | None = Field(None, title='Publisher Auto Visibility V2')


class Type32(Enum):
    row = 'row'
    column = 'column'


class Type33(Enum):
    title = 'title'


class Type34(Enum):
    heading = 'heading'


class Level(IntEnum):
    integer_1 = 1
    integer_2 = 2
    integer_3 = 3
    integer_4 = 4
    integer_5 = 5
    integer_6 = 6


class Type35(Enum):
    text = 'text'


class Type36(Enum):
    image = 'image'


class Type37(Enum):
    visualization = 'visualization'


class Type38(Enum):
    takeaway = 'takeaway'


class Type39(Enum):
    page_template = 'page_template'


class Type40(Enum):
    parameter = 'parameter'


class Type41(Enum):
    STRING = 'STRING'


class Type42(Enum):
    NUMBER = 'NUMBER'


class Constraints1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    min: float | None = Field(
        None, description='The smallest accepted value, inclusive.'
    )
    max: float | None = Field(
        None, description='The largest accepted value, inclusive.'
    )


class NumberParameterDefinition(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type42
    defaultValue: float = Field(
        ..., description='The value used whenever the parameter is not overridden.'
    )
    constraints: Constraints1 | None = Field(
        None,
        description='Optional bounds the parameter value must satisfy.',
        title='Number Parameter Constraints',
    )


class ParameterAllowedValue(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    value: constr(min_length=1) = Field(
        ..., description='The accepted parameter value.'
    )
    title: str | None = Field(
        None,
        description='An optional human readable title shown instead of the raw value. Defaults to the value.',
    )


class Type43(Enum):
    plugin = 'plugin'


class Aggregation(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'


class Operator(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'


class Type44(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'


class Aggregation1(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator1(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type45(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class QueryField2(BaseModel):
    aggregation: Aggregation1 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator1 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type45 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Aggregation2(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'


class Using1(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^metric/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ..., description='Identifier to use for this field.', title='Metric Identifier'
    )


class Using2(RootModel[list[str]]):
    root: list[str] = Field(
        ...,
        description='List of identifiers to use for this field.',
        title='Metric Identifier',
    )


class Operator2(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'


class Type46(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'


class Aggregation3(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator3(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type47(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class QueryField4(BaseModel):
    aggregation: Aggregation3 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator3 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type47 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Operator4(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'


class Type48(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'


class Operator5(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type49(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class QueryField6(BaseModel):
    aggregation: Aggregation3 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator5 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type49 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Aggregation6(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'


class Operator6(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'


class Type50(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'


class Aggregation7(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator7(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type51(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class QueryField8(BaseModel):
    aggregation: Aggregation7 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator7 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type51 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Aggregation8(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'


class Type52(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'


class Aggregation9(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Type53(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class QueryField10(BaseModel):
    aggregation: Aggregation9 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator7 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type53 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Aggregation10(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'


class Operator10(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'


class Type54(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'


class Aggregation11(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator11(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type55(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class QueryField12(BaseModel):
    aggregation: Aggregation11 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator11 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type55 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Aggregation12(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'


class Operator12(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'


class Type56(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class Aggregation13(Enum):
    SUM = 'SUM'
    COUNT = 'COUNT'
    APPROXIMATE_COUNT = 'APPROXIMATE_COUNT'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MEDIAN = 'MEDIAN'
    RUNSUM = 'RUNSUM'
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator13(Enum):
    SUM = 'SUM'
    DIFFERENCE = 'DIFFERENCE'
    MULTIPLICATION = 'MULTIPLICATION'
    RATIO = 'RATIO'
    CHANGE = 'CHANGE'
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type57(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


class QueryField14(BaseModel):
    aggregation: Aggregation13 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator13 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type57 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Type58(Enum):
    attribute_sort = 'attribute_sort'


class Direction(Enum):
    ASC = 'ASC'
    DESC = 'DESC'


class Aggregation14(Enum):
    SUM = 'SUM'


class Type59(Enum):
    metric_sort = 'metric_sort'


class Function(Enum):
    SUM = 'SUM'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MED = 'MED'
    NAT = 'NAT'


class Type60(Enum):
    report = 'report'


class Type61(Enum):
    report_page_layout = 'report_page_layout'


class Type62(Enum):
    report_template = 'report_template'


class Axis(Enum):
    primary = 'primary'
    secondary = 'secondary'


class DisplayAs(Enum):
    line = 'line'
    column = 'column'
    metric = 'metric'


class BucketEmptyItem(RootModel[None]):
    root: None = Field(..., title='Empty Bucket')


class BucketPushpinLocationItem(RootModel[str]):
    root: str = Field(..., title='Pushpin Location Bucket')


class LayerItem1(BaseModel):
    type: Literal['pushpin']
    view_by: list[BucketPushpinLocationItem] | None = Field(
        None, description='A list of view by locations in this layer.'
    )


class BucketGeoAreaItem(RootModel[str]):
    root: str = Field(..., title='Geo Area Bucket')


class Type63(Enum):
    SUM = 'SUM'
    AVG = 'AVG'
    MAX = 'MAX'
    MIN = 'MIN'
    MED = 'MED'
    NAT = 'NAT'


class BucketLocationItem(RootModel[str]):
    root: str = Field(..., title='Location Bucket')


class Type64(Enum):
    pushpin = 'pushpin'
    area = 'area'


class Type65(Enum):
    attribute_hierarchy = 'attribute_hierarchy'


class Type66(Enum):
    computed_attribute = 'computed_attribute'


class ValueType2(Enum):
    TEXT = 'TEXT'
    HYPERLINK = 'HYPERLINK'
    GEO = 'GEO'
    GEO_LONGITUDE = 'GEO_LONGITUDE'
    GEO_LATITUDE = 'GEO_LATITUDE'
    GEO_AREA = 'GEO_AREA'
    GEO_ICON = 'GEO_ICON'
    IMAGE = 'IMAGE'
    HYPERLOGLOG = 'HYPERLOGLOG'


class DataLabelsStyle(Enum):
    auto = 'auto'
    backplate = 'backplate'


class Type67(Enum):
    solid = 'solid'
    pattern = 'pattern'
    outline = 'outline'


class PatternNameMapping(Enum):
    diagonal_grid_small = 'diagonal_grid_small'
    vertical_lines_small = 'vertical_lines_small'
    grid_small = 'grid_small'
    horizontal_lines_small = 'horizontal_lines_small'
    circle_small = 'circle_small'
    flag_small = 'flag_small'
    waffle_small = 'waffle_small'
    dot_small = 'dot_small'
    pyramid_small = 'pyramid_small'
    needle_small = 'needle_small'
    diamond_small = 'diamond_small'
    pizza_small = 'pizza_small'
    diagonal_grid_medium = 'diagonal_grid_medium'
    vertical_lines_medium = 'vertical_lines_medium'
    grid_large = 'grid_large'
    horizontal_lines_medium = 'horizontal_lines_medium'
    circle_medium = 'circle_medium'
    flag_medium = 'flag_medium'
    waffle_medium = 'waffle_medium'
    dot_medium = 'dot_medium'
    pyramid_medium = 'pyramid_medium'
    needle_medium = 'needle_medium'
    diamond_medium = 'diamond_medium'
    pizza_medium = 'pizza_medium'


class ChartFill(BaseModel):
    type: Type67 | None = None
    pattern_name_mapping: dict[str, PatternNameMapping] | None = None


class LineShape(Enum):
    linear = 'linear'
    spline = 'spline'
    stepped = 'stepped'


class RenderAs(Enum):
    filled = 'filled'
    outline = 'outline'


class GridLineShape(Enum):
    polygon = 'polygon'
    circle = 'circle'


class PointShapeMapping(Enum):
    circle = 'circle'
    square = 'square'
    diamond = 'diamond'
    triangle = 'triangle'
    triangle_down = 'triangle-down'


class DistinctPointShapes(BaseModel):
    enabled: bool | None = None
    point_shape_mapping: dict[str, PointShapeMapping] | None = None


class YaxisPrimaryType(Enum):
    column = 'column'
    area = 'area'
    line = 'line'


class YaxisSecondaryType(Enum):
    column = 'column'
    area = 'area'
    line = 'line'


class Viewport(Enum):
    auto = 'auto'
    continent_af = 'continent_af'
    continent_as = 'continent_as'
    continent_au = 'continent_au'
    continent_eu = 'continent_eu'
    continent_na = 'continent_na'
    continent_sa = 'continent_sa'
    world = 'world'
    custom = 'custom'


class MinSize(Enum):
    field_0_5x = '0.5x'
    field_0_75x = '0.75x'
    normal = 'normal'
    field_1_25x = '1.25x'
    field_1_5x = '1.5x'
    default = 'default'


class MaxSize(Enum):
    field_0_5x = '0.5x'
    field_0_75x = '0.75x'
    normal = 'normal'
    field_1_25x = '1.25x'
    field_1_5x = '1.5x'
    default = 'default'


class ShapeType(Enum):
    circle = 'circle'
    iconByValue = 'iconByValue'
    oneIcon = 'oneIcon'


class RowHeight(Enum):
    small = 'small'
    medium = 'medium'
    large = 'large'


class CellVerticalAlign(Enum):
    top = 'top'
    middle = 'middle'
    bottom = 'bottom'


class CellTextWrapping(Enum):
    clip = 'clip'
    wrap = 'wrap'


class CellImageSizing(Enum):
    fit = 'fit'
    fill = 'fill'


class AnomalyDetectionSensitivity(Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'


class AnomalyDetectionSize(Enum):
    small = 'small'
    medium = 'medium'
    big = 'big'


class MatchType(Enum):
    column = 'column'
    pivotGroup = 'pivotGroup'


class ColumnOverride(BaseModel):
    locators: list[dict[str, Any]] | None = None
    wrap_text: bool | None = None
    wrap_header_text: bool | None = None
    match_type: MatchType | None = None


class TextWrapping(BaseModel):
    wrap_text: bool | None = Field(
        None, description='Enable text wrapping for cell content.'
    )
    wrap_header_text: bool | None = Field(
        None, description='Enable text wrapping for header content.'
    )
    column_overrides: list[ColumnOverride] | None = Field(
        None, description='Per-column text wrapping overrides.'
    )


class GrandTotalsPosition(Enum):
    pinnedBottom = 'pinnedBottom'
    pinnedTop = 'pinnedTop'
    bottom = 'bottom'
    top = 'top'


class Placement(Enum):
    above = 'above'
    below = 'below'
    replace = 'replace'


class CustomTooltip(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    enabled: bool | None = Field(
        None, description='Whether the custom tooltip section is rendered.'
    )
    content: str | None = Field(
        None,
        description='Markdown content. Supports headings, bold/italic, ordered/unordered lists, images, links, horizontal rules, and metric/attribute references ({metric/id}, {label/id}) that resolve per hovered data point.',
    )
    placement: Placement | None = Field(
        None,
        description='Placement of the custom section relative to the default tooltip content. Defaults to "above".',
    )


class Target(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    measure: str = Field(..., description='Local identifier of the targeted measure.')


class Target1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    attribute: str = Field(
        ..., description='Local identifier of the targeted attribute.'
    )


class Operator14(Enum):
    all = 'all'
    equal_to = 'equal_to'
    not_equal_to = 'not_equal_to'
    less_than = 'less_than'
    less_than_or_equal_to = 'less_than_or_equal_to'
    greater_than = 'greater_than'
    greater_than_or_equal_to = 'greater_than_or_equal_to'
    between = 'between'
    not_between = 'not_between'
    contains = 'contains'
    not_contains = 'not_contains'
    starts_with = 'starts_with'
    not_starts_with = 'not_starts_with'
    ends_with = 'ends_with'
    not_ends_with = 'not_ends_with'
    is_empty = 'is_empty'
    is_not_empty = 'is_not_empty'


class Value(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    from_: float = Field(..., alias='from')
    to: float


class Absolute(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    from_: str = Field(..., alias='from')
    to: str


class Value1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    absolute: Absolute = Field(
        ...,
        description='Static period, snapped to the target date attribute\'s granularity: from = period start, to = inclusive period end. Platform date strings: "YYYY-MM-DD", or "YYYY-MM-DD HH:mm" for hour/minute, or "YYYY-MM-DD HH:mm:ss" for hour/minute/second granularities.',
    )


class Granularity2(Enum):
    minute = 'minute'
    hour = 'hour'
    day = 'day'
    week = 'week'
    month = 'month'
    quarter = 'quarter'
    year = 'year'


class Relative(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    granularity: Granularity2
    from_: int = Field(..., alias='from')
    to: int


class Value2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    relative: Relative = Field(
        ...,
        description="Relative period re-resolved on every render/export: integer period offsets where 0 = the current period, negative = past. Granularity must be coarser than or equal to (and aligned with) the target date attribute's granularity.",
    )


class Scope(Enum):
    cell = 'cell'
    row = 'row'


class Format(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    text: str | None = Field(None, description='Text color as hex (e.g. #FFFFFF).')
    fill: str | None = Field(
        None, description='Background color as hex (e.g. #E54D40).'
    )
    scope: Scope


class Condition9(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str
    operator: Operator14
    value: float | str | Value | Value1 | Value2 | None = Field(
        None,
        description='Literal (number or string); a {from,to} range for between/not_between; an {absolute} period or {relative} period for date-attribute conditions; omitted for all/is_empty/is_not_empty.',
    )
    format: Format


class Rule(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str = Field(..., description='Stable, table-unique rule id.')
    target: Target | Target1 = Field(
        ...,
        description='The measure or attribute the rule targets — exactly one of measure/attribute.',
    )
    conditions: list[Condition9] = Field(
        ..., description='Stacked conditions; the first matching condition wins.'
    )


class SuppressedTargets(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    measure: str = Field(..., description='Local identifier of the targeted measure.')


class SuppressedTargets1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    attribute: str = Field(
        ..., description='Local identifier of the targeted attribute.'
    )


class ConditionalFormatting(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    version: str | None = Field(
        None,
        description='Conditional-formatting model version. "1" (default if omitted) — initial shape: discrete rules, one column per rule with stacked conditions. Readers must tolerate omission (treat as "1") and evolve under the same backward-compat contract as the dashboard model version, so server-side consumers (e.g. XLSX export) stay forward-compatible.',
    )
    enabled: bool | None = Field(
        None, description='Master toggle for all conditional formatting rules.'
    )
    rules: list[Rule] | None = Field(
        None, description='Ordered list of rules; the first matching rule wins.'
    )
    suppressed_targets: list[SuppressedTargets | SuppressedTargets1] | None = Field(
        None,
        description='Targets whose semantic-layer formatting is explicitly suppressed — an entry here with no matching rule means formatting is turned off for that target (Custom-with-zero-rules).',
    )


class Type68(Enum):
    dashboard = 'dashboard'


class Version4(Enum):
    field_2 = '2'
    field_3 = '3'


class Type69(Enum):
    dataset = 'dataset'
    dataset_1 = 'dataset'


class DatasetType3(Enum):
    standard = 'standard'
    auxiliary = 'auxiliary'
    standard_1 = 'standard'
    auxiliary_1 = 'auxiliary'


class DatasetType5(Enum):
    standard = 'standard'
    auxiliary = 'auxiliary'


class Type72(Enum):
    date = 'date'


class Granularity3(Enum):
    SECOND = 'SECOND'
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK = 'WEEK'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    SECOND_OF_MINUTE = 'SECOND_OF_MINUTE'
    SECOND_OF_DAY = 'SECOND_OF_DAY'
    MINUTE_OF_HOUR = 'MINUTE_OF_HOUR'
    MINUTE_OF_DAY = 'MINUTE_OF_DAY'
    HOUR_OF_DAY = 'HOUR_OF_DAY'
    DAY_OF_WEEK = 'DAY_OF_WEEK'
    DAY_OF_WEEK_EU = 'DAY_OF_WEEK_EU'
    DAY_OF_MONTH = 'DAY_OF_MONTH'
    DAY_OF_YEAR = 'DAY_OF_YEAR'
    DAY_OF_QUARTER = 'DAY_OF_QUARTER'
    WEEK_OF_YEAR = 'WEEK_OF_YEAR'
    WEEK_OF_YEAR_EU = 'WEEK_OF_YEAR_EU'
    WEEK_OF_QUARTER_EU = 'WEEK_OF_QUARTER_EU'
    WEEK_OF_QUARTER = 'WEEK_OF_QUARTER'
    MONTH_OF_YEAR = 'MONTH_OF_YEAR'
    MONTH_OF_QUARTER = 'MONTH_OF_QUARTER'
    QUARTER_OF_YEAR = 'QUARTER_OF_YEAR'
    FISCAL_YEAR = 'FISCAL_YEAR'
    FISCAL_QUARTER = 'FISCAL_QUARTER'
    FISCAL_MONTH = 'FISCAL_MONTH'


class Description(RootModel[constr(max_length=10000)]):
    root: constr(max_length=10000)


class Locale(RootModel[constr(pattern=r'^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{1,8})*$')]):
    root: constr(pattern=r'^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{1,8})*$') = Field(
        ...,
        description='Locale string in BCP 47 format (for example en-US or cs-CZ-u-kn-true).',
        title='Locale',
    )


class Type73(Enum):
    metric = 'metric'


class Type74(Enum):
    parameter = 'parameter'


class Type75(Enum):
    plugin = 'plugin'


class PublisherColorValueV2(
    RootModel[
        constr(
            pattern=r'^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d*\.?\d+\s*)?\)|\{theme\.(colors\.(backgrounds|texts|lines)\.[A-Za-z0-9_-]+|palette\.(primary|success|error|warning))\})$'
        )
    ]
):
    root: constr(
        pattern=r'^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d*\.?\d+\s*)?\)|\{theme\.(colors\.(backgrounds|texts|lines)\.[A-Za-z0-9_-]+|palette\.(primary|success|error|warning))\})$'
    ) = Field(
        ...,
        description='A theme color reference such as {theme.palette.primary}, or #rgb, #rrggbb, #rrggbbaa, or rgb() with 3 or 4 arguments.',
        title='Publisher Color Value V2',
    )


class BackgroundFit(Enum):
    cover = 'cover'
    contain = 'contain'
    fill = 'fill'
    tile = 'tile'


class HorizontalAlign(Enum):
    left = 'left'
    center = 'center'
    right = 'right'
    justify = 'justify'


class FontStyle(Enum):
    normal = 'normal'
    italic = 'italic'


class TextTransform(Enum):
    none = 'none'
    uppercase = 'uppercase'
    lowercase = 'lowercase'
    capitalize = 'capitalize'


class TextOverflow(Enum):
    shrink = 'shrink'
    clip = 'clip'
    ellipsis = 'ellipsis'


class Type76(Enum):
    document_template = 'document_template'


class Version5(Enum):
    field_2 = '2'


class Type77(Enum):
    document = 'document'


class PublisherEntityDescriptionV2(RootModel[constr(min_length=1, max_length=10000)]):
    root: constr(min_length=1, max_length=10000) = Field(
        ...,
        description='An optional description.',
        title='Publisher Entity Description V2',
    )


class PublisherEntityTagsV2Item(RootModel[constr(min_length=1)]):
    root: constr(min_length=1)


class PublisherEntityTagsV2(RootModel[list[PublisherEntityTagsV2Item]]):
    root: list[PublisherEntityTagsV2Item] = Field(
        ...,
        description='A list of strings - metadata tags.',
        title='Publisher Entity Tags V2',
    )


class PublisherEntityTitleV2(RootModel[constr(min_length=1, max_length=255)]):
    root: constr(min_length=1, max_length=255) = Field(
        ..., description='A human readable title.', title='Publisher Entity Title V2'
    )


class PublisherImageSourceV2(
    RootModel[
        constr(
            pattern=r'^(\{theme\.(logo|coverImage|assets\.(logos|images)\.[A-Za-z0-9_-]+)\}|https://\S+)$'
        )
    ]
):
    root: constr(
        pattern=r'^(\{theme\.(logo|coverImage|assets\.(logos|images)\.[A-Za-z0-9_-]+)\}|https://\S+)$'
    ) = Field(
        ...,
        description='A theme image reference such as {theme.logo}, or an https URL, which may contain text variables.',
        title='Publisher Image Source V2',
    )


class Fit(Enum):
    contain = 'contain'
    cover = 'cover'
    fill = 'fill'


class Kind(Enum):
    cover = 'cover'
    section = 'section'
    content = 'content'


class PublisherPageNodeIdV2(RootModel[constr(pattern=r'^[A-Za-z0-9_.-]{1,64}$')]):
    root: constr(pattern=r'^[A-Za-z0-9_.-]{1,64}$') = Field(
        ..., title='Publisher Page Node Id V2'
    )


class PublisherPageProportionV2(RootModel[PositiveFloat]):
    root: PositiveFloat = Field(
        ...,
        description='Share of the parent container this node takes, relative to its siblings. Defaults to 1.',
        title='Publisher Page Proportion V2',
    )


class Type78(Enum):
    page_template = 'page_template'


class Granularity4(Enum):
    SECOND = 'SECOND'
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    FISCAL_YEAR = 'FISCAL_YEAR'
    FISCAL_QUARTER = 'FISCAL_QUARTER'
    FISCAL_MONTH = 'FISCAL_MONTH'


class PublisherPeriodV21(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    granularity: Granularity4
    from_: int = Field(
        ..., alias='from', description='Offset from the current period, for example -1.'
    )
    to: int = Field(..., description='Offset from the current period, for example -1.')


class PublisherPeriodV22(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    from_: constr(pattern=r'^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$') = Field(
        ..., alias='from', description='YYYY-MM-DD.'
    )
    to: constr(pattern=r'^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$') = Field(
        ..., description='YYYY-MM-DD.'
    )


class PublisherPeriodV2(RootModel[PublisherPeriodV21 | PublisherPeriodV22]):
    root: PublisherPeriodV21 | PublisherPeriodV22 = Field(
        ...,
        description='The period the document reports on, in the date filter grammar without a dataset. Numbers for from and to make it relative; dates make it absolute. Both ends are inclusive.',
        title='Publisher Period V2',
    )


class PublisherPxV2(RootModel[confloat(ge=0.0)]):
    root: confloat(ge=0.0) = Field(
        ...,
        description="Pixels on the page's design canvas (1920 x 1080 for widescreen).",
        title='Publisher Px V2',
    )


class Context(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    widgets: list[PublisherPageNodeIdV2] | None = Field(
        None,
        description='Ids of the widgets on this page the takeaway is generated from.',
    )
    page_title: bool | None = None
    filters: bool | None = None
    other_pages: bool | None = None


class PublisherTakeawayGenerationV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    instructions: constr(min_length=1) | None = Field(
        None, description='Instructions the takeaway is generated with.'
    )
    context: Context | None = Field(None, title='Publisher Takeaway Context V2')


class PublisherWidgetPlaceholderV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    hint: constr(min_length=1) | None = Field(
        None, description='Authoring hint shown in the empty widget.'
    )
    required: bool | None = None


class Type79(Enum):
    report = 'report'


class ReportPageFormat(Enum):
    widescreen = 'widescreen'
    a4Portrait = 'a4Portrait'
    letterPortrait = 'letterPortrait'


class ReportPageKind(Enum):
    cover = 'cover'
    section = 'section'
    content = 'content'


class ReportPeriod(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    start: constr(pattern=r'^\d{4}-\d{2}-\d{2}$') = Field(
        ...,
        description='Start of the period the document covers, ISO 8601 date (YYYY-MM-DD), inclusive.',
    )
    end: constr(pattern=r'^\d{4}-\d{2}-\d{2}$') = Field(
        ...,
        description='End of the period the document covers, ISO 8601 date (YYYY-MM-DD), inclusive.',
    )


class ReportPlaceholder1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    hint: str | None = Field(
        None, description='Authoring hint shown in the empty slot.'
    )
    required: bool | None = Field(
        None,
        description='When true, a document is not considered complete until this slot is filled.',
    )


class ReportPlaceholder(RootModel[bool | str | ReportPlaceholder1]):
    root: bool | str | ReportPlaceholder1 = Field(
        ...,
        description='Metadata of a slot intentionally left unfilled. A bare true marks it required; a bare string is the authoring hint.',
        title='Report Slot Placeholder',
    )


class ReportSlotId(RootModel[Identifier]):
    root: Identifier = Field(
        ...,
        description='An id for this area, unique within the page. It is what a document fills when it takes this page from a template, so an id written down here survives edits to the layout around it.',
    )


class ReportText1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    text: str | None = Field(
        None,
        description='Markdown with {variable} placeholders. Alongside a prompt this is the materialized generation, stored so the document renders without re-invoking AI.',
    )
    prompt: str | None = Field(
        None,
        description='Instruction for the generator. Its presence makes this an AI-written text; supports {variables}.',
    )
    generated_at: str | None = Field(
        None,
        description='ISO 8601 timestamp of the stored generation. Only meaningful alongside a prompt.',
    )


class ReportText(RootModel[str | ReportText1]):
    root: str | ReportText1 = Field(
        ...,
        description='A bare string is the text itself. AI-written text is a mapping carrying the prompt and the generation it produced.',
        title='Report Text',
    )


class ReportWeight(RootModel[float]):
    root: float = Field(
        ...,
        description='Fractional weight of this node inside its parent. Defaults to 1; sibling weights [2, 1] render a 2/3 + 1/3 split.',
        title='Report Layout Weight',
    )


class Type80(Enum):
    report_page_layout = 'report_page_layout'


class Type81(Enum):
    report_template = 'report_template'


class Title(RootModel[constr(max_length=255)]):
    root: constr(max_length=255)


class Type82(Enum):
    table = 'table'


class Type83(Enum):
    bar_chart = 'bar_chart'


class Type84(Enum):
    column_chart = 'column_chart'


class Type85(Enum):
    line_chart = 'line_chart'


class Type86(Enum):
    area_chart = 'area_chart'


class Type87(Enum):
    scatter_chart = 'scatter_chart'


class Type88(Enum):
    bubble_chart = 'bubble_chart'


class Type89(Enum):
    pie_chart = 'pie_chart'


class Type90(Enum):
    donut_chart = 'donut_chart'


class Type91(Enum):
    treemap_chart = 'treemap_chart'


class Type92(Enum):
    pyramid_chart = 'pyramid_chart'


class Type93(Enum):
    funnel_chart = 'funnel_chart'


class Type94(Enum):
    heatmap_chart = 'heatmap_chart'


class Type95(Enum):
    bullet_chart = 'bullet_chart'


class Type96(Enum):
    waterfall_chart = 'waterfall_chart'


class Type97(Enum):
    dependency_wheel_chart = 'dependency_wheel_chart'


class Type98(Enum):
    sankey_chart = 'sankey_chart'


class Type99(Enum):
    headline_chart = 'headline_chart'


class Type100(Enum):
    combo_chart = 'combo_chart'


class Type101(Enum):
    geo_chart = 'geo_chart'


class Type102(Enum):
    geo_area_chart = 'geo_area_chart'


class Type103(Enum):
    repeater_chart = 'repeater_chart'


class Type104(Enum):
    radar_chart = 'radar_chart'


class PublisherBorderLineStyleV2(Enum):
    solid = 'solid'
    dashed = 'dashed'
    dotted = 'dotted'
    none = 'none'


class Takeaway(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    generation: PublisherTakeawayGenerationV2 | None = Field(
        None, description="Combined with each takeaway widget's own generation."
    )


class PublisherGapValueV21(Enum):
    field_theme_spacing_gap_compact_ = '{theme.spacing.gap.compact}'
    field_theme_spacing_gap_normal_ = '{theme.spacing.gap.normal}'
    field_theme_spacing_gap_spacious_ = '{theme.spacing.gap.spacious}'


class PublisherGapValueV2(RootModel[confloat(ge=0.0) | PublisherGapValueV21]):
    root: confloat(ge=0.0) | PublisherGapValueV21 = Field(
        ...,
        description='Space between children, in pixels or as a theme spacing reference.',
        title='Publisher Gap Value V2',
    )


class PublisherHorizontalAlignV2(Enum):
    left = 'left'
    center = 'center'
    right = 'right'


class PublisherOpacityV2(RootModel[confloat(ge=0.0, le=1.0)]):
    root: confloat(ge=0.0, le=1.0) = Field(..., title='Publisher Opacity V2')


class PublisherPaddingValueV21(Enum):
    field_theme_spacing_padding_compact_ = '{theme.spacing.padding.compact}'
    field_theme_spacing_padding_normal_ = '{theme.spacing.padding.normal}'
    field_theme_spacing_padding_spacious_ = '{theme.spacing.padding.spacious}'


class PublisherPaddingValueV2(RootModel[confloat(ge=0.0) | PublisherPaddingValueV21]):
    root: confloat(ge=0.0) | PublisherPaddingValueV21 = Field(
        ...,
        description='Inner spacing, in pixels or as a theme spacing reference.',
        title='Publisher Padding Value V2',
    )


class PublisherPageSizeV2(Enum):
    widescreen = 'widescreen'


class PublisherRadiusValueV21(Enum):
    field_theme_corners_small_ = '{theme.corners.small}'
    field_theme_corners_medium_ = '{theme.corners.medium}'
    field_theme_corners_large_ = '{theme.corners.large}'
    field_theme_corners_full_ = '{theme.corners.full}'


class PublisherRadiusValueV2(RootModel[confloat(ge=0.0) | PublisherRadiusValueV21]):
    root: confloat(ge=0.0) | PublisherRadiusValueV21 = Field(
        ...,
        description='Corner radius, in pixels or as a theme corner reference.',
        title='Publisher Radius Value V2',
    )


class PublisherShadowValueV2(
    RootModel[constr(pattern=r'^(none|\{theme\.shadows\.[A-Za-z0-9_-]+\})$')]
):
    root: constr(pattern=r'^(none|\{theme\.shadows\.[A-Za-z0-9_-]+\})$') = Field(
        ...,
        description='"none" or a {theme.shadows.<name>} reference.',
        title='Publisher Shadow Value V2',
    )


class PublisherTextStyleNameV2(Enum):
    title = 'title'
    h1 = 'h1'
    h2 = 'h2'
    h3 = 'h3'
    h4 = 'h4'
    h5 = 'h5'
    h6 = 'h6'
    largeText = 'largeText'
    normalText = 'normalText'
    smallText = 'smallText'


class PublisherVerticalAlignV2(Enum):
    top = 'top'
    center = 'center'
    bottom = 'bottom'


class ReportAlignment(Enum):
    start = 'start'
    center = 'center'
    end = 'end'


class ReportImageStyle(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    horizontal_align: ReportAlignment | None = None
    vertical_align: ReportAlignment | None = None


class ReportTextType(Enum):
    h1 = 'h1'
    h2 = 'h2'
    h3 = 'h3'
    h4 = 'h4'
    h5 = 'h5'
    h6 = 'h6'
    largeText = 'largeText'
    normalText = 'normalText'
    smallText = 'smallText'


class ReportBackgroundImage1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    ref: Identifier = Field(
        ...,
        description='An id of an image already written down elsewhere on this page, drawn here as well.',
    )


class ReportBackgroundImage2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: ReportSlotId
    url: str | None = Field(
        None,
        description='Image URL, supporting {variables} - a logo uses {logo}. Mutually exclusive with asset.',
    )
    asset: Identifier | None = Field(
        None,
        description='Backend-managed asset rendered as the image. Mutually exclusive with url.',
    )
    alt_text: str | None = None
    fit: Fit | None = Field(
        None,
        description='How the image fills its area: kept whole inside it, filling it and cropped to do so, or stretched to its shape. Defaults to contain.',
    )
    style: ReportImageStyle | None = None
    placeholder: ReportPlaceholder | None = None


class ReportBackgroundImage(RootModel[ReportBackgroundImage1 | ReportBackgroundImage2]):
    root: ReportBackgroundImage1 | ReportBackgroundImage2 = Field(
        ...,
        description='The image a box paints behind its content. It is drawn from a slot of its own, which is what keeps a backdrop fillable and gives it placeholder metadata, so it is written down with an id - or it names an image another box on the page already wrote down.',
        title='Report Background Image',
    )


class AttributeHierarchy1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the attribute hierarchy.'
    )
    type: Type
    title: Title | None = Field(
        None,
        description='An optional human readable title for the attribute hierarchy. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the attribute hierarchy.'
    )
    tags: Tags | None = Field(
        None,
        description='A list of strings - metadata tags of this attribute hierarchy.',
    )
    attributes: list[AttributeIdentifier] = Field(
        ...,
        description='A list of sorted attributes use in attribute hierarchy. The first attribute is the top level attribute.',
        min_length=1,
    )


class DashboardAbsoluteDateFilter(BaseModel):
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type1
    granularity: DateFilterGranularity | None = None
    from_: (
        constr(
            pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})(?: ([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?)?$'
        )
        | None
    ) = Field(
        None,
        alias='from',
        description='A period start as YYYY-MM-DD, or YYYY-MM-DD HH:mm for hour/minute, or YYYY-MM-DD HH:mm:ss for hour/minute/second granularities',
    )
    to: (
        constr(
            pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})(?: ([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?)?$'
        )
        | None
    ) = Field(
        None,
        description='A period end as YYYY-MM-DD, or YYYY-MM-DD HH:mm for hour/minute, or YYYY-MM-DD HH:mm:ss for hour/minute/second granularities',
    )
    mode: Mode | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    empty_values: EmptyValues | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )
    date: Identifier | None = Field(
        None, description='An id of the date dataset to be used for date filter'
    )


class DashboardRelativeDateFilter(BaseModel):
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type1
    granularity: DateFilterGranularity | None = None
    from_: float = Field(
        ..., alias='from', description='A period start as number, from today'
    )
    to: float = Field(..., description='A period end as number, from today')
    mode: Mode | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    empty_values: EmptyValues | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )
    date: Identifier | None = Field(
        None, description='An id of the date dataset to be used for date filter'
    )


class DashboardAttributeFilter1(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type3
    using: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    multiselect: bool | None = Field(
        None, description='Whether the filter should allow multiple selection'
    )
    mode: Mode2 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    selection_type: SelectionType | None = Field(
        None,
        description="Controls which filter presentation types are available to the user in View mode. 'list' means only elements/list selection, 'text' means only text-based filtering, 'listOrText' means both types are available.",
    )
    parents: list[str | Parents] | None = Field(
        None, description='An ids of the parent local attribute or label filter'
    )
    metric_filters: list[str] | None = Field(
        None,
        description='An id of the attributes, labels, facts or metrics to validate the filter by',
    )
    state: DashboardStateSelect | None = None


class DashboardAttributeFilter2(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type3
    using: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    multiselect: bool | None = Field(
        None, description='Whether the filter should allow multiple selection'
    )
    mode: Mode2 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='If specified, the attribute filter will display the elements in selected label form.',
        title='Display As Label Identifier',
    )
    selection_type: SelectionType | None = Field(
        None,
        description="Controls which filter presentation types are available to the user in View mode. 'list' means only elements/list selection, 'text' means only text-based filtering, 'listOrText' means both types are available.",
    )
    parents: list[str | Parents] | None = Field(
        None, description='An ids of the parent local attribute or label filter'
    )
    metric_filters: list[str] | None = Field(
        None,
        description='An id of the attributes, labels, facts or metrics to validate the filter by',
    )
    state: DashboardStateMultiselect | None = None


class DashboardAttributeFilter(
    RootModel[DashboardAttributeFilter1 | DashboardAttributeFilter2]
):
    root: DashboardAttributeFilter1 | DashboardAttributeFilter2 = Field(
        ...,
        description='A dashboard attribute filter',
        title='Dashboard attribute filter',
    )


class DashboardMetricValueFilter(BaseModel):
    type: Type7
    title: str | None = Field(
        None,
        description='Optional custom title of the filter to display in the filter bar.',
    )
    using: MetricIdentifier = Field(
        ..., description='Reference to the metric being filtered.'
    )
    conditions: list[MvfCondition] | None = Field(
        None,
        description='OR-ed list of conditions. Empty or omitted means "All" (no filtering).',
    )
    dimensionality: list[LabelIdentifier | ComputedAttributeIdentifier] | None = Field(
        None,
        description='Optional array of label or computed attribute references to apply dimensionality to the filter.',
    )
    null_values_as_zero: bool | None = Field(
        None, description='Null values will be treated as zero during comparisons.'
    )
    mode: Mode6 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )


class DashboardFiltersNoGroups(
    RootModel[
        dict[
            str,
            DashboardAbsoluteDateFilter
            | DashboardRelativeDateFilter
            | DashboardAttributeFilter
            | DashboardTextFilter
            | DashboardMetricValueFilter,
        ]
    ]
):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        DashboardAbsoluteDateFilter
        | DashboardRelativeDateFilter
        | DashboardAttributeFilter
        | DashboardTextFilter
        | DashboardMetricValueFilter,
    ] = Field(
        ...,
        description='Dashboard filters that cannot contain filter groups - only attribute, date, text, and metric value filters',
        title='Dashboard Filters (no groups)',
    )


class QueryDateFilter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type9
    using: str = Field(
        ..., description='Date dataset identifier to use for this field.'
    )
    granularity: Granularity = Field(
        ..., description='A granularity to use in relative date filter'
    )
    from_: float | None = Field(
        None,
        alias='from',
        description='A relative granularity from which the filter will be applied.',
    )
    to: float | None = Field(
        None, description='A relative granularity to which the filter will be applied.'
    )
    with_: (
        dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), QueryAttributeFilter]
        | None
    ) = Field(
        None,
        alias='with',
        description='Attribute filters to apply together with this date filter.',
    )
    empty_values: EmptyValues | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )


class QueryDateFilter2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type9
    using: str = Field(
        ..., description='Date dataset identifier to use for this field.'
    )
    from_: (
        constr(
            pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})(?: ([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?)?$'
        )
        | None
    ) = Field(
        None,
        alias='from',
        description='A date from which the filter will be applied. YYYY-MM-DD, or YYYY-MM-DD HH:mm for hour/minute, or YYYY-MM-DD HH:mm:ss for hour/minute/second granularities.',
    )
    to: (
        constr(
            pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})(?: ([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?)?$'
        )
        | None
    ) = Field(
        None,
        description='A date to which the filter will be applied. YYYY-MM-DD, or YYYY-MM-DD HH:mm for hour/minute, or YYYY-MM-DD HH:mm:ss for hour/minute/second granularities.',
    )
    with_: (
        dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), QueryAttributeFilter]
        | None
    ) = Field(
        None,
        alias='with',
        description='Attribute filters to apply together with this date filter.',
    )
    empty_values: EmptyValues | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )


class QueryDateFilter(RootModel[QueryDateFilter1 | QueryDateFilter2]):
    root: QueryDateFilter1 | QueryDateFilter2 = Field(..., title='Date Filter')


class ComputedAttribute1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ...,
        description='A unique identifier of the computed attribute. Must not collide with the identifier of an attribute or a label.',
    )
    type: Type20
    title: Title | None = Field(
        None,
        description='An optional human readable title for the computed attribute. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the computed attribute.'
    )
    tags: Tags | None = Field(
        None,
        description='A list of strings - metadata tags of this computed attribute.',
    )
    maql: str = Field(
        ...,
        description='Define MAQL syntax for the computed attribute. Values are assigned with break points written as CASE WHEN branches over a metric, and the first matching branch wins.',
    )
    format: str | None = Field(
        None,
        description='An optional Excel-like format string applied to the computed values.',
    )
    metric_type: MetricType | None = Field(
        None,
        description='An optional categorization of the computed values semantics, for example currency.',
    )
    data_type: DataType | None = Field(
        None,
        description='An optional data type of the computed values. Defaults to STRING on the backend.',
    )
    value_type: ValueType | None = Field(
        None,
        description='An optional specific type of the computed values. Defaults to TEXT on the backend.',
    )
    is_nullable: bool | None = Field(
        None,
        description='Optional flag to indicate if the computed attribute can contain null values.',
    )
    null_value_join_replacement: str | None = Field(
        None,
        description='Optional value which can be used as replacement for NULL in join conditions.',
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the computed attribute should be shown in AI results. When omitted, the computed attribute is visible.',
    )
    locale: Locale | None = Field(
        None,
        description='An optional locale in BCP 47 format (for example en-US) whose collation order the computed values are sorted by.',
    )


class ColorItems(RootModel[dict[str, ComplexColorItem]]):
    root: dict[str, ComplexColorItem]


class ColorDefinition(BaseModel):
    total: SimpleColorItem | None = None
    negative: SimpleColorItem | None = None
    positive: SimpleColorItem | None = None


class Plugins(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='An unique identifier of the plugin.')
    parameters: dict[str, Any] | list[Any] | str | float | bool | None = Field(
        None,
        description='Parameter that will be passed to the plugin. Everything other than string will be serialized to JSON automatically.',
    )


class Permissions(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    VIEW: Permission | None = None
    EDIT: Permission | None = None
    SHARE: Permission | None = None


class TimezoneConfig(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    timezone_id: TimezoneId | None = Field(
        None,
        description='Dashboard default timezone. Use an IANA timezone ID or $browserDetected. If omitted, the workspace or organization timezone setting is used.',
    )
    show_timezone_info: bool | None = Field(
        None, description='Whether the dashboard timezone indicator is visible.'
    )
    allow_user_override_in_view_mode: bool | None = Field(
        None,
        description='Whether viewers can override the dashboard timezone for their current session.',
    )


class Widget1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier | None = Field(
        None, description='A unique identifier of the widget.'
    )
    content: str = Field(..., description='A markdown content of the widget')
    columns: Columns | None = Field(
        None,
        description='An optional width of the widget in the grid, total width being 12 columns',
    )
    rows: float | None = Field(
        None,
        description='An optional height of the widget in the grid, each row being ~20px high',
    )


class InteractionOpenPlainUrl(BaseModel):
    click_on: InteractionClickOn
    open_url: str = Field(..., description='An url to be opened on interaction')
    ignored_intersection_attributes: InteractionIgnoredIntersectionAttributes | None = (
        None
    )


class OpenUrl(BaseModel):
    href: AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier | None = (
        Field(
            None,
            description='An ID of the attribute that holds the url to be opened on interaction',
        )
    )
    label: (
        AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier | None
    ) = Field(
        None,
        description='An id of the attribute that holds the label for the url to be opened on interaction',
    )


class InteractionOpenParamUrl(BaseModel):
    click_on: InteractionClickOn
    open_url: OpenUrl
    ignored_intersection_attributes: InteractionIgnoredIntersectionAttributes | None = (
        None
    )


class InteractionOpenDashboard(BaseModel):
    click_on: InteractionClickOn
    open_dashboard: str = Field(
        ..., description='An id of the dashboard to be opened on interaction'
    )
    open_dashboard_tab: str | None = Field(
        None,
        description='An optional id of the tab to be opened in the target dashboard',
    )
    filters: InteractionFilters | None = None


class InteractionOpenVisualization(BaseModel):
    click_on: InteractionClickOn
    open_visualization: str = Field(
        ..., description='An id of the visualization to be opened on interaction'
    )
    filters: InteractionFilters | None = None


class DateDataset1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the date instance.')
    type: Type25
    title: Title | None = Field(
        None,
        description='An optional human readable title for the date instance. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the date instance.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this date instance.'
    )
    title_base: constr(max_length=255) | None = Field(
        None, description='A title for the title formatting'
    )
    title_pattern: constr(max_length=255) | None = Field(
        None, description='A pattern for the title formatting'
    )
    granularities: list[Granularity1] | None = None


class Reference(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    dataset: constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ..., description='A dataset id to join to.'
    )
    sources: list[Source] = Field(
        ..., description='A primary key for the given dataset.'
    )
    multi_directional: bool | None = Field(
        None,
        description='Defines if dataset connection can work in both directions. Optional, defaults to false.',
    )


class WorkspaceDataFilter(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    filter_id: str = Field(
        ..., description='Filter identifier to be applied to the dataset source column.'
    )
    source_column: SourceColumn
    data_type: DataType = Field(
        ..., description='A column data type in the physical database.'
    )


class Fact(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type27
    title: Title | None = Field(
        None,
        description='A human readable title of the field. Optional, derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the field.'
    )
    tags: Tags | None = None
    source_column: SourceColumn | None = Field(
        None,
        description='A column name in the physical database. Optional, equals to id by default.',
    )
    data_type: DataType = Field(
        ..., description='A column data type in the physical database.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the fact should be shown in AI results. When omitted, the fact is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    is_nullable: bool | None = Field(
        None,
        description='Optional flag to indicate if the fact can contain null values.',
    )
    null_value_join_replacement: str | None = Field(
        None,
        description='Optional value which can be used as replacement for NULL in join conditions.',
    )


class AggregatedFact(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type28
    description: Description | None = Field(
        None, description='An optional description of the field.'
    )
    tags: Tags | None = None
    source_column: SourceColumn | None = Field(
        None,
        description='A column name in the physical database. Optional, equals to id by default.',
    )
    data_type: DataType = Field(
        ..., description='A column data type in the physical database.'
    )
    aggregated_as: AggregatedAs = Field(
        ...,
        description='Aggregation method for the fact. Mapped to sourceFactReference in the API.',
    )
    assigned_to: str = Field(
        ...,
        description='ID of the source fact this aggregated fact is based on. Mapped to sourceFactReference in the API.',
    )
    is_nullable: bool | None = Field(
        None,
        description='Optional flag to indicate if the aggregated fact can contain null values.',
    )
    null_value_join_replacement: str | None = Field(
        None,
        description='Optional value which can be used as replacement for NULL in join conditions.',
    )


class LabelTranslation(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    source_column: SourceColumn = Field(
        ..., description='Column that stores the localized label values.'
    )
    locale: Locale = Field(
        ...,
        description='Locale string in BCP 47 format that identifies the translation.',
    )


class Metric1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the metric.')
    type: Type31
    title: Title | None = Field(
        None,
        description='An optional human readable title for the metric. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the metric.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this metric.'
    )
    maql: str = Field(..., description='Define MAQL syntax for metric.')
    format: str | None = Field(None, description='Metric value default format')
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the metric should be shown in AI results. When omitted, the metric is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )


class PublisherChartStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    font_size: PublisherPxV2 | None = None
    text_color: PublisherColorValueV2 | None = None
    axis_line_color: PublisherColorValueV2 | None = None
    axis_name_color: PublisherColorValueV2 | None = None
    axis_name_size: PublisherPxV2 | None = None
    axis_value_color: PublisherColorValueV2 | None = None
    axis_value_size: PublisherPxV2 | None = None
    grid_color: PublisherColorValueV2 | None = None
    plot_line_color: PublisherColorValueV2 | None = None
    legend_color: PublisherColorValueV2 | None = None
    legend_size: PublisherPxV2 | None = None
    data_label_color: PublisherColorValueV2 | None = None
    data_label_size: PublisherPxV2 | None = None


class PublisherTableStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    font_size: PublisherPxV2 | None = None
    row_height: PublisherPxV2 | None = None
    grid_color: PublisherColorValueV2 | None = None
    value_color: PublisherColorValueV2 | None = None
    null_value_color: PublisherColorValueV2 | None = None
    header_label_color: PublisherColorValueV2 | None = None
    header_background_color: PublisherColorValueV2 | None = None
    total_value_color: PublisherColorValueV2 | None = None
    total_background_color: PublisherColorValueV2 | None = None
    subtotal_background_color: PublisherColorValueV2 | None = None


class PublisherHeadlineStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    primary_value_color: PublisherColorValueV2 | None = None
    primary_value_size: PublisherPxV2 | None = None
    secondary_value_color: PublisherColorValueV2 | None = None
    secondary_value_size: PublisherPxV2 | None = None
    positive_color: PublisherColorValueV2 | None = None
    negative_color: PublisherColorValueV2 | None = None


class Constraints(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    minLength: conint(ge=0) | None = Field(
        None, description='The shortest accepted value length, inclusive.'
    )
    maxLength: conint(ge=0) | None = Field(
        None, description='The longest accepted value length, inclusive.'
    )
    allowedValues: list[ParameterAllowedValue] | None = Field(
        None,
        description='When present, the parameter value must equal one of the listed values.',
        min_length=1,
    )


class StringParameterDefinition(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type41
    defaultValue: str = Field(
        ..., description='The value used whenever the parameter is not overridden.'
    )
    constraints: Constraints | None = Field(
        None,
        description="Optional restrictions the parameter value must satisfy. Length bounds and 'allowedValues' are mutually exclusive.",
        title='String Parameter Constraints',
    )


class Plugin1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the plugin.')
    type: Type43
    title: Title | None = Field(
        None,
        description='An optional human readable title for the plugin. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the plugin.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this plugin.'
    )
    url: constr(
        pattern=r'[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)'
    ) = Field(..., description='URL of the plugin.')


class QueryField1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    aggregation: Aggregation | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: (
        str
        | list[str]
        | constr(pattern=r'^attribute/(?!\.)[.A-Za-z0-9_-]{1,255}$')
        | constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$')
        | constr(pattern=r'^computed_attribute/(?!\.)[.A-Za-z0-9_-]{1,255}$')
        | constr(pattern=r'^fact/(?!\.)[.A-Za-z0-9_-]{1,255}$')
    ) = Field(..., description='Attribute or label identifier to use for this field.')
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type44 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )
    title: Title | None = Field(None, description='A field title.')
    show_all_values: bool | None = Field(
        None,
        description='Show all values in the attribute filter (do not ignore empty and NULL).',
    )


class QueryField7(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    aggregation: Aggregation6 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str = Field(..., description='Define MAQL syntax for metric.')
    operator: Operator6 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type50 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )
    title: Title | None = Field(None, description='A field title.')


class QueryField9(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    aggregation: Aggregation8 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: list[str] = Field(..., max_length=2, min_length=2)
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator7 = Field(
        ..., description='Arithmetic operator to use for this field.'
    )
    type: Type52 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )
    title: Title | None = Field(None, description='A field title.')


class QueryField11(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    aggregation: Aggregation10 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] = Field(..., description='Identifier to use for this field.')
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator10 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type54 = Field(
        ...,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str = Field(..., description='Date filter to use for this field.')
    title: Title | None = Field(None, description='A field title.')


class QueryField13(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    aggregation: Aggregation12 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] = Field(..., description='Identifier to use for this field.')
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator12 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type56 = Field(
        ...,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str = Field(..., description='Date filter to use for this field.')
    title: Title | None = Field(None, description='A field title.')
    period: confloat(ge=1.0) | None = Field(
        None, description='Number of periods ago to use for this field.'
    )


class QueryAttributeSort(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type58
    by: str | AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = (
        Field(..., description='Local attribute or label to use in this sort.')
    )
    direction: Direction = Field(..., description='Sort direction.')
    aggregation: Aggregation14 | None = Field(
        None, description='Aggregation function to use for this sort.'
    )


class Metrics(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    by: str | AttributeIdentifier | LabelIdentifier | ComputedAttributeIdentifier = (
        Field(..., description='Local attribute or label to use in this sort.')
    )
    element: str | None = Field(
        None, description='Value of attribute or label to use for this sort.'
    )
    function: Function | None = Field(
        None, description='Aggregation function to use for this sort.'
    )


class QueryMetricSort(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type59
    direction: Direction = Field(..., description='Sort direction.')
    metrics: list[str | Metrics] = Field(..., min_length=1)


class LayerItem2(BaseModel):
    type: Literal['area']
    view_by: list[BucketGeoAreaItem] | None = Field(
        None, description='A list of view by locations in this layer.'
    )


class TotalItem(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type63
    title: Title | None = Field(None, description='A total title.')
    using: str = Field(
        ..., description='Local metric identifier to use for this total.'
    )


class AttributeHierarchy(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the attribute hierarchy.'
    )
    type: Type65
    title: Title | None = Field(
        None,
        description='An optional human readable title for the attribute hierarchy. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the attribute hierarchy.'
    )
    tags: Tags | None = Field(
        None,
        description='A list of strings - metadata tags of this attribute hierarchy.',
    )
    attributes: list[AttributeIdentifier] = Field(
        ...,
        description='A list of sorted attributes use in attribute hierarchy. The first attribute is the top level attribute.',
        min_length=1,
    )


class ComputedAttribute(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ...,
        description='A unique identifier of the computed attribute. Must not collide with the identifier of an attribute or a label.',
    )
    type: Type66
    title: Title | None = Field(
        None,
        description='An optional human readable title for the computed attribute. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the computed attribute.'
    )
    tags: Tags | None = Field(
        None,
        description='A list of strings - metadata tags of this computed attribute.',
    )
    maql: str = Field(
        ...,
        description='Define MAQL syntax for the computed attribute. Values are assigned with break points written as CASE WHEN branches over a metric, and the first matching branch wins.',
    )
    format: str | None = Field(
        None,
        description='An optional Excel-like format string applied to the computed values.',
    )
    metric_type: MetricType | None = Field(
        None,
        description='An optional categorization of the computed values semantics, for example currency.',
    )
    data_type: DataType | None = Field(
        None,
        description='An optional data type of the computed values. Defaults to STRING on the backend.',
    )
    value_type: ValueType2 | None = Field(
        None,
        description='An optional specific type of the computed values. Defaults to TEXT on the backend.',
    )
    is_nullable: bool | None = Field(
        None,
        description='Optional flag to indicate if the computed attribute can contain null values.',
    )
    null_value_join_replacement: str | None = Field(
        None,
        description='Optional value which can be used as replacement for NULL in join conditions.',
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the computed attribute should be shown in AI results. When omitted, the computed attribute is visible.',
    )
    locale: Locale | None = Field(
        None,
        description='An optional locale in BCP 47 format (for example en-US) whose collation order the computed values are sorted by.',
    )


class Config(BaseModel):
    widths: list[WidthItem] | None = Field(
        None, description='A list of widths in this visualisation.'
    )
    colors: ColorItems | None = Field(
        None, description='A map of colors in this visualisation.'
    )
    color: ColorDefinition | None = Field(
        None, description='A map of color definition in this visualisation.'
    )
    column_header: str | None = None
    metrics_in: str | None = None
    data_labels: bool | Literal['auto'] | None = None
    data_labels_style: DataLabelsStyle | None = None
    chart_fill: ChartFill | None = None
    data_points: bool | Literal['auto'] | None = None
    line_shape: LineShape | None = Field(
        None,
        description='Line shape with regards to data points (i.e. line interpolation).',
    )
    data_totals: bool | Literal['auto'] | None = None
    orientation: str | None = None
    legend_enabled: bool | None = None
    legend_position: str | None = None
    xaxis_format: str | None = None
    xaxis_max: float | None = None
    xaxis_min: float | None = None
    xaxis_name_position: str | None = None
    xaxis_name_visible: bool | None = None
    xaxis_rotation: str | None = None
    xaxis_visible: bool | None = None
    xaxis_labels: bool | None = None
    yaxis_name_position: str | None = None
    yaxis_name_visible: bool | None = None
    yaxis_rotation: str | None = None
    yaxis_visible: bool | None = None
    yaxis_labels: bool | None = None
    yaxis_format: str | None = None
    yaxis_max: float | None = None
    yaxis_min: float | None = None
    grid_enabled: bool | None = None
    stack_measures_to_100: bool | None = None
    stack_measures: bool | None = None
    continuous_line: bool | None = None
    render_as: RenderAs | None = None
    grid_line_shape: GridLineShape | None = None
    distinct_point_shapes: DistinctPointShapes | None = None
    total_enabled: bool | None = None
    total_name: str | None = None
    comparison_enabled: bool | None = None
    comparison_type: str | None = None
    format: str | None = None
    position: str | None = None
    indicator_arrow: bool | None = None
    indicator_colors: bool | None = None
    indicator_color_equals: SimpleColorItem | None = None
    indicator_color_negative: SimpleColorItem | None = None
    indicator_color_positive: SimpleColorItem | None = None
    label_default: str | None = None
    label_conditional: bool | None = None
    label_equals: str | None = None
    label_negative: str | None = None
    label_positive: str | None = None
    yaxis_primary_type: YaxisPrimaryType | None = None
    yaxis_primary_format: str | None = None
    yaxis_primary_max: float | None = None
    yaxis_primary_min: float | None = None
    yaxis_primary_name_position: str | None = None
    yaxis_primary_name_visible: bool | None = None
    yaxis_primary_rotation: str | None = None
    yaxis_primary_visible: bool | None = None
    yaxis_primary_labels: bool | None = None
    yaxis_secondary_type: YaxisSecondaryType | None = None
    yaxis_secondary_format: str | None = None
    yaxis_secondary_max: float | None = None
    yaxis_secondary_min: float | None = None
    yaxis_secondary_name_position: str | None = None
    yaxis_secondary_name_visible: bool | None = None
    yaxis_secondary_rotation: str | None = None
    yaxis_secondary_visible: bool | None = None
    yaxis_secondary_labels: bool | None = None
    yaxis_secondary_show_on_right: bool | None = None
    tooltip_text: str | None = None
    viewport: Viewport | None = None
    basemap: str | None = None
    viewport_pan: bool | None = None
    viewport_zoom: bool | None = None
    center_lat: float | None = None
    center_lng: float | None = None
    zoom_level: float | None = None
    group_nearby_points: bool | None = None
    min_size: MinSize | None = None
    max_size: MaxSize | None = None
    shape_type: ShapeType | None = None
    icon: str | None = None
    viewport_bounds_ne_lat: float | None = None
    viewport_bounds_ne_lng: float | None = None
    viewport_bounds_sw_lat: float | None = None
    viewport_bounds_sw_lng: float | None = None
    row_height: RowHeight | None = None
    cell_vertical_align: CellVerticalAlign | None = None
    cell_text_wrapping: CellTextWrapping | None = None
    cell_image_sizing: CellImageSizing | None = None
    forecast_enabled: bool | None = None
    forecast_confidence: confloat(ge=0.0, le=1.0) | None = None
    forecast_period: float | None = None
    forecast_seasonal: bool | None = None
    anomaly_detection_enabled: bool | None = None
    anomaly_detection_sensitivity: AnomalyDetectionSensitivity | None = None
    anomaly_detection_size: AnomalyDetectionSize | None = None
    anomaly_detection_color: SimpleColorItem | None = None
    clustering_enabled: bool | None = None
    clustering_amount: float | None = None
    clustering_threshold: confloat(lt=1.0, gt=0.0) | None = None
    disable_drill_down: bool | None = None
    disable_drill_into_url: bool | None = None
    disable_alerts: bool | None = None
    disable_scheduled_exports: bool | None = None
    disable_key_drive_analysis: dict[str, bool] | None = None
    text_wrapping: TextWrapping | None = Field(
        None, description='Text wrapping settings for table cells and headers.'
    )
    pagination: bool | None = Field(None, description='Enable pagination for tables.')
    page_size: float | None = Field(
        None, description='Number of rows per page when pagination is enabled.'
    )
    grand_totals_position: GrandTotalsPosition | None = Field(
        None, description='Position of grand totals in the table.'
    )
    enable_accessibility: bool | None = Field(
        None, description='Enable accessibility features for tables.'
    )
    line_style_control_metrics: list[str] | None = None
    line_style_excluded_metrics: list[str] | None = None
    custom_tooltip: CustomTooltip | None = Field(
        None,
        description='Custom tooltip section rendered in the visualization tooltip, authored in Markdown with metric/attribute references that resolve per hovered data point.',
    )
    line_style_mapping: LineStyleMapping | None = Field(
        None,
        description="Per-series line style and weight overrides. Keys are metric local identifiers, or attribute element URIs (on Tiger, the element's primary label value) when the chart is segmented or stacked by an attribute.",
    )
    conditional_formatting: ConditionalFormatting | None = Field(
        None,
        description='Conditional formatting rules that color cells or rows based on their values.',
    )


class DateDataset(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the date instance.')
    type: Type72
    title: Title | None = Field(
        None,
        description='An optional human readable title for the date instance. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the date instance.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this date instance.'
    )
    title_base: constr(max_length=255) | None = Field(
        None, description='A title for the title formatting'
    )
    title_pattern: constr(max_length=255) | None = Field(
        None, description='A pattern for the title formatting'
    )
    granularities: list[Granularity3] | None = None


class Metric(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the metric.')
    type: Type73
    title: Title | None = Field(
        None,
        description='An optional human readable title for the metric. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the metric.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this metric.'
    )
    maql: str = Field(..., description='Define MAQL syntax for metric.')
    format: str | None = Field(None, description='Metric value default format')
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the metric should be shown in AI results. When omitted, the metric is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )


class Plugin(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the plugin.')
    type: Type75
    title: Title | None = Field(
        None,
        description='An optional human readable title for the plugin. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the plugin.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this plugin.'
    )
    url: constr(
        pattern=r'[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)'
    ) = Field(..., description='URL of the plugin.')


class PublisherContainerStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    background_color: PublisherColorValueV2 | None = None
    background_opacity: PublisherOpacityV2 | None = None
    background_image: PublisherImageSourceV2 | None = None
    background_image_opacity: PublisherOpacityV2 | None = None
    background_fit: BackgroundFit | None = None
    background_horizontal_align: PublisherHorizontalAlignV2 | None = None
    background_vertical_align: PublisherVerticalAlignV2 | None = None
    background_offset: PublisherPxV2 | None = None
    background_offset_top: PublisherPxV2 | None = None
    background_offset_right: PublisherPxV2 | None = None
    background_offset_bottom: PublisherPxV2 | None = None
    background_offset_left: PublisherPxV2 | None = None
    padding: PublisherPaddingValueV2 | None = None
    padding_top: PublisherPaddingValueV2 | None = None
    padding_right: PublisherPaddingValueV2 | None = None
    padding_bottom: PublisherPaddingValueV2 | None = None
    padding_left: PublisherPaddingValueV2 | None = None
    border_width: PublisherPxV2 | None = None
    border_style: PublisherBorderLineStyleV2 | None = None
    border_color: PublisherColorValueV2 | None = None
    border_top_width: PublisherPxV2 | None = None
    border_top_style: PublisherBorderLineStyleV2 | None = None
    border_top_color: PublisherColorValueV2 | None = None
    border_right_width: PublisherPxV2 | None = None
    border_right_style: PublisherBorderLineStyleV2 | None = None
    border_right_color: PublisherColorValueV2 | None = None
    border_bottom_width: PublisherPxV2 | None = None
    border_bottom_style: PublisherBorderLineStyleV2 | None = None
    border_bottom_color: PublisherColorValueV2 | None = None
    border_left_width: PublisherPxV2 | None = None
    border_left_style: PublisherBorderLineStyleV2 | None = None
    border_left_color: PublisherColorValueV2 | None = None
    border_radius: PublisherRadiusValueV2 | None = None
    border_top_left_radius: PublisherRadiusValueV2 | None = None
    border_top_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_left_radius: PublisherRadiusValueV2 | None = None
    shadow: PublisherShadowValueV2 | None = None
    shadow_x: float | None = None
    shadow_y: float | None = None
    shadow_blur: PublisherPxV2 | None = None
    shadow_spread: float | None = None
    shadow_color: PublisherColorValueV2 | None = None
    shadow_opacity: PublisherOpacityV2 | None = None
    opacity: PublisherOpacityV2 | None = None
    text_style: PublisherTextStyleNameV2 | None = None
    text_color: PublisherColorValueV2 | None = None
    horizontal_align: HorizontalAlign | None = None
    vertical_align: PublisherVerticalAlignV2 | None = None
    font_size: PublisherPxV2 | None = None
    font_weight: confloat(ge=1.0, le=1000.0) | None = None
    font_style: FontStyle | None = None
    line_height: float | None = None
    letter_spacing: float | None = None
    text_transform: TextTransform | None = None
    text_overflow: TextOverflow | None = None
    gap: PublisherGapValueV2 | None = None


class PublisherImageWidgetStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    background_color: PublisherColorValueV2 | None = None
    background_opacity: PublisherOpacityV2 | None = None
    background_image: PublisherImageSourceV2 | None = None
    background_image_opacity: PublisherOpacityV2 | None = None
    background_fit: BackgroundFit | None = None
    background_horizontal_align: PublisherHorizontalAlignV2 | None = None
    background_vertical_align: PublisherVerticalAlignV2 | None = None
    background_offset: PublisherPxV2 | None = None
    background_offset_top: PublisherPxV2 | None = None
    background_offset_right: PublisherPxV2 | None = None
    background_offset_bottom: PublisherPxV2 | None = None
    background_offset_left: PublisherPxV2 | None = None
    padding: PublisherPaddingValueV2 | None = None
    padding_top: PublisherPaddingValueV2 | None = None
    padding_right: PublisherPaddingValueV2 | None = None
    padding_bottom: PublisherPaddingValueV2 | None = None
    padding_left: PublisherPaddingValueV2 | None = None
    border_width: PublisherPxV2 | None = None
    border_style: PublisherBorderLineStyleV2 | None = None
    border_color: PublisherColorValueV2 | None = None
    border_top_width: PublisherPxV2 | None = None
    border_top_style: PublisherBorderLineStyleV2 | None = None
    border_top_color: PublisherColorValueV2 | None = None
    border_right_width: PublisherPxV2 | None = None
    border_right_style: PublisherBorderLineStyleV2 | None = None
    border_right_color: PublisherColorValueV2 | None = None
    border_bottom_width: PublisherPxV2 | None = None
    border_bottom_style: PublisherBorderLineStyleV2 | None = None
    border_bottom_color: PublisherColorValueV2 | None = None
    border_left_width: PublisherPxV2 | None = None
    border_left_style: PublisherBorderLineStyleV2 | None = None
    border_left_color: PublisherColorValueV2 | None = None
    border_radius: PublisherRadiusValueV2 | None = None
    border_top_left_radius: PublisherRadiusValueV2 | None = None
    border_top_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_left_radius: PublisherRadiusValueV2 | None = None
    shadow: PublisherShadowValueV2 | None = None
    shadow_x: float | None = None
    shadow_y: float | None = None
    shadow_blur: PublisherPxV2 | None = None
    shadow_spread: float | None = None
    shadow_color: PublisherColorValueV2 | None = None
    shadow_opacity: PublisherOpacityV2 | None = None
    opacity: PublisherOpacityV2 | None = None
    fit: Fit | None = None
    horizontal_align: PublisherHorizontalAlignV2 | None = None
    vertical_align: PublisherVerticalAlignV2 | None = None


class PublisherTextWidgetStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    background_color: PublisherColorValueV2 | None = None
    background_opacity: PublisherOpacityV2 | None = None
    background_image: PublisherImageSourceV2 | None = None
    background_image_opacity: PublisherOpacityV2 | None = None
    background_fit: BackgroundFit | None = None
    background_horizontal_align: PublisherHorizontalAlignV2 | None = None
    background_vertical_align: PublisherVerticalAlignV2 | None = None
    background_offset: PublisherPxV2 | None = None
    background_offset_top: PublisherPxV2 | None = None
    background_offset_right: PublisherPxV2 | None = None
    background_offset_bottom: PublisherPxV2 | None = None
    background_offset_left: PublisherPxV2 | None = None
    padding: PublisherPaddingValueV2 | None = None
    padding_top: PublisherPaddingValueV2 | None = None
    padding_right: PublisherPaddingValueV2 | None = None
    padding_bottom: PublisherPaddingValueV2 | None = None
    padding_left: PublisherPaddingValueV2 | None = None
    border_width: PublisherPxV2 | None = None
    border_style: PublisherBorderLineStyleV2 | None = None
    border_color: PublisherColorValueV2 | None = None
    border_top_width: PublisherPxV2 | None = None
    border_top_style: PublisherBorderLineStyleV2 | None = None
    border_top_color: PublisherColorValueV2 | None = None
    border_right_width: PublisherPxV2 | None = None
    border_right_style: PublisherBorderLineStyleV2 | None = None
    border_right_color: PublisherColorValueV2 | None = None
    border_bottom_width: PublisherPxV2 | None = None
    border_bottom_style: PublisherBorderLineStyleV2 | None = None
    border_bottom_color: PublisherColorValueV2 | None = None
    border_left_width: PublisherPxV2 | None = None
    border_left_style: PublisherBorderLineStyleV2 | None = None
    border_left_color: PublisherColorValueV2 | None = None
    border_radius: PublisherRadiusValueV2 | None = None
    border_top_left_radius: PublisherRadiusValueV2 | None = None
    border_top_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_left_radius: PublisherRadiusValueV2 | None = None
    shadow: PublisherShadowValueV2 | None = None
    shadow_x: float | None = None
    shadow_y: float | None = None
    shadow_blur: PublisherPxV2 | None = None
    shadow_spread: float | None = None
    shadow_color: PublisherColorValueV2 | None = None
    shadow_opacity: PublisherOpacityV2 | None = None
    opacity: PublisherOpacityV2 | None = None
    text_style: PublisherTextStyleNameV2 | None = None
    text_color: PublisherColorValueV2 | None = None
    horizontal_align: HorizontalAlign | None = None
    vertical_align: PublisherVerticalAlignV2 | None = None
    font_size: PublisherPxV2 | None = None
    font_weight: confloat(ge=1.0, le=1000.0) | None = None
    font_style: FontStyle | None = None
    line_height: float | None = None
    letter_spacing: float | None = None
    text_transform: TextTransform | None = None
    text_overflow: TextOverflow | None = None


class PublisherVisualizationStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    background_color: PublisherColorValueV2 | None = None
    background_opacity: PublisherOpacityV2 | None = None
    background_image: PublisherImageSourceV2 | None = None
    background_image_opacity: PublisherOpacityV2 | None = None
    background_fit: BackgroundFit | None = None
    background_horizontal_align: PublisherHorizontalAlignV2 | None = None
    background_vertical_align: PublisherVerticalAlignV2 | None = None
    background_offset: PublisherPxV2 | None = None
    background_offset_top: PublisherPxV2 | None = None
    background_offset_right: PublisherPxV2 | None = None
    background_offset_bottom: PublisherPxV2 | None = None
    background_offset_left: PublisherPxV2 | None = None
    padding: PublisherPaddingValueV2 | None = None
    padding_top: PublisherPaddingValueV2 | None = None
    padding_right: PublisherPaddingValueV2 | None = None
    padding_bottom: PublisherPaddingValueV2 | None = None
    padding_left: PublisherPaddingValueV2 | None = None
    border_width: PublisherPxV2 | None = None
    border_style: PublisherBorderLineStyleV2 | None = None
    border_color: PublisherColorValueV2 | None = None
    border_top_width: PublisherPxV2 | None = None
    border_top_style: PublisherBorderLineStyleV2 | None = None
    border_top_color: PublisherColorValueV2 | None = None
    border_right_width: PublisherPxV2 | None = None
    border_right_style: PublisherBorderLineStyleV2 | None = None
    border_right_color: PublisherColorValueV2 | None = None
    border_bottom_width: PublisherPxV2 | None = None
    border_bottom_style: PublisherBorderLineStyleV2 | None = None
    border_bottom_color: PublisherColorValueV2 | None = None
    border_left_width: PublisherPxV2 | None = None
    border_left_style: PublisherBorderLineStyleV2 | None = None
    border_left_color: PublisherColorValueV2 | None = None
    border_radius: PublisherRadiusValueV2 | None = None
    border_top_left_radius: PublisherRadiusValueV2 | None = None
    border_top_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_right_radius: PublisherRadiusValueV2 | None = None
    border_bottom_left_radius: PublisherRadiusValueV2 | None = None
    shadow: PublisherShadowValueV2 | None = None
    shadow_x: float | None = None
    shadow_y: float | None = None
    shadow_blur: PublisherPxV2 | None = None
    shadow_spread: float | None = None
    shadow_color: PublisherColorValueV2 | None = None
    shadow_opacity: PublisherOpacityV2 | None = None
    opacity: PublisherOpacityV2 | None = None
    chart: PublisherChartStyleV2 | None = None
    table: PublisherTableStyleV2 | None = None
    headline: PublisherHeadlineStyleV2 | None = None


class ReportImage1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    url: str | None = Field(
        None,
        description='Image URL, supporting {variables} - a logo uses {logo}. Mutually exclusive with asset.',
    )
    asset: Identifier | None = Field(
        None,
        description='Backend-managed asset rendered as the image. Mutually exclusive with url.',
    )
    alt_text: str | None = None
    fit: Fit | None = Field(
        None,
        description='How the image fills its area: kept whole inside it, filling it and cropped to do so, or stretched to its shape. Defaults to contain.',
    )
    style: ReportImageStyle | None = None
    placeholder: ReportPlaceholder | None = None


class ReportImage(RootModel[str | ReportImage1]):
    root: str | ReportImage1 = Field(
        ...,
        description='A bare string is the image URL. Anything more is written as a mapping. The id belongs to whatever draws the image, not to the image itself.',
        title='Report Image',
    )


class ReportVariable(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    name: str = Field(
        ..., description='Name the variable is referenced by from text, as {name}.'
    )
    title: Title | None = None
    description: Description | None = None
    default: str | None = Field(
        None, description='Value used when the document gives the variable none.'
    )


class PublisherDocumentDefaultsV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    page_size: PublisherPageSizeV2 | None = Field(
        None, description='Applies to every page without its own page_size.'
    )
    takeaway: Takeaway | None = Field(
        None, title='Publisher Document Takeaway Defaults V2'
    )
    period: PublisherPeriodV2 | None = Field(
        None,
        description='Document templates only: the period a document created from the template starts with.',
    )


class PublisherDocumentStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    background_color: PublisherColorValueV2 | None = None
    background_opacity: PublisherOpacityV2 | None = None
    background_image: PublisherImageSourceV2 | None = None
    background_image_opacity: PublisherOpacityV2 | None = None
    background_fit: BackgroundFit | None = None
    background_horizontal_align: PublisherHorizontalAlignV2 | None = None
    background_vertical_align: PublisherVerticalAlignV2 | None = None
    background_offset: PublisherPxV2 | None = None
    background_offset_top: PublisherPxV2 | None = None
    background_offset_right: PublisherPxV2 | None = None
    background_offset_bottom: PublisherPxV2 | None = None
    background_offset_left: PublisherPxV2 | None = None
    gap: PublisherGapValueV2 | None = Field(
        None, description='Space between pages in the viewer and the editor.'
    )


class PublisherPageStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    background_color: PublisherColorValueV2 | None = None
    background_opacity: PublisherOpacityV2 | None = None
    background_image: PublisherImageSourceV2 | None = None
    background_image_opacity: PublisherOpacityV2 | None = None
    background_fit: BackgroundFit | None = None
    background_horizontal_align: PublisherHorizontalAlignV2 | None = None
    background_vertical_align: PublisherVerticalAlignV2 | None = None
    background_offset: PublisherPxV2 | None = None
    background_offset_top: PublisherPxV2 | None = None
    background_offset_right: PublisherPxV2 | None = None
    background_offset_bottom: PublisherPxV2 | None = None
    background_offset_left: PublisherPxV2 | None = None
    padding: PublisherPaddingValueV2 | None = None
    padding_top: PublisherPaddingValueV2 | None = None
    padding_right: PublisherPaddingValueV2 | None = None
    padding_bottom: PublisherPaddingValueV2 | None = None
    padding_left: PublisherPaddingValueV2 | None = None
    text_style: PublisherTextStyleNameV2 | None = None
    text_color: PublisherColorValueV2 | None = None
    horizontal_align: HorizontalAlign | None = None
    vertical_align: PublisherVerticalAlignV2 | None = None
    font_size: PublisherPxV2 | None = None
    font_weight: confloat(ge=1.0, le=1000.0) | None = None
    font_style: FontStyle | None = None
    line_height: float | None = None
    letter_spacing: float | None = None
    text_transform: TextTransform | None = None
    text_overflow: TextOverflow | None = None
    gap: PublisherGapValueV2 | None = None


class PublisherTextStyleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    text_style: PublisherTextStyleNameV2 | None = None
    text_color: PublisherColorValueV2 | None = None
    horizontal_align: HorizontalAlign | None = None
    vertical_align: PublisherVerticalAlignV2 | None = None
    font_size: PublisherPxV2 | None = None
    font_weight: confloat(ge=1.0, le=1000.0) | None = None
    font_style: FontStyle | None = None
    line_height: float | None = None
    letter_spacing: float | None = None
    text_transform: TextTransform | None = None
    text_overflow: TextOverflow | None = None


class ReportBackground1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    image: ReportBackgroundImage = Field(
        ..., description='Image painted behind the content.'
    )


class ReportBackground(RootModel[str | ReportBackground1]):
    root: str | ReportBackground1 = Field(
        ...,
        description='A bare string is a color. An image is written as a mapping.',
        title='Report Background',
    )


class DashboardFilterGroup(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type8
    title: str = Field(..., description='Display title for the filter group')
    filters: DashboardFiltersNoGroups = Field(
        ...,
        description='Filters contained in this group (only attribute and date filters, no nested groups)',
    )


class QueryFilter(
    RootModel[
        QueryDateFilter
        | QueryAttributeFilter
        | QueryTextFilter
        | QueryMetricValueFilter
        | QueryRankingFilter
    ]
):
    root: (
        QueryDateFilter
        | QueryAttributeFilter
        | QueryTextFilter
        | QueryMetricValueFilter
        | QueryRankingFilter
    ) = Field(..., title='Filter')


class Interaction(
    RootModel[
        InteractionOpenPlainUrl
        | InteractionOpenParamUrl
        | InteractionOpenDashboard
        | InteractionOpenVisualization
    ]
):
    root: (
        InteractionOpenPlainUrl
        | InteractionOpenParamUrl
        | InteractionOpenDashboard
        | InteractionOpenVisualization
    ) = Field(
        ..., description='An interaction for current widget.', title='Interaction'
    )


class VisualizationWidget(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier | None = Field(
        None, description='A unique identifier of the widget.'
    )
    visualization: str = Field(
        ..., description='An id of the visualization to be rendered with the widget'
    )
    title: str | Title2 | None = None
    description: str | Description2 | Description3 | None = None
    columns: Columns | None = Field(
        None,
        description='An optional width of the widget in the grid, total width being 12 columns',
    )
    rows: float | None = Field(
        None,
        description='An optional height of the widget in the grid, each row being ~20px high',
    )
    date: Identifier | None = Field(
        None,
        description='An id of the date dataset to be used for date filtering in this widget',
    )
    ignored_filters: list[str] | None = Field(
        None, description='A list of dashboard filters to be ignored for this widget'
    )
    zoom_data: bool | None = Field(
        None,
        description='Enable zooming to the data for certain types of visualizations',
    )
    interactions: list[Interaction] | None = None
    ignored_drill_downs: list[IgnoredDrillDown] | None = Field(
        None, description='A list of drill downs to be ignored for this widget'
    )
    ignored_drill_downs_intersections: list[IgnoredDrillDownsIntersection] | None = (
        Field(
            None,
            description='A list of drill downs intersections to be ignored for this widget',
        )
    )
    ignored_cross_filtering: bool | None = Field(
        None, description='Whether cross filtering is disabled for this widget'
    )


class Label(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    source_column: SourceColumn | None = Field(
        None, description='A column name in the physical database.'
    )
    data_type: DataType | None = Field(
        None, description='A column data type in the physical database.'
    )
    title: Title | None = Field(
        None, description='An optional human readable title for the label.'
    )
    description: Description | None = Field(
        None, description='An optional description of the label.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this label.'
    )
    value_type: ValueType1 | None = None
    geo_area_config: GeoAreaConfig | None = Field(
        None, description='Configuration required for GEO_AREA labels.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the label should be shown in AI results. When omitted, the label is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    locale: Locale | None = Field(
        None,
        description='Locale string in BCP 47 format used for default label sorting.',
    )
    translations: list[LabelTranslation] | None = Field(
        None, description='Optional list of localized source columns for this label.'
    )
    is_nullable: bool | None = Field(
        None,
        description='Optional flag to indicate if the label can contain null values.',
    )
    null_value_join_replacement: str | None = Field(
        None,
        description='Optional value which can be used as replacement for NULL in join conditions.',
    )


class PublisherTitleWidgetV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type33
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the page.')
    proportion: PublisherPageProportionV2 | None = None
    placeholder: PublisherWidgetPlaceholderV2 | None = None
    locked: bool | None = None
    markdown: constr(min_length=1) | None = Field(
        None,
        description='Inline markdown only: strong, emphasis, highlight, strike, links and line breaks.',
    )
    style: PublisherTextWidgetStyleV2 | None = None


class PublisherHeadingWidgetV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type34
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the page.')
    proportion: PublisherPageProportionV2 | None = None
    placeholder: PublisherWidgetPlaceholderV2 | None = None
    locked: bool | None = None
    markdown: constr(min_length=1) | None = Field(
        None, description='Inline markdown only.'
    )
    level: Level | None = Field(None, description='Defaults to 1.')
    style: PublisherTextWidgetStyleV2 | None = None


class PublisherTextWidgetV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type35
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the page.')
    proportion: PublisherPageProportionV2 | None = None
    placeholder: PublisherWidgetPlaceholderV2 | None = None
    locked: bool | None = None
    markdown: constr(min_length=1) | None = Field(
        None, description='Full markdown: paragraphs, lists, quotes and headings.'
    )
    decorative: bool | None = Field(
        None,
        description='Page furniture such as page numbers: kept out of the accessibility tree, PDF tags and AI context.',
    )
    style: PublisherTextWidgetStyleV2 | None = None


class PublisherImageWidgetV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type36
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the page.')
    proportion: PublisherPageProportionV2 | None = None
    placeholder: PublisherWidgetPlaceholderV2 | None = None
    locked: bool | None = None
    source: PublisherImageSourceV2 | None = None
    alt_text: constr(min_length=1) | None = None
    decorative: bool | None = Field(
        None, description='A decorative image needs no alt text.'
    )
    style: PublisherImageWidgetStyleV2 | None = None


class ParameterDefinition(
    RootModel[StringParameterDefinition | NumberParameterDefinition]
):
    root: StringParameterDefinition | NumberParameterDefinition = Field(
        ...,
        description='A typed parameter definition: textual or numeric.',
        title='Parameter Definition',
    )


class QuerySort(RootModel[QueryAttributeSort | QueryMetricSort]):
    root: QueryAttributeSort | QueryMetricSort = Field(..., title='Sort')


class ImageSlot(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: ReportSlotId
    weight: ReportWeight | None = None
    image: ReportImage
    placeholder: ReportPlaceholder | None = None


class BucketItem1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    field: str | None = Field(None, description='A field name in the report.')
    format: str | None = Field(None, description='Metric value default format')
    axis: Axis | None = Field(
        None,
        description='Axis to use for this bucket. Only applicable for "combo" charts.',
    )
    display_as: DisplayAs | None = Field(
        None,
        description='Chart type to use for this bucket. Only applicable for "repeater" charts.',
    )
    totals: list[TotalItem] | None = Field(
        None, description='A list of totals in this bucket.'
    )


class BucketItem(RootModel[str | BucketItem1]):
    root: str | BucketItem1 = Field(..., title='Bucket')


class LayerItemBase(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the visualization data layer.'
    )
    title: Title | None = Field(
        None,
        description='An optional human readable title for the layer. Will be derived from id if not provided explicitly.',
    )
    type: Type64 | None = Field(
        None, description='Type of visualisation for this layer.'
    )
    config: Config | None = Field(
        None, description='Configuration of layer of defined type.'
    )
    metrics: list[BucketItem | BucketEmptyItem] | None = Field(
        None, description='A list of metrics in this layer.'
    )
    view_by: list[BucketLocationItem] | None = Field(
        None, description='A list of view by locations in this layer.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this layer.'
    )


class DashboardFilters(
    RootModel[
        dict[
            str,
            DashboardAbsoluteDateFilter
            | DashboardRelativeDateFilter
            | DashboardAttributeFilter
            | DashboardTextFilter
            | DashboardMetricValueFilter
            | DashboardFilterGroup,
        ]
    ]
):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        DashboardAbsoluteDateFilter
        | DashboardRelativeDateFilter
        | DashboardAttributeFilter
        | DashboardTextFilter
        | DashboardMetricValueFilter
        | DashboardFilterGroup,
    ] = Field(..., title='Dashboard Filters')


class Parameter(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the parameter.')
    type: Type74
    title: Title | None = Field(
        None,
        description='An optional human readable title for the parameter. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the parameter.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this parameter.'
    )
    definition: ParameterDefinition = Field(
        ...,
        description='The typed definition of the parameter - its data type, default value and constraints.',
    )


class PublisherWidgetTitleV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    visible: bool | None = None
    text: constr(min_length=1) | None = None
    style: PublisherTextStyleV2 | None = None


class QueryFilters(RootModel[dict[str, QueryFilter]]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), QueryFilter] = Field(
        ..., title='Query Filters'
    )


class ReportBoxStyle(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    background: ReportBackground | None = Field(
        None, description='What the box paints behind its content.'
    )
    border_radius: float | None = Field(
        None,
        description='Corner radius in percent of the page width. Content reaching into a rounded corner is clipped.',
    )
    padding: float | None = Field(
        None,
        description="Inset of the box's own content, in percent of the page width. Insets only inward.",
    )


class ReportTextStyle1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: ReportTextType | None = None
    color: str | None = Field(None, description='CSS color value of the text.')
    horizontal_align: ReportAlignment | None = None
    vertical_align: ReportAlignment | None = None
    background: ReportBackground | None = None
    border_radius: float | None = None
    padding: float | None = None


class ReportTextStyle(RootModel[ReportTextType | ReportTextStyle1]):
    root: ReportTextType | ReportTextStyle1 = Field(
        ...,
        description='A bare string is the text type. Anything more is written as a mapping.',
        title='Report Text Style',
    )


class Widget2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier | None = Field(
        None, description='A unique identifier of the widget.'
    )
    columns: Columns | None = Field(
        None,
        description='An optional width of the widget in the grid, total width being 12 columns',
    )
    rows: float | None = Field(
        None,
        description='An optional height of the widget in the grid, each row being ~20px high',
    )
    visualizations: list[VisualizationWidget] = Field(
        ..., description='A list of visualizations to be rendered with the widget'
    )


class Attribute(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type26
    title: Title | None = Field(
        None,
        description='A human readable title of the field. Optional, derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the field.'
    )
    tags: Tags | None = None
    source_column: SourceColumn | None = Field(
        None,
        description='A column name in the physical database. Optional, equals to id by default.',
    )
    data_type: DataType = Field(
        ..., description='A column data type in the physical database.'
    )
    default_view: str | None = Field(
        None, description='An Id of the label to be used by default for this field'
    )
    sort_column: str | None = Field(
        None, description='A column name in the source table to do sorting by'
    )
    sort_direction: SortDirection | None = None
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the attribute should be shown in AI results. When omitted, the attribute is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    locale: Locale | None = Field(
        None,
        description='Locale string in BCP 47 format used for default label sorting.',
    )
    is_nullable: bool | None = Field(
        None,
        description='Optional flag to indicate if the attribute can contain null values.',
    )
    null_value_join_replacement: str | None = Field(
        None,
        description='Optional value which can be used as replacement for NULL in join conditions.',
    )
    labels: dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), Label] | None = None


class PublisherVisualizationWidgetV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type37
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the page.')
    proportion: PublisherPageProportionV2 | None = None
    placeholder: PublisherWidgetPlaceholderV2 | None = None
    locked: bool | None = None
    visualization: Identifier | None = Field(
        None, description='An id of the visualization rendered here.'
    )
    title: PublisherWidgetTitleV2 | None = None
    alt_text: constr(min_length=1) | None = None
    date: Identifier | None = Field(
        None, description='An id of the date dataset the document period applies to.'
    )
    ignore_document_period: bool | None = Field(
        None, description='When true, the document period does not apply here.'
    )
    filters: DashboardFilters | None = Field(
        None, description='Filters applied on top of the page and document filters.'
    )
    ignored_filters: (
        list[
            constr(
                pattern=r'^(label|computed_attribute|dataset|metric)/(?!\.)[.A-Za-z0-9_-]{1,255}$'
            )
        ]
        | None
    ) = Field(None, description='Document filters ignored here.')
    display: PublisherVisualizationDisplayV2 | None = None
    style: PublisherVisualizationStyleV2 | None = None


class PublisherTakeawayWidgetV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type38
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the page.')
    proportion: PublisherPageProportionV2 | None = None
    placeholder: PublisherWidgetPlaceholderV2 | None = None
    locked: bool | None = None
    title: PublisherWidgetTitleV2 | None = None
    markdown: constr(min_length=1) | None = Field(
        None, description='The generated or written text.'
    )
    generation: PublisherTakeawayGenerationV2 | None = None
    style: PublisherTextWidgetStyleV2 | None = None


class Parameter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the parameter.')
    type: Type40
    title: Title | None = Field(
        None,
        description='An optional human readable title for the parameter. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the parameter.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this parameter.'
    )
    definition: ParameterDefinition = Field(
        ...,
        description='The typed definition of the parameter - its data type, default value and constraints.',
    )


class QuerySorts(RootModel[list[QuerySort]]):
    root: list[QuerySort] = Field(..., title='Sorts')


class QueryField3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    aggregation: Aggregation2 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: Using1 | Using2 = Field(
        ...,
        description='Metric identifier to use for this field.',
        title='Metric Identifier',
    )
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator2 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type46 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )
    title: Title | None = Field(None, description='A field title.')
    compute_ratio: bool | None = Field(
        None, description='Compute ratio for this metric.'
    )
    filter_by: QueryFilters | None = Field(
        None, description='A list of filters in this query.'
    )


class QueryField5(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    aggregation: Aggregation3 = Field(
        ..., description='Aggregation function to use for this field.'
    )
    using: (
        str
        | list[str]
        | constr(pattern=r'^attribute/(?!\.)[.A-Za-z0-9_-]{1,255}$')
        | constr(pattern=r'^fact/(?!\.)[.A-Za-z0-9_-]{1,255}$')
        | constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$')
    ) = Field(..., description='Attribute identifier to use for this field.')
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator4 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type48 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )
    title: Title | None = Field(None, description='A field title.')
    compute_ratio: bool | None = Field(
        None, description='Compute ratio for this metric.'
    )
    filter_by: QueryFilters | None = Field(
        None, description='A list of filters in this query.'
    )


class QueryField(
    RootModel[
        AttributeIdentifier
        | LabelIdentifier
        | ComputedAttributeIdentifier
        | MetricIdentifier
        | FactIdentifier
        | QueryField1
        | QueryField2
        | QueryField3
        | QueryField4
        | QueryField5
        | QueryField6
        | QueryField7
        | QueryField8
        | QueryField9
        | QueryField10
        | QueryField11
        | QueryField12
        | QueryField13
        | QueryField14
    ]
):
    root: (
        AttributeIdentifier
        | LabelIdentifier
        | ComputedAttributeIdentifier
        | MetricIdentifier
        | FactIdentifier
        | QueryField1
        | QueryField2
        | QueryField3
        | QueryField4
        | QueryField5
        | QueryField6
        | QueryField7
        | QueryField8
        | QueryField9
        | QueryField10
        | QueryField11
        | QueryField12
        | QueryField13
        | QueryField14
    ) = Field(..., title='Field')


class VisualizationSlot(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: ReportSlotId
    weight: ReportWeight | None = None
    visualization: str | None = Field(
        ...,
        description='An id of the visualization to be rendered in this area. Null leaves the area declared but empty, which renders a placeholder.',
    )
    title: str | Title2 | None = Field(
        None,
        description='Title rendered above the visualization; supports {variables}. False hides it.',
    )
    show_title: bool | None = Field(
        None,
        description='Whether the title is rendered. Only needed to hide a title that is kept written down; a title of false hides it and drops the text.',
    )
    properties: dict[str, Any] | None = Field(
        None, description="Visualization properties overriding the insight's own."
    )
    date: Identifier | None = Field(
        None,
        description="An id of the date dataset the document's period is applied to as an absolute date filter. Omitted leaves the backend date dataset resolution to decide.",
    )
    ignore_report_period: bool | None = Field(
        None,
        description="When true, the implicit date filter derived from the document's period is not applied here.",
    )
    filters: DashboardFilters | None = Field(
        None,
        description='Filters applied on top of the effective page and document filters. A filter targeting the same object replaces the inherited one.',
    )
    ignored_filters: list[str] | None = Field(
        None, description='A list of document and page filters ignored here.'
    )
    placeholder: ReportPlaceholder | None = None


class HeadingSlot(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: ReportSlotId
    weight: ReportWeight | None = None
    heading: ReportText = Field(
        ...,
        description='A line of display text. It carries no markup of its own: what is typed in it is what it renders.',
    )
    style: ReportTextStyle | None = None
    placeholder: ReportPlaceholder | None = None


class ParagraphSlot(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: ReportSlotId
    weight: ReportWeight | None = None
    paragraph: ReportText = Field(..., description='Prose, written as markdown.')
    style: ReportTextStyle | None = None
    placeholder: ReportPlaceholder | None = None


class LayerItem(RootModel[LayerItemBase | LayerItem1 | LayerItem2]):
    root: LayerItemBase | LayerItem1 | LayerItem2


class Fields(RootModel[dict[str, Attribute | Fact | AggregatedFact]]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        Attribute | Fact | AggregatedFact,
    ] = Field(..., title='Fields')


class QueryFields(RootModel[dict[str, QueryField]]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), QueryField] = Field(
        ..., title='Fields'
    )


class Dataset5(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type69
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dataset. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dataset.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dataset.'
    )
    table_path: constr(pattern=r'^(?!\.)[.A-Za-z0-9_/-]{1,255}$') = Field(
        ..., description='A table path in the data source delimited by / character.'
    )
    sql: str | None = Field(None, description='A sql statement that represent a table.')
    primary_key: (
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') | list[Identifier] | None
    ) = None
    fields: Fields | None = Field(None, description='A list of fields in this dataset.')
    references: list[Reference] | None = Field(
        None,
        description='A list of references, specifies the relations between datasets.\nForeign dataset is defined in "dataset" attribute and will always be joined by it\'s grain.\nCurrent dataset will be join by the column name defined in "using" attribute.',
    )
    workspace_data_filters: list[WorkspaceDataFilter] | None = Field(
        None,
        description='A list of workspace data filters to be applied to the dataset.',
    )
    data_source: str | None = Field(
        None, description='An optional data source id used for the specific dataset.'
    )
    precedence: float | None = Field(
        None,
        description='An optional precedence value for the dataset (whole positive number).',
    )
    dataset_type: DatasetType3 | None = Field(
        None,
        description='An optional dataset type. Standard datasets have direct data mapping. Auxiliary datasets are helper datasets without data mapping. Defaults to standard.',
    )


class Dataset6(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type69
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dataset. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dataset.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dataset.'
    )
    table_path: constr(pattern=r'^(?!\.)[.A-Za-z0-9_/-]{1,255}$') | None = Field(
        None, description='A table path in the data source delimited by / character.'
    )
    sql: str = Field(..., description='A sql statement that represent a table.')
    primary_key: (
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') | list[Identifier] | None
    ) = None
    fields: Fields | None = Field(None, description='A list of fields in this dataset.')
    references: list[Reference] | None = Field(
        None,
        description='A list of references, specifies the relations between datasets.\nForeign dataset is defined in "dataset" attribute and will always be joined by it\'s grain.\nCurrent dataset will be join by the column name defined in "using" attribute.',
    )
    workspace_data_filters: list[WorkspaceDataFilter] | None = Field(
        None,
        description='A list of workspace data filters to be applied to the dataset.',
    )
    data_source: str | None = Field(
        None, description='An optional data source id used for the specific dataset.'
    )
    precedence: float | None = Field(
        None,
        description='An optional precedence value for the dataset (whole positive number).',
    )
    dataset_type: DatasetType3 | None = Field(
        None,
        description='An optional dataset type. Standard datasets have direct data mapping. Auxiliary datasets are helper datasets without data mapping. Defaults to standard.',
    )


class Dataset7(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type69
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dataset. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dataset.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dataset.'
    )
    table_path: Any | None = None
    sql: Any | None = None
    primary_key: (
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') | list[Identifier] | None
    ) = None
    fields: Fields | None = Field(None, description='A list of fields in this dataset.')
    references: list[Reference] | None = Field(
        None,
        description='A list of references, specifies the relations between datasets.\nForeign dataset is defined in "dataset" attribute and will always be joined by it\'s grain.\nCurrent dataset will be join by the column name defined in "using" attribute.',
    )
    workspace_data_filters: Any | None = None
    data_source: str | None = Field(
        None, description='An optional data source id used for the specific dataset.'
    )
    precedence: Any | None = None
    dataset_type: Literal['auxiliary'] = Field(
        ...,
        description='An optional dataset type. Standard datasets have direct data mapping. Auxiliary datasets are helper datasets without data mapping. Defaults to standard.',
    )


class Dataset(RootModel[Dataset5 | Dataset6 | Dataset7]):
    root: Dataset5 | Dataset6 | Dataset7 = Field(..., title='Dataset')


class Query(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    fields: QueryFields = Field(..., description='A list of fields in this query.')
    filter_by: QueryFilters | None = Field(
        None, description='A list of filters in this query.'
    )
    sort_by: QuerySorts | None = Field(
        None, description='A list of sorting in this query.'
    )


class Dataset2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type22
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dataset. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dataset.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dataset.'
    )
    table_path: constr(pattern=r'^(?!\.)[.A-Za-z0-9_/-]{1,255}$') = Field(
        ..., description='A table path in the data source delimited by / character.'
    )
    sql: str | None = Field(None, description='A sql statement that represent a table.')
    primary_key: (
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') | list[Identifier] | None
    ) = None
    fields: Fields | None = Field(None, description='A list of fields in this dataset.')
    references: list[Reference] | None = Field(
        None,
        description='A list of references, specifies the relations between datasets.\nForeign dataset is defined in "dataset" attribute and will always be joined by it\'s grain.\nCurrent dataset will be join by the column name defined in "using" attribute.',
    )
    workspace_data_filters: list[WorkspaceDataFilter] | None = Field(
        None,
        description='A list of workspace data filters to be applied to the dataset.',
    )
    data_source: str | None = Field(
        None, description='An optional data source id used for the specific dataset.'
    )
    precedence: float | None = Field(
        None,
        description='An optional precedence value for the dataset (whole positive number).',
    )
    dataset_type: DatasetType | None = Field(
        None,
        description='An optional dataset type. Standard datasets have direct data mapping. Auxiliary datasets are helper datasets without data mapping. Defaults to standard.',
    )


class Dataset3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type22
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dataset. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dataset.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dataset.'
    )
    table_path: constr(pattern=r'^(?!\.)[.A-Za-z0-9_/-]{1,255}$') | None = Field(
        None, description='A table path in the data source delimited by / character.'
    )
    sql: str = Field(..., description='A sql statement that represent a table.')
    primary_key: (
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') | list[Identifier] | None
    ) = None
    fields: Fields | None = Field(None, description='A list of fields in this dataset.')
    references: list[Reference] | None = Field(
        None,
        description='A list of references, specifies the relations between datasets.\nForeign dataset is defined in "dataset" attribute and will always be joined by it\'s grain.\nCurrent dataset will be join by the column name defined in "using" attribute.',
    )
    workspace_data_filters: list[WorkspaceDataFilter] | None = Field(
        None,
        description='A list of workspace data filters to be applied to the dataset.',
    )
    data_source: str | None = Field(
        None, description='An optional data source id used for the specific dataset.'
    )
    precedence: float | None = Field(
        None,
        description='An optional precedence value for the dataset (whole positive number).',
    )
    dataset_type: DatasetType | None = Field(
        None,
        description='An optional dataset type. Standard datasets have direct data mapping. Auxiliary datasets are helper datasets without data mapping. Defaults to standard.',
    )


class Dataset4(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type22
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dataset. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dataset.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dataset.'
    )
    table_path: Any | None = None
    sql: Any | None = None
    primary_key: (
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$') | list[Identifier] | None
    ) = None
    fields: Fields | None = Field(None, description='A list of fields in this dataset.')
    references: list[Reference] | None = Field(
        None,
        description='A list of references, specifies the relations between datasets.\nForeign dataset is defined in "dataset" attribute and will always be joined by it\'s grain.\nCurrent dataset will be join by the column name defined in "using" attribute.',
    )
    workspace_data_filters: Any | None = None
    data_source: str | None = Field(
        None, description='An optional data source id used for the specific dataset.'
    )
    precedence: Any | None = None
    dataset_type: Literal['auxiliary'] = Field(
        ...,
        description='An optional dataset type. Standard datasets have direct data mapping. Auxiliary datasets are helper datasets without data mapping. Defaults to standard.',
    )


class Dataset1(RootModel[Dataset2 | Dataset3 | Dataset4]):
    root: Dataset2 | Dataset3 | Dataset4 = Field(..., title='Dataset')


class Visualisation1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type82 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )
    rows: list[BucketItem] | None = Field(
        None, description='A list of rows attributes in this visualisation.'
    )
    columns: list[BucketItem] | None = Field(
        None, description='A list of columns attributes in this visualisation.'
    )


class Visualisation2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type83 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )
    stack_by: list[BucketItem] | None = Field(
        None, description='A list of stack by attributes in this visualisation.'
    )


class Visualisation3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type84 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )
    stack_by: list[BucketItem] | None = Field(
        None, description='A list of stack by attributes in this visualisation.'
    )


class Visualisation4(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type85 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    trend_by: list[BucketItem] | None = Field(
        None, description='A list of trend by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )


class Visualisation5(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type86 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    stack_by: list[BucketItem] | None = Field(
        None, description='A list of stack by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )


class Visualisation6(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type87 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem | BucketEmptyItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of attributes in this visualisation.'
    )
    attributes: list[BucketItem] | None = Field(
        None, description='A list of attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attribute in this visualisation.'
    )


class Visualisation7(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type88 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem | BucketEmptyItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of size metrics in this visualisation.'
    )
    size_by: list[BucketItem] | None = Field(
        None, description='A list of size metrics in this visualisation.'
    )


class Visualisation8(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type89 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation9(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type90 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation10(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type91 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )


class Visualisation11(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type92 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation12(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type93 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation13(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type94 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )
    rows: list[BucketItem] | None = Field(
        None, description='A list of rows attributes in this visualisation.'
    )
    columns: list[BucketItem] | None = Field(
        None, description='A list of columns attributes in this visualisation.'
    )


class Visualisation14(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type95 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem | BucketEmptyItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation15(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type96 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation16(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type97 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem | BucketEmptyItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    from_: BucketItem | None = Field(
        None, alias='from', description='A from attribute in this visualisation.'
    )
    to: BucketItem | None = Field(
        None, description='A to attribute in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation17(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type98 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem | BucketEmptyItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    from_: BucketItem | None = Field(
        None, alias='from', description='A from attribute in this visualisation.'
    )
    to: BucketItem | None = Field(
        None, description='A to attribute in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation18(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type99 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[Any] | None = Field(None, description='Not used in this graph type.')
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation19(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type100 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[Any] | None = Field(
        None, description='Not used in this graph type.'
    )


class Visualisation20(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type101 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem | BucketEmptyItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketPushpinLocationItem] | None = Field(
        None, description='A list of view by locations in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )
    layers: list[LayerItem] | None = Field(
        None,
        description='A list of data layers in this visualisation. Layer buckets reuse the root-level query definition.',
    )


class Visualisation21(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type102 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketGeoAreaItem] | None = Field(
        None, description='A list of view by locations in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )
    layers: list[LayerItem] | None = Field(
        None,
        description='A list of data layers in this visualisation. Layer buckets reuse the root-level query definition.',
    )


class Visualisation22(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type103 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by locations in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )
    rows: list[BucketItem] | None = Field(
        None, description='A list of rows attributes in this visualisation.'
    )
    columns: list[BucketItem] | None = Field(
        None, description='A list of columns attributes in this visualisation.'
    )


class Visualisation23(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type104 = Field(..., description='Type of visualisation.')
    id: Identifier = Field(..., description='A unique identifier of the visualisation.')
    title: Title | None = Field(
        None,
        description='An optional human readable title for the visualisation. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the visualisation.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this visualisation.'
    )
    show_in_ai_results: bool | None = Field(
        None,
        description='Optional flag to indicate if the visualisation should be shown in AI results. When omitted, the visualisation is visible.',
    )
    is_hidden: bool | None = Field(
        None,
        deprecated=True,
        description="Deprecated. Use 'show_in_ai_results' instead.",
    )
    query: Query = Field(..., description='Query definition of visualisation.')
    config: Config | None = Field(
        None, description='Configuration of visualisation of defined type.'
    )
    metrics: list[BucketItem] | None = Field(
        None, description='A list of metrics in this visualisation.'
    )
    view_by: list[BucketItem] | None = Field(
        None, description='A list of view by attributes in this visualisation.'
    )
    segment_by: list[BucketItem] | None = Field(
        None, description='A list of segment by attributes in this visualisation.'
    )


class Visualisation(
    RootModel[
        Visualisation1
        | Visualisation2
        | Visualisation3
        | Visualisation4
        | Visualisation5
        | Visualisation6
        | Visualisation7
        | Visualisation8
        | Visualisation9
        | Visualisation10
        | Visualisation11
        | Visualisation12
        | Visualisation13
        | Visualisation14
        | Visualisation15
        | Visualisation16
        | Visualisation17
        | Visualisation18
        | Visualisation19
        | Visualisation20
        | Visualisation21
        | Visualisation22
        | Visualisation23
    ]
):
    root: (
        Visualisation1
        | Visualisation2
        | Visualisation3
        | Visualisation4
        | Visualisation5
        | Visualisation6
        | Visualisation7
        | Visualisation8
        | Visualisation9
        | Visualisation10
        | Visualisation11
        | Visualisation12
        | Visualisation13
        | Visualisation14
        | Visualisation15
        | Visualisation16
        | Visualisation17
        | Visualisation18
        | Visualisation19
        | Visualisation20
        | Visualisation21
        | Visualisation22
        | Visualisation23
    ) = Field(
        ...,
        description='JSON schema for Gooddata Analytics Visualisation',
        title='Visualisation',
    )


class Dashboard1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the dashboard.')
    type: Type21
    version: Version | None = Field(
        None,
        description='Dashboard model version. "2" (default if omitted) — legacy shape: root-level sections/filters are also mirrored into a default tab, producing a declarative model with duplicated content for backward compatibility with older SDK readers. "3" — clean shape: tabs are the sole source of layout and filters; root sections/filters in YAML are still allowed as an authoring shortcut but are wrapped into a single synthetic tab without duplication. Use "3" for new dashboards; "2" exists to keep existing files round-trippable.',
    )
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dashboard. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dashboard.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dashboard.'
    )
    cross_filtering: bool | None = Field(
        None,
        description='Whether cross filtering is enabled for this dashboard. Defaults to true.',
    )
    user_filters_reset: bool | None = Field(
        None,
        description='Whether user can reset custom updated filters. Defaults to true.',
    )
    user_filters_save: bool | None = Field(
        None,
        description='Whether user filter setting will be stored in local storage. Defaults to true.',
    )
    filter_views: bool | None = Field(
        None,
        description='Whether user can save and apply filter views for this dashboard. Defaults to true.',
    )
    persistent_filters_across_tabs: bool | None = Field(
        None,
        description='Whether persistent filters across tabs are enabled for this dashboard. Defaults to true.',
    )
    timezone_config: TimezoneConfig | None = Field(
        None,
        description='Dashboard-level timezone configuration. If omitted, the workspace or organization timezone setting is used.',
    )
    enable_section_headers: bool | None = Field(
        None,
        description='Applies to the root layout. Whether all sections headers are enabled. Defaults to true.',
    )
    sections: list[Section] | None = Field(
        None, description='A list of sections in this dashboard.'
    )
    filters: DashboardFilters | None = None
    plugins: list[Plugins | Identifier] | None = Field(
        None, description='A list of plugins in this dashboard.'
    )
    tabs: list[Tab] | None = Field(
        None,
        description='A list of tabs in this dashboard. Each tab has its own layout, filters, and filter configurations. Mutually exclusive with sections and filters at dashboard level.',
    )
    permissions: Permissions | None = Field(
        None, description='Permissions for the dashboard'
    )


class Section(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    title: str | None = Field(None, description='Optional title of the section')
    description: str | None = Field(
        None, description='Optional description of the section'
    )
    widgets: list[Widget] = Field(..., description='A list of widgets in this section.')


class Tab(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the tab.')
    title: Title = Field(..., description='Display title for the tab.')
    filters: DashboardFilters | None = Field(
        None, description='Filters specific to this tab.'
    )
    sections: list[Section] = Field(..., description='A list of sections in this tab.')


class Section1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    title: str | None = Field(None, description='Optional title of the section')
    description: str | None = Field(
        None, description='Optional description of the section'
    )
    widgets: list[Widget] = Field(..., description='A list of widgets in this section')


class Widget3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    container: Identifier = Field(..., description='A unique identifier of the widget.')
    columns: Columns | None = Field(
        None,
        description="An optional width of the widget within the grid. When the parent container's direction is set to 'row', widget widths can vary up to the width of the container. Widgets are placed next to each other and wrap to the next row when their combined width exceeds that of the container. When the direction is set to 'column', the width does not need to be set, or it should match the width of the container.",
    )
    rows: float | None = Field(
        None,
        description="An optional height of the widget within the grid, where each row is approximately 20px high. When the parent container's direction is 'row', the height should be greater than the total height of all rows formed by wrapped widgets in the container where row height is determined by highest widget in the row. When the direction is 'column', each widget occupies one row; therefore, the height must be equal to or greater than the combined height of all widgets in the container.",
    )
    layout_direction: LayoutDirection | None = Field(
        None, description='Layout direction for the container widgets'
    )
    enable_section_headers: bool | None = Field(
        None,
        description='Whether header of sections in the layout is enabled. Defaults to true',
    )
    sections: list[Section1] = Field(
        ..., description='A list of sections contained in this container'
    )


class PublisherDocumentV21(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: constr(pattern=r'^(?!default\.)(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A unique identifier of the document. Ids starting with default. are reserved.',
    )
    type: Type29
    version: Version1 = Field(..., description='Version of the content format.')
    title: PublisherEntityTitleV2
    description: PublisherEntityDescriptionV2 | None = None
    tags: PublisherEntityTagsV2 | None = None
    period: PublisherPeriodV2
    content: PublisherDocumentContentV2


class PublisherDocumentTemplateV21(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: constr(pattern=r'^(?!default\.)(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A unique identifier of the document template. Ids starting with default. are reserved.',
    )
    type: Type30
    version: Version1 = Field(..., description='Version of the content format.')
    title: PublisherEntityTitleV2
    description: PublisherEntityDescriptionV2 | None = None
    tags: PublisherEntityTagsV2 | None = None
    content: PublisherDocumentContentV2


class PublisherContainerV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type32
    id: PublisherPageNodeIdV2 | None = None
    children: list[PublisherLayoutNodeV2] = Field(
        ...,
        description="Nodes laid out along the container's direction. An empty list renders as a spacer.",
    )
    proportion: PublisherPageProportionV2 | None = None
    locked: bool | None = None
    style: PublisherContainerStyleV2 | None = None


class PublisherPageTemplateV21(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: constr(pattern=r'^(?!default\.)(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A unique identifier of the page template. Ids starting with default. are reserved.',
    )
    type: Type39
    version: Version1 = Field(..., description='Version of the content format.')
    title: PublisherEntityTitleV2
    description: PublisherEntityDescriptionV2 | None = None
    tags: PublisherEntityTagsV2 | None = None
    content: PublisherPageBodyV2 = Field(
        ...,
        description='Copied into a document, with a page id added, when the template is used.',
    )


class Report1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the document.')
    type: Type60
    title: Title = Field(..., description='A human readable title for the document.')
    description: Description | None = Field(
        None, description='An optional description of the document.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this document.'
    )
    period: ReportPeriod = Field(
        ...,
        description="The finished period the document covers. It is not a filter: at execution time it materializes as an absolute date filter on each visualization's date dataset, at the lowest precedence, which a visualization opts out of with ignore_report_period.",
    )
    pages: list[ReportPageBody] = Field(
        ...,
        description='Ordered pages of the document. A page is a deep copy taken when it was added, and never changes with the page layout or template it came from.',
    )
    filters: DashboardFilters | None = Field(
        None,
        description='Document filters; pages and visualizations may extend or override them.',
    )
    variables: list[ReportVariable] | None = Field(
        None,
        description="Custom variables the document's text can interpolate as {name}. Built-in variable names win a collision.",
    )
    takeaways_instruction: str | None = Field(
        None,
        description='Instructions every AI takeaway without instructions of its own is generated with. Supports {variables}.',
    )
    variable_values: dict[str, str] | None = Field(
        None,
        description='Values for the declared variables, keyed by variable name. A variable with no value here falls back to its default.',
    )


class LayoutColumn(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    weight: ReportWeight | None = None
    column: list[ReportLayoutNode] = Field(
        ..., description='Children laid out vertically.'
    )
    style: ReportBoxStyle | None = Field(
        None,
        description="Paint of this container's box. Never affects how children are laid out.",
    )


class LayoutRow(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    weight: ReportWeight | None = None
    row: list[ReportLayoutNode] = Field(
        ..., description='Children laid out horizontally.'
    )
    style: ReportBoxStyle | None = Field(
        None,
        description="Paint of this container's box. Never affects how children are laid out.",
    )


class ReportPageLayout1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the document page layout.'
    )
    type: Type61
    title: Title = Field(
        ..., description='A human readable title for the document page layout.'
    )
    description: Description | None = Field(
        None, description='An optional description of the document page layout.'
    )
    tags: Tags | None = Field(
        None,
        description='A list of strings - metadata tags of this document page layout.',
    )
    kind: ReportPageKind | None = None
    format: ReportPageFormat | None = None
    style: ReportBoxStyle | None = Field(
        None,
        description='Paint of the page itself, behind everything the layout places.',
    )
    layout: ReportLayoutNode = Field(..., description='Root of the page layout tree.')
    filters: DashboardFilters | None = Field(
        None,
        description='Page filters, carried into the template and document content this page is copied into.',
    )


class ReportTemplate1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the document template.'
    )
    type: Type62
    title: Title = Field(
        ..., description='A human readable title for the document template.'
    )
    description: Description | None = Field(
        None, description='An optional description of the document template.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this document template.'
    )
    pages: list[ReportPageBody] = Field(
        ...,
        description='Ordered pages of the template. A document created from the template deep-copies them and keeps no reference back, so the document stays frozen while the template evolves.',
    )
    filters: DashboardFilters | None = Field(
        None,
        description='Template filters; pages and visualizations may extend or override them.',
    )
    variables: list[ReportVariable] | None = Field(
        None,
        description="Custom variables the template's text can interpolate as {name}. A document created from it gives them values.",
    )
    takeaways_instruction: str | None = Field(
        None,
        description='Instructions every AI takeaway without instructions of its own is generated with. Supports {variables}.',
    )


class Dashboard(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the dashboard.')
    type: Type68
    version: Version4 | None = Field(
        None,
        description='Dashboard model version. "2" (default if omitted) — legacy shape: root-level sections/filters are also mirrored into a default tab, producing a declarative model with duplicated content for backward compatibility with older SDK readers. "3" — clean shape: tabs are the sole source of layout and filters; root sections/filters in YAML are still allowed as an authoring shortcut but are wrapped into a single synthetic tab without duplication. Use "3" for new dashboards; "2" exists to keep existing files round-trippable.',
    )
    title: Title | None = Field(
        None,
        description='An optional human readable title for the dashboard. Will be derived from id if not provided explicitly.',
    )
    description: Description | None = Field(
        None, description='An optional description of the dashboard.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this dashboard.'
    )
    cross_filtering: bool | None = Field(
        None,
        description='Whether cross filtering is enabled for this dashboard. Defaults to true.',
    )
    user_filters_reset: bool | None = Field(
        None,
        description='Whether user can reset custom updated filters. Defaults to true.',
    )
    user_filters_save: bool | None = Field(
        None,
        description='Whether user filter setting will be stored in local storage. Defaults to true.',
    )
    filter_views: bool | None = Field(
        None,
        description='Whether user can save and apply filter views for this dashboard. Defaults to true.',
    )
    persistent_filters_across_tabs: bool | None = Field(
        None,
        description='Whether persistent filters across tabs are enabled for this dashboard. Defaults to true.',
    )
    timezone_config: TimezoneConfig | None = Field(
        None,
        description='Dashboard-level timezone configuration. If omitted, the workspace or organization timezone setting is used.',
    )
    enable_section_headers: bool | None = Field(
        None,
        description='Applies to the root layout. Whether all sections headers are enabled. Defaults to true.',
    )
    sections: list[Section] | None = Field(
        None, description='A list of sections in this dashboard.'
    )
    filters: DashboardFilters | None = None
    plugins: list[Plugins | Identifier] | None = Field(
        None, description='A list of plugins in this dashboard.'
    )
    tabs: list[Tab] | None = Field(
        None,
        description='A list of tabs in this dashboard. Each tab has its own layout, filters, and filter configurations. Mutually exclusive with sections and filters at dashboard level.',
    )
    permissions: Permissions | None = Field(
        None, description='Permissions for the dashboard'
    )


class PublisherDocumentContentV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    defaults: PublisherDocumentDefaultsV2 | None = None
    filters: DashboardFilters | None = Field(
        None,
        description='Document filters. Date filters name their date dataset. At most one filter per attribute or date dataset.',
    )
    style: PublisherDocumentStyleV2 | None = None
    locale: Locale | None = Field(
        None, description='Overrides the workspace locale for this document.'
    )
    format_locale: Locale | None = Field(
        None, description='Overrides the workspace format locale used for dates.'
    )
    pages: list[PublisherDocumentPageV2] | None = None
    sections: list[PublisherSectionV2] | None = None


class PublisherDocumentTemplateV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: constr(pattern=r'^(?!default\.)(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A unique identifier of the document template. Ids starting with default. are reserved.',
    )
    type: Type76
    version: Version5 = Field(..., description='Version of the content format.')
    title: PublisherEntityTitleV2
    description: PublisherEntityDescriptionV2 | None = None
    tags: PublisherEntityTagsV2 | None = None
    content: PublisherDocumentContentV2


class PublisherDocumentV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: constr(pattern=r'^(?!default\.)(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A unique identifier of the document. Ids starting with default. are reserved.',
    )
    type: Type77
    version: Version5 = Field(..., description='Version of the content format.')
    title: PublisherEntityTitleV2
    description: PublisherEntityDescriptionV2 | None = None
    tags: PublisherEntityTagsV2 | None = None
    period: PublisherPeriodV2
    content: PublisherDocumentContentV2


class PublisherPageBodyV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    kind: Kind | None = Field(
        None, description='Editor hint. It does not change how the page renders.'
    )
    page_size: PublisherPageSizeV2 | None = None
    notes: constr(min_length=1) | None = Field(
        None, description='Markdown speaker notes, never drawn on the page.'
    )
    style: PublisherPageStyleV2 | None = None
    layout: PublisherLayoutNodeV2 = Field(
        ..., description='Root of the page layout tree.'
    )
    filters: DashboardFilters | None = Field(
        None, description='Page filters, applied on top of the document filters.'
    )


class PublisherPageTemplateV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: constr(pattern=r'^(?!default\.)(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ...,
        description='A unique identifier of the page template. Ids starting with default. are reserved.',
    )
    type: Type78
    version: Version5 = Field(..., description='Version of the content format.')
    title: PublisherEntityTitleV2
    description: PublisherEntityDescriptionV2 | None = None
    tags: PublisherEntityTagsV2 | None = None
    content: PublisherPageBodyV2 = Field(
        ...,
        description='Copied into a document, with a page id added, when the template is used.',
    )


class Report(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the document.')
    type: Type79
    title: Title = Field(..., description='A human readable title for the document.')
    description: Description | None = Field(
        None, description='An optional description of the document.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this document.'
    )
    period: ReportPeriod = Field(
        ...,
        description="The finished period the document covers. It is not a filter: at execution time it materializes as an absolute date filter on each visualization's date dataset, at the lowest precedence, which a visualization opts out of with ignore_report_period.",
    )
    pages: list[ReportPageBody] = Field(
        ...,
        description='Ordered pages of the document. A page is a deep copy taken when it was added, and never changes with the page layout or template it came from.',
    )
    filters: DashboardFilters | None = Field(
        None,
        description='Document filters; pages and visualizations may extend or override them.',
    )
    variables: list[ReportVariable] | None = Field(
        None,
        description="Custom variables the document's text can interpolate as {name}. Built-in variable names win a collision.",
    )
    takeaways_instruction: str | None = Field(
        None,
        description='Instructions every AI takeaway without instructions of its own is generated with. Supports {variables}.',
    )
    variable_values: dict[str, str] | None = Field(
        None,
        description='Values for the declared variables, keyed by variable name. A variable with no value here falls back to its default.',
    )


class ReportPageBody(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='An id for this page, unique within the document.'
    )
    kind: ReportPageKind | None = None
    format: ReportPageFormat | None = None
    style: ReportBoxStyle | None = Field(
        None,
        description='Paint of the page itself, behind everything the layout places.',
    )
    layout: ReportLayoutNode = Field(..., description='Root of the page layout.')
    filters: DashboardFilters | None = Field(
        None,
        description="Page filters, merged over the document's own. A filter targeting the same object replaces the inherited one; a visualization's own filters apply on top.",
    )


class ReportPageLayout(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the document page layout.'
    )
    type: Type80
    title: Title = Field(
        ..., description='A human readable title for the document page layout.'
    )
    description: Description | None = Field(
        None, description='An optional description of the document page layout.'
    )
    tags: Tags | None = Field(
        None,
        description='A list of strings - metadata tags of this document page layout.',
    )
    kind: ReportPageKind | None = None
    format: ReportPageFormat | None = None
    style: ReportBoxStyle | None = Field(
        None,
        description='Paint of the page itself, behind everything the layout places.',
    )
    layout: ReportLayoutNode = Field(..., description='Root of the page layout tree.')
    filters: DashboardFilters | None = Field(
        None,
        description='Page filters, carried into the template and document content this page is copied into.',
    )


class ReportTemplate(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the document template.'
    )
    type: Type81
    title: Title = Field(
        ..., description='A human readable title for the document template.'
    )
    description: Description | None = Field(
        None, description='An optional description of the document template.'
    )
    tags: Tags | None = Field(
        None, description='A list of strings - metadata tags of this document template.'
    )
    pages: list[ReportPageBody] = Field(
        ...,
        description='Ordered pages of the template. A document created from the template deep-copies them and keeps no reference back, so the document stays frozen while the template evolves.',
    )
    filters: DashboardFilters | None = Field(
        None,
        description='Template filters; pages and visualizations may extend or override them.',
    )
    variables: list[ReportVariable] | None = Field(
        None,
        description="Custom variables the template's text can interpolate as {name}. A document created from it gives them values.",
    )
    takeaways_instruction: str | None = Field(
        None,
        description='Instructions every AI takeaway without instructions of its own is generated with. Supports {variables}.',
    )


class PublisherDocumentPageV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the document.')
    visible: bool | None = Field(
        None,
        description='Defaults to true. A hidden page is left out of the viewer, exports and page numbers.',
    )
    kind: Kind | None = Field(
        None, description='Editor hint. It does not change how the page renders.'
    )
    page_size: PublisherPageSizeV2 | None = None
    notes: constr(min_length=1) | None = Field(
        None, description='Markdown speaker notes, never drawn on the page.'
    )
    style: PublisherPageStyleV2 | None = None
    layout: PublisherLayoutNodeV2 = Field(
        ..., description='Root of the page layout tree.'
    )
    filters: DashboardFilters | None = Field(
        None, description='Page filters, applied on top of the document filters.'
    )


class PublisherSectionV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: PublisherPageNodeIdV2 = Field(..., description='Unique within the document.')
    title: constr(min_length=1) | None = None
    description: constr(min_length=1) | None = None
    pages: list[PublisherDocumentPageV2]


class Widget(RootModel[VisualizationWidget | Widget1 | Widget2 | Widget3]):
    root: VisualizationWidget | Widget1 | Widget2 | Widget3 = Field(..., title='Widget')


class PublisherLayoutNodeV2(
    RootModel[
        PublisherContainerV2
        | PublisherTitleWidgetV2
        | PublisherHeadingWidgetV2
        | PublisherTextWidgetV2
        | PublisherImageWidgetV2
        | PublisherVisualizationWidgetV2
        | PublisherTakeawayWidgetV2
    ]
):
    root: (
        PublisherContainerV2
        | PublisherTitleWidgetV2
        | PublisherHeadingWidgetV2
        | PublisherTextWidgetV2
        | PublisherImageWidgetV2
        | PublisherVisualizationWidgetV2
        | PublisherTakeawayWidgetV2
    ) = Field(
        ...,
        description='A row or column container, or a widget.',
        title='Publisher Layout Node V2',
    )


class ReportLayoutNode(
    RootModel[
        LayoutColumn
        | LayoutRow
        | VisualizationSlot
        | HeadingSlot
        | ParagraphSlot
        | ImageSlot
    ]
):
    root: (
        LayoutColumn
        | LayoutRow
        | VisualizationSlot
        | HeadingSlot
        | ParagraphSlot
        | ImageSlot
    ) = Field(
        ...,
        description='A node of the page layout. A node carrying column or row splits its area along that direction; every other node draws content, told apart by the content key it carries.',
        title='Report Layout Node',
    )


class Metadata(
    RootModel[
        Dataset
        | DateDataset
        | Metric
        | ComputedAttribute
        | Dashboard
        | Plugin
        | AttributeHierarchy
        | Parameter
        | Visualisation
        | Report
        | ReportTemplate
        | ReportPageLayout
        | PublisherDocumentV2
        | PublisherDocumentTemplateV2
        | PublisherPageTemplateV2
    ]
):
    root: (
        Dataset
        | DateDataset
        | Metric
        | ComputedAttribute
        | Dashboard
        | Plugin
        | AttributeHierarchy
        | Parameter
        | Visualisation
        | Report
        | ReportTemplate
        | ReportPageLayout
        | PublisherDocumentV2
        | PublisherDocumentTemplateV2
        | PublisherPageTemplateV2
    ) = Field(..., description='JSON schema for Gooddata Analytics', title='Metadata')


Dashboard1.model_rebuild()
Section.model_rebuild()
Section1.model_rebuild()
PublisherDocumentV21.model_rebuild()
PublisherDocumentTemplateV21.model_rebuild()
PublisherContainerV2.model_rebuild()
PublisherPageTemplateV21.model_rebuild()
Report1.model_rebuild()
LayoutColumn.model_rebuild()
LayoutRow.model_rebuild()
ReportPageLayout1.model_rebuild()
ReportTemplate1.model_rebuild()
PublisherDocumentContentV2.model_rebuild()
PublisherPageBodyV2.model_rebuild()
Report.model_rebuild()
ReportPageBody.model_rebuild()
ReportPageLayout.model_rebuild()
PublisherDocumentPageV2.model_rebuild()
