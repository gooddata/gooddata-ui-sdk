// (C) 2007-2019 GoodData Corporation
import { ArithmeticMeasureTitleFactory } from "../ArithmeticMeasureTitleFactory.js";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "../MeasureTitle.js";
import { describe, expect, it } from "vitest";

describe("ArithmeticMeasureTitleFactory", () => {
    describe("getTitle", () => {
        const MEASURE_TITLE_1: IMeasureTitleProps = {
            localIdentifier: "m1",
            title: "M1",
        };

        const MEASURE_TITLE_2: IMeasureTitleProps = {
            localIdentifier: "m2",
            title: "M2",
        };
        const MEASURE_TITLE_3: IMeasureTitleProps = {
            localIdentifier: "m3",
            title: "M3",
        };

        it("should return null when zero master measures is referenced by the arithmetic measure", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: [],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, []);
            expect(title).toBeNull();
        });

        it("should return null when a single master measures is referenced by the arithmetic measure", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1]);

            expect(title).toBeNull();
        });

        it("should return null when the first master measure is not found", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_2, MEASURE_TITLE_3]);

            expect(title).toBeNull();
        });

        it("should return null when the second master measure is not found", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1, MEASURE_TITLE_3]);

            expect(title).toBeNull();
        });

        it("should return null when the first master measure does not have title", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const firstMeasureWithoutTitle = {
                localIdentifier: "m1",
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [
                firstMeasureWithoutTitle,
                MEASURE_TITLE_2,
            ]);

            expect(title).toBeNull();
        });

        it("should return null when the second master measure does not have title", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const secondMeasureWithoutTitle = {
                localIdentifier: "m2",
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [
                MEASURE_TITLE_1,
                secondMeasureWithoutTitle,
            ]);

            expect(title).toBeNull();
        });

        it("should return correct title for sum arithmetic measure with default master measure titles", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1, MEASURE_TITLE_2]);

            expect(title).toEqual("Sum of M1 and M2");
        });

        it("should return correct title for sum arithmetic measure with renamed master measure titles", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const renamedMeasureTitle1 = {
                localIdentifier: "m1",
                title: "M1",
                alias: "Renamed M1",
            };
            const renamedMeasureTitle2 = {
                localIdentifier: "m2",
                title: "M2",
                alias: "Renamed M2",
            };

            const title = titleFactory.getTitle(arithmeticMeasureProps, [
                renamedMeasureTitle1,
                renamedMeasureTitle2,
            ]);

            expect(title).toEqual("Sum of Renamed M1 and Renamed M2");
        });

        it("should return correct title for sum arithmetic measure with three master measures", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "sum",
                masterMeasureLocalIdentifiers: ["m1", "m2", "m3"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [
                MEASURE_TITLE_1,
                MEASURE_TITLE_2,
                MEASURE_TITLE_3,
            ]);

            expect(title).toEqual("Sum of M1 and M2");
        });

        it("should return correct title for difference arithmetic measure", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "difference",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1, MEASURE_TITLE_2]);

            expect(title).toEqual("Difference of M1 and M2");
        });

        it("should return correct title for multiplication arithmetic measure", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "multiplication",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1, MEASURE_TITLE_2]);

            expect(title).toEqual("Product of M1 and M2");
        });

        it("should return correct title for ratio arithmetic measure", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "ratio",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1, MEASURE_TITLE_2]);

            expect(title).toEqual("Ratio of M1 and M2");
        });

        it("should return correct title for change arithmetic measure", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "change",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            const title = titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1, MEASURE_TITLE_2]);

            expect(title).toEqual("Change from M2 to M1");
        });

        it("should throw error when unsupported arithmetic operator is provided", () => {
            const titleFactory = new ArithmeticMeasureTitleFactory("en-US");
            const arithmeticMeasureProps: IArithmeticMeasureTitleProps = {
                operator: "unsupported_operator",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            };
            expect(() => {
                titleFactory.getTitle(arithmeticMeasureProps, [MEASURE_TITLE_1, MEASURE_TITLE_2]);
            }).toThrow();
        });
    });
});
