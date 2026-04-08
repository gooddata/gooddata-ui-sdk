# (C) 2026 GoodData Corporation
# schema-hash: 54e9928af2e890dc3a3fa20d4a6effc052467dc6847081285ad12633083cdf6a

from __future__ import annotations

from typing import Any, Literal, TypeAlias, TypedDict

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
    "Config",
    "Dashboard",
    "DashboardAbsoluteDateFilter",
    "DashboardAttributeFilter",
    "DashboardAttributeFilter1",
    "DashboardFilterGroup",
    "DashboardFilters",
    "DashboardFilters1",
    "DashboardFilters2",
    "DashboardFiltersModel",
    "DashboardFiltersNoGroups",
    "DashboardFiltersNoGroups1",
    "DashboardRelativeDateFilter",
    "DataType",
    "Dataset",
    "Dataset1",
    "Dataset2",
    "DateDataset",
    "DateFilterGranularity",
    "Description",
    "DisplayAsLabelIdentifier",
    "DistinctPointShapes",
    "Fact",
    "FactIdentifier",
    "Fields",
    "Fields1",
    "GeoAreaConfig",
    "Identifier",
    "IgnoredDrillDown",
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
    "LayerItem3",
    "LayerItem4",
    "LayerItem5",
    "LayerItemBase",
    "Locale",
    "Metadata",
    "Metric",
    "MetricIdentifier",
    "Metrics",
    "MvfCondition",
    "OpenUrl",
    "Parents",
    "Permission",
    "Permissions",
    "Plugin",
    "Plugins",
    "QueryAttributeFilter",
    "QueryAttributeSort",
    "QueryDateFilter",
    "QueryField",
    "QueryField1",
    "QueryFields",
    "QueryFilter",
    "QueryMetricSort",
    "QueryMetricValueFilter",
    "QueryRankingFilter",
    "QueryRankingFilter1",
    "QueryRankingFilter2",
    "QuerySort",
    "QuerySorts",
    "Reference",
    "Section",
    "SimpleColorItem",
    "Source",
    "SourceColumn",
    "State",
    "Tab",
    "Tags",
    "TextWrapping",
    "Title",
    "TotalItem",
    "Using",
    "VisualizationWidget",
    "Widget",
    "WidthItem",
    "WorkspaceDataFilter",
]



class Metadata(TypedDict):
    type: Literal[
        'dataset',
        'date',
        'metric',
        'dashboard',
        'plugin',
        'table',
        'bar_chart',
        'column_chart',
        'line_chart',
        'area_chart',
        'scatter_chart',
        'bubble_chart',
        'pie_chart',
        'donut_chart',
        'treemap_chart',
        'pyramid_chart',
        'funnel_chart',
        'heatmap_chart',
        'bullet_chart',
        'waterfall_chart',
        'dependency_wheel_chart',
        'sankey_chart',
        'headline_chart',
        'combo_chart',
        'geo_chart',
        'geo_area_chart',
        'repeater_chart',
        'attribute_hierarchy',
    ]


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


class DashboardFilters(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'filter_group']


DashboardFilters1: TypeAlias = dict[str, DashboardFilters]


class Parents(TypedDict):
    using: str
    common: bool


class DashboardAttributeFilter1(TypedDict):
    title: NotRequired[str]
    type: Literal['attribute_filter']
    using: AttributeIdentifier | LabelIdentifier
    multiselect: NotRequired[bool]
    mode: NotRequired[Literal['readonly', 'hidden', 'active']]
    display_as: NotRequired[str]
    parents: NotRequired[list[str | Parents]]
    metric_filters: NotRequired[list[str]]


DashboardAttributeFilter: TypeAlias = DashboardAttributeFilter1


class DashboardFiltersNoGroups1(TypedDict):
    type: Literal['date_filter', 'attribute_filter']


DashboardFiltersNoGroups: TypeAlias = dict[str, DashboardFiltersNoGroups1]


DateFilterGranularity: TypeAlias = Literal[
    'MINUTE',
    'HOUR',
    'DAY',
    'WEEK',
    'WEEK_US',
    'MONTH',
    'QUARTER',
    'YEAR',
    'FISCAL_YEAR',
    'FISCAL_QUARTER',
    'FISCAL_MONTH',
]


class QueryFilter(TypedDict):
    type: Literal[
        'date_filter', 'attribute_filter', 'metric_value_filter', 'ranking_filter'
    ]


class State(TypedDict):
    include: NotRequired[list[str | float | bool]]
    exclude: NotRequired[list[str | float | bool]]


class QueryAttributeFilter(TypedDict):
    type: Literal['attribute_filter']
    using: AttributeIdentifier | LabelIdentifier
    display_as: NotRequired[str]
    state: NotRequired[State]


class QueryRankingFilter1(TypedDict):
    type: Literal['ranking_filter']
    using: MetricIdentifier | str
    attribute: NotRequired[AttributeIdentifier | str]
    bottom: float
    top: NotRequired[float]


class QueryRankingFilter2(TypedDict):
    type: Literal['ranking_filter']
    using: MetricIdentifier | str
    attribute: NotRequired[AttributeIdentifier | str]
    bottom: NotRequired[float]
    top: float


QueryRankingFilter: TypeAlias = QueryRankingFilter1 | QueryRankingFilter2


class MvfCondition(TypedDict):
    condition: NotRequired[
        Literal[
            'GREATER_THAN',
            'GREATER_THAN_OR_EQUAL_TO',
            'LESS_THAN',
            'LESS_THAN_OR_EQUAL_TO',
            'EQUAL_TO',
            'NOT_EQUAL_TO',
            'BETWEEN',
            'NOT_BETWEEN',
        ]
    ]


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


class Widget(TypedDict):
    pass


Interaction: TypeAlias = Any


class IgnoredDrillDown(TypedDict):
    pass


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


class Fields1(TypedDict):
    type: Literal['fact', 'attribute', 'aggregated_fact']


Fields: TypeAlias = dict[str, Fields1]


SourceColumn: TypeAlias = str


DataType: TypeAlias = Literal[
    'INT', 'STRING', 'DATE', 'NUMERIC', 'TIMESTAMP', 'TIMESTAMP_TZ', 'BOOLEAN'
]


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


class QueryField1(TypedDict):
    aggregation: NotRequired[
        Literal[
            'SUM', 'COUNT', 'APPROXIMATE_COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'RUNSUM'
        ]
    ]
    using: NotRequired[str | list[str]]
    maql: NotRequired[str]
    operator: NotRequired[
        Literal['SUM', 'DIFFERENCE', 'MULTIPLICATION', 'RATIO', 'CHANGE']
    ]
    type: NotRequired[Literal['PREVIOUS_YEAR', 'PREVIOUS_PERIOD']]
    date_filter: NotRequired[str]


class QuerySort(TypedDict):
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
            Literal[
                'diagonal_grid_small',
                'vertical_lines_small',
                'grid_small',
                'horizontal_lines_small',
                'circle_small',
                'flag_small',
                'waffle_small',
                'dot_small',
                'pyramid_small',
                'needle_small',
                'diamond_small',
                'pizza_small',
                'diagonal_grid_medium',
                'vertical_lines_medium',
                'grid_large',
                'horizontal_lines_medium',
                'circle_medium',
                'flag_medium',
                'waffle_medium',
                'dot_medium',
                'pyramid_medium',
                'needle_medium',
                'diamond_medium',
                'pizza_medium',
            ],
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


class DashboardFilters2(TypedDict):
    type: Literal['date_filter', 'attribute_filter', 'filter_group']


DashboardFiltersModel: TypeAlias = dict[str, DashboardFilters2]


class AttributeHierarchy(TypedDict):
    id: Identifier
    type: Literal['attribute_hierarchy']
    title: NotRequired[Title]
    description: NotRequired[Description]
    tags: NotRequired[Tags]
    attributes: list[AttributeIdentifier]


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


class DashboardFilterGroup(TypedDict):
    type: Literal['filter_group']
    title: str
    filters: DashboardFiltersNoGroups


QueryDateFilter = TypedDict(
    'QueryDateFilter',
    {
        'type': Literal['date_filter'],
        'using': str,
        'granularity': NotRequired[
            Literal[
                'MINUTE',
                'HOUR',
                'DAY',
                'WEEK',
                'WEEK_US',
                'MONTH',
                'QUARTER',
                'YEAR',
                'MINUTE_OF_HOUR',
                'HOUR_OF_DAY',
                'DAY_OF_WEEK',
                'DAY_OF_MONTH',
                'DAY_OF_YEAR',
                'WEEK_OF_YEAR',
                'MONTH_OF_YEAR',
                'QUARTER_OF_YEAR',
                'FISCAL_YEAR',
                'FISCAL_QUARTER',
                'FISCAL_MONTH',
            ]
        ],
        'from': NotRequired[str | float],
        'to': NotRequired[str | float],
        'with': NotRequired[dict[str, QueryAttributeFilter]],
        'empty_values': NotRequired[Literal['only', 'include', 'exclude']],
    },
)


class QueryMetricValueFilter(TypedDict):
    type: Literal['metric_value_filter']
    conditions: NotRequired[list[MvfCondition]]
    condition: NotRequired[
        Literal[
            'GREATER_THAN',
            'GREATER_THAN_OR_EQUAL_TO',
            'LESS_THAN',
            'LESS_THAN_OR_EQUAL_TO',
            'EQUAL_TO',
            'NOT_EQUAL_TO',
            'BETWEEN',
            'NOT_BETWEEN',
        ]
    ]


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


class Section(TypedDict):
    title: NotRequired[str]
    description: NotRequired[str]
    widgets: list[Widget]


class Tab(TypedDict):
    id: Identifier
    title: Title
    filters: NotRequired[DashboardFiltersModel]
    sections: list[Section]


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
            Literal[
                'MINUTE',
                'HOUR',
                'DAY',
                'WEEK',
                'WEEK_US',
                'MONTH',
                'QUARTER',
                'YEAR',
                'MINUTE_OF_HOUR',
                'HOUR_OF_DAY',
                'DAY_OF_WEEK',
                'DAY_OF_WEEK_EU',
                'DAY_OF_MONTH',
                'DAY_OF_YEAR',
                'DAY_OF_QUARTER',
                'WEEK_OF_YEAR',
                'WEEK_OF_YEAR_EU',
                'WEEK_OF_QUARTER_EU',
                'WEEK_OF_QUARTER',
                'MONTH_OF_YEAR',
                'MONTH_OF_QUARTER',
                'QUARTER_OF_YEAR',
                'FISCAL_YEAR',
                'FISCAL_QUARTER',
                'FISCAL_MONTH',
            ]
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
    aggregated_as: Literal['MIN', 'MAX', 'SUM']
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
        Literal[
            'TEXT',
            'HYPERLINK',
            'GEO',
            'GEO_LONGITUDE',
            'GEO_LATITUDE',
            'GEO_ICON',
            'IMAGE',
            'GEO_AREA',
        ]
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


QuerySorts: TypeAlias = list[QuerySort]


QueryField: TypeAlias = (
    AttributeIdentifier
    | LabelIdentifier
    | MetricIdentifier
    | FactIdentifier
    | QueryField1
)


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
        Literal[
            'auto',
            'continent_af',
            'continent_as',
            'continent_au',
            'continent_eu',
            'continent_na',
            'continent_sa',
            'world',
            'custom',
        ]
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
    text_wrapping: NotRequired[TextWrapping]
    pagination: NotRequired[bool]
    page_size: NotRequired[float]
    grand_totals_position: NotRequired[
        Literal['pinnedBottom', 'pinnedTop', 'bottom', 'top']
    ]
    enable_accessibility: NotRequired[bool]
    line_style_control_metrics: NotRequired[list[str]]
    line_style_excluded_metrics: NotRequired[list[str]]


class Dashboard(TypedDict):
    id: Identifier
    type: Literal['dashboard']
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


class Dataset1(TypedDict):
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


class Dataset2(TypedDict):
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


Dataset: TypeAlias = Dataset1 | Dataset2


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


QueryFields: TypeAlias = dict[str, QueryField]


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


class LayerItem3(LayerItemBase):
    pass


class LayerItem4(LayerItem1, LayerItem3):
    pass


class LayerItem5(LayerItem2, LayerItem3):
    pass


LayerItem: TypeAlias = LayerItem4 | LayerItem5
