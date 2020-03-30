// (C) 2020 GoodData Corporation
import { IColorStrategy } from "../base";

export function getColorsFromStrategy(strategy: IColorStrategy): string[] {
    const res: string[] = [];

    for (let i = 0; i < strategy.getFullColorAssignment().length; i++) {
        res.push(strategy.getColorByIndex(i));
    }

    return res;
}
