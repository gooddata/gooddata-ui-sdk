// (C) 2020 GoodData Corporation
import { IColorStrategy } from "../base.js";

export function getColorsFromStrategy(strategy: IColorStrategy): string[] {
    const res: string[] = [];
    const assignments = strategy.getFullColorAssignment().length;

    for (let i = 0; i < assignments; i++) {
        res.push(strategy.getColorByIndex(i));
    }

    return res;
}
