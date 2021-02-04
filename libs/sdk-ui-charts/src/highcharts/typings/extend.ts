// (C) 2007-2020 GoodData Corporation
import Highcharts from "../lib";

export type IHighchartsAxis = Partial<Highcharts.Axis> &
    Partial<Highcharts.ExtremesObject> &
    Highcharts.ChartParallelAxesOptions;

export interface IHighchartsAxisExtend extends IHighchartsAxis {
    len?: number | null;
    transA?: number;
    translationSlope?: number;
    options?: Highcharts.YAxisOptions;
    chart?: any;
    translate?(
        val: number,
        backwards: number | boolean,
        cvsCoord: number | boolean,
        old: number | boolean,
        handleLog: number | boolean,
        pointPlacement?: number,
    ): number | undefined;
}

type IHighchartsPoint = Partial<Highcharts.Point>;

// move to heatmap
export type IHighchartsSeriesOptionsType = Partial<Highcharts.SeriesHeatmapOptions>;

interface IHighchartsSeries {
    area?: Highcharts.SVGElement;
    type: string;
    name: string;
    chart: Highcharts.Chart;
    data: IHighchartsPoint[];
    graph?: Highcharts.SVGElement;
    options: IHighchartsSeriesOptionsType;
    points: IHighchartsPoint[];
    visible: boolean;
    xAxis: IHighchartsAxisExtend;
    yAxis: IHighchartsAxisExtend;
}

// move to heatmap
export interface IHighchartsSeriesExtend extends Partial<IHighchartsSeries> {
    pointPlacementToXValue?(): number;
}
