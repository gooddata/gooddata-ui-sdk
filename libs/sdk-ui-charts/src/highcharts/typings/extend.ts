// (C) 2007-2025 GoodData Corporation
import { Axis, ChartParallelAxesOptions, ExtremesObject, YAxisOptions } from "../lib/index.js";

export type IHighchartsAxis = Partial<Axis> & Partial<ExtremesObject> & ChartParallelAxesOptions;

export interface IHighchartsAxisExtend extends IHighchartsAxis {
    len?: number | null;
    transA?: number;
    translationSlope?: number;
    options?: YAxisOptions;
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
