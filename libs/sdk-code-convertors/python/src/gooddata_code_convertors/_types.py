# (C) 2026 GoodData Corporation
# schema-hash: 0442cdd2eea7db6d6ce38e58b1501dd0a56dfd973a92d1ef9cedfaa4ac3e4149

from __future__ import annotations

from typing import Any, Literal, TypeAlias, TypedDict, Union

from typing_extensions import NotRequired

__all__ = [
    "AggregatedFact",
    "Attribute",
    "AttributeHierarchy",
    "AttributeIdentifier",
    "BucketEmptyItem",
    "BucketGeoAreaItem",
    "BucketItem",
    "BucketItem1",
    "BucketLocationItem",
    "BucketPushpinLocationItem",
    "ChartFill",
    "Collection",
    "ColorDefinition",
    "ColorItems",
    "ColumnOverride",
    "ComplexColorItem",
    "Condition",
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
    "DashboardFiltersNoGroups5",
    "DashboardMetricValueFilter",
    "DashboardRelativeDateFilter",
    "DashboardTextFilter",
    "DashboardTextFilter1",
    "DashboardTextFilter2",
    "DataType",
    "Dataset",
    "Dataset1",
    "Dataset2",
    "Dataset3",
    "Dataset4",
    "Dataset5",
    "Dataset6",
    "Dataset7",
    "DateDataset",
    "DateFilterGranularity",
    "Description",
    "DisplayAsLabelIdentifier",
    "DistinctPointShapes",
    "Fact",
    "FactIdentifier",
    "Fields",
    "Fields1",
    "Fields2",
    "Fields3",
    "Fields4",
    "Format",
    "GeoAreaConfig",
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
    "Locale",
    "Metadata",
    "Metadata1",
    "Metadata2",
    "Metadata3",
    "Metadata4",
    "Metadata5",
    "Metadata6",
    "Metadata8",
    "Metric",
    "MetricIdentifier",
    "Metrics",
    "MvfCondition",
    "MvfCondition1",
    "MvfCondition2",
    "MvfCondition3",
    "OpenUrl",
    "Parents",
    "Permission",
    "Permissions",
    "Plugin",
    "Plugins",
    "Query",
    "QueryAttributeFilter",
    "QueryAttributeSort",
    "QueryDateFilter",
    "QueryDateFilter1",
    "QueryDateFilter2",
    "QueryField",
    "QueryField1",
    "QueryField11",
    "QueryField13",
    "QueryField2",
    "QueryField3",
    "QueryField5",
    "QueryField7",
    "QueryField9",
    "QueryFields",
    "QueryFilter",
    "QueryFilter2",
    "QueryFilter3",
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
    "Rule",
    "Section",
    "SimpleColorItem",
    "Source",
    "SourceColumn",
    "State",
    "Tab",
    "Tags",
    "Target",
    "Target1",
    "TextWrapping",
    "Title",
    "TotalItem",
    "Using",
    "Using1",
    "Using2",
    "Using3",
    "Using4",
    "Value",
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
    "WidthItem",
    "WorkspaceDataFilter",
]



class Metadata8(TypedDict):
    type: Literal['dataset', 'date', 'metric', 'dashboard', 'plugin', 'table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart', 'attribute_hierarchy']


Identifier: TypeAlias = str


Title: TypeAlias = str


Description: TypeAlias = str


Tags: TypeAlias = list[str]


AttributeIdentifier: TypeAlias = str


LabelIdentifier: TypeAlias = str


DisplayAsLabelIdentifier: TypeAlias = str


FactIdentifier: TypeAlias = str


MetricIdentifier: TypeAlias = str


class Permission(TypedDict):
    all: NotRequired[bool]
    users: NotRequired[list[str]]
    user_groups: NotRequired[list[str]]


class Parents(TypedDict):
    using: str
    common: bool
    date: NotRequired[str]


class DashboardFilters2(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    multiselect: NotRequired[bool]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    display_as: NotRequired[str]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    state: NotRequired[Any]


class DashboardFilters3(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    multiselect: NotRequired[bool]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    display_as: NotRequired[str]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    state: NotRequired[Any]


class DashboardFilters4(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    condition: Literal['is', 'isNot']
    values: list[str | None]


class DashboardFilters5(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    condition: Literal['contains', 'doesNotContain', 'startsWith', 'doesNotStartWith', 'endsWith', 'doesNotEndWith']
    value: str


class DashboardAttributeFilter1(TypedDict):
    title: NotRequired[str]
    type: Literal['attribute_filter']
    using: AttributeIdentifier | LabelIdentifier
    multiselect: NotRequired[bool]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    display_as: NotRequired[str]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    state: NotRequired[Any]


class DashboardAttributeFilter2(TypedDict):
    title: NotRequired[str]
    type: Literal['attribute_filter']
    using: AttributeIdentifier | LabelIdentifier
    multiselect: NotRequired[bool]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    display_as: NotRequired[str]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    state: NotRequired[Any]


DashboardAttributeFilter: TypeAlias = (
    DashboardAttributeFilter1 | DashboardAttributeFilter2
)


class DashboardTextFilter1(TypedDict):
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    type: Literal['text_filter']
    condition: Literal['is', 'isNot']
    values: list[str | None]


class DashboardTextFilter2(TypedDict):
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    type: Literal['text_filter']
    condition: Literal['contains', 'doesNotContain', 'startsWith', 'doesNotStartWith', 'endsWith', 'doesNotEndWith']
    value: str


DashboardTextFilter: TypeAlias = DashboardTextFilter1 | DashboardTextFilter2


class DashboardFiltersNoGroups3(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter']


DateFilterGranularity: TypeAlias = Literal['MINUTE', 'HOUR', 'DAY', 'WEEK', 'WEEK_US', 'MONTH', 'QUARTER', 'YEAR', 'FISCAL_YEAR', 'FISCAL_QUARTER', 'FISCAL_MONTH']


class MvfCondition1(TypedDict):
    condition: NotRequired[
        Literal['GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', 'EQUAL_TO', 'NOT_EQUAL_TO', 'BETWEEN', 'NOT_BETWEEN']
    ]


class MvfCondition2(TypedDict):
    condition: Literal['GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', 'EQUAL_TO', 'NOT_EQUAL_TO', 'BETWEEN', 'NOT_BETWEEN']
    value: float


MvfCondition3 = TypedDict(
    'MvfCondition3',
    {
        'condition': Literal['GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', 'EQUAL_TO', 'NOT_EQUAL_TO', 'BETWEEN', 'NOT_BETWEEN'],
        'from': float,
        'to': float,
    },
)


MvfCondition: TypeAlias = MvfCondition1 | MvfCondition2 | MvfCondition3


class QueryFilter6(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'ranking_filter']


class State(TypedDict):
    include: NotRequired[list[str | float | bool]]
    exclude: NotRequired[list[str | float | bool]]


class QueryAttributeFilter(TypedDict):
    type: Literal['attribute_filter']
    using: AttributeIdentifier | LabelIdentifier
    display_as: NotRequired[str]
    state: NotRequired[State]


class QueryTextFilter1(TypedDict):
    type: Literal['text_filter']
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    condition: Literal['is', 'isNot']
    values: list[str | None]


class QueryTextFilter2(TypedDict):
    type: Literal['text_filter']
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    condition: Literal['contains', 'doesNotContain', 'startsWith', 'doesNotStartWith', 'endsWith', 'doesNotEndWith']
    value: str


QueryTextFilter: TypeAlias = QueryTextFilter1 | QueryTextFilter2


class QueryMetricValueFilter1(TypedDict):
    type: Literal['metric_value_filter']
    conditions: list[MvfCondition]
    condition: NotRequired[
        Literal['GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', 'EQUAL_TO', 'NOT_EQUAL_TO', 'BETWEEN', 'NOT_BETWEEN']
    ]
    using: MetricIdentifier | str
    null_values_as_zero: NotRequired[bool]
    dimensionality: NotRequired[list[LabelIdentifier | str]]


class QueryMetricValueFilter2(TypedDict):
    type: Literal['metric_value_filter']
    conditions: NotRequired[list[MvfCondition]]
    condition: Literal['GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', 'EQUAL_TO', 'NOT_EQUAL_TO', 'BETWEEN', 'NOT_BETWEEN']
    using: MetricIdentifier | str
    value: float
    null_values_as_zero: NotRequired[bool]
    dimensionality: NotRequired[list[LabelIdentifier | str]]


QueryMetricValueFilter3 = TypedDict(
    'QueryMetricValueFilter3',
    {
        'type': Literal['metric_value_filter'],
        'conditions': NotRequired[list[MvfCondition]],
        'condition': Literal['GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', 'EQUAL_TO', 'NOT_EQUAL_TO', 'BETWEEN', 'NOT_BETWEEN'],
        'using': MetricIdentifier | str,
        'from': float,
        'to': float,
        'null_values_as_zero': NotRequired[bool],
        'dimensionality': NotRequired[list[LabelIdentifier | str]],
    },
)


class QueryMetricValueFilter4(TypedDict):
    type: Literal['metric_value_filter']
    conditions: NotRequired[list[MvfCondition]]
    condition: NotRequired[
        Literal['GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', 'EQUAL_TO', 'NOT_EQUAL_TO', 'BETWEEN', 'NOT_BETWEEN']
    ]
    using: MetricIdentifier | str
    dimensionality: NotRequired[list[LabelIdentifier | str]]


QueryMetricValueFilter: TypeAlias = (
    QueryMetricValueFilter1
    | QueryMetricValueFilter2
    | QueryMetricValueFilter3
    | QueryMetricValueFilter4
)


class QueryRankingFilter1(TypedDict):
    type: Literal['ranking_filter']
    using: MetricIdentifier | str
    attribute: NotRequired[LabelIdentifier | str]
    bottom: float
    top: NotRequired[float]
    strict_limit_of_rows: NotRequired[bool]


class QueryRankingFilter2(TypedDict):
    type: Literal['ranking_filter']
    using: MetricIdentifier | str
    attribute: NotRequired[LabelIdentifier | str]
    bottom: NotRequired[float]
    top: float
    strict_limit_of_rows: NotRequired[bool]


QueryRankingFilter: TypeAlias = QueryRankingFilter1 | QueryRankingFilter2


class Using(TypedDict):
    SUM: NotRequired[str]
    AVG: NotRequired[str]
    MAX: NotRequired[str]
    MIN: NotRequired[str]
    MED: NotRequired[str]
    NAT: NotRequired[str]


class WidthItem(TypedDict):
    value: NotRequired[float | Literal['auto']]
    allowGrowToFit: NotRequired[bool]
    using: NotRequired[list[str | dict[str, str] | Using]]


SimpleColorItem: TypeAlias = float | str


ComplexColorItem: TypeAlias = float | str


class IgnoredDrillDown1(TypedDict):
    hierarchy: str
    on: str


class IgnoredDrillDown2(TypedDict):
    template: Literal['default']
    on: str


IgnoredDrillDown: TypeAlias = IgnoredDrillDown1 | IgnoredDrillDown2


class IgnoredDrillDownsIntersection(TypedDict):
    attributes: list[str]
    hierarchy: IgnoredDrillDown


InteractionIgnoredIntersectionAttributes: TypeAlias = list[str]


InteractionIgnoredDashboardFilters: TypeAlias = list[str]


InteractionIncludedSourceInsightFilters: TypeAlias = list[str]


InteractionIncludedSourceMeasureFilters: TypeAlias = list[str]


class InteractionFiltersExclude(TypedDict):
    drilled_datapoint: NotRequired[InteractionIgnoredIntersectionAttributes]
    dashboard_filters: NotRequired[InteractionIgnoredDashboardFilters]


class InteractionFiltersInclude(TypedDict):
    visualization_filters: NotRequired[InteractionIncludedSourceInsightFilters]
    metric_filters: NotRequired[InteractionIncludedSourceMeasureFilters]


InteractionClickOn: TypeAlias = str


class InteractionFilters(TypedDict):
    exclude: NotRequired[InteractionFiltersExclude]
    include: NotRequired[InteractionFiltersInclude]


class Fields4(TypedDict):
    type: Literal['fact', 'attribute', 'aggregated_fact']


SourceColumn: TypeAlias = str


DataType: TypeAlias = Literal['INT', 'STRING', 'DATE', 'NUMERIC', 'TIMESTAMP', 'TIMESTAMP_TZ', 'BOOLEAN', 'HLL']


Locale: TypeAlias = str


class Collection(TypedDict):
    id: str


class GeoAreaConfig(TypedDict):
    collection: Collection


class LabelTranslation(TypedDict):
    source_column: SourceColumn
    locale: Locale


class Source(TypedDict):
    source_column: SourceColumn
    data_type: DataType
    target: str
    is_nullable: NotRequired[bool]
    null_value_join_replacement: NotRequired[str]


class QueryField2(TypedDict):
    aggregation: NotRequired[
        Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    ]
    using: NotRequired[str | list[str]]
    maql: NotRequired[str]
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: NotRequired[
        Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    ]
    date_filter: NotRequired[str]


Using1: TypeAlias = str


Using2: TypeAlias = list[str]


Using3: TypeAlias = str


Using4: TypeAlias = list[str]


class QuerySort3(TypedDict):
    type: Literal['attribute_sort', 'metric_sort']


BucketEmptyItem: TypeAlias = None


BucketPushpinLocationItem: TypeAlias = str


class LayerItem1(TypedDict):
    type: Literal['pushpin']
    view_by: NotRequired[list[BucketPushpinLocationItem]]


BucketGeoAreaItem: TypeAlias = str


BucketLocationItem: TypeAlias = str


class ChartFill(TypedDict):
    type: NotRequired[Literal['solid', 'pattern', 'outline']]
    pattern_name_mapping: NotRequired[
        dict[
            str,
            Literal['diagonal_grid_small', 'vertical_lines_small', 'grid_small', 'horizontal_lines_small', 'circle_small', 'flag_small', 'waffle_small', 'dot_small', 'pyramid_small', 'needle_small', 'diamond_small', 'pizza_small', 'diagonal_grid_medium', 'vertical_lines_medium', 'grid_large', 'horizontal_lines_medium', 'circle_medium', 'flag_medium', 'waffle_medium', 'dot_medium', 'pyramid_medium', 'needle_medium', 'diamond_medium', 'pizza_medium'],
        ]
    ]


class DistinctPointShapes(TypedDict):
    enabled: NotRequired[bool]
    point_shape_mapping: NotRequired[
        dict[str, Literal['circle', 'square', 'diamond', 'triangle', 'triangle-down']]
    ]


class ColumnOverride(TypedDict):
    locators: NotRequired[list[dict[str, Any]]]
    wrap_text: NotRequired[bool]
    wrap_header_text: NotRequired[bool]
    match_type: NotRequired[Literal['column', 'pivotGroup']]


class TextWrapping(TypedDict):
    wrap_text: NotRequired[bool]
    wrap_header_text: NotRequired[bool]
    column_overrides: NotRequired[list[ColumnOverride]]


class CustomTooltip(TypedDict):
    enabled: NotRequired[bool]
    content: NotRequired[str]
    placement: NotRequired[Literal['above', 'below', 'replace']]


class Target(TypedDict):
    measure: str


class Target1(TypedDict):
    attribute: str


Value = TypedDict(
    'Value',
    {
        'from': float,
        'to': float,
    },
)


class Format(TypedDict):
    text: NotRequired[str]
    fill: NotRequired[str]
    scope: Literal['cell', 'row']


class Condition(TypedDict):
    id: str
    operator: Literal['all', 'equal_to', 'not_equal_to', 'less_than', 'less_than_or_equal_to', 'greater_than', 'greater_than_or_equal_to', 'between', 'not_between', 'contains', 'not_contains', 'starts_with', 'not_starts_with', 'ends_with', 'not_ends_with', 'is_empty', 'is_not_empty']
    value: NotRequired[float | str | Value]
    format: Format


class Rule(TypedDict):
    id: str
    target: Target | Target1
    conditions: list[Condition]


class ConditionalFormatting(TypedDict):
    version: NotRequired[str]
    enabled: NotRequired[bool]
    rules: NotRequired[list[Rule]]


DashboardFilters9 = TypedDict(
    'DashboardFilters9',
    {
        'type': Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group'],
        'title': NotRequired[str],
        'granularity': NotRequired[DateFilterGranularity],
        'from': NotRequired[str],
        'to': NotRequired[str],
        'mode': NotRequired[Literal['readonly', 'hidden', 'active']],
        'empty_values': NotRequired[Literal['only', 'include', 'exclude']],
        'date': NotRequired[Identifier],
    },
)


DashboardFilters10 = TypedDict(
    'DashboardFilters10',
    {
        'type': Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group'],
        'title': NotRequired[str],
        'granularity': NotRequired[DateFilterGranularity],
        'from': float,
        'to': float,
        'mode': NotRequired[Literal['readonly', 'hidden', 'active']],
        'empty_values': NotRequired[Literal['only', 'include', 'exclude']],
        'date': NotRequired[Identifier],
    },
)


class DashboardFilters11(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    multiselect: NotRequired[bool]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    display_as: NotRequired[str]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    state: NotRequired[Any]


class DashboardFilters12(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    multiselect: NotRequired[bool]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    display_as: NotRequired[str]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    state: NotRequired[Any]


class DashboardFilters13(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    condition: Literal['is', 'isNot']
    values: list[str | None]


class DashboardFilters14(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: AttributeIdentifier | LabelIdentifier
    case_sensitive: NotRequired[bool]
    display_as: NotRequired[str]
    mode: NotRequired[
        Literal['readonly', 'hidden', 'active']
    ]
    selection_type: NotRequired[
        Literal['list', 'text', 'listOrText']
    ]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]
    condition: Literal['contains', 'doesNotContain', 'startsWith', 'doesNotStartWith', 'endsWith', 'doesNotEndWith']
    value: str


class DashboardFilters15(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: MetricIdentifier
    conditions: NotRequired[list[MvfCondition]]
    dimensionality: NotRequired[list[LabelIdentifier]]
    null_values_as_zero: NotRequired[bool]
    mode: NotRequired[Literal['readonly', 'hidden', 'active']]


class AttributeHierarchy(TypedDict):
    id: Identifier
    type: Literal['attribute_hierarchy']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    attributes: list[AttributeIdentifier]


DashboardFilters = TypedDict(
    'DashboardFilters',
    {
        'type': Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group'],
        'title': NotRequired[str],
        'granularity': NotRequired[DateFilterGranularity],
        'from': NotRequired[str],
        'to': NotRequired[str],
        'mode': NotRequired[Literal['readonly', 'hidden', 'active']],
        'empty_values': NotRequired[Literal['only', 'include', 'exclude']],
        'date': NotRequired[Identifier],
    },
)


DashboardFilters1 = TypedDict(
    'DashboardFilters1',
    {
        'type': Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group'],
        'title': NotRequired[str],
        'granularity': NotRequired[DateFilterGranularity],
        'from': float,
        'to': float,
        'mode': NotRequired[Literal['readonly', 'hidden', 'active']],
        'empty_values': NotRequired[Literal['only', 'include', 'exclude']],
        'date': NotRequired[Identifier],
    },
)


class DashboardFilters6(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: NotRequired[str]
    using: MetricIdentifier
    conditions: NotRequired[list[MvfCondition]]
    dimensionality: NotRequired[list[LabelIdentifier]]
    null_values_as_zero: NotRequired[bool]
    mode: NotRequired[Literal['readonly', 'hidden', 'active']]


DashboardAbsoluteDateFilter = TypedDict(
    'DashboardAbsoluteDateFilter',
    {
        'title': NotRequired[str],
        'type': Literal['date_filter'],
        'granularity': NotRequired[DateFilterGranularity],
        'from': NotRequired[str],
        'to': NotRequired[str],
        'mode': NotRequired[Literal['readonly', 'hidden', 'active']],
        'empty_values': NotRequired[Literal['only', 'include', 'exclude']],
        'date': NotRequired[Identifier],
    },
)


DashboardRelativeDateFilter = TypedDict(
    'DashboardRelativeDateFilter',
    {
        'title': NotRequired[str],
        'type': Literal['date_filter'],
        'granularity': NotRequired[DateFilterGranularity],
        'from': float,
        'to': float,
        'mode': NotRequired[Literal['readonly', 'hidden', 'active']],
        'empty_values': NotRequired[Literal['only', 'include', 'exclude']],
        'date': NotRequired[Identifier],
    },
)


class DashboardMetricValueFilter(TypedDict):
    type: Literal['metric_value_filter']
    title: NotRequired[str]
    using: MetricIdentifier
    conditions: NotRequired[list[MvfCondition]]
    dimensionality: NotRequired[list[LabelIdentifier]]
    null_values_as_zero: NotRequired[bool]
    mode: NotRequired[Literal['readonly', 'hidden', 'active']]


class DashboardFiltersNoGroups1(DashboardAbsoluteDateFilter):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter']


class DashboardFiltersNoGroups2(DashboardRelativeDateFilter):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter']


class DashboardFiltersNoGroups5(DashboardMetricValueFilter):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter']


DashboardFiltersNoGroups: TypeAlias = dict[
    str,
    DashboardFiltersNoGroups1
    | DashboardFiltersNoGroups2
    | DashboardFiltersNoGroups3
    | DashboardFiltersNoGroups5,
]


class QueryFilter2(QueryAttributeFilter):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'ranking_filter']


class QueryFilter3(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'ranking_filter']


QueryDateFilter1 = TypedDict(
    'QueryDateFilter1',
    {
        'type': Literal['date_filter'],
        'using': str,
        'granularity': Literal['MINUTE', 'HOUR', 'DAY', 'WEEK', 'WEEK_US', 'MONTH', 'QUARTER', 'YEAR', 'MINUTE_OF_HOUR', 'HOUR_OF_DAY', 'DAY_OF_WEEK', 'DAY_OF_MONTH', 'DAY_OF_YEAR', 'WEEK_OF_YEAR', 'MONTH_OF_YEAR', 'QUARTER_OF_YEAR', 'FISCAL_YEAR', 'FISCAL_QUARTER', 'FISCAL_MONTH'],
        'from': NotRequired[float],
        'to': NotRequired[float],
        'with': NotRequired[dict[str, QueryAttributeFilter]],
        'empty_values': NotRequired[
            Literal['only', 'include', 'exclude']
        ],
    },
)


QueryDateFilter2 = TypedDict(
    'QueryDateFilter2',
    {
        'type': Literal['date_filter'],
        'using': str,
        'granularity': NotRequired[
            Literal['MINUTE', 'HOUR', 'DAY', 'WEEK', 'WEEK_US', 'MONTH', 'QUARTER', 'YEAR', 'MINUTE_OF_HOUR', 'HOUR_OF_DAY', 'DAY_OF_WEEK', 'DAY_OF_MONTH', 'DAY_OF_YEAR', 'WEEK_OF_YEAR', 'MONTH_OF_YEAR', 'QUARTER_OF_YEAR', 'FISCAL_YEAR', 'FISCAL_QUARTER', 'FISCAL_MONTH']
        ],
        'from': NotRequired[str],
        'to': NotRequired[str],
        'with': NotRequired[dict[str, QueryAttributeFilter]],
        'empty_values': NotRequired[
            Literal['only', 'include', 'exclude']
        ],
    },
)


QueryDateFilter: TypeAlias = QueryDateFilter1 | QueryDateFilter2


ColorItems: TypeAlias = dict[str, ComplexColorItem]


class ColorDefinition(TypedDict):
    total: NotRequired[SimpleColorItem]
    negative: NotRequired[SimpleColorItem]
    positive: NotRequired[SimpleColorItem]


class Plugins(TypedDict):
    id: Identifier
    parameters: NotRequired[Any]


class Permissions(TypedDict):
    VIEW: NotRequired[Permission]
    EDIT: NotRequired[Permission]
    SHARE: NotRequired[Permission]


class Widget1(TypedDict):
    id: NotRequired[Identifier]
    content: str
    columns: NotRequired[Literal[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]]
    rows: NotRequired[float]


class InteractionOpenPlainUrl(TypedDict):
    click_on: InteractionClickOn
    open_url: str
    ignored_intersection_attributes: NotRequired[
        InteractionIgnoredIntersectionAttributes
    ]


class OpenUrl(TypedDict):
    href: NotRequired[AttributeIdentifier | LabelIdentifier]
    label: NotRequired[AttributeIdentifier | LabelIdentifier]


class InteractionOpenParamUrl(TypedDict):
    click_on: InteractionClickOn
    open_url: OpenUrl
    ignored_intersection_attributes: NotRequired[
        InteractionIgnoredIntersectionAttributes
    ]


class InteractionOpenDashboard(TypedDict):
    click_on: InteractionClickOn
    open_dashboard: str
    open_dashboard_tab: NotRequired[str]
    filters: NotRequired[InteractionFilters]


class InteractionOpenVisualization(TypedDict):
    click_on: InteractionClickOn
    open_visualization: str
    filters: NotRequired[InteractionFilters]


class DateDataset(TypedDict):
    id: Identifier
    type: Literal['date']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    title_base: NotRequired[str]
    title_pattern: NotRequired[str]
    granularities: NotRequired[
        list[
            Literal['MINUTE', 'HOUR', 'DAY', 'WEEK', 'WEEK_US', 'MONTH', 'QUARTER', 'YEAR', 'MINUTE_OF_HOUR', 'HOUR_OF_DAY', 'DAY_OF_WEEK', 'DAY_OF_WEEK_EU', 'DAY_OF_MONTH', 'DAY_OF_YEAR', 'DAY_OF_QUARTER', 'WEEK_OF_YEAR', 'WEEK_OF_YEAR_EU', 'WEEK_OF_QUARTER_EU', 'WEEK_OF_QUARTER', 'MONTH_OF_YEAR', 'MONTH_OF_QUARTER', 'QUARTER_OF_YEAR', 'FISCAL_YEAR', 'FISCAL_QUARTER', 'FISCAL_MONTH']
        ]
    ]


class Reference(TypedDict):
    dataset: str
    sources: list[Source]
    multi_directional: NotRequired[bool]


class WorkspaceDataFilter(TypedDict):
    filter_id: str
    source_column: SourceColumn
    data_type: DataType


class Fact(TypedDict):
    type: Literal['fact']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    source_column: NotRequired[SourceColumn]
    data_type: DataType
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    is_nullable: NotRequired[bool]
    null_value_join_replacement: NotRequired[str]


class AggregatedFact(TypedDict):
    type: Literal['aggregated_fact']
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    source_column: NotRequired[SourceColumn]
    data_type: DataType
    aggregated_as: Literal['MIN', 'MAX', 'SUM', 'APPROXIMATE_COUNT']
    assigned_to: str
    is_nullable: NotRequired[bool]
    null_value_join_replacement: NotRequired[str]


class Label(TypedDict):
    source_column: NotRequired[SourceColumn]
    data_type: NotRequired[DataType]
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    value_type: NotRequired[
        Literal['TEXT', 'HYPERLINK', 'GEO', 'GEO_LONGITUDE', 'GEO_LATITUDE', 'GEO_ICON', 'IMAGE', 'GEO_AREA']
    ]
    geo_area_config: NotRequired[GeoAreaConfig]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    locale: NotRequired[Locale]
    translations: NotRequired[list[LabelTranslation]]
    is_nullable: NotRequired[bool]
    null_value_join_replacement: NotRequired[str]


class Metric(TypedDict):
    id: Identifier
    type: Literal['metric']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    maql: str
    format: NotRequired[str]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]


class Plugin(TypedDict):
    id: Identifier
    type: Literal['plugin']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    url: str


class QueryField1(TypedDict):
    aggregation: NotRequired[
        Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    ]
    using: str | list[str]
    maql: NotRequired[str]
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: NotRequired[
        Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    ]
    date_filter: NotRequired[str]
    title: NotRequired[Title]
    show_all_values: NotRequired[bool]


class QueryField7(TypedDict):
    aggregation: NotRequired[
        Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    ]
    using: NotRequired[str | list[str]]
    maql: str
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: NotRequired[
        Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    ]
    date_filter: NotRequired[str]
    title: NotRequired[Title]


class QueryField9(TypedDict):
    aggregation: NotRequired[
        Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    ]
    using: list[str]
    maql: NotRequired[str]
    operator: Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    type: NotRequired[
        Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    ]
    date_filter: NotRequired[str]
    title: NotRequired[Title]


class QueryField11(TypedDict):
    aggregation: NotRequired[
        Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    ]
    using: str | list[str]
    maql: NotRequired[str]
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    date_filter: str
    title: NotRequired[Title]


class QueryField13(TypedDict):
    aggregation: NotRequired[
        Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    ]
    using: str | list[str]
    maql: NotRequired[str]
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    date_filter: str
    title: NotRequired[Title]
    period: NotRequired[float]


class QueryAttributeSort(TypedDict):
    type: Literal['attribute_sort']
    by: str | AttributeIdentifier | LabelIdentifier
    direction: Literal['ASC', 'DESC']
    aggregation: NotRequired[Literal['SUM']]


class Metrics(TypedDict):
    by: str | AttributeIdentifier | LabelIdentifier
    element: NotRequired[str]
    function: NotRequired[Literal['SUM', 'AVG', 'MIN', 'MAX', 'MED', 'NAT']]


class QueryMetricSort(TypedDict):
    type: Literal['metric_sort']
    direction: Literal['ASC', 'DESC']
    metrics: list[str | Metrics]


class LayerItem2(TypedDict):
    type: Literal['area']
    view_by: NotRequired[list[BucketGeoAreaItem]]


class TotalItem(TypedDict):
    type: Literal['SUM', 'AVG', 'MAX', 'MIN', 'MED', 'NAT']
    title: NotRequired[Title]
    using: str


class Config(TypedDict):
    widths: NotRequired[list[WidthItem]]
    colors: NotRequired[ColorItems]
    color: NotRequired[ColorDefinition]
    column_header: NotRequired[str]
    metrics_in: NotRequired[str]
    data_labels: NotRequired[bool | Literal['auto']]
    data_labels_style: NotRequired[Literal['auto', 'backplate']]
    chart_fill: NotRequired[ChartFill]
    data_points: NotRequired[bool | Literal['auto']]
    data_totals: NotRequired[bool | Literal['auto']]
    orientation: NotRequired[str]
    legend_enabled: NotRequired[bool]
    legend_position: NotRequired[str]
    xaxis_format: NotRequired[str]
    xaxis_max: NotRequired[float]
    xaxis_min: NotRequired[float]
    xaxis_name_position: NotRequired[str]
    xaxis_name_visible: NotRequired[bool]
    xaxis_rotation: NotRequired[str]
    xaxis_visible: NotRequired[bool]
    xaxis_labels: NotRequired[bool]
    yaxis_name_position: NotRequired[str]
    yaxis_name_visible: NotRequired[bool]
    yaxis_rotation: NotRequired[str]
    yaxis_visible: NotRequired[bool]
    yaxis_labels: NotRequired[bool]
    yaxis_format: NotRequired[str]
    yaxis_max: NotRequired[float]
    yaxis_min: NotRequired[float]
    grid_enabled: NotRequired[bool]
    stack_measures_to_100: NotRequired[bool]
    stack_measures: NotRequired[bool]
    continuous_line: NotRequired[bool]
    distinct_point_shapes: NotRequired[DistinctPointShapes]
    total_enabled: NotRequired[bool]
    total_name: NotRequired[str]
    comparison_enabled: NotRequired[bool]
    comparison_type: NotRequired[str]
    format: NotRequired[str]
    position: NotRequired[str]
    indicator_arrow: NotRequired[bool]
    indicator_colors: NotRequired[bool]
    indicator_color_equals: NotRequired[SimpleColorItem]
    indicator_color_negative: NotRequired[SimpleColorItem]
    indicator_color_positive: NotRequired[SimpleColorItem]
    label_default: NotRequired[str]
    label_conditional: NotRequired[bool]
    label_equals: NotRequired[str]
    label_negative: NotRequired[str]
    label_positive: NotRequired[str]
    yaxis_primary_type: NotRequired[Literal['column', 'area', 'line']]
    yaxis_primary_format: NotRequired[str]
    yaxis_primary_max: NotRequired[float]
    yaxis_primary_min: NotRequired[float]
    yaxis_primary_name_position: NotRequired[str]
    yaxis_primary_name_visible: NotRequired[bool]
    yaxis_primary_rotation: NotRequired[str]
    yaxis_primary_visible: NotRequired[bool]
    yaxis_primary_labels: NotRequired[bool]
    yaxis_secondary_type: NotRequired[Literal['column', 'area', 'line']]
    yaxis_secondary_format: NotRequired[str]
    yaxis_secondary_max: NotRequired[float]
    yaxis_secondary_min: NotRequired[float]
    yaxis_secondary_name_position: NotRequired[str]
    yaxis_secondary_name_visible: NotRequired[bool]
    yaxis_secondary_rotation: NotRequired[str]
    yaxis_secondary_visible: NotRequired[bool]
    yaxis_secondary_labels: NotRequired[bool]
    yaxis_secondary_show_on_right: NotRequired[bool]
    tooltip_text: NotRequired[str]
    viewport: NotRequired[
        Literal['auto', 'continent_af', 'continent_as', 'continent_au', 'continent_eu', 'continent_na', 'continent_sa', 'world', 'custom']
    ]
    basemap: NotRequired[str]
    viewport_pan: NotRequired[bool]
    viewport_zoom: NotRequired[bool]
    center_lat: NotRequired[float]
    center_lng: NotRequired[float]
    zoom_level: NotRequired[float]
    group_nearby_points: NotRequired[bool]
    min_size: NotRequired[
        Literal['0.5x', '0.75x', 'normal', '1.25x', '1.5x', 'default']
    ]
    max_size: NotRequired[
        Literal['0.5x', '0.75x', 'normal', '1.25x', '1.5x', 'default']
    ]
    shape_type: NotRequired[Literal['circle', 'iconByValue', 'oneIcon']]
    icon: NotRequired[str]
    viewport_bounds_ne_lat: NotRequired[float]
    viewport_bounds_ne_lng: NotRequired[float]
    viewport_bounds_sw_lat: NotRequired[float]
    viewport_bounds_sw_lng: NotRequired[float]
    row_height: NotRequired[Literal['small', 'medium', 'large']]
    cell_vertical_align: NotRequired[Literal['top', 'middle', 'bottom']]
    cell_text_wrapping: NotRequired[Literal['clip', 'wrap']]
    cell_image_sizing: NotRequired[Literal['fit', 'fill']]
    forecast_enabled: NotRequired[bool]
    forecast_confidence: NotRequired[float]
    forecast_period: NotRequired[float]
    forecast_seasonal: NotRequired[bool]
    anomaly_detection_enabled: NotRequired[bool]
    anomaly_detection_sensitivity: NotRequired[Literal['low', 'medium', 'high']]
    anomaly_detection_size: NotRequired[Literal['small', 'medium', 'big']]
    anomaly_detection_color: NotRequired[SimpleColorItem]
    clustering_enabled: NotRequired[bool]
    clustering_amount: NotRequired[float]
    clustering_threshold: NotRequired[float]
    disable_drill_down: NotRequired[bool]
    disable_drill_into_url: NotRequired[bool]
    disable_alerts: NotRequired[bool]
    disable_scheduled_exports: NotRequired[bool]
    disable_key_drive_analysis: NotRequired[dict[str, bool]]
    text_wrapping: NotRequired[TextWrapping]
    pagination: NotRequired[bool]
    page_size: NotRequired[float]
    grand_totals_position: NotRequired[
        Literal['pinnedBottom', 'pinnedTop', 'bottom', 'top']
    ]
    enable_accessibility: NotRequired[bool]
    line_style_control_metrics: NotRequired[list[str]]
    line_style_excluded_metrics: NotRequired[list[str]]
    custom_tooltip: NotRequired[CustomTooltip]
    conditional_formatting: NotRequired[ConditionalFormatting]


class DashboardFilters16(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: str
    filters: DashboardFiltersNoGroups


DashboardFiltersModel: TypeAlias = dict[
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


class Metadata2(DateDataset):
    type: Literal['dataset', 'date', 'metric', 'dashboard', 'plugin', 'table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart', 'attribute_hierarchy']


class Metadata3(Metric):
    type: Literal['dataset', 'date', 'metric', 'dashboard', 'plugin', 'table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart', 'attribute_hierarchy']


class Metadata5(Plugin):
    type: Literal['dataset', 'date', 'metric', 'dashboard', 'plugin', 'table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart', 'attribute_hierarchy']


class Metadata6(AttributeHierarchy):
    type: Literal['dataset', 'date', 'metric', 'dashboard', 'plugin', 'table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart', 'attribute_hierarchy']


class DashboardFilters7(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'text_filter', 'metric_value_filter', 'filter_group']
    title: str
    filters: DashboardFiltersNoGroups


DashboardFilters8: TypeAlias = dict[
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


class DashboardFilterGroup(TypedDict):
    type: Literal['filter_group']
    title: str
    filters: DashboardFiltersNoGroups


QueryFilter: TypeAlias = QueryFilter3 | QueryFilter2 | QueryFilter6


Interaction: TypeAlias = (
    InteractionOpenPlainUrl
    | Any
    | InteractionOpenParamUrl
    | Any
    | InteractionOpenDashboard
    | Any
    | InteractionOpenVisualization
    | Any
)


class VisualizationWidget(TypedDict):
    id: NotRequired[Identifier]
    visualization: str
    title: NotRequired[str | Literal[False]]
    description: NotRequired[str | Literal[False] | Literal['inherit']]
    columns: NotRequired[Literal[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]]
    rows: NotRequired[float]
    date: NotRequired[Identifier]
    ignored_filters: NotRequired[list[str]]
    zoom_data: NotRequired[bool]
    interactions: NotRequired[list[Interaction]]
    ignored_drill_downs: NotRequired[list[IgnoredDrillDown]]
    ignored_drill_downs_intersections: NotRequired[list[IgnoredDrillDownsIntersection]]
    ignored_cross_filtering: NotRequired[bool]


class Fields2(Fact):
    type: Literal['fact', 'attribute', 'aggregated_fact']


class Fields3(AggregatedFact):
    type: Literal['fact', 'attribute', 'aggregated_fact']


class Attribute(TypedDict):
    type: Literal['attribute']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    source_column: NotRequired[SourceColumn]
    data_type: DataType
    default_view: NotRequired[str]
    sort_column: NotRequired[str]
    sort_direction: NotRequired[Literal['ASC', 'DESC']]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    locale: NotRequired[Locale]
    is_nullable: NotRequired[bool]
    null_value_join_replacement: NotRequired[str]
    labels: NotRequired[dict[str, Label]]


class QuerySort1(QueryAttributeSort):
    type: Literal['attribute_sort', 'metric_sort']


class QuerySort2(QueryMetricSort):
    type: Literal['attribute_sort', 'metric_sort']


QuerySort: TypeAlias = QuerySort1 | QuerySort2 | QuerySort3


class BucketItem1(TypedDict):
    field: NotRequired[str]
    format: NotRequired[str]
    axis: NotRequired[Literal['primary', 'secondary']]
    display_as: NotRequired[Literal['line', 'column', 'metric']]
    totals: NotRequired[list[TotalItem]]


BucketItem: TypeAlias = str | BucketItem1


class LayerItemBase(TypedDict):
    id: Identifier
    title: NotRequired[Title]
    type: NotRequired[Literal['pushpin', 'area']]
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem | BucketEmptyItem]]
    view_by: NotRequired[list[BucketLocationItem]]
    segment_by: NotRequired[list[BucketItem]]


QueryFilters: TypeAlias = dict[str, QueryFilter]


class Widget2(TypedDict):
    id: NotRequired[Identifier]
    columns: NotRequired[Literal[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]]
    rows: NotRequired[float]
    visualizations: list[VisualizationWidget]


class Fields1(Attribute):
    type: Literal['fact', 'attribute', 'aggregated_fact']


Fields: TypeAlias = dict[str, Fields1 | Fields2 | Fields3 | Fields4]


QuerySorts: TypeAlias = list[QuerySort]


class QueryField3(TypedDict):
    aggregation: NotRequired[
        Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    ]
    using: Using1 | Using2 | Using3 | Using4
    maql: NotRequired[str]
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: NotRequired[
        Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    ]
    date_filter: NotRequired[str]
    title: NotRequired[Title]
    compute_ratio: NotRequired[bool]
    filter_by: NotRequired[QueryFilters]


class QueryField5(TypedDict):
    aggregation: Literal['SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM']
    using: str | list[str]
    maql: NotRequired[str]
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: NotRequired[
        Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']
    ]
    date_filter: NotRequired[str]
    title: NotRequired[Title]
    compute_ratio: NotRequired[bool]
    filter_by: NotRequired[QueryFilters]


QueryField: TypeAlias = (
    AttributeIdentifier
    | LabelIdentifier
    | MetricIdentifier
    | FactIdentifier
    | QueryField1
    | QueryField2
    | QueryField3
    | QueryField2
    | QueryField5
    | QueryField2
    | QueryField7
    | QueryField2
    | QueryField9
    | QueryField2
    | QueryField11
    | QueryField2
    | QueryField13
    | QueryField2
)


LayerItem: TypeAlias = LayerItemBase | LayerItem1 | LayerItem2


class Dataset5(TypedDict):
    id: Identifier
    type: Literal['dataset']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    table_path: str
    sql: NotRequired[str]
    primary_key: NotRequired[str | list[Identifier]]
    fields: NotRequired[Fields]
    references: NotRequired[list[Reference]]
    workspace_data_filters: NotRequired[list[WorkspaceDataFilter]]
    data_source: NotRequired[str]
    precedence: NotRequired[float]
    dataset_type: NotRequired[Literal['standard', 'auxiliary']]


class Dataset6(TypedDict):
    id: Identifier
    type: Literal['dataset']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    table_path: NotRequired[str]
    sql: str
    primary_key: NotRequired[str | list[Identifier]]
    fields: NotRequired[Fields]
    references: NotRequired[list[Reference]]
    workspace_data_filters: NotRequired[list[WorkspaceDataFilter]]
    data_source: NotRequired[str]
    precedence: NotRequired[float]
    dataset_type: NotRequired[Literal['standard', 'auxiliary']]


class Dataset7(TypedDict):
    id: Identifier
    type: Literal['dataset']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    table_path: NotRequired[Any]
    sql: NotRequired[Any]
    primary_key: NotRequired[str | list[Identifier]]
    fields: NotRequired[Fields]
    references: NotRequired[list[Reference]]
    workspace_data_filters: NotRequired[Any]
    data_source: NotRequired[str]
    precedence: NotRequired[Any]
    dataset_type: Literal['auxiliary']


Dataset: TypeAlias = Dataset5 | Dataset6 | Dataset7


class Metadata1(TypedDict):
    type: Literal['dataset', 'date', 'metric', 'dashboard', 'plugin', 'table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart', 'attribute_hierarchy']


class Dataset2(TypedDict):
    id: Identifier
    type: Literal['dataset']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    table_path: str
    sql: NotRequired[str]
    primary_key: NotRequired[str | list[Identifier]]
    fields: NotRequired[Fields]
    references: NotRequired[list[Reference]]
    workspace_data_filters: NotRequired[list[WorkspaceDataFilter]]
    data_source: NotRequired[str]
    precedence: NotRequired[float]
    dataset_type: NotRequired[Literal['standard', 'auxiliary']]


class Dataset3(TypedDict):
    id: Identifier
    type: Literal['dataset']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    table_path: NotRequired[str]
    sql: str
    primary_key: NotRequired[str | list[Identifier]]
    fields: NotRequired[Fields]
    references: NotRequired[list[Reference]]
    workspace_data_filters: NotRequired[list[WorkspaceDataFilter]]
    data_source: NotRequired[str]
    precedence: NotRequired[float]
    dataset_type: NotRequired[Literal['standard', 'auxiliary']]


class Dataset4(TypedDict):
    id: Identifier
    type: Literal['dataset']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    table_path: NotRequired[Any]
    sql: NotRequired[Any]
    primary_key: NotRequired[str | list[Identifier]]
    fields: NotRequired[Fields]
    references: NotRequired[list[Reference]]
    workspace_data_filters: NotRequired[Any]
    data_source: NotRequired[str]
    precedence: NotRequired[Any]
    dataset_type: Literal['auxiliary']


Dataset1: TypeAlias = Dataset2 | Dataset3 | Dataset4


QueryFields: TypeAlias = dict[str, QueryField]


class Query(TypedDict):
    fields: QueryFields
    filter_by: NotRequired[QueryFilters]
    sort_by: NotRequired[QuerySorts]


class Visualisation1(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]
    rows: NotRequired[list[BucketItem]]
    columns: NotRequired[list[BucketItem]]


class Visualisation2(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]
    stack_by: NotRequired[list[BucketItem]]


class Visualisation3(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]
    stack_by: NotRequired[list[BucketItem]]


class Visualisation4(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    trend_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]


class Visualisation5(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    stack_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]


class Visualisation6(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem | BucketEmptyItem]]
    view_by: NotRequired[list[BucketItem]]
    attributes: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]


class Visualisation7(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem | BucketEmptyItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]
    size_by: NotRequired[list[BucketItem]]


class Visualisation8(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[Any]]


class Visualisation9(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[Any]]


class Visualisation10(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]


class Visualisation11(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[Any]]


class Visualisation12(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[Any]]


class Visualisation13(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]
    rows: NotRequired[list[BucketItem]]
    columns: NotRequired[list[BucketItem]]


class Visualisation14(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem | BucketEmptyItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[Any]]


class Visualisation15(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[Any]]


Visualisation16 = TypedDict(
    'Visualisation16',
    {
        'type': Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart'],
        'id': Identifier,
        'title': NotRequired[Title],
        'description': NotRequired[Description],
        'tags': NotRequired[Tags],
        'show_in_ai_results': NotRequired[bool],
        'is_hidden': NotRequired[bool],
        'query': Query,
        'config': NotRequired[Config],
        'metrics': NotRequired[list[BucketItem]],
        'view_by': NotRequired[list[BucketItem | BucketEmptyItem]],
        'from': NotRequired[BucketItem],
        'to': NotRequired[BucketItem],
        'segment_by': NotRequired[list[Any]],
    },
)


Visualisation17 = TypedDict(
    'Visualisation17',
    {
        'type': Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart'],
        'id': Identifier,
        'title': NotRequired[Title],
        'description': NotRequired[Description],
        'tags': NotRequired[Tags],
        'show_in_ai_results': NotRequired[bool],
        'is_hidden': NotRequired[bool],
        'query': Query,
        'config': NotRequired[Config],
        'metrics': NotRequired[list[BucketItem]],
        'view_by': NotRequired[list[BucketItem | BucketEmptyItem]],
        'from': NotRequired[BucketItem],
        'to': NotRequired[BucketItem],
        'segment_by': NotRequired[list[Any]],
    },
)


class Visualisation18(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[Any]]
    segment_by: NotRequired[list[Any]]


class Visualisation19(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[Any]]


class Visualisation20(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem | BucketEmptyItem]]
    view_by: NotRequired[list[BucketPushpinLocationItem]]
    segment_by: NotRequired[list[BucketItem]]
    layers: NotRequired[list[LayerItem]]


class Visualisation21(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketGeoAreaItem]]
    segment_by: NotRequired[list[BucketItem]]
    layers: NotRequired[list[LayerItem]]


class Visualisation22(TypedDict):
    type: Literal['table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart']
    id: Identifier
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    show_in_ai_results: NotRequired[bool]
    is_hidden: NotRequired[bool]
    query: Query
    config: NotRequired[Config]
    metrics: NotRequired[list[BucketItem]]
    view_by: NotRequired[list[BucketItem]]
    segment_by: NotRequired[list[BucketItem]]
    rows: NotRequired[list[BucketItem]]
    columns: NotRequired[list[BucketItem]]


Visualisation: TypeAlias = (
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
)


Metadata: TypeAlias = Union[
    Metadata1, Metadata2, Metadata3, "Metadata4", Metadata5, Metadata6, Metadata8
]


class Dashboard1(TypedDict):
    id: Identifier
    type: Literal['dashboard']
    version: NotRequired[Literal['2', '3']]
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    cross_filtering: NotRequired[bool]
    user_filters_reset: NotRequired[bool]
    user_filters_save: NotRequired[bool]
    filter_views: NotRequired[bool]
    enable_section_headers: NotRequired[bool]
    sections: NotRequired[list[Section]]
    filters: NotRequired[DashboardFiltersModel]
    plugins: NotRequired[list[Plugins | Identifier]]
    tabs: NotRequired[list[Tab]]
    permissions: NotRequired[Permissions]


class Section(TypedDict):
    title: NotRequired[str]
    description: NotRequired[str]
    widgets: list[Widget]


class Tab(TypedDict):
    id: Identifier
    title: Title
    filters: NotRequired[DashboardFiltersModel]
    sections: list[Section]


class Widget3(TypedDict):
    container: Identifier
    columns: NotRequired[Literal[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]]
    rows: NotRequired[float]
    layout_direction: NotRequired[Literal['row', 'column']]
    enable_section_headers: NotRequired[bool]
    sections: list[Section]


Widget: TypeAlias = VisualizationWidget | Widget1 | Widget2 | Widget3


class Dashboard(TypedDict):
    id: Identifier
    type: Literal['dashboard']
    version: NotRequired[Literal['2', '3']]
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    cross_filtering: NotRequired[bool]
    user_filters_reset: NotRequired[bool]
    user_filters_save: NotRequired[bool]
    filter_views: NotRequired[bool]
    enable_section_headers: NotRequired[bool]
    sections: NotRequired[list[Section]]
    filters: NotRequired[DashboardFiltersModel]
    plugins: NotRequired[list[Plugins | Identifier]]
    tabs: NotRequired[list[Tab]]
    permissions: NotRequired[Permissions]


class Metadata4(Dashboard):
    type: Literal['dataset', 'date', 'metric', 'dashboard', 'plugin', 'table', 'bar_chart', 'column_chart', 'line_chart', 'area_chart', 'scatter_chart', 'bubble_chart', 'pie_chart', 'donut_chart', 'treemap_chart', 'pyramid_chart', 'funnel_chart', 'heatmap_chart', 'bullet_chart', 'waterfall_chart', 'dependency_wheel_chart', 'sankey_chart', 'headline_chart', 'combo_chart', 'geo_chart', 'geo_area_chart', 'repeater_chart', 'attribute_hierarchy']
