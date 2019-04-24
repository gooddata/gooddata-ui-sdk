// (C) 2007-2018 GoodData Corporation
import { getStackLabelPointsForDualAxis } from "../autohideColumnLabels";

describe("getStackLabelPointsForDualAxis", () => {
    it("should return points for column0 and column", () => {
        const stacks: any[] = [
            { column0: { 0: { x: 0, total: 678 }, 1: { x: 1, total: 958 } } },
            { column: { 0: { x: 0, total: 907 }, 1: { x: 1, total: 525 } } },
        ];
        const points = getStackLabelPointsForDualAxis(stacks);

        expect(points).toEqual([
            stacks[0].column0[0],
            stacks[1].column[0],
            stacks[0].column0[1],
            stacks[1].column[1],
        ]);
    });

    it("should return points for column0 and column1", () => {
        const stacks: any[] = [
            { column0: { 0: { x: 0, total: 678 }, 1: { x: 1, total: 958 } } },
            { column1: { 0: { x: 0, total: 907 }, 1: { x: 1, total: 525 } } },
        ];
        const points = getStackLabelPointsForDualAxis(stacks);

        expect(points).toEqual([
            stacks[0].column0[0],
            stacks[1].column1[0],
            stacks[0].column0[1],
            stacks[1].column1[1],
        ]);
    });
});
