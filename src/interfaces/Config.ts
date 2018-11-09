// (C) 2007-2018 GoodData Corporation
import { ISeparators } from '@gooddata/numberjs';
import { VisualizationObject } from '@gooddata/typings';
import { PositionType } from '../components/visualizations/typings/legend';
import { VisType } from '../constants/visualizationTypes';
import { IDataLabelsConfig } from '../interfaces/Config';
import { IHeaderPredicate } from './HeaderPredicate';
import { IMappingHeader } from './MappingHeader';

export { DEFAULT_COLOR_PALETTE } from '../components/visualizations/utils/color';

export type IDataLabelsVisibile = string | boolean;

export interface IDataLabelsConfig {
    visible?: IDataLabelsVisibile;
}

export type GuidType = 'guid';
export type RGBType = 'rgb';

export interface IRGBColor {
    r: number;
    g: number;
    b: number;
}

export interface IGuidColorItem {
    type: GuidType;
    value: string;
}

export interface IRGBColorItem {
    type: RGBType;
    value: IRGBColor;
}

export type IColorItem = IGuidColorItem | IRGBColorItem;

export interface IColorMapping { // sent to SDK
    predicate: IHeaderPredicate;
    color: IColorItem;
}

export interface IColorAssignment { // << send from SDK up
    headerItem: IMappingHeader;
    color: IColorItem;
}

export interface IColorPaletteItem {
    guid: string;
    fill: IRGBColor;
}

export interface IColorPalette extends Array<IColorPaletteItem> {}

export interface ILegendConfig {
    enabled?: boolean;
    position?: PositionType;
    responsive?: boolean;
}

export interface IChartLimits {
    series?: number;
    categories?: number;
    dataPoints?: number;
}

export interface IChartConfig {
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    type?: VisType;
    legend?: ILegendConfig;
    legendLayout?: string;
    limits?: IChartLimits;
    stacking?: boolean;
    grid?: any;
    mdObject?: VisualizationObject.IVisualizationObjectContent;
    yFormat?: string;
    yLabel?: string;
    xFormat?: string;
    xLabel?: string;
    chart?: any;
    xaxis?: IAxisConfig;
    yaxis?: IAxisConfig;
    secondary_xaxis?: IAxisConfig;
    secondary_yaxis?: IAxisConfig;
    separators?: ISeparators;
    dataLabels?: IDataLabelsConfig;
}

export interface IAxisConfig {
    visible?: boolean;
    labelsEnabled?: boolean;
    rotation?: string;
    min?: string;
    max?: string;
    measures?: string[];
}
