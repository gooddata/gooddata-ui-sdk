# (C) 2026 GoodData Corporation
# schema-hash: d33fde6e156639a69bd104b0a89144e53c9b0498394dbc63f30d859eb278225f

from __future__ import annotations

from enum import Enum, IntEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, RootModel, confloat, conint, constr

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
    "DashboardTextFilter",
    "DashboardTextFilter1",
    "DashboardTextFilter2",
    "DataLabelsStyle",
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
    "Format",
    "Function",
    "GeoAreaConfig",
    "GrandTotalsPosition",
    "Granularity",
    "Granularity1",
    "Granularity2",
    "Granularity3",
    "GridLineShape",
    "Identifier",
    "IgnoredDrillDown",
    "IgnoredDrillDown1",
    "IgnoredDrillDown2",
    "IgnoredDrillDownsIntersection",
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
    "Label",
    "LabelIdentifier",
    "LabelTranslation",
    "LayerItem",
    "LayerItem1",
    "LayerItem2",
    "LayerItemBase",
    "LayoutDirection",
    "LineStyleMapping",
    "LineStyleMapping1",
    "Locale",
    "MatchType",
    "MaxSize",
    "Metadata",
    "Metric",
    "Metric1",
    "MetricIdentifier",
    "Metrics",
    "MinSize",
    "Mode",
    "Mode2",
    "Mode6",
    "MvfCondition",
    "MvfCondition1",
    "MvfCondition2",
    "MvfCondition3",
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
    "Tab",
    "Tags",
    "Target",
    "Target1",
    "Template",
    "TextWrapping",
    "TimezoneConfig",
    "TimezoneId",
    "Title",
    "Title1",
    "Title2",
    "TotalItem",
    "Type",
    "Type1",
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
    "Type70",
    "Type71",
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
    "Type9",
    "Using",
    "Using1",
    "Using2",
    "Value",
    "Value1",
    "Value2",
    "ValueType",
    "Version",
    "Viewport",
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


class DashboardAttributeFilter1(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type3
    using: AttributeIdentifier | LabelIdentifier = Field(
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
    state: Any | None = None


class DashboardAttributeFilter2(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type3
    using: AttributeIdentifier | LabelIdentifier = Field(
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
    state: Any | None = None


class DashboardAttributeFilter(
    RootModel[DashboardAttributeFilter1 | DashboardAttributeFilter2]
):
    root: DashboardAttributeFilter1 | DashboardAttributeFilter2 = Field(
        ...,
        description='A dashboard attribute filter',
        title='Dashboard attribute filter',
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
    using: AttributeIdentifier | LabelIdentifier = Field(
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
    using: AttributeIdentifier | LabelIdentifier = Field(
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
    using: AttributeIdentifier | LabelIdentifier = Field(
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
    using: AttributeIdentifier | LabelIdentifier = Field(
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
    using: AttributeIdentifier | LabelIdentifier = Field(
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
    dimensionality: list[LabelIdentifier | str] | None = Field(
        None,
        description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
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
    dimensionality: list[LabelIdentifier | str] | None = Field(
        None,
        description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
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
    dimensionality: list[LabelIdentifier | str] | None = Field(
        None,
        description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
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
    dimensionality: list[LabelIdentifier | str] | None = Field(
        None,
        description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
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
    attribute: LabelIdentifier | str | None = Field(
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
    attribute: LabelIdentifier | str | None = Field(
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


class DataType(Enum):
    INT = 'INT'
    STRING = 'STRING'
    DATE = 'DATE'
    NUMERIC = 'NUMERIC'
    TIMESTAMP = 'TIMESTAMP'
    TIMESTAMP_TZ = 'TIMESTAMP_TZ'
    BOOLEAN = 'BOOLEAN'
    HLL = 'HLL'


class Locale(RootModel[constr(pattern=r'^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{1,8})*$')]):
    root: constr(pattern=r'^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{1,8})*$') = Field(
        ...,
        description='Locale string in BCP 47 format (for example en-US or cs-CZ-u-kn-true).',
    )


class ValueType(Enum):
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
    metric = 'metric'


class Type30(Enum):
    parameter = 'parameter'


class Type31(Enum):
    STRING = 'STRING'


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


class Type32(Enum):
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


class Type33(Enum):
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


class Type34(Enum):
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
    type: Type34 | None = Field(
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


class Type35(Enum):
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


class Type36(Enum):
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
    type: Type36 | None = Field(
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


class Type37(Enum):
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


class Type38(Enum):
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
    type: Type38 | None = Field(
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


class Type39(Enum):
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


class Type40(Enum):
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
    type: Type40 | None = Field(
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


class Type41(Enum):
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


class Type42(Enum):
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
    type: Type42 | None = Field(
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


class Type43(Enum):
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


class Type44(Enum):
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
    type: Type44 | None = Field(
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


class Type45(Enum):
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


class Type46(Enum):
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
    type: Type46 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Type47(Enum):
    attribute_sort = 'attribute_sort'


class Direction(Enum):
    ASC = 'ASC'
    DESC = 'DESC'


class Aggregation14(Enum):
    SUM = 'SUM'


class Type48(Enum):
    metric_sort = 'metric_sort'


class Function(Enum):
    SUM = 'SUM'
    AVG = 'AVG'
    MIN = 'MIN'
    MAX = 'MAX'
    MED = 'MED'
    NAT = 'NAT'


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


class Type49(Enum):
    SUM = 'SUM'
    AVG = 'AVG'
    MAX = 'MAX'
    MIN = 'MIN'
    MED = 'MED'
    NAT = 'NAT'


class BucketLocationItem(RootModel[str]):
    root: str = Field(..., title='Location Bucket')


class Type50(Enum):
    pushpin = 'pushpin'
    area = 'area'


class Type51(Enum):
    attribute_hierarchy = 'attribute_hierarchy'


class Type52(Enum):
    computed_attribute = 'computed_attribute'


class DataLabelsStyle(Enum):
    auto = 'auto'
    backplate = 'backplate'


class Type53(Enum):
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
    type: Type53 | None = None
    pattern_name_mapping: dict[str, PatternNameMapping] | None = None


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


class Type54(Enum):
    dashboard = 'dashboard'


class Type55(Enum):
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


class Type58(Enum):
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


class Type59(Enum):
    metric = 'metric'


class Type60(Enum):
    parameter = 'parameter'


class Type61(Enum):
    plugin = 'plugin'


class Title(RootModel[constr(max_length=255)]):
    root: constr(max_length=255)


class Type62(Enum):
    table = 'table'


class Type63(Enum):
    bar_chart = 'bar_chart'


class Type64(Enum):
    column_chart = 'column_chart'


class Type65(Enum):
    line_chart = 'line_chart'


class Type66(Enum):
    area_chart = 'area_chart'


class Type67(Enum):
    scatter_chart = 'scatter_chart'


class Type68(Enum):
    bubble_chart = 'bubble_chart'


class Type69(Enum):
    pie_chart = 'pie_chart'


class Type70(Enum):
    donut_chart = 'donut_chart'


class Type71(Enum):
    treemap_chart = 'treemap_chart'


class Type72(Enum):
    pyramid_chart = 'pyramid_chart'


class Type73(Enum):
    funnel_chart = 'funnel_chart'


class Type74(Enum):
    heatmap_chart = 'heatmap_chart'


class Type75(Enum):
    bullet_chart = 'bullet_chart'


class Type76(Enum):
    waterfall_chart = 'waterfall_chart'


class Type77(Enum):
    dependency_wheel_chart = 'dependency_wheel_chart'


class Type78(Enum):
    sankey_chart = 'sankey_chart'


class Type79(Enum):
    headline_chart = 'headline_chart'


class Type80(Enum):
    combo_chart = 'combo_chart'


class Type81(Enum):
    geo_chart = 'geo_chart'


class Type82(Enum):
    geo_area_chart = 'geo_area_chart'


class Type83(Enum):
    repeater_chart = 'repeater_chart'


class Type84(Enum):
    radar_chart = 'radar_chart'


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
    dimensionality: list[LabelIdentifier] | None = Field(
        None,
        description='Optional array of label references to apply dimensionality to the filter.',
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
    locale: str | None = Field(
        None,
        description='An optional locale whose collation order the computed values are sorted by.',
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
    parameters: Any | None = Field(
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
    href: AttributeIdentifier | LabelIdentifier | None = Field(
        None,
        description='An ID of the attribute that holds the url to be opened on interaction',
    )
    label: AttributeIdentifier | LabelIdentifier | None = Field(
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
    value_type: ValueType | None = None
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


class Metric1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the metric.')
    type: Type29
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
    type: Type31
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
    type: Type32
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
        | constr(pattern=r'^fact/(?!\.)[.A-Za-z0-9_-]{1,255}$')
    ) = Field(..., description='Attribute or label identifier to use for this field.')
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type33 | None = Field(
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
    type: Type39 | None = Field(
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
    type: Type41 | None = Field(
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
    type: Type43 = Field(
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
    type: Type45 = Field(
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
    type: Type47
    by: str | AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Local attribute or label to use in this sort.'
    )
    direction: Direction = Field(..., description='Sort direction.')
    aggregation: Aggregation14 | None = Field(
        None, description='Aggregation function to use for this sort.'
    )


class Metrics(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    by: str | AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Local attribute or label to use in this sort.'
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
    type: Type48
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
    type: Type49
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
    type: Type51
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
    type: Type52
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
    locale: str | None = Field(
        None,
        description='An optional locale whose collation order the computed values are sorted by.',
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
        description='Per-series line style and weight overrides. Keys are measure identifiers.',
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
    type: Type58
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
    type: Type59
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
    type: Type61
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


class ParameterDefinition(RootModel[StringParameterDefinition]):
    root: StringParameterDefinition = Field(
        ...,
        description='A typed parameter definition. Only textual parameters are supported as code.',
        title='Parameter Definition',
    )


class QuerySort(RootModel[QueryAttributeSort | QueryMetricSort]):
    root: QueryAttributeSort | QueryMetricSort = Field(..., title='Sort')


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
    type: Type50 | None = Field(
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
    type: Type60
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


class QueryFilters(RootModel[dict[str, QueryFilter]]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), QueryFilter] = Field(
        ..., title='Query Filters'
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


class Fields(RootModel[dict[str, Attribute | Fact | AggregatedFact]]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        Attribute | Fact | AggregatedFact,
    ] = Field(..., title='Fields')


class Parameter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the parameter.')
    type: Type30
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
    type: Type35 | None = Field(
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
    type: Type37 | None = Field(
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


class LayerItem(RootModel[LayerItemBase | LayerItem1 | LayerItem2]):
    root: LayerItemBase | LayerItem1 | LayerItem2


class Dataset5(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type55
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
    type: Type55
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
    type: Type55
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


class QueryFields(RootModel[dict[str, QueryField]]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), QueryField] = Field(
        ..., title='Fields'
    )


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


class Visualisation1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type62 = Field(..., description='Type of visualisation.')
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
    type: Type63 = Field(..., description='Type of visualisation.')
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
    type: Type64 = Field(..., description='Type of visualisation.')
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
    type: Type65 = Field(..., description='Type of visualisation.')
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
    type: Type66 = Field(..., description='Type of visualisation.')
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
    type: Type67 = Field(..., description='Type of visualisation.')
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
    type: Type68 = Field(..., description='Type of visualisation.')
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
    type: Type69 = Field(..., description='Type of visualisation.')
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
    type: Type70 = Field(..., description='Type of visualisation.')
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
    type: Type71 = Field(..., description='Type of visualisation.')
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
    type: Type72 = Field(..., description='Type of visualisation.')
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
    type: Type73 = Field(..., description='Type of visualisation.')
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
    type: Type74 = Field(..., description='Type of visualisation.')
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
    type: Type75 = Field(..., description='Type of visualisation.')
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
    type: Type76 = Field(..., description='Type of visualisation.')
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
    type: Type77 = Field(..., description='Type of visualisation.')
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
    type: Type78 = Field(..., description='Type of visualisation.')
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
    type: Type79 = Field(..., description='Type of visualisation.')
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
    type: Type80 = Field(..., description='Type of visualisation.')
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
    type: Type81 = Field(..., description='Type of visualisation.')
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


class Dashboard(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the dashboard.')
    type: Type54
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


class Widget(RootModel[VisualizationWidget | Widget1 | Widget2 | Widget3]):
    root: VisualizationWidget | Widget1 | Widget2 | Widget3 = Field(..., title='Widget')


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
    ) = Field(..., description='JSON schema for Gooddata Analytics', title='Metadata')


Dashboard1.model_rebuild()
Section.model_rebuild()
Section1.model_rebuild()
