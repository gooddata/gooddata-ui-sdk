// (C) 2007-2018 GoodData Corporation
export const VisualizationTypes = {
    BAR: 'bar' as 'bar',
    COLUMN: 'column' as 'column',
    LINE: 'line' as 'line',
    PIE: 'pie' as 'pie',
    TABLE: 'table' as 'table',
    HEADLINE: 'headline' as 'headline',
    AREA: 'area' as 'area',
    DOUGHNUT: 'doughnut' as 'doughnut'
};

export type ChartType = 'bar' | 'column' | 'pie' | 'line' | 'area';
export type VisType = ChartType | 'table' | 'headline';
export type ChartElementType = 'slice' | 'bar' | 'point';
export type VisElementType = ChartElementType | 'cell';
