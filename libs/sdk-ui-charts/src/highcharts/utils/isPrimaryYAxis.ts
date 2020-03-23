// (C) 2019-2020 GoodData Corporation
import { IHighchartsAxisExtend } from "../typings/extend";
import { IAxis } from "../typings/unsafe";

export const isPrimaryYAxis = (yAxis: IAxis | IHighchartsAxisExtend) => !yAxis.opposite;
