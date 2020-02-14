// (C) 2007-2019 GoodData Corporation
import Highcharts from "./chart/highcharts/highchartsEntryPoint";

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
export type IHighchartsSeriesOptionsType = Partial<Highcharts.SeriesOptionsType>;

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

export interface IHighchartsSeriesExtend extends Partial<IHighchartsSeries> {
    pointPlacementToXValue?(): number;
}
