// (C) 2019-2020 GoodData Corporation
import { IHighchartsAxisExtend } from "../../typings/extend.js";
import { IAxis } from "../../typings/unsafe.js";

export const isPrimaryYAxis = (yAxis: IAxis | IHighchartsAxisExtend): boolean => !yAxis.opposite;
