# (C) 2026 GoodData Corporation
# schema-hash: a24115f6345c86cd254fa623ff5aea6964832a8a7585392404e1ac2eb7839bbc

from __future__ import annotations

from enum import Enum, IntEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, RootModel, confloat, constr

import re as _re
import pydantic as _pydantic

_pydantic_version_match = _re.match(r'(\d+)\.(\d+)\.(\d+)', _pydantic.VERSION)
if not _pydantic_version_match or tuple(int(g) for g in _pydantic_version_match.groups()) < (2, 11, 0):
    raise ImportError(
        f'gooddata_code_convertors.pydantic_models requires pydantic>=2.11.0 '
        f'(RootModel classes here need model_config regex_engine="python-re" to validate negative-lookahead patterns, silently broken on some earlier/2.10.x releases — see pydantic#11042/#11184), but pydantic {_pydantic.VERSION} is installed.'
    )

__all__ = [
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
    "Condition",
    "Condition1",
    "Condition10",
    "Condition11",
    "Condition12",
    "Condition13",
    "Condition14",
    "Condition15",
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
    "CustomTooltip",
    "Dashboard",
    "Dashboard1",
    "DashboardAbsoluteDateFilter",
    "DashboardAttributeFilter",
    "DashboardAttributeFilter1",
    "DashboardAttributeFilter2",
    "DashboardFilterGroup",
    "DashboardFilters",
    "DashboardFilters1",
    "DashboardFilters10",
    "DashboardFilters11",
    "DashboardFilters12",
    "DashboardFilters13",
    "DashboardFilters14",
    "DashboardFilters15",
    "DashboardFilters16",
    "DashboardFilters2",
    "DashboardFilters3",
    "DashboardFilters4",
    "DashboardFilters5",
    "DashboardFilters6",
    "DashboardFilters7",
    "DashboardFilters8",
    "DashboardFilters9",
    "DashboardFiltersModel",
    "DashboardFiltersNoGroups",
    "DashboardFiltersNoGroups1",
    "DashboardFiltersNoGroups2",
    "DashboardFiltersNoGroups3",
    "DashboardFiltersNoGroups4",
    "DashboardFiltersNoGroups5",
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
    "EmptyValues4",
    "EmptyValues6",
    "Fact",
    "FactIdentifier",
    "Fields",
    "Fields1",
    "Fields2",
    "Fields3",
    "Fields4",
    "Format",
    "Function",
    "GeoAreaConfig",
    "GrandTotalsPosition",
    "Granularity",
    "Granularity1",
    "Granularity2",
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
    "Metadata1",
    "Metadata2",
    "Metadata3",
    "Metadata4",
    "Metadata5",
    "Metadata6",
    "Metadata7",
    "Metadata8",
    "Metric",
    "Metric1",
    "MetricIdentifier",
    "Metrics",
    "MinSize",
    "Mode",
    "Mode11",
    "Mode13",
    "Mode16",
    "Mode18",
    "Mode2",
    "Mode20",
    "Mode4",
    "Mode6",
    "Mode9",
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
    "QueryFilter1",
    "QueryFilter2",
    "QueryFilter3",
    "QueryFilter4",
    "QueryFilter5",
    "QueryFilter6",
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
    "QuerySort1",
    "QuerySort2",
    "QuerySort3",
    "QuerySorts",
    "QueryTextFilter",
    "QueryTextFilter1",
    "QueryTextFilter2",
    "Reference",
    "RowHeight",
    "Rule",
    "Scope",
    "Section",
    "Section1",
    "SelectionType",
    "SelectionType10",
    "SelectionType2",
    "SelectionType4",
    "SelectionType6",
    "SelectionType8",
    "ShapeType",
    "SimpleColorItem",
    "SortDirection",
    "Source",
    "SourceColumn",
    "State",
    "Style",
    "Tab",
    "Tags",
    "Target",
    "Target1",
    "Template",
    "TextWrapping",
    "Title",
    "Title1",
    "Title2",
    "TotalItem",
    "Type",
    "Type100",
    "Type101",
    "Type102",
    "Type103",
    "Type104",
    "Type105",
    "Type106",
    "Type107",
    "Type108",
    "Type109",
    "Type11",
    "Type110",
    "Type111",
    "Type112",
    "Type113",
    "Type114",
    "Type115",
    "Type116",
    "Type117",
    "Type118",
    "Type119",
    "Type120",
    "Type13",
    "Type15",
    "Type16",
    "Type17",
    "Type19",
    "Type21",
    "Type23",
    "Type24",
    "Type25",
    "Type30",
    "Type36",
    "Type38",
    "Type39",
    "Type41",
    "Type45",
    "Type47",
    "Type48",
    "Type51",
    "Type52",
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
    "Type70",
    "Type71",
    "Type72",
    "Type73",
    "Type74",
    "Type75",
    "Type78",
    "Type79",
    "Type8",
    "Type80",
    "Type81",
    "Type82",
    "Type83",
    "Type84",
    "Type85",
    "Type87",
    "Type89",
    "Type9",
    "Type91",
    "Type92",
    "Type93",
    "Type96",
    "Type97",
    "Type98",
    "Type99",
    "Using",
    "Using1",
    "Using2",
    "Using3",
    "Using4",
    "Value",
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
    dataset = 'dataset'
    date = 'date'
    metric = 'metric'
    dashboard = 'dashboard'
    plugin = 'plugin'
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    attribute_hierarchy = 'attribute_hierarchy'
    dataset_1 = 'dataset'
    date_1 = 'date'
    metric_1 = 'metric'
    dashboard_1 = 'dashboard'
    plugin_1 = 'plugin'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    attribute_hierarchy_1 = 'attribute_hierarchy'


class Metadata8(BaseModel):
    type: Type


class Type8(Enum):
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


class Type9(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    date_filter_2 = 'date_filter'
    date_filter_3 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_2 = 'filter_group'


class Mode(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'


class EmptyValues(Enum):
    only = 'only'
    include = 'include'
    exclude = 'exclude'


class Type11(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    attribute_filter_2 = 'attribute_filter'
    date_filter_2 = 'date_filter'
    attribute_filter_3 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_2 = 'filter_group'
    attribute_filter_4 = 'attribute_filter'
    attribute_filter_5 = 'attribute_filter'


class Mode2(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'
    readonly_1 = 'readonly'
    hidden_1 = 'hidden'
    active_1 = 'active'
    readonly_2 = 'readonly'
    hidden_2 = 'hidden'
    active_2 = 'active'


class SelectionType(Enum):
    list = 'list'
    text = 'text'
    listOrText = 'listOrText'
    list_1 = 'list'
    text_1 = 'text'
    listOrText_1 = 'listOrText'
    list_2 = 'list'
    text_2 = 'text'
    listOrText_2 = 'listOrText'


class Parents(BaseModel):
    using: str = Field(..., description='Local date filter to use as parent')
    common: bool = Field(
        ..., description='Whether the parent filter is common date or special date'
    )
    date: str | None = Field(
        None,
        description='Date dataset the common date filter is applied through. Only valid when common is true; ignored and stripped on both import and export when common is false.',
    )


class DashboardFilters2(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type11
    title: str | None = Field(None, description='Optional title of the filter')
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


class DashboardFilters3(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type11
    title: str | None = Field(None, description='Optional title of the filter')
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


class Type13(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    date_filter_2 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_2 = 'filter_group'
    text_filter_3 = 'text_filter'


class Mode4(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'
    readonly_1 = 'readonly'
    hidden_1 = 'hidden'
    active_1 = 'active'


class SelectionType2(Enum):
    list = 'list'
    text = 'text'
    listOrText = 'listOrText'
    list_1 = 'list'
    text_1 = 'text'
    listOrText_1 = 'listOrText'


class Condition(Enum):
    is_ = 'is'
    isNot = 'isNot'


class DashboardFilters4(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type13
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
    mode: Mode4 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType2 | None = Field(
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
    condition: Condition
    values: list[str | None]


class Condition1(Enum):
    contains = 'contains'
    doesNotContain = 'doesNotContain'
    startsWith = 'startsWith'
    doesNotStartWith = 'doesNotStartWith'
    endsWith = 'endsWith'
    doesNotEndWith = 'doesNotEndWith'


class DashboardFilters5(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type13
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
    mode: Mode4 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType2 | None = Field(
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
    condition: Condition1
    value: str


class Type15(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    metric_value_filter_2 = 'metric_value_filter'
    date_filter_2 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_3 = 'metric_value_filter'
    filter_group_2 = 'filter_group'


class Mode6(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'


class Type16(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    filter_group_2 = 'filter_group'
    date_filter_2 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_3 = 'filter_group'


class Type17(Enum):
    date_filter = 'date_filter'


class Type19(Enum):
    attribute_filter = 'attribute_filter'
    attribute_filter_1 = 'attribute_filter'
    attribute_filter_2 = 'attribute_filter'


class Mode9(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'
    readonly_1 = 'readonly'
    hidden_1 = 'hidden'
    active_1 = 'active'
    readonly_2 = 'readonly'
    hidden_2 = 'hidden'
    active_2 = 'active'


class SelectionType4(Enum):
    list = 'list'
    text = 'text'
    listOrText = 'listOrText'
    list_1 = 'list'
    text_1 = 'text'
    listOrText_1 = 'listOrText'
    list_2 = 'list'
    text_2 = 'text'
    listOrText_2 = 'listOrText'


class DashboardAttributeFilter1(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type19
    using: AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    multiselect: bool | None = Field(
        None, description='Whether the filter should allow multiple selection'
    )
    mode: Mode9 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    selection_type: SelectionType4 | None = Field(
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
    type: Type19
    using: AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    multiselect: bool | None = Field(
        None, description='Whether the filter should allow multiple selection'
    )
    mode: Mode9 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='If specified, the attribute filter will display the elements in selected label form.',
        title='Display As Label Identifier',
    )
    selection_type: SelectionType4 | None = Field(
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


class Mode11(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'
    readonly_1 = 'readonly'
    hidden_1 = 'hidden'
    active_1 = 'active'


class SelectionType6(Enum):
    list = 'list'
    text = 'text'
    listOrText = 'listOrText'
    list_1 = 'list'
    text_1 = 'text'
    listOrText_1 = 'listOrText'


class Type21(Enum):
    text_filter = 'text_filter'


class Condition2(Enum):
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
    mode: Mode11 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType6 | None = Field(
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
    type: Type21
    condition: Condition2
    values: list[str | None]


class Condition3(Enum):
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
    mode: Mode11 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType6 | None = Field(
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
    type: Type21
    condition: Condition3
    value: str


class DashboardTextFilter(RootModel[DashboardTextFilter1 | DashboardTextFilter2]):
    root: DashboardTextFilter1 | DashboardTextFilter2 = Field(
        ..., description='A dashboard text filter', title='Dashboard text filter'
    )


class Type23(Enum):
    metric_value_filter = 'metric_value_filter'


class Mode13(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'


class Type24(Enum):
    filter_group = 'filter_group'


class Type25(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'


class DashboardFiltersNoGroups3(BaseModel):
    type: Type25


class DashboardFiltersNoGroups4(BaseModel):
    type: Type25


class DateFilterGranularity(Enum):
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


class Condition4(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'
    GREATER_THAN_1 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_1 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_1 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_1 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_1 = 'EQUAL_TO'
    NOT_EQUAL_TO_1 = 'NOT_EQUAL_TO'
    BETWEEN_1 = 'BETWEEN'
    NOT_BETWEEN_1 = 'NOT_BETWEEN'


class MvfCondition1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    condition: Condition4 | None = Field(
        None,
        description='Condition to use for this filter. If omitted, the condition represents ALL (no filtering).',
    )


class Condition5(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'
    GREATER_THAN_1 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_1 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_1 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_1 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_1 = 'EQUAL_TO'
    NOT_EQUAL_TO_1 = 'NOT_EQUAL_TO'
    BETWEEN_1 = 'BETWEEN'
    NOT_BETWEEN_1 = 'NOT_BETWEEN'
    GREATER_THAN_2 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_2 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_2 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_2 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_2 = 'EQUAL_TO'
    NOT_EQUAL_TO_2 = 'NOT_EQUAL_TO'


class MvfCondition2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    condition: Condition5 = Field(
        ...,
        description='Condition to use for this filter. If omitted, the condition represents ALL (no filtering).',
    )
    value: float = Field(..., description='Value to use in condition for this filter.')


class Condition6(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'
    GREATER_THAN_1 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_1 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_1 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_1 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_1 = 'EQUAL_TO'
    NOT_EQUAL_TO_1 = 'NOT_EQUAL_TO'
    BETWEEN_1 = 'BETWEEN'
    NOT_BETWEEN_1 = 'NOT_BETWEEN'
    BETWEEN_2 = 'BETWEEN'
    NOT_BETWEEN_2 = 'NOT_BETWEEN'


class MvfCondition3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    condition: Condition6 = Field(
        ...,
        description='Condition to use for this filter. If omitted, the condition represents ALL (no filtering).',
    )
    from_: float = Field(
        ..., alias='from', description='From value to use in condition for this filter.'
    )
    to: float = Field(..., description='To value to use in condition for this filter.')


class MvfCondition(RootModel[MvfCondition1 | MvfCondition2 | MvfCondition3]):
    root: MvfCondition1 | MvfCondition2 | MvfCondition3 = Field(
        ..., title='Metric Value Filter Condition'
    )


class Type30(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    ranking_filter = 'ranking_filter'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    ranking_filter_1 = 'ranking_filter'


class QueryFilter6(BaseModel):
    type: Type30


class Type36(Enum):
    date_filter = 'date_filter'
    date_filter_1 = 'date_filter'
    date_filter_2 = 'date_filter'


class Granularity(Enum):
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK = 'WEEK'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    MINUTE_OF_HOUR = 'MINUTE_OF_HOUR'
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
    MINUTE_1 = 'MINUTE'
    HOUR_1 = 'HOUR'
    DAY_1 = 'DAY'
    WEEK_1 = 'WEEK'
    WEEK_US_1 = 'WEEK_US'
    MONTH_1 = 'MONTH'
    QUARTER_1 = 'QUARTER'
    YEAR_1 = 'YEAR'
    MINUTE_OF_HOUR_1 = 'MINUTE_OF_HOUR'
    HOUR_OF_DAY_1 = 'HOUR_OF_DAY'
    DAY_OF_WEEK_1 = 'DAY_OF_WEEK'
    DAY_OF_MONTH_1 = 'DAY_OF_MONTH'
    DAY_OF_YEAR_1 = 'DAY_OF_YEAR'
    WEEK_OF_YEAR_1 = 'WEEK_OF_YEAR'
    MONTH_OF_YEAR_1 = 'MONTH_OF_YEAR'
    QUARTER_OF_YEAR_1 = 'QUARTER_OF_YEAR'
    FISCAL_YEAR_1 = 'FISCAL_YEAR'
    FISCAL_QUARTER_1 = 'FISCAL_QUARTER'
    FISCAL_MONTH_1 = 'FISCAL_MONTH'
    MINUTE_2 = 'MINUTE'
    HOUR_2 = 'HOUR'
    DAY_2 = 'DAY'
    WEEK_2 = 'WEEK'
    WEEK_US_2 = 'WEEK_US'
    MONTH_2 = 'MONTH'
    QUARTER_2 = 'QUARTER'
    YEAR_2 = 'YEAR'
    MINUTE_OF_HOUR_2 = 'MINUTE_OF_HOUR'
    HOUR_OF_DAY_2 = 'HOUR_OF_DAY'
    DAY_OF_WEEK_2 = 'DAY_OF_WEEK'
    DAY_OF_MONTH_2 = 'DAY_OF_MONTH'
    DAY_OF_YEAR_2 = 'DAY_OF_YEAR'
    WEEK_OF_YEAR_2 = 'WEEK_OF_YEAR'
    MONTH_OF_YEAR_2 = 'MONTH_OF_YEAR'
    QUARTER_OF_YEAR_2 = 'QUARTER_OF_YEAR'
    FISCAL_YEAR_2 = 'FISCAL_YEAR'
    FISCAL_QUARTER_2 = 'FISCAL_QUARTER'
    FISCAL_MONTH_2 = 'FISCAL_MONTH'


class EmptyValues4(Enum):
    only = 'only'
    include = 'include'
    exclude = 'exclude'
    only_1 = 'only'
    include_1 = 'include'
    exclude_1 = 'exclude'
    only_2 = 'only'
    include_2 = 'include'
    exclude_2 = 'exclude'


class Granularity1(Enum):
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK = 'WEEK'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    MINUTE_OF_HOUR = 'MINUTE_OF_HOUR'
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
    MINUTE_1 = 'MINUTE'
    HOUR_1 = 'HOUR'
    DAY_1 = 'DAY'
    WEEK_1 = 'WEEK'
    WEEK_US_1 = 'WEEK_US'
    MONTH_1 = 'MONTH'
    QUARTER_1 = 'QUARTER'
    YEAR_1 = 'YEAR'
    MINUTE_OF_HOUR_1 = 'MINUTE_OF_HOUR'
    HOUR_OF_DAY_1 = 'HOUR_OF_DAY'
    DAY_OF_WEEK_1 = 'DAY_OF_WEEK'
    DAY_OF_MONTH_1 = 'DAY_OF_MONTH'
    DAY_OF_YEAR_1 = 'DAY_OF_YEAR'
    WEEK_OF_YEAR_1 = 'WEEK_OF_YEAR'
    MONTH_OF_YEAR_1 = 'MONTH_OF_YEAR'
    QUARTER_OF_YEAR_1 = 'QUARTER_OF_YEAR'
    FISCAL_YEAR_1 = 'FISCAL_YEAR'
    FISCAL_QUARTER_1 = 'FISCAL_QUARTER'
    FISCAL_MONTH_1 = 'FISCAL_MONTH'


class Type38(Enum):
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
    type: Type38
    using: AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    state: State | None = Field(None, title='State')


class Type39(Enum):
    text_filter = 'text_filter'
    text_filter_1 = 'text_filter'


class Condition7(Enum):
    is_ = 'is'
    isNot = 'isNot'


class QueryTextFilter1(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type39
    using: AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    case_sensitive: bool | None = None
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    condition: Condition7
    values: list[str | None]


class Condition8(Enum):
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
    type: Type39
    using: AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    case_sensitive: bool | None = None
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    condition: Condition8
    value: str


class QueryTextFilter(RootModel[QueryTextFilter1 | QueryTextFilter2]):
    root: QueryTextFilter1 | QueryTextFilter2 = Field(..., title='Text Filter')


class Type41(Enum):
    metric_value_filter = 'metric_value_filter'
    metric_value_filter_1 = 'metric_value_filter'
    metric_value_filter_2 = 'metric_value_filter'


class Condition9(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'
    GREATER_THAN_1 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_1 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_1 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_1 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_1 = 'EQUAL_TO'
    NOT_EQUAL_TO_1 = 'NOT_EQUAL_TO'
    BETWEEN_1 = 'BETWEEN'
    NOT_BETWEEN_1 = 'NOT_BETWEEN'


class QueryMetricValueFilter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type41
    conditions: list[MvfCondition] = Field(
        ...,
        description='Optional list of conditions for this filter. Conditions are applied as AND during execution.',
        min_length=1,
    )
    condition: Condition9 | None = Field(
        None, description='Condition to use for this filter.'
    )
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
    )
    null_values_as_zero: bool | None = Field(
        None, description='Null values will be treated as zero.'
    )
    dimensionality: list[LabelIdentifier | str] | None = Field(
        None,
        description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
    )


class Condition10(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'
    GREATER_THAN_1 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_1 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_1 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_1 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_1 = 'EQUAL_TO'
    NOT_EQUAL_TO_1 = 'NOT_EQUAL_TO'
    BETWEEN_1 = 'BETWEEN'
    NOT_BETWEEN_1 = 'NOT_BETWEEN'
    GREATER_THAN_2 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_2 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_2 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_2 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_2 = 'EQUAL_TO'
    NOT_EQUAL_TO_2 = 'NOT_EQUAL_TO'


class QueryMetricValueFilter2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type41
    conditions: list[MvfCondition] | None = Field(
        None,
        description='Optional list of conditions for this filter. Conditions are applied as AND during execution.',
    )
    condition: Condition10 = Field(..., description='Condition to use for this filter.')
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
    )
    value: float = Field(..., description='Value to use in condition for this filter.')
    null_values_as_zero: bool | None = Field(
        None, description='Null values will be treated as zero.'
    )
    dimensionality: list[LabelIdentifier | str] | None = Field(
        None,
        description='Optional array of attribute or label references or local identifiers to apply dimensionality to the filter.',
    )


class Condition11(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'
    GREATER_THAN_1 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_1 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_1 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_1 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_1 = 'EQUAL_TO'
    NOT_EQUAL_TO_1 = 'NOT_EQUAL_TO'
    BETWEEN_1 = 'BETWEEN'
    NOT_BETWEEN_1 = 'NOT_BETWEEN'
    BETWEEN_2 = 'BETWEEN'
    NOT_BETWEEN_2 = 'NOT_BETWEEN'


class QueryMetricValueFilter3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type41
    conditions: list[MvfCondition] | None = Field(
        None,
        description='Optional list of conditions for this filter. Conditions are applied as AND during execution.',
    )
    condition: Condition11 = Field(..., description='Condition to use for this filter.')
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
    )
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


class Condition12(Enum):
    GREATER_THAN = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO = 'EQUAL_TO'
    NOT_EQUAL_TO = 'NOT_EQUAL_TO'
    BETWEEN = 'BETWEEN'
    NOT_BETWEEN = 'NOT_BETWEEN'
    GREATER_THAN_1 = 'GREATER_THAN'
    GREATER_THAN_OR_EQUAL_TO_1 = 'GREATER_THAN_OR_EQUAL_TO'
    LESS_THAN_1 = 'LESS_THAN'
    LESS_THAN_OR_EQUAL_TO_1 = 'LESS_THAN_OR_EQUAL_TO'
    EQUAL_TO_1 = 'EQUAL_TO'
    NOT_EQUAL_TO_1 = 'NOT_EQUAL_TO'
    BETWEEN_1 = 'BETWEEN'
    NOT_BETWEEN_1 = 'NOT_BETWEEN'


class QueryMetricValueFilter4(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type41
    conditions: list[MvfCondition] | None = Field(
        None,
        description='Optional list of conditions for this filter. Conditions are applied as AND during execution.',
    )
    condition: Condition12 | None = Field(
        None, description='Condition to use for this filter.'
    )
    using: MetricIdentifier | str = Field(
        ..., description='Metric or local metric to use in this filter.'
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


class Type45(Enum):
    ranking_filter = 'ranking_filter'
    ranking_filter_1 = 'ranking_filter'


class QueryRankingFilter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type45
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
    type: Type45
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


class Type47(Enum):
    dashboard = 'dashboard'


class Version(Enum):
    field_2 = '2'
    field_3 = '3'


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


class Type48(Enum):
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


class Type51(Enum):
    date = 'date'


class Granularity2(Enum):
    MINUTE = 'MINUTE'
    HOUR = 'HOUR'
    DAY = 'DAY'
    WEEK = 'WEEK'
    WEEK_US = 'WEEK_US'
    MONTH = 'MONTH'
    QUARTER = 'QUARTER'
    YEAR = 'YEAR'
    MINUTE_OF_HOUR = 'MINUTE_OF_HOUR'
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


class Type52(Enum):
    fact = 'fact'
    attribute = 'attribute'
    aggregated_fact = 'aggregated_fact'
    fact_1 = 'fact'
    attribute_1 = 'attribute'
    aggregated_fact_1 = 'aggregated_fact'


class Fields4(BaseModel):
    type: Type52


class Type56(Enum):
    attribute = 'attribute'


class SortDirection(Enum):
    ASC = 'ASC'
    DESC = 'DESC'


class Type57(Enum):
    fact = 'fact'


class Type58(Enum):
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


class Type59(Enum):
    metric = 'metric'


class Type60(Enum):
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
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator(Enum):
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


class Type61(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


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
    SUM_2 = 'SUM'
    COUNT_2 = 'COUNT'
    APPROXIMATE_COUNT_2 = 'APPROXIMATE_COUNT'
    AVG_2 = 'AVG'
    MIN_2 = 'MIN'
    MAX_2 = 'MAX'
    MEDIAN_2 = 'MEDIAN'
    RUNSUM_2 = 'RUNSUM'


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
    SUM_2 = 'SUM'
    DIFFERENCE_2 = 'DIFFERENCE'
    MULTIPLICATION_2 = 'MULTIPLICATION'
    RATIO_2 = 'RATIO'
    CHANGE_2 = 'CHANGE'


class Type62(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


class QueryField2(BaseModel):
    aggregation: Aggregation1 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator1 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type62 | None = Field(
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
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


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


class Using3(RootModel[str]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: constr(pattern=r'^metric/(?!\.)[.A-Za-z0-9_-]{1,255}$') = Field(
        ..., description='Identifier to use for this field.', title='Metric Identifier'
    )


class Using4(RootModel[list[str]]):
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
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type63(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


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
    SUM_2 = 'SUM'
    COUNT_2 = 'COUNT'
    APPROXIMATE_COUNT_2 = 'APPROXIMATE_COUNT'
    AVG_2 = 'AVG'
    MIN_2 = 'MIN'
    MAX_2 = 'MAX'
    MEDIAN_2 = 'MEDIAN'
    RUNSUM_2 = 'RUNSUM'


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
    SUM_2 = 'SUM'
    DIFFERENCE_2 = 'DIFFERENCE'
    MULTIPLICATION_2 = 'MULTIPLICATION'
    RATIO_2 = 'RATIO'
    CHANGE_2 = 'CHANGE'


class Type64(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


class QueryField4(BaseModel):
    aggregation: Aggregation3 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator3 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type64 | None = Field(
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
    SUM_1 = 'SUM'
    DIFFERENCE_1 = 'DIFFERENCE'
    MULTIPLICATION_1 = 'MULTIPLICATION'
    RATIO_1 = 'RATIO'
    CHANGE_1 = 'CHANGE'


class Type65(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


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
    SUM_2 = 'SUM'
    DIFFERENCE_2 = 'DIFFERENCE'
    MULTIPLICATION_2 = 'MULTIPLICATION'
    RATIO_2 = 'RATIO'
    CHANGE_2 = 'CHANGE'


class Type66(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


class QueryField6(BaseModel):
    aggregation: Aggregation3 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator5 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type66 | None = Field(
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
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator6(Enum):
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


class Type67(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


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
    SUM_2 = 'SUM'
    COUNT_2 = 'COUNT'
    APPROXIMATE_COUNT_2 = 'APPROXIMATE_COUNT'
    AVG_2 = 'AVG'
    MIN_2 = 'MIN'
    MAX_2 = 'MAX'
    MEDIAN_2 = 'MEDIAN'
    RUNSUM_2 = 'RUNSUM'


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
    SUM_2 = 'SUM'
    DIFFERENCE_2 = 'DIFFERENCE'
    MULTIPLICATION_2 = 'MULTIPLICATION'
    RATIO_2 = 'RATIO'
    CHANGE_2 = 'CHANGE'


class Type68(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


class QueryField8(BaseModel):
    aggregation: Aggregation7 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator7 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type68 | None = Field(
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
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Type69(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'


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
    SUM_2 = 'SUM'
    COUNT_2 = 'COUNT'
    APPROXIMATE_COUNT_2 = 'APPROXIMATE_COUNT'
    AVG_2 = 'AVG'
    MIN_2 = 'MIN'
    MAX_2 = 'MAX'
    MEDIAN_2 = 'MEDIAN'
    RUNSUM_2 = 'RUNSUM'


class Type70(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


class QueryField10(BaseModel):
    aggregation: Aggregation9 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator7 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type70 | None = Field(
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
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator10(Enum):
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


class Type71(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'


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
    SUM_2 = 'SUM'
    COUNT_2 = 'COUNT'
    APPROXIMATE_COUNT_2 = 'APPROXIMATE_COUNT'
    AVG_2 = 'AVG'
    MIN_2 = 'MIN'
    MAX_2 = 'MAX'
    MEDIAN_2 = 'MEDIAN'
    RUNSUM_2 = 'RUNSUM'


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
    SUM_2 = 'SUM'
    DIFFERENCE_2 = 'DIFFERENCE'
    MULTIPLICATION_2 = 'MULTIPLICATION'
    RATIO_2 = 'RATIO'
    CHANGE_2 = 'CHANGE'


class Type72(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


class QueryField12(BaseModel):
    aggregation: Aggregation11 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator11 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type72 | None = Field(
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
    SUM_1 = 'SUM'
    COUNT_1 = 'COUNT'
    APPROXIMATE_COUNT_1 = 'APPROXIMATE_COUNT'
    AVG_1 = 'AVG'
    MIN_1 = 'MIN'
    MAX_1 = 'MAX'
    MEDIAN_1 = 'MEDIAN'
    RUNSUM_1 = 'RUNSUM'


class Operator12(Enum):
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


class Type73(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


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
    SUM_2 = 'SUM'
    COUNT_2 = 'COUNT'
    APPROXIMATE_COUNT_2 = 'APPROXIMATE_COUNT'
    AVG_2 = 'AVG'
    MIN_2 = 'MIN'
    MAX_2 = 'MAX'
    MEDIAN_2 = 'MEDIAN'
    RUNSUM_2 = 'RUNSUM'


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
    SUM_2 = 'SUM'
    DIFFERENCE_2 = 'DIFFERENCE'
    MULTIPLICATION_2 = 'MULTIPLICATION'
    RATIO_2 = 'RATIO'
    CHANGE_2 = 'CHANGE'


class Type74(Enum):
    PREVIOUS_YEAR = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_1 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_1 = 'PREVIOUS_PERIOD'
    PREVIOUS_YEAR_2 = 'PREVIOUS_YEAR'
    PREVIOUS_PERIOD_2 = 'PREVIOUS_PERIOD'


class QueryField14(BaseModel):
    aggregation: Aggregation13 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: str | list[str] | None = None
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator13 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type74 | None = Field(
        None,
        description='Type of relative period metric related to another metric in list.',
    )
    date_filter: str | None = Field(
        None, description='Date filter to use for this field.'
    )


class Type75(Enum):
    attribute_sort = 'attribute_sort'
    metric_sort = 'metric_sort'
    attribute_sort_1 = 'attribute_sort'
    metric_sort_1 = 'metric_sort'


class QuerySort3(BaseModel):
    type: Type75


class Type78(Enum):
    attribute_sort = 'attribute_sort'


class Direction(Enum):
    ASC = 'ASC'
    DESC = 'DESC'


class Aggregation14(Enum):
    SUM = 'SUM'


class Type79(Enum):
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


class Type80(Enum):
    SUM = 'SUM'
    AVG = 'AVG'
    MAX = 'MAX'
    MIN = 'MIN'
    MED = 'MED'
    NAT = 'NAT'


class BucketLocationItem(RootModel[str]):
    root: str = Field(..., title='Location Bucket')


class Type81(Enum):
    pushpin = 'pushpin'
    area = 'area'


class Type82(Enum):
    attribute_hierarchy = 'attribute_hierarchy'


class DataLabelsStyle(Enum):
    auto = 'auto'
    backplate = 'backplate'


class Type83(Enum):
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
    type: Type83 | None = None
    pattern_name_mapping: dict[str, PatternNameMapping] | None = None


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


class Condition13(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str
    operator: Operator14
    value: float | str | Value | None = Field(
        None,
        description='Literal (number or string); a {from,to} range for between/not_between; omitted for all/is_empty/is_not_empty.',
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
    conditions: list[Condition13] = Field(
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


class Type84(Enum):
    dashboard = 'dashboard'


class Type85(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    date_filter_2 = 'date_filter'
    date_filter_3 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_2 = 'filter_group'


class EmptyValues6(Enum):
    only = 'only'
    include = 'include'
    exclude = 'exclude'


class DashboardFilters9(BaseModel):
    type: Type85
    title: str | None = Field(None, description='Optional title of the filter')
    granularity: DateFilterGranularity | None = None
    from_: constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})$') | None = Field(
        None, alias='from', description='A period start date as YYYY-MM-DD'
    )
    to: constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})$') | None = Field(
        None, description='A period end date as YYYY-MM-DD'
    )
    mode: Mode13 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    empty_values: EmptyValues6 | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )
    date: Identifier | None = Field(
        None, description='An id of the date dataset to be used for date filter'
    )


class DashboardFilters10(BaseModel):
    type: Type85
    title: str | None = Field(None, description='Optional title of the filter')
    granularity: DateFilterGranularity | None = None
    from_: float = Field(
        ..., alias='from', description='A period start as number, from today'
    )
    to: float = Field(..., description='A period end as number, from today')
    mode: Mode13 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    empty_values: EmptyValues6 | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )
    date: Identifier | None = Field(
        None, description='An id of the date dataset to be used for date filter'
    )


class Type87(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    attribute_filter_2 = 'attribute_filter'
    date_filter_2 = 'date_filter'
    attribute_filter_3 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_2 = 'filter_group'
    attribute_filter_4 = 'attribute_filter'
    attribute_filter_5 = 'attribute_filter'


class Mode16(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'
    readonly_1 = 'readonly'
    hidden_1 = 'hidden'
    active_1 = 'active'
    readonly_2 = 'readonly'
    hidden_2 = 'hidden'
    active_2 = 'active'


class SelectionType8(Enum):
    list = 'list'
    text = 'text'
    listOrText = 'listOrText'
    list_1 = 'list'
    text_1 = 'text'
    listOrText_1 = 'listOrText'
    list_2 = 'list'
    text_2 = 'text'
    listOrText_2 = 'listOrText'


class DashboardFilters11(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type87
    title: str | None = Field(None, description='Optional title of the filter')
    using: AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    multiselect: bool | None = Field(
        None, description='Whether the filter should allow multiple selection'
    )
    mode: Mode16 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='Configures the label used for representing attribute filter elements in UI.',
        title='Display As Label Identifier',
    )
    selection_type: SelectionType8 | None = Field(
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


class DashboardFilters12(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type87
    title: str | None = Field(None, description='Optional title of the filter')
    using: AttributeIdentifier | LabelIdentifier = Field(
        ..., description='Attribute or label to use in this filter.'
    )
    multiselect: bool | None = Field(
        None, description='Whether the filter should allow multiple selection'
    )
    mode: Mode16 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    display_as: constr(pattern=r'^label/(?!\.)[.A-Za-z0-9_-]{1,255}$') | None = Field(
        None,
        description='If specified, the attribute filter will display the elements in selected label form.',
        title='Display As Label Identifier',
    )
    selection_type: SelectionType8 | None = Field(
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


class Type89(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    date_filter_2 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_2 = 'filter_group'
    text_filter_3 = 'text_filter'


class Mode18(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'
    readonly_1 = 'readonly'
    hidden_1 = 'hidden'
    active_1 = 'active'


class SelectionType10(Enum):
    list = 'list'
    text = 'text'
    listOrText = 'listOrText'
    list_1 = 'list'
    text_1 = 'text'
    listOrText_1 = 'listOrText'


class Condition14(Enum):
    is_ = 'is'
    isNot = 'isNot'


class DashboardFilters13(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type89
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
    mode: Mode18 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType10 | None = Field(
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
    condition: Condition14
    values: list[str | None]


class Condition15(Enum):
    contains = 'contains'
    doesNotContain = 'doesNotContain'
    startsWith = 'startsWith'
    doesNotStartWith = 'doesNotStartWith'
    endsWith = 'endsWith'
    doesNotEndWith = 'doesNotEndWith'


class DashboardFilters14(BaseModel):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    type: Type89
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
    mode: Mode18 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )
    selection_type: SelectionType10 | None = Field(
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
    condition: Condition15
    value: str


class Type91(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    metric_value_filter_2 = 'metric_value_filter'
    date_filter_2 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_3 = 'metric_value_filter'
    filter_group_2 = 'filter_group'


class Mode20(Enum):
    readonly = 'readonly'
    hidden = 'hidden'
    active = 'active'


class DashboardFilters15(BaseModel):
    type: Type91
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
    mode: Mode20 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )


class Type92(Enum):
    date_filter = 'date_filter'
    attribute_filter = 'attribute_filter'
    text_filter = 'text_filter'
    metric_value_filter = 'metric_value_filter'
    filter_group = 'filter_group'
    date_filter_1 = 'date_filter'
    attribute_filter_1 = 'attribute_filter'
    text_filter_1 = 'text_filter'
    metric_value_filter_1 = 'metric_value_filter'
    filter_group_1 = 'filter_group'
    filter_group_2 = 'filter_group'
    date_filter_2 = 'date_filter'
    attribute_filter_2 = 'attribute_filter'
    text_filter_2 = 'text_filter'
    metric_value_filter_2 = 'metric_value_filter'
    filter_group_3 = 'filter_group'


class Type93(Enum):
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


class Type96(Enum):
    date = 'date'


class Description(RootModel[constr(max_length=10000)]):
    root: constr(max_length=10000)


class Type97(Enum):
    metric = 'metric'


class Type98(Enum):
    plugin = 'plugin'


class Title(RootModel[constr(max_length=255)]):
    root: constr(max_length=255)


class Type99(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    table_2 = 'table'


class Type100(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    bar_chart_2 = 'bar_chart'


class Type101(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    column_chart_2 = 'column_chart'


class Type102(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    line_chart_2 = 'line_chart'


class Type103(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    area_chart_2 = 'area_chart'


class Type104(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    scatter_chart_2 = 'scatter_chart'


class Type105(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    bubble_chart_2 = 'bubble_chart'


class Type106(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    pie_chart_2 = 'pie_chart'


class Type107(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    donut_chart_2 = 'donut_chart'


class Type108(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    treemap_chart_2 = 'treemap_chart'


class Type109(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    pyramid_chart_2 = 'pyramid_chart'


class Type110(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    funnel_chart_2 = 'funnel_chart'


class Type111(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    heatmap_chart_2 = 'heatmap_chart'


class Type112(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    bullet_chart_2 = 'bullet_chart'


class Type113(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    waterfall_chart_2 = 'waterfall_chart'


class Type114(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    dependency_wheel_chart_2 = 'dependency_wheel_chart'


class Type115(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    sankey_chart_2 = 'sankey_chart'


class Type116(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    headline_chart_2 = 'headline_chart'


class Type117(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    combo_chart_2 = 'combo_chart'


class Type118(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    geo_chart_2 = 'geo_chart'


class Type119(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    geo_area_chart_2 = 'geo_area_chart'


class Type120(Enum):
    table = 'table'
    bar_chart = 'bar_chart'
    column_chart = 'column_chart'
    line_chart = 'line_chart'
    area_chart = 'area_chart'
    scatter_chart = 'scatter_chart'
    bubble_chart = 'bubble_chart'
    pie_chart = 'pie_chart'
    donut_chart = 'donut_chart'
    treemap_chart = 'treemap_chart'
    pyramid_chart = 'pyramid_chart'
    funnel_chart = 'funnel_chart'
    heatmap_chart = 'heatmap_chart'
    bullet_chart = 'bullet_chart'
    waterfall_chart = 'waterfall_chart'
    dependency_wheel_chart = 'dependency_wheel_chart'
    sankey_chart = 'sankey_chart'
    headline_chart = 'headline_chart'
    combo_chart = 'combo_chart'
    geo_chart = 'geo_chart'
    geo_area_chart = 'geo_area_chart'
    repeater_chart = 'repeater_chart'
    table_1 = 'table'
    bar_chart_1 = 'bar_chart'
    column_chart_1 = 'column_chart'
    line_chart_1 = 'line_chart'
    area_chart_1 = 'area_chart'
    scatter_chart_1 = 'scatter_chart'
    bubble_chart_1 = 'bubble_chart'
    pie_chart_1 = 'pie_chart'
    donut_chart_1 = 'donut_chart'
    treemap_chart_1 = 'treemap_chart'
    pyramid_chart_1 = 'pyramid_chart'
    funnel_chart_1 = 'funnel_chart'
    heatmap_chart_1 = 'heatmap_chart'
    bullet_chart_1 = 'bullet_chart'
    waterfall_chart_1 = 'waterfall_chart'
    dependency_wheel_chart_1 = 'dependency_wheel_chart'
    sankey_chart_1 = 'sankey_chart'
    headline_chart_1 = 'headline_chart'
    combo_chart_1 = 'combo_chart'
    geo_chart_1 = 'geo_chart'
    geo_area_chart_1 = 'geo_area_chart'
    repeater_chart_1 = 'repeater_chart'
    repeater_chart_2 = 'repeater_chart'


class AttributeHierarchy1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(
        ..., description='A unique identifier of the attribute hierarchy.'
    )
    type: Type8
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


class DashboardFilters(BaseModel):
    type: Type9
    title: str | None = Field(None, description='Optional title of the filter')
    granularity: DateFilterGranularity | None = None
    from_: constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})$') | None = Field(
        None, alias='from', description='A period start date as YYYY-MM-DD'
    )
    to: constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})$') | None = Field(
        None, description='A period end date as YYYY-MM-DD'
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


class DashboardFilters1(BaseModel):
    type: Type9
    title: str | None = Field(None, description='Optional title of the filter')
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


class DashboardFilters6(BaseModel):
    type: Type15
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


class DashboardAbsoluteDateFilter(BaseModel):
    title: str | None = Field(None, description='Optional title of the filter')
    type: Type17
    granularity: DateFilterGranularity | None = None
    from_: constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})$') | None = Field(
        None, alias='from', description='A period start date as YYYY-MM-DD'
    )
    to: constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})$') | None = Field(
        None, description='A period end date as YYYY-MM-DD'
    )
    mode: Mode6 | None = Field(
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
    type: Type17
    granularity: DateFilterGranularity | None = None
    from_: float = Field(
        ..., alias='from', description='A period start as number, from today'
    )
    to: float = Field(..., description='A period end as number, from today')
    mode: Mode6 | None = Field(
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
    type: Type23
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
    mode: Mode13 | None = Field(
        None,
        description='Setting filter mode to readonly will disable the filter. Setting it to hidden will hide the filter from the dashboard. Setting it to active will enable the filter.',
    )


class DashboardFiltersNoGroups1(DashboardAbsoluteDateFilter):
    type: Type25


class DashboardFiltersNoGroups2(DashboardRelativeDateFilter):
    type: Type25


class DashboardFiltersNoGroups5(DashboardMetricValueFilter):
    type: Type25


class DashboardFiltersNoGroups(
    RootModel[
        dict[
            str,
            DashboardFiltersNoGroups1
            | DashboardFiltersNoGroups2
            | DashboardFiltersNoGroups3
            | DashboardFiltersNoGroups4
            | DashboardFiltersNoGroups5,
        ]
    ]
):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        DashboardFiltersNoGroups1
        | DashboardFiltersNoGroups2
        | DashboardFiltersNoGroups3
        | DashboardFiltersNoGroups4
        | DashboardFiltersNoGroups5,
    ] = Field(
        ...,
        description='Dashboard filters that cannot contain filter groups - only attribute, date, text, and metric value filters',
        title='Dashboard Filters (no groups)',
    )


class QueryFilter2(QueryAttributeFilter):
    type: Type30


class QueryFilter3(BaseModel):
    type: Type30


class QueryFilter4(BaseModel):
    type: Type30


class QueryFilter5(BaseModel):
    type: Type30


class QueryDateFilter1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type36
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
    empty_values: EmptyValues4 | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )


class QueryDateFilter2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type36
    using: str = Field(
        ..., description='Date dataset identifier to use for this field.'
    )
    granularity: Granularity1 | None = Field(
        None, description='A granularity to use in relative date filter'
    )
    from_: (
        constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})(?: ([0-9]{2}):([0-9]{2}))?$')
        | None
    ) = Field(
        None, alias='from', description='A date from which the filter will be applied.'
    )
    to: (
        constr(pattern=r'^([0-9]{4})-([0-9]{2})-([0-9]{2})(?: ([0-9]{2}):([0-9]{2}))?$')
        | None
    ) = Field(None, description='A date to which the filter will be applied.')
    with_: (
        dict[constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'), QueryAttributeFilter]
        | None
    ) = Field(
        None,
        alias='with',
        description='Attribute filters to apply together with this date filter.',
    )
    empty_values: EmptyValues4 | None = Field(
        None, description='Controls how empty values are handled in the filter.'
    )


class QueryDateFilter(RootModel[QueryDateFilter1 | QueryDateFilter2]):
    root: QueryDateFilter1 | QueryDateFilter2 = Field(..., title='Date Filter')


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
    type: Type51
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
    granularities: list[Granularity2] | None = None


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
    type: Type57
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
    type: Type58
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


class Plugin1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the plugin.')
    type: Type60
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
    type: Type61 | None = Field(
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
    type: Type67 | None = Field(
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
    type: Type69 | None = Field(
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
    type: Type71 = Field(
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
    type: Type73 = Field(
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
    type: Type78
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
    type: Type79
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
    type: Type80
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
    type: Type82
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


class DashboardFilters16(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type92
    title: str = Field(..., description='Display title for the filter group')
    filters: DashboardFiltersNoGroups = Field(
        ...,
        description='Filters contained in this group (only attribute and date filters, no nested groups)',
    )


class DashboardFiltersModel(
    RootModel[
        dict[
            str,
            DashboardFilters9
            | DashboardFilters10
            | DashboardFilters11
            | DashboardFilters12
            | DashboardFilters13
            | DashboardFilters14
            | DashboardFilters15
            | DashboardFilters16,
        ]
    ]
):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        DashboardFilters9
        | DashboardFilters10
        | DashboardFilters11
        | DashboardFilters12
        | DashboardFilters13
        | DashboardFilters14
        | DashboardFilters15
        | DashboardFilters16,
    ] = Field(..., title='Dashboard Filters')


class DateDataset(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the date instance.')
    type: Type96
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
    granularities: list[Granularity2] | None = None


class Metric(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the metric.')
    type: Type97
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
    type: Type98
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


class Metadata2(DateDataset):
    type: Type


class Metadata3(Metric):
    type: Type


class Metadata5(Plugin):
    type: Type


class Metadata6(AttributeHierarchy):
    type: Type


class DashboardFilters7(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type16
    title: str = Field(..., description='Display title for the filter group')
    filters: DashboardFiltersNoGroups = Field(
        ...,
        description='Filters contained in this group (only attribute and date filters, no nested groups)',
    )


class DashboardFilters8(
    RootModel[
        dict[
            str,
            DashboardFilters
            | DashboardFilters1
            | DashboardFilters2
            | DashboardFilters3
            | DashboardFilters4
            | DashboardFilters5
            | DashboardFilters6
            | DashboardFilters7,
        ]
    ]
):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        DashboardFilters
        | DashboardFilters1
        | DashboardFilters2
        | DashboardFilters3
        | DashboardFilters4
        | DashboardFilters5
        | DashboardFilters6
        | DashboardFilters7,
    ] = Field(..., title='Dashboard Filters')


class DashboardFilterGroup(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type24
    title: str = Field(..., description='Display title for the filter group')
    filters: DashboardFiltersNoGroups = Field(
        ...,
        description='Filters contained in this group (only attribute and date filters, no nested groups)',
    )


class QueryFilter1(BaseModel):
    type: Type30


class QueryFilter(
    RootModel[
        QueryFilter1
        | QueryFilter2
        | QueryFilter3
        | QueryFilter4
        | QueryFilter5
        | QueryFilter6
    ]
):
    root: (
        QueryFilter1
        | QueryFilter2
        | QueryFilter3
        | QueryFilter4
        | QueryFilter5
        | QueryFilter6
    ) = Field(..., title='Filter')


class Interaction(
    RootModel[
        InteractionOpenPlainUrl
        | Any
        | InteractionOpenParamUrl
        | Any
        | InteractionOpenDashboard
        | Any
        | InteractionOpenVisualization
        | Any
    ]
):
    root: (
        InteractionOpenPlainUrl
        | Any
        | InteractionOpenParamUrl
        | Any
        | InteractionOpenDashboard
        | Any
        | InteractionOpenVisualization
        | Any
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


class Fields2(Fact):
    type: Type52


class Fields3(AggregatedFact):
    type: Type52


class Attribute(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    type: Type56
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


class QuerySort1(QueryAttributeSort):
    type: Type75


class QuerySort2(QueryMetricSort):
    type: Type75


class QuerySort(RootModel[QuerySort1 | QuerySort2 | QuerySort3]):
    root: QuerySort1 | QuerySort2 | QuerySort3 = Field(..., title='Sort')


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
    type: Type81 | None = Field(
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


class Fields1(Attribute):
    type: Type52


class Fields(RootModel[dict[str, Fields1 | Fields2 | Fields3 | Fields4]]):
    model_config = ConfigDict(
        regex_engine="python-re",
    )
    root: dict[
        constr(pattern=r'^(?!\.)[.A-Za-z0-9_-]{1,255}$'),
        Fields1 | Fields2 | Fields3 | Fields4,
    ] = Field(..., title='Fields')


class QuerySorts(RootModel[list[QuerySort]]):
    root: list[QuerySort] = Field(..., title='Sorts')


class QueryField3(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    aggregation: Aggregation2 | None = Field(
        None, description='Aggregation function to use for this field.'
    )
    using: Using1 | Using2 | Using3 | Using4 = Field(
        ...,
        description='Metric identifier to use for this field.',
        title='Metric Identifier',
    )
    maql: str | None = Field(None, description='Define MAQL syntax for metric.')
    operator: Operator2 | None = Field(
        None, description='Arithmetic operator to use for this field.'
    )
    type: Type63 | None = Field(
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
    type: Type65 | None = Field(
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
    type: Type93
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
    type: Type93
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
    type: Type93
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


class Metadata1(BaseModel):
    type: Type


class Dataset2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        regex_engine="python-re",
    )
    id: Identifier = Field(..., description='A unique identifier of the dataset.')
    type: Type48
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
    type: Type48
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
    type: Type48
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
    type: Type105 = Field(..., description='Type of visualisation.')
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
    type: Type106 = Field(..., description='Type of visualisation.')
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
    type: Type107 = Field(..., description='Type of visualisation.')
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
    type: Type108 = Field(..., description='Type of visualisation.')
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
    type: Type109 = Field(..., description='Type of visualisation.')
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
    type: Type110 = Field(..., description='Type of visualisation.')
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
    type: Type111 = Field(..., description='Type of visualisation.')
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
    type: Type112 = Field(..., description='Type of visualisation.')
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
    type: Type113 = Field(..., description='Type of visualisation.')
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
    type: Type114 = Field(..., description='Type of visualisation.')
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
    type: Type115 = Field(..., description='Type of visualisation.')
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
    type: Type116 = Field(..., description='Type of visualisation.')
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
    type: Type117 = Field(..., description='Type of visualisation.')
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
    type: Type118 = Field(..., description='Type of visualisation.')
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
    type: Type119 = Field(..., description='Type of visualisation.')
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
    type: Type120 = Field(..., description='Type of visualisation.')
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
    ) = Field(
        ...,
        description='JSON schema for Gooddata Analytics Visualisation',
        title='Visualisation',
    )


class Metadata7(BaseModel):
    type: Type


class Dashboard1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    id: Identifier = Field(..., description='A unique identifier of the dashboard.')
    type: Type47
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
    enable_section_headers: bool | None = Field(
        None,
        description='Applies to the root layout. Whether all sections headers are enabled. Defaults to true.',
    )
    sections: list[Section] | None = Field(
        None, description='A list of sections in this dashboard.'
    )
    filters: DashboardFiltersModel | None = None
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
    filters: DashboardFiltersModel | None = Field(
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
    type: Type84
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
    enable_section_headers: bool | None = Field(
        None,
        description='Applies to the root layout. Whether all sections headers are enabled. Defaults to true.',
    )
    sections: list[Section] | None = Field(
        None, description='A list of sections in this dashboard.'
    )
    filters: DashboardFiltersModel | None = None
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


class Metadata4(Dashboard):
    type: Type


class Metadata(
    RootModel[
        Metadata1
        | Metadata2
        | Metadata3
        | Metadata4
        | Metadata5
        | Metadata6
        | Metadata7
        | Metadata8
    ]
):
    root: (
        Metadata1
        | Metadata2
        | Metadata3
        | Metadata4
        | Metadata5
        | Metadata6
        | Metadata7
        | Metadata8
    ) = Field(..., description='JSON schema for Gooddata Analytics', title='Metadata')


Dashboard1.model_rebuild()
Section.model_rebuild()
Section1.model_rebuild()
