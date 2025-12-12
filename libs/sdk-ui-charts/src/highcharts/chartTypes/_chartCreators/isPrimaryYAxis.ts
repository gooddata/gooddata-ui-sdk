// (C) 2019-2020 GoodData Corporation
import { type IHighchartsAxisExtend } from "../../typings/extend.js";
import { type IAxis } from "../../typings/unsafe.js";

export const isPrimaryYAxis = (yAxis: IAxis | IHighchartsAxisExtend): boolean => !yAxis.opposite;
