// (C) 2007-2018 GoodData Corporation
export const VisualizationTypes = {
    BAR: 'bar' as 'bar',
    COLUMN: 'column' as 'column',
    LINE: 'line' as 'line',
    PIE: 'pie' as 'pie',
    TABLE: 'table' as 'table',
    HEADLINE: 'headline' as 'headline',
    AREA: 'area' as 'area',
    DONUT: 'donut' as 'donut',
    SCATTER: 'scatter' as 'scatter',
    BUBBLE: 'bubble' as 'bubble',
    HEATMAP: 'heatmap' as 'heatmap',
    GEO: 'geo' as 'geo',
    COMBO: 'combo' as 'combo',
    DUAL: 'dual' as 'dual',
    HISTOGRAM: 'histogram' as 'histogram',
    BULLET: 'bullet' as 'bullet',
    TREEMAP: 'treemap' as 'treemap',
    WATERFALL: 'waterfall' as 'waterfall',
    FUNNEL: 'funnel' as 'funnel',
    PARETO: 'pareto' as 'pareto',
    ALLUVIAL: 'alluvial' as 'alluvial'
};

export type ChartType = 'bar' | 'column' | 'pie' | 'line' | 'area' | 'donut' |
    'scatter' | 'bubble' | 'heatmap' | 'geo' | 'combo' | 'dual' | 'histogram' |
    'bullet' | 'treemap' | 'waterfall' | 'funnel' | 'pareto' | 'alluvial';
export type VisType = ChartType | 'table' | 'headline';
export type ChartElementType = 'slice' | 'bar' | 'point';
export type VisElementType = ChartElementType | 'cell' | 'primaryValue' | 'secondaryValue';
