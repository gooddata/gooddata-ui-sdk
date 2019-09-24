// (C) 2019 GoodData Corporation
import { IAxis } from "../../base/interfaces/Config";
import { IHighchartsAxisExtend } from "../HighchartsExtend";

export const isPrimaryYAxis = (yAxis: IAxis | IHighchartsAxisExtend) => !yAxis.opposite;
