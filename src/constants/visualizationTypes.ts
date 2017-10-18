export enum VisualizationTypes {
    BAR = 'bar',
    COLUMN = 'column',
    LINE = 'line',
    PIE = 'pie',
    TABLE = 'table'
}

export type ChartType = 'line' | 'bar' | 'column' | 'pie';
export type VisType = ChartType | 'table';
export type ChartElementType = 'slice' | 'bar' | 'point';
export type VisElementType = ChartElementType | 'cell';
