// (C) 2007-2019 GoodData Corporation
import * as Highcharts from "highcharts";

export type IHighchartsAxis = Partial<Highcharts.Axis> &
    Partial<Highcharts.ExtremesObject> &
    Highcharts.ChartParallelAxesOptions;

export interface IHighchartsAxisExtend extends IHighchartsAxis {
    transA?: number;
    options?: Highcharts.YAxisOptions;
    chart?: any;
}
