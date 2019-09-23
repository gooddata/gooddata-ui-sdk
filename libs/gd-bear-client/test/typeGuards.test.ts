// (C) 2007-2019 GoodData Corporation
import { isGuidColorItem, isRgbColorItem } from "../src/typeGuards";
import { IGuidColorItem, IRGBColorItem } from "../src/interfaces";

describe("typeGuards", () => {
    describe("isGuidColorItem", () => {
        it("should return false when null is tested", () => {
            const result = isGuidColorItem(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = isGuidColorItem(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when RGB color is tested", () => {
            const colorItem: IRGBColorItem = {
                type: "rgb",
                value: {
                    r: 127,
                    g: 127,
                    b: 127,
                },
            };
            const result = isGuidColorItem(colorItem);
            expect(result).toEqual(false);
        });

        it("should return true when GUID color is tested", () => {
            const colorItem: IGuidColorItem = {
                type: "guid",
                value: "some_guid",
            };
            const result = isGuidColorItem(colorItem);
            expect(result).toEqual(true);
        });
    });

    describe("isRgbColorItem", () => {
        it("should return false when null is tested", () => {
            const result = isRgbColorItem(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = isRgbColorItem(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when GUID color is tested", () => {
            const colorItem: IGuidColorItem = {
                type: "guid",
                value: "some_guid",
            };
            const result = isRgbColorItem(colorItem);
            expect(result).toEqual(false);
        });

        it("should return true when RGB color is tested", () => {
            const colorItem: IRGBColorItem = {
                type: "rgb",
                value: {
                    r: 127,
                    g: 127,
                    b: 127,
                },
            };
            const result = isRgbColorItem(colorItem);
            expect(result).toEqual(true);
        });
    });
});
