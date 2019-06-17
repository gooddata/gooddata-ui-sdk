// (C) 2007-2019 GoodData Corporation
import { getStackLabelPointsForDualAxis, isOverlappingWidth } from "../autohideColumnLabels";
import { IPointData } from "../../../../../../../interfaces/Config";

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

describe("isOverlappingWidth", () => {
    const visiblePointsWithoutShape: IPointData[] = [
        {
            x: 0,
            dataLabel: {
                width: 98,
                padding: 2,
            },
        },
    ];

    it("should return true when point has datalabel width greater than shape width", () => {
        const visiblePointsWithShape: IPointData[] = [
            {
                ...visiblePointsWithoutShape[0],
                shapeArgs: {
                    width: 100,
                },
            },
        ];
        expect(isOverlappingWidth(visiblePointsWithShape)).toEqual(true);
    });

    it("should return false when point has datalabel width less than shape width", () => {
        const visiblePointsWithShape: IPointData[] = [
            {
                ...visiblePointsWithoutShape[0],
                shapeArgs: {
                    width: 105,
                },
            },
        ];
        expect(isOverlappingWidth(visiblePointsWithShape)).toEqual(false);
    });

    it("should return false when shapeArgs is undefined", () => {
        expect(isOverlappingWidth(visiblePointsWithoutShape)).toEqual(false);
    });
});
